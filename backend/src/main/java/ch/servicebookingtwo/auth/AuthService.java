package ch.servicebookingtwo.auth;
import ch.servicebookingtwo.common.ApiError.Failure;
import ch.servicebookingtwo.simulation.VerificationPort;
import ch.servicebookingtwo.simulation.VerificationPort.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Clock;
import java.util.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class AuthService {
    private static final Logger LOG = LoggerFactory.getLogger(AuthService.class);
    private final AccountRepository accounts;
    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final VerificationPort delivery;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();
    private final String dummyHash;
    public AuthService(AccountRepository accounts, JdbcTemplate jdbc, PasswordEncoder encoder, VerificationPort delivery, Clock clock) {
        this.accounts = accounts; this.jdbc = jdbc; this.encoder = encoder; this.delivery = delivery; this.clock = clock;
        dummyHash = encoder.encode(UUID.randomUUID().toString());
    }
    @Transactional
    public Account register(AuthDtos.RegistrationCommand command, Role role) {
        if (role == Role.ADMINISTRATOR) throw new Failure(403, "FORBIDDEN");
        String email = normalize(command.email());
        if (accounts.findByEmail(email).isPresent()) throw new Failure(409, "EMAIL_IN_USE");
        Account account;
        try { account = accounts.saveAndFlush(new Account(email, command.displayName(), hash(command.password()), role)); }
        catch (DataIntegrityViolationException duplicate) { throw new Failure(409, "EMAIL_IN_USE"); }
        issue(account, role == Role.CUSTOMER ? Kind.CUSTOMER_VERIFICATION : Kind.PROVIDER_VERIFICATION);
        return account;
    }
    @Transactional(readOnly = true)
    public Account signIn(AuthDtos.SignInCommand command) {
        var account = accounts.findByEmail(normalize(command.email()));
        boolean matches = encoder.matches(command.password(), account.map(Account::getPasswordHash).orElse(dummyHash));
        if (account.isEmpty() || !matches) throw new Failure(401, "INVALID_CREDENTIALS");
        active(account.get());
        return account.get();
    }
    @Transactional
    public Account verify(String token, Role role) {
        Account account = consume(token, role == Role.CUSTOMER ? Kind.CUSTOMER_VERIFICATION : Kind.PROVIDER_VERIFICATION);
        active(account); account.verify();
        return account;
    }
    @Transactional
    public void requestReset(String email) {
        accounts.findByEmail(normalize(email)).ifPresent(account -> issue(account, Kind.PASSWORD_RESET));
    }
    @Transactional
    public void reset(String token, String password) {
        Account account = consume(token, Kind.PASSWORD_RESET);
        account.resetPassword(hash(password));
        jdbc.update("delete from verification_credential where account_id = ? and kind = 'PASSWORD_RESET'", account.getId());
        jdbc.update("delete from spring_session where principal_name = ?", account.getId().toString());
    }
    private Account consume(String token, Kind kind) {
        List<UUID> ids = jdbc.query("delete from verification_credential where token_digest = ? and kind = ? returning account_id",
            (rs, row) -> rs.getObject(1, UUID.class), digest(token), kind.name());
        if (ids.isEmpty()) throw new Failure(422, "INVALID_TOKEN");
        // Serialize concurrent credential consumption for the same account.
        jdbc.queryForObject("select id from account where id = ? for update", UUID.class, ids.getFirst());
        return accounts.findById(ids.getFirst()).orElseThrow(() -> new Failure(422, "INVALID_TOKEN"));
    }
    private void issue(Account account, Kind kind) {
        byte[] bytes = new byte[32]; random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        UUID correlationId = UUID.randomUUID();
        jdbc.update("insert into verification_credential(token_digest, account_id, kind, created_at) values (?, ?, ?, ?)",
            digest(token), account.getId(), kind.name(), java.sql.Timestamp.from(clock.instant()));
        Delivery event = new Delivery(kind, correlationId, account.getEmail(), token);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                try { delivery.deliver(event); }
                catch (RuntimeException failure) {
                    LOG.warn("deliveryFailed event={} correlationId={}", event.kind(), event.correlationId());
                }
            }
        });
    }
    private String hash(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) throw new Failure(422, "INVALID_INPUT");
        return encoder.encode(password);
    }
    private static String normalize(String email) { return email.trim().toLowerCase(Locale.ROOT); }
    private static String digest(String token) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException impossible) { throw new IllegalStateException("SHA-256 unavailable"); }
    }
    public static void active(Account account) {
        if (account.isSuspended()) throw new Failure(403, "PROVIDER_SUSPENDED");
    }
    public static AuthDtos.Actor actor(Account account) {
        return new AuthDtos.Actor(account.getId(), account.getRole(), account.isVerified(), account.isSuspended());
    }
}
