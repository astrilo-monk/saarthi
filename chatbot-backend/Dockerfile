# Use official Maven image to build the app
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies
RUN mvn dependency:go-offline -B
# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# Use lightweight JRE for running the app
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/chatbot-backend-1.0.0.jar app.jar

# Expose port (Render sets PORT env variable)
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
