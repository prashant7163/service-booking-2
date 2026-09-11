package ch.servicebookingtwo.common;
import java.util.Comparator;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ApiError.Failure.class)
    ResponseEntity<ApiError> domain(ApiError.Failure failure) { return error(failure.status(), failure.code()); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException failure) {
        var fields = failure.getBindingResult().getFieldErrors().stream()
            .sorted(Comparator.comparing(org.springframework.validation.FieldError::getField)
                .thenComparing(field -> field.getCode() == null ? "" : field.getCode()))
            .map(field -> new ApiError.FieldError(field.getField(), validationKey(field.getCode())))
            .toList();
        return ResponseEntity.unprocessableEntity().cacheControl(CacheControl.noStore()).body(ApiError.validation(fields));
    }
    @ExceptionHandler({HttpMessageNotReadableException.class, IllegalArgumentException.class})
    ResponseEntity<ApiError> invalid(Exception ignored) { return error(422, "INVALID_INPUT"); }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> conflict() { return error(409, "CONFLICT"); }
    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiError> forbidden() { return error(403, "FORBIDDEN"); }
    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ApiError> missing() { return error(404, "NOT_FOUND"); }
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ApiError> unsupported() { return error(405, "METHOD_NOT_ALLOWED"); }
    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> unexpected() { return error(500, "INTERNAL_ERROR"); }
    private ResponseEntity<ApiError> error(int status, String code) {
        return ResponseEntity.status(status).cacheControl(CacheControl.noStore()).body(ApiError.of(code));
    }
    private static String validationKey(String code) {
        return switch (code == null ? "" : code) {
            case "Email" -> "validation.email";
            case "NotBlank" -> "validation.notBlank";
            default -> "validation.invalid";
        };
    }
}
