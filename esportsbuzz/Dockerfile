# --- Stage 1: Build the application ---
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# --- Stage 2: Run the application ---
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
# This copies the compiled jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Render injects the PORT dynamically
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]