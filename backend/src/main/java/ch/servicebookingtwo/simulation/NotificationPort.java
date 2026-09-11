package ch.servicebookingtwo.simulation;
import java.util.UUID;
public interface NotificationPort {
    enum Kind { CONFIRMATION, PROVIDER_PURCHASE, CUSTOMER_REDEMPTION, CUSTOMER_EXPIRY }
    record Event(Kind kind, UUID correlationId, UUID accountId, UUID bookingLineId) {}
    void notify(Event event);
    @FunctionalInterface interface Observer { void notified(Event event); }
}
