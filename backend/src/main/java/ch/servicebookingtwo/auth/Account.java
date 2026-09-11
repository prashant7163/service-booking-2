package ch.servicebookingtwo.auth;
import jakarta.persistence.*;
import java.util.UUID;
@Entity
@Table(name = "account")
public class Account {
    @Id private UUID id;
    @Column(nullable = false, unique = true) private String email;
    @Column(name = "display_name", nullable = false) private String displayName;
    @Column(name = "password_hash", nullable = false) private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
    @Column(nullable = false) private boolean verified;
    @Column(nullable = false) private boolean suspended;
    @Column(name = "session_version", nullable = false) private long sessionVersion;
    protected Account() {}
    public Account(String email, String displayName, String passwordHash, Role role) {
        this.id = UUID.randomUUID(); this.email = email; this.displayName = displayName;
        this.passwordHash = passwordHash; this.role = role;
    }
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getDisplayName() { return displayName; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
    public boolean isVerified() { return verified; }
    public boolean isSuspended() { return suspended; }
    public long getSessionVersion() { return sessionVersion; }
    void verify() { verified = true; }
    void resetPassword(String hash) { passwordHash = hash; sessionVersion++; }
}
