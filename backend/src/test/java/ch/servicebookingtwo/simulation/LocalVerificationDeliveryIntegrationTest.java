package ch.servicebookingtwo.simulation;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import tools.jackson.databind.ObjectMapper;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(OutputCaptureExtension.class)
class LocalVerificationDeliveryIntegrationTest {
    @Test void isEnabledOnlyByExplicitConfigurationInLocalOrE2eProfiles() {
        try (var disabled = context("local", false);
             var hosted = context("hosted", true);
             var local = context("local", true)) {
            assertThat(disabled.getBeansOfType(LocalVerificationDelivery.class)).isEmpty();
            assertThat(hosted.getBeansOfType(LocalVerificationDelivery.class)).isEmpty();
            assertThat(local.getBeansOfType(LocalVerificationDelivery.class)).hasSize(1);
        }
    }

    @Test void postsCredentialToConfiguredLoopbackReceiverWithoutLoggingIt(CapturedOutput logs) throws Exception {
        var requests = new ArrayBlockingQueue<String>(1);
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/verification", exchange -> {
            requests.add(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
        });
        server.start();
        try {
            var delivery = new VerificationPort.Delivery(VerificationPort.Kind.PASSWORD_RESET, UUID.randomUUID(),
                "synthetic@example.test", "private-reset-credential");
            var observer = new LocalVerificationDelivery(
                URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/verification"), new ObjectMapper());

            observer.delivered(delivery);

            assertThat(requests.poll(1, TimeUnit.SECONDS)).isEqualTo(new ObjectMapper().writeValueAsString(delivery));
            assertThat(logs.getAll()).doesNotContain(delivery.email(), delivery.token());
        } finally {
            server.stop(0);
        }
    }

    private static AnnotationConfigApplicationContext context(String profile, boolean enabled) {
        var context = new AnnotationConfigApplicationContext();
        context.getEnvironment().setActiveProfiles(profile);
        TestPropertyValues.of(
            "booking.simulation.verification-enabled=" + enabled,
            "booking.simulation.verification-endpoint=http://127.0.0.1:8081/verification"
        ).applyTo(context);
        context.registerBean("objectMapper", ObjectMapper.class, () -> new ObjectMapper());
        context.register(LocalVerificationDelivery.class);
        context.refresh();
        return context;
    }
}
