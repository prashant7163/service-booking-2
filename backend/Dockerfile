FROM eclipse-temurin:21-jdk@sha256:1f79c73404fb0cccf9a3459eda22892f368d994b1028d6fb1ae871c1f49749a6 AS development
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -q -DskipTests dependency:go-offline
COPY src src
CMD ["./mvnw", "-q", "-DskipTests", "spring-boot:run"]

FROM development AS build
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre@sha256:a80c51f2d09a3e7e00d521f1c817bbceb6b3be94109b4a784d46078099882dda AS runtime
WORKDIR /app
COPY --from=build /app/target/service-booking-two-0.1.0-SNAPSHOT.jar app.jar
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
