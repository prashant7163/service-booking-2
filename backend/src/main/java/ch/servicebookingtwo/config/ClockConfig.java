package ch.servicebookingtwo.config;
import java.time.*;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.context.annotation.*;
@Configuration
public class ClockConfig {
    @Bean @Profile("!e2e") Clock clock() { return Clock.systemUTC(); }
    @Bean @Profile("e2e") MutableClock e2eClock() { return new MutableClock(Instant.now()); }
    public static final class MutableClock extends Clock {
        private final AtomicReference<Instant> now;
        public MutableClock(Instant initial) { now = new AtomicReference<>(initial); }
        public Instant advance(Duration duration) {
            if (duration.isNegative()) throw new IllegalArgumentException("Clock cannot move backwards");
            return now.updateAndGet(instant -> instant.plus(duration));
        }
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) {
            if (!ZoneOffset.UTC.equals(zone)) throw new IllegalArgumentException("UTC required");
            return this;
        }
        @Override public Instant instant() { return now.get(); }
    }
}
