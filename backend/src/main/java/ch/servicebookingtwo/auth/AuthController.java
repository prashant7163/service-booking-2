package ch.servicebookingtwo.auth;
import ch.servicebookingtwo.auth.AuthDtos.*;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth) { this.auth = auth; }
    @GetMapping("/csrf") CsrfView csrf(CsrfToken token) { return new CsrfView(token.getToken()); }
    @PostMapping("/customers") @ResponseStatus(HttpStatus.CREATED)
    SessionView customer(@Valid @RequestBody RegistrationCommand command, HttpServletRequest request, HttpServletResponse response) {
        return establish(auth.register(command, Role.CUSTOMER), request, response);
    }
    @PostMapping("/providers") @ResponseStatus(HttpStatus.CREATED)
    VerificationPendingView provider(@Valid @RequestBody RegistrationCommand command) {
        auth.register(command, Role.PROVIDER);
        return new VerificationPendingView("VERIFICATION_PENDING");
    }
    @PostMapping("/customers/verification")
    SessionView verifyCustomer(@Valid @RequestBody TokenCommand command, HttpServletRequest request, HttpServletResponse response) {
        return establish(auth.verify(command.token(), Role.CUSTOMER), request, response);
    }
    @PostMapping("/providers/verification")
    SessionView verifyProvider(@Valid @RequestBody TokenCommand command, HttpServletRequest request, HttpServletResponse response) {
        return establish(auth.verify(command.token(), Role.PROVIDER), request, response);
    }
    @GetMapping("/session") SessionView session(Authentication authentication) { return view((Actor) authentication.getPrincipal()); }
    @PostMapping("/session")
    SessionView signIn(@Valid @RequestBody SignInCommand command, HttpServletRequest request, HttpServletResponse response) {
        return establish(auth.signIn(command), request, response);
    }
    @DeleteMapping("/session") @ResponseStatus(HttpStatus.NO_CONTENT)
    void signOut(HttpServletRequest request, HttpServletResponse response) {
        var session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
        Cookie cookie = new Cookie("JSESSIONID", ""); cookie.setPath("/"); cookie.setMaxAge(0);
        cookie.setHttpOnly(true); cookie.setSecure(request.isSecure()); cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }
    @PostMapping("/password-reset-requests") @ResponseStatus(HttpStatus.ACCEPTED)
    Acknowledgment requestReset(@Valid @RequestBody EmailCommand command) { auth.requestReset(command.email()); return new Acknowledgment("ACCEPTED"); }
    @PostMapping("/password-resets") @ResponseStatus(HttpStatus.NO_CONTENT)
    void reset(@Valid @RequestBody ResetPasswordCommand command) { auth.reset(command.token(), command.password()); }
    private SessionView establish(Account account, HttpServletRequest request, HttpServletResponse response) {
        request.getSession();
        request.changeSessionId();
        new HttpSessionCsrfTokenRepository().saveToken(null, request, response);
        var actor = AuthService.actor(account);
        var authentication = UsernamePasswordAuthenticationToken.authenticated(actor, null,
            List.of(new SimpleGrantedAuthority("ROLE_" + actor.role())));
        authentication.setDetails(account.getSessionVersion());
        var context = SecurityContextHolder.createEmptyContext(); context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        new HttpSessionSecurityContextRepository().saveContext(context, request, response);
        request.getSession().setAttribute("SPRING_SECURITY_SAVED_REQUEST", null);
        return view(actor);
    }
    private SessionView view(Actor actor) { return new SessionView(actor.accountId(), actor.role(), actor.verified()); }
}
