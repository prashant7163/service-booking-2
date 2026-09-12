package ch.servicebookingtwo;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import ch.servicebookingtwo.simulation.VerificationPort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.servlet.http.Cookie;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest(classes = {Application.class, AbstractPostgresIntegrationTest.Fixture.class})
@AutoConfigureMockMvc(print = org.springframework.boot.webmvc.test.autoconfigure.MockMvcPrint.NONE)
@ActiveProfiles("local")
public abstract class AbstractPostgresIntegrationTest {
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer(DockerImageName.parse(
        "postgres:17.11@sha256:67f41722b7a8cbdb868a44a4995c846eddfdc2973bccb291ce937dce88ad5675")
        .asCompatibleSubstituteFor("postgres"));
    static { POSTGRES.start(); }

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("booking.redemption-hmac-secret", () -> UUID.randomUUID().toString());
    }

    @TestConfiguration
    public static class Fixture {
        @Bean DeliverySpy deliverySpy() { return new DeliverySpy(); }
        @Bean @Primary Clock testClock() {
            return Clock.fixed(Instant.parse("2026-09-12T10:00:00Z"), ZoneOffset.UTC);
        }
    }

    @Autowired protected MockMvc mvc;
    @Autowired protected JdbcTemplate jdbc;
    @Autowired protected DeliverySpy deliveries;

    public static class DeliverySpy implements VerificationPort.Observer {
        private final ConcurrentHashMap<String, VerificationPort.Delivery> delivered = new ConcurrentHashMap<>();
        private final AtomicBoolean failNext = new AtomicBoolean();
        @Override public void delivered(VerificationPort.Delivery delivery) {
            delivered.put(delivery.email(), delivery);
            if (failNext.compareAndSet(true, false)) {
                throw new IllegalStateException("simulated failure containing " + delivery.email() + " " + delivery.token());
            }
        }
        public VerificationPort.Delivery forEmail(String email) { return delivered.get(email); }
        public void failNext() { failNext.set(true); }
    }

    protected String email() { return UUID.randomUUID() + "@example.test"; }
    protected MockHttpServletRequestBuilder registration(String route, String email) {
        return post(route).with(csrf()).contentType("application/json")
            .content("{\"email\":\"" + email + "\",\"password\":\"test-password\",\"displayName\":\"Synthetic Person\"}");
    }
    protected ResultActions postJson(String route, String body) throws Exception {
        return mvc.perform(post(route).with(csrf()).contentType("application/json").content(body));
    }
    protected Cookie customer() throws Exception {
        return mvc.perform(registration("/api/auth/customers", email()))
            .andReturn().getResponse().getCookie("JSESSIONID");
    }
    protected Cookie provider(String email) throws Exception {
        mvc.perform(registration("/api/auth/providers", email));
        return postJson("/api/auth/session",
            "{\"email\":\"" + email + "\",\"password\":\"test-password\"}")
            .andReturn().getResponse().getCookie("JSESSIONID");
    }
}
