FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# Copy everything
COPY . .

# Build common first
WORKDIR /app/common
RUN mvn clean install -DskipTests -q

# Build all services
WORKDIR /app
RUN mvn clean package -DskipTests -q -pl service-registry,api-gateway,user-service,hotel-service,booking-service,payment-service,notification-service,review-service,analytics-service -am

FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy all jars
COPY --from=build /app/service-registry/target/*.jar service-registry.jar
COPY --from=build /app/api-gateway/target/*.jar api-gateway.jar
COPY --from=build /app/user-service/target/*.jar user-service.jar
COPY --from=build /app/hotel-service/target/*.jar hotel-service.jar
COPY --from=build /app/booking-service/target/*.jar booking-service.jar
COPY --from=build /app/payment-service/target/*.jar payment-service.jar
COPY --from=build /app/notification-service/target/*.jar notification-service.jar
COPY --from=build /app/review-service/target/*.jar review-service.jar
COPY --from=build /app/analytics-service/target/*.jar analytics-service.jar

# Copy startup script
COPY start-services.sh .
RUN chmod +x start-services.sh

EXPOSE 8080
ENV JAVA_OPTS="-Xmx512m -Xms256m"
CMD ["./start-services.sh"]
