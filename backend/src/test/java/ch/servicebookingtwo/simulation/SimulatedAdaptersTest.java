package ch.servicebookingtwo.simulation;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.support.StaticListableBeanFactory;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(OutputCaptureExtension.class)
class SimulatedAdaptersTest {
    private final SimulatedAdapters adapters = new SimulatedAdapters();

    @Test void paymentReturnsConfiguredOutcomeAndLogsOnlyEventAndCorrelation(CapturedOutput logs) {
        UUID attemptId = UUID.randomUUID();
        var attempt = new PaymentPort.PaymentAttempt(attemptId, new BigDecimal("123.45"), PaymentPort.Outcome.FAILED);

        assertThat(adapters.paymentPort().authorize(attempt)).isEqualTo(PaymentPort.Outcome.FAILED);
        assertThat(logs.getAll()).contains("event=PAYMENT_ATTEMPT", "correlationId=" + attemptId)
            .doesNotContain("123.45");
    }

    @Test void notificationDeliversExactEventAndLogsOnlyTypeAndCorrelation(CapturedOutput logs) {
        var observed = new AtomicReference<NotificationPort.Event>();
        var beans = new StaticListableBeanFactory();
        beans.addBean("observer", (NotificationPort.Observer) observed::set);
        var event = new NotificationPort.Event(NotificationPort.Kind.CONFIRMATION, UUID.randomUUID(),
            UUID.randomUUID(), UUID.randomUUID());

        adapters.notificationPort(beans.getBeanProvider(NotificationPort.Observer.class)).notify(event);

        assertThat(observed.get()).isEqualTo(event);
        assertThat(logs.getAll()).contains("event=" + event.kind(), "correlationId=" + event.correlationId())
            .doesNotContain(event.accountId().toString(), event.bookingLineId().toString());
    }
}
