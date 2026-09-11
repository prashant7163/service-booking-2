package ch.servicebookingtwo.simulation;
import org.slf4j.*;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.*;
@Configuration
public class SimulatedAdapters {
    private static final Logger LOG = LoggerFactory.getLogger(SimulatedAdapters.class);
    @Bean VerificationPort verificationPort(ObjectProvider<VerificationPort.Observer> observers) {
        return delivery -> {
            LOG.info("event={} correlationId={}", delivery.kind(), delivery.correlationId());
            observers.orderedStream().forEach(observer -> observer.delivered(delivery));
        };
    }
    @Bean PaymentPort paymentPort() {
        return attempt -> {
            LOG.info("event=PAYMENT_ATTEMPT correlationId={}", attempt.attemptId());
            return attempt.simulatedOutcome();
        };
    }
    @Bean NotificationPort notificationPort(ObjectProvider<NotificationPort.Observer> observers) {
        return event -> {
            LOG.info("event={} correlationId={}", event.kind(), event.correlationId());
            observers.orderedStream().forEach(observer -> observer.notified(event));
        };
    }
}
