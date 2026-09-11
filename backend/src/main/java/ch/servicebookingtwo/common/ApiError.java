package ch.servicebookingtwo.common;
import java.util.*;
public record ApiError(String code, String messageKey, List<FieldError> fieldErrors, UUID correlationId) {
    public record FieldError(String field, String messageKey) {}
    public static ApiError of(String code) {
        return new ApiError(code, "error." + code.toLowerCase(Locale.ROOT), List.of(), UUID.randomUUID());
    }
    public static final class Failure extends RuntimeException {
        private final int status;
        private final String code;
        public Failure(int status, String code) { super(code); this.status = status; this.code = code; }
        public int status() { return status; }
        public String code() { return code; }
    }
}
