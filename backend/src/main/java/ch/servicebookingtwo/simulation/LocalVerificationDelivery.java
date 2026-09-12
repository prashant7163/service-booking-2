package ch.servicebookingtwo.simulation;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
@Profile({"local", "e2e"})
@ConditionalOnProperty(name = "booking.simulation.verification-enabled", havingValue = "true")
final class LocalVerificationDelivery implements VerificationPort.Observer {
    private static final Set<String> ALLOWED_HOSTS = Set.of(
        "localhost", "127.0.0.1", "::1", "[::1]", "host.docker.internal");
    private final URI endpoint;
    private final ObjectMapper mapper;
    private final HttpClient client;

    LocalVerificationDelivery(@Value("${booking.simulation.verification-endpoint}") URI endpoint, ObjectMapper mapper) {
        if (!"http".equals(endpoint.getScheme()) || !ALLOWED_HOSTS.contains(endpoint.getHost())) {
            throw new IllegalArgumentException("Simulated verification endpoint must use HTTP on an approved local host");
        }
        this.endpoint = endpoint;
        this.mapper = mapper;
        this.client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(1)).build();
    }

    @Override public void delivered(VerificationPort.Delivery delivery) {
        var request = HttpRequest.newBuilder(endpoint).timeout(Duration.ofSeconds(2))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofByteArray(mapper.writeValueAsBytes(delivery)))
            .build();
        try {
            var response = client.send(request, HttpResponse.BodyHandlers.discarding());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Simulated verification receiver rejected delivery");
            }
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Simulated verification delivery interrupted", interrupted);
        } catch (IOException failure) {
            throw new IllegalStateException("Simulated verification receiver unavailable", failure);
        }
    }
}
