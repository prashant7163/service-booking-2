package ch.servicebookingtwo.auth;

import ch.servicebookingtwo.AbstractPostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(OutputCaptureExtension.class)
class AuthIntegrationTest extends AbstractPostgresIntegrationTest {
    @Test void verificationConsumesDigestOnceAndEnforcesRole(CapturedOutput logs) throws Exception {
        String email = email();
        mvc.perform(registration("/api/auth/providers", email)).andExpect(status().isCreated());
        String token = deliveries.forEmail(email).token();
        String stored = jdbc.queryForObject("select token_digest from verification_credential where account_id = (select id from account where email = ?)", String.class, email);
        assertThat(stored).hasSize(64).isNotEqualTo(token);
        postJson("/api/auth/customers/verification", "{\"token\":\"" + token + "\"}").andExpect(status().isUnprocessableEntity());
        postJson("/api/auth/providers/verification", "{\"token\":\"" + token + "\"}")
            .andExpect(status().isOk()).andExpect(jsonPath("$.verified").value(true)).andExpect(jsonPath("$.role").value("PROVIDER"));
        postJson("/api/auth/providers/verification", "{\"token\":\"" + token + "\"}").andExpect(status().isUnprocessableEntity());
        assertThat(logs.getAll()).doesNotContain(token, stored);
    }
    @Test void resetConsumesTokenChangesPasswordAndRevokesExistingSessions(CapturedOutput logs) throws Exception {
        String email = email();
        var session = mvc.perform(registration("/api/auth/customers", email))
            .andExpect(status().isCreated()).andReturn().getResponse().getCookie("JSESSIONID");
        postJson("/api/auth/password-reset-requests", "{\"email\":\"" + email + "\"}")
            .andExpect(status().isAccepted()).andExpect(content().json("{\"status\":\"ACCEPTED\"}"));
        String token = deliveries.forEmail(email).token();
        String reset = "{\"token\":\"" + token + "\",\"password\":\"replacement-password\"}";
        postJson("/api/auth/password-resets", reset).andExpect(status().isNoContent());
        mvc.perform(get("/api/auth/session").cookie(session)).andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
        postJson("/api/auth/session", "{\"email\":\"" + email + "\",\"password\":\"test-password\"}")
            .andExpect(status().isUnauthorized());
        postJson("/api/auth/session", "{\"email\":\"" + email + "\",\"password\":\"replacement-password\"}")
            .andExpect(status().isOk());
        postJson("/api/auth/password-resets", reset).andExpect(status().isUnprocessableEntity());
        postJson("/api/auth/password-reset-requests", "{\"email\":\"missing@example.test\"}")
            .andExpect(status().isAccepted()).andExpect(content().json("{\"status\":\"ACCEPTED\"}"));
        assertThat(logs.getAll()).doesNotContain(token, "replacement-password");
    }
    @Test void realCsrfTokenIsSessionBoundAndRotatedAfterRegistration() throws Exception {
        var bootstrap = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
        var session = bootstrap.getResponse().getCookie("JSESSIONID");
        String oldId = session.getValue();
        String token = com.jayway.jsonpath.JsonPath.read(bootstrap.getResponse().getContentAsString(), "$.token");
        String registration = "{\"email\":\"" + email() + "\",\"password\":\"test-password\",\"displayName\":\"Synthetic\"}";
        session = mvc.perform(post("/api/auth/customers").cookie(session).header("X-CSRF-TOKEN", token)
            .contentType("application/json").content(registration)).andExpect(status().isCreated())
            .andReturn().getResponse().getCookie("JSESSIONID");
        assertThat(session.getValue()).isNotEqualTo(oldId);
        mvc.perform(delete("/api/auth/session").cookie(session).header("X-CSRF-TOKEN", token))
            .andExpect(status().isForbidden());
        var refreshed = mvc.perform(get("/api/auth/csrf").cookie(session)).andReturn();
        String freshToken = com.jayway.jsonpath.JsonPath.read(refreshed.getResponse().getContentAsString(), "$.token");
        mvc.perform(delete("/api/auth/session").cookie(session).header("X-CSRF-TOKEN", freshToken)).andExpect(status().isNoContent());
    }
    @Test void anonymousCannotCreateCart() throws Exception {
        postJson("/api/cart", "{}").andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
    }
    @Test void unverifiedProviderCannotPublish() throws Exception {
        mvc.perform(post("/api/provider/offerings/1/publish").cookie(provider(email())).with(csrf()))
            .andExpect(status().isForbidden());
    }
    @Test void oneEmailCannotHoldCustomerAndProviderRoles() throws Exception {
        String email = email();
        mvc.perform(registration("/api/auth/customers", email)).andExpect(status().isCreated());
        mvc.perform(registration("/api/auth/providers", email.toUpperCase()))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("EMAIL_IN_USE"));
    }
    @Test void passwordIsBcryptAndNeverReturnedOrLogged(CapturedOutput logs) throws Exception {
        String email = email();
        String body = mvc.perform(registration("/api/auth/customers", email))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.role").value("CUSTOMER"))
            .andExpect(jsonPath("$.verified").value(false)).andReturn().getResponse().getContentAsString();
        String storedHash = jdbc.queryForObject("select password_hash from account where email = ?", String.class, email);
        assertThat(storedHash).startsWith("$2");
        assertThat(body).doesNotContain("test-password", storedHash, "password", "token");
        assertThat(logs.getAll()).doesNotContain("test-password", storedHash);
    }
    @Test void csrfIsRequiredForAuthenticatedMutation() throws Exception {
        mvc.perform(post("/api/cart").cookie(customer()).contentType("application/json").content("{}"))
            .andExpect(status().isForbidden());
    }
    @Test void csrfIsRequiredForAnonymousRegistration() throws Exception {
        mvc.perform(post("/api/auth/customers").contentType("application/json").content("{}"))
            .andExpect(status().isForbidden());
    }
    @Test void providerRegistrationReturnsOnlyPendingAcknowledgment() throws Exception {
        mvc.perform(registration("/api/auth/providers", email())).andExpect(status().isCreated())
            .andExpect(content().json("{\"status\":\"VERIFICATION_PENDING\"}"));
    }
    @Test void suspensionBlocksSignInAndExistingSession() throws Exception {
        String email = email();
        var session = provider(email);
        String token = deliveries.forEmail(email).token();
        jdbc.update("update account set suspended = true where email = ?", email);
        mvc.perform(get("/api/auth/session").cookie(session)).andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("PROVIDER_SUSPENDED"));
        postJson("/api/auth/session", "{\"email\":\"" + email + "\",\"password\":\"test-password\"}")
            .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("PROVIDER_SUSPENDED"));
        postJson("/api/auth/providers/verification", "{\"token\":\"" + token + "\"}")
            .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("PROVIDER_SUSPENDED"));
    }
    @Test void signOutInvalidatesSession() throws Exception {
        var session = customer();
        mvc.perform(delete("/api/auth/session").cookie(session).with(csrf())).andExpect(status().isNoContent())
            .andExpect(cookie().maxAge("JSESSIONID", 0));
        mvc.perform(get("/api/auth/session").cookie(session)).andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
    }
    @Test void invalidCredentialsAndMalformedInputAreRedacted() throws Exception {
        postJson("/api/auth/session", "{\"email\":\"missing@example.test\",\"password\":\"private-input\"}")
            .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
            .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("private-input"))));
        postJson("/api/auth/customers", "{\"email\":\"invalid\",\"password\":\"\",\"displayName\":\"\"}")
            .andExpect(status().isUnprocessableEntity());
    }
    @Test void beanValidationReturnsContractFieldErrorsWithoutRejectedValues() throws Exception {
        String rejectedEmail = "private-invalid-address";
        postJson("/api/auth/customers", "{\"email\":\"" + rejectedEmail
            + "\",\"password\":\"private-password\",\"displayName\":\"\"}")
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
            .andExpect(jsonPath("$.messageKey").value("error.validation_failed"))
            .andExpect(jsonPath("$.fieldErrors.length()").value(2))
            .andExpect(jsonPath("$.fieldErrors[?(@.field == 'email')].messageKey")
                .value(org.hamcrest.Matchers.contains("validation.email")))
            .andExpect(jsonPath("$.fieldErrors[?(@.field == 'displayName')].messageKey")
                .value(org.hamcrest.Matchers.contains("validation.notBlank")))
            .andExpect(jsonPath("$.correlationId").isString())
            .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString(rejectedEmail))))
            .andExpect(jsonPath("$.fieldErrors[0].rejectedValue").doesNotExist());
    }
    @Test void malformedJsonRemainsGenericInvalidInput() throws Exception {
        postJson("/api/auth/customers", "{\"email\":")
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.code").value("INVALID_INPUT"))
            .andExpect(jsonPath("$.messageKey").value("error.invalid_input"))
            .andExpect(jsonPath("$.fieldErrors").isEmpty())
            .andExpect(jsonPath("$.correlationId").isString());
    }
    @Test void registrationSucceedsWhenPostCommitDeliveryFails(CapturedOutput logs) throws Exception {
        String email = email();
        deliveries.failNext();

        mvc.perform(registration("/api/auth/customers", email)).andExpect(status().isCreated());

        var delivery = deliveries.forEmail(email);
        assertThat(jdbc.queryForObject("select count(*) from account where email = ?", Integer.class, email)).isOne();
        assertThat(logs.getAll()).contains("event=" + delivery.kind(), "correlationId=" + delivery.correlationId())
            .doesNotContain(email, delivery.token());
    }
    @Test void resetRequestSucceedsWhenPostCommitDeliveryFails(CapturedOutput logs) throws Exception {
        String email = email();
        mvc.perform(registration("/api/auth/customers", email)).andExpect(status().isCreated());
        deliveries.failNext();

        postJson("/api/auth/password-reset-requests", "{\"email\":\"" + email + "\"}")
            .andExpect(status().isAccepted());

        var delivery = deliveries.forEmail(email);
        assertThat(delivery.kind()).isEqualTo(ch.servicebookingtwo.simulation.VerificationPort.Kind.PASSWORD_RESET);
        assertThat(jdbc.queryForObject("select count(*) from verification_credential where account_id = "
            + "(select id from account where email = ?) and kind = 'PASSWORD_RESET'", Integer.class, email)).isOne();
        assertThat(logs.getAll()).contains("event=" + delivery.kind(), "correlationId=" + delivery.correlationId())
            .doesNotContain(email, delivery.token());
    }
}
