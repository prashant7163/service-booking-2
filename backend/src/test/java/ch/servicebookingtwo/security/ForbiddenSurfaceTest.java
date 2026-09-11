package ch.servicebookingtwo.security;

import ch.servicebookingtwo.AbstractPostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ForbiddenSurfaceTest extends AbstractPostgresIntegrationTest {
    @Test void excludedRoutesHaveNoHandlers() throws Exception {
        for (String path : new String[] {"/api/inbox", "/api/messages", "/api/refunds",
                "/api/categories", "/api/auth/administrators", "/api/testing/clock"}) {
            mvc.perform(post(path).with(csrf()).contentType("application/json").content("{}"))
                .andExpect(status().isNotFound());
        }
    }
    @Test void customerCannotUseProviderOrAdministratorMutation() throws Exception {
        var session = customer();
        for (String path : new String[] {"/api/provider/offerings/1/publish", "/api/admin/providers/1/suspend"}) {
            mvc.perform(post(path).cookie(session).with(csrf())).andExpect(status().isForbidden());
        }
    }
    @Test void sessionViewAndHeadersContainOnlyApprovedPublicFields() throws Exception {
        mvc.perform(get("/api/auth/session").cookie(customer()))
            .andExpect(status().isOk()).andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("no-store")))
            .andExpect(jsonPath("$.accountId").isString()).andExpect(jsonPath("$.role").value("CUSTOMER"))
            .andExpect(jsonPath("$.verified").value(false)).andExpect(jsonPath("$.passwordHash").doesNotExist())
            .andExpect(jsonPath("$.email").doesNotExist()).andExpect(jsonPath("$.suspended").doesNotExist());
    }
    @Test void unverifiedCustomerCanReadAuthenticatedCustomerSurfaces() throws Exception {
        var session = customer();
        String id = java.util.UUID.randomUUID().toString();
        for (String path : new String[] {"/api/cart", "/api/services/" + id + "/slots",
                "/api/customer/orders", "/api/customer/orders/" + id}) {
            mvc.perform(get(path).cookie(session)).andExpect(status().isNotFound());
        }
    }
    @Test void unverifiedCustomerCannotReserveOrCheckout() throws Exception {
        var session = customer();
        for (String path : new String[] {"/api/cart", "/api/checkout"}) {
            mvc.perform(post(path).cookie(session).with(csrf()).contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
        }
    }
    @Test void verifiedCustomerPassesCustomerAuthorizationBoundary() throws Exception {
        String email = email();
        mvc.perform(registration("/api/auth/customers", email)).andExpect(status().isCreated());
        String token = deliveries.forEmail(email).token();
        var session = postJson("/api/auth/customers/verification", "{\"token\":\"" + token + "\"}")
            .andExpect(status().isOk()).andReturn().getResponse().getCookie("JSESSIONID");

        mvc.perform(post("/api/cart").cookie(session).with(csrf()).contentType("application/json").content("{}"))
            .andExpect(status().isNotFound());
    }
}
