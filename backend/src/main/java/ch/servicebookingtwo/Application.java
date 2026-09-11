package ch.servicebookingtwo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication(excludeName = "org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration")
public class Application {
    public static void main(String[] args) { SpringApplication.run(Application.class, args); }
}
