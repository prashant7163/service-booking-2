package ch.servicebookingtwo.simulation;
import java.math.BigDecimal;
import java.util.UUID;
public interface PaymentPort {
    enum Outcome { SUCCEEDED, FAILED }
    record PaymentAttempt(UUID attemptId, BigDecimal amountChf, Outcome simulatedOutcome) {}
    Outcome authorize(PaymentAttempt attempt);
}
