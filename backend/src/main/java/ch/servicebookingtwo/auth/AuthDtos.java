package ch.servicebookingtwo.auth;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.UUID;
public final class AuthDtos {
    private AuthDtos() {}
    public record Actor(UUID accountId, Role role, boolean verified, boolean suspended) implements Serializable, java.security.Principal {
        @Override public String getName() { return accountId.toString(); }
    }
    public record SessionView(UUID accountId, Role role, boolean verified) {}
    public record RegistrationCommand(@NotBlank @Email String email, @NotBlank String password, @NotBlank String displayName) {
        @Override public String toString() { return "RegistrationCommand[redacted]"; }
    }
    public record SignInCommand(@NotBlank @Email String email, @NotBlank String password) {
        @Override public String toString() { return "SignInCommand[redacted]"; }
    }
    public record TokenCommand(@NotBlank String token) {
        @Override public String toString() { return "TokenCommand[redacted]"; }
    }
    public record EmailCommand(@NotBlank @Email String email) {
        @Override public String toString() { return "EmailCommand[redacted]"; }
    }
    public record ResetPasswordCommand(@NotBlank String token, @NotBlank String password) {
        @Override public String toString() { return "ResetPasswordCommand[redacted]"; }
    }
    public record CsrfView(String token) {
        @Override public String toString() { return "CsrfView[redacted]"; }
    }
    public record VerificationPendingView(String status) {}
    public record Acknowledgment(String status) {}
}
