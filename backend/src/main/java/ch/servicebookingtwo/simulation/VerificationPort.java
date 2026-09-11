package ch.servicebookingtwo.simulation;
import java.util.UUID;
public interface VerificationPort {
    enum Kind { CUSTOMER_VERIFICATION, PROVIDER_VERIFICATION, PASSWORD_RESET }
    record Delivery(Kind kind, UUID correlationId, String email, String token) {
        @Override public String toString() { return "Delivery[" + kind + "," + correlationId + "]"; }
    }
    void deliver(Delivery delivery);
    @FunctionalInterface interface Observer { void delivered(Delivery delivery); }
}
