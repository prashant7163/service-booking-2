package ch.servicebookingtwo.config;
import ch.servicebookingtwo.auth.*;
import ch.servicebookingtwo.auth.AuthDtos.Actor;
import ch.servicebookingtwo.common.ApiError;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.security.web.csrf.*;
import org.springframework.session.web.http.*;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.ObjectMapper;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean CookieSerializer cookieSerializer(Environment environment) {
        var serializer = new DefaultCookieSerializer();
        serializer.setCookieName("JSESSIONID"); serializer.setCookiePath("/");
        serializer.setUseHttpOnlyCookie(true); serializer.setSameSite("Lax");
        serializer.setUseSecureCookie(!environment.matchesProfiles("local", "e2e"));
        return serializer;
    }
    @Bean SecurityFilterChain security(HttpSecurity http, AccountRepository accounts, ObjectMapper mapper) throws Exception {
        var csrfRepository = new HttpSessionCsrfTokenRepository();
        csrfRepository.setHeaderName("X-CSRF-TOKEN");
        http.csrf(csrf -> csrf.csrfTokenRepository(csrfRepository))
            .formLogin(form -> form.disable()).httpBasic(basic -> basic.disable()).logout(logout -> logout.disable())
            .requestCache(cache -> cache.disable())
            .exceptionHandling(errors -> errors
                .authenticationEntryPoint((request, response, failure) -> write(mapper, response, 401, "UNAUTHORIZED"))
                .accessDeniedHandler((request, response, failure) -> write(mapper, response, 403, "FORBIDDEN")))
            .headers(headers -> headers
                .contentSecurityPolicy(policy -> policy.policyDirectives("default-src 'self'; frame-ancestors 'none'; object-src 'none'"))
                .referrerPolicy(policy -> policy.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.SAME_ORIGIN)))
            .authorizeHttpRequests(routes -> routes
                .requestMatchers(HttpMethod.GET, "/api/auth/session").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/auth/session").authenticated()
                .requestMatchers("/api/auth/**", "/actuator/health").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/provider/offerings/*/publish").access((authentication, context) -> {
                    var auth = authentication.get();
                    return new AuthorizationDecision(auth.getPrincipal() instanceof Actor actor
                        && actor.role() == Role.PROVIDER && actor.verified() && !actor.suspended());
                })
                .requestMatchers("/api/provider/**").hasRole("PROVIDER")
                .requestMatchers("/api/admin/**").hasRole("ADMINISTRATOR")
                .requestMatchers("/api/cart", "/api/cart/**", "/api/checkout", "/api/orders", "/api/orders/**",
                    "/api/services/*/slots").access((authentication, context) -> {
                        var auth = authentication.get();
                        return new AuthorizationDecision(auth.getPrincipal() instanceof Actor actor
                            && actor.role() == Role.CUSTOMER && actor.verified() && !actor.suspended());
                    })
                .anyRequest().permitAll());
        http.addFilterAfter(new OncePerRequestFilter() {
            @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
                    throws ServletException, IOException {
                response.setHeader("Cache-Control", "no-store");
                var current = SecurityContextHolder.getContext().getAuthentication();
                if (current != null && current.getPrincipal() instanceof Actor actor) {
                    var account = accounts.findById(actor.accountId());
                    if (account.isEmpty() || !(current.getDetails() instanceof Long version)
                            || account.get().getSessionVersion() != version) {
                        SecurityContextHolder.clearContext();
                        if (request.getSession(false) != null) request.getSession(false).invalidate();
                        write(mapper, response, 401, "UNAUTHORIZED"); return;
                    }
                    if (account.get().isSuspended()) { write(mapper, response, 403, "FORBIDDEN"); return; }
                    var refreshed = AuthService.actor(account.get());
                    var authentication = UsernamePasswordAuthenticationToken.authenticated(refreshed, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + refreshed.role())));
                    authentication.setDetails(account.get().getSessionVersion());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
                chain.doFilter(request, response);
            }
        }, SecurityContextHolderFilter.class);
        return http.build();
    }
    private static void write(ObjectMapper mapper, HttpServletResponse response, int status, String code) throws IOException {
        response.setStatus(status); response.setContentType("application/json");
        response.setHeader("Cache-Control", "no-store");
        mapper.writeValue(response.getOutputStream(), ApiError.of(code));
    }
}
