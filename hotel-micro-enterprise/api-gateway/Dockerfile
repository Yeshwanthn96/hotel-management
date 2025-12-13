FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# Copy parent pom and common module first
COPY ../pom.xml ../pom.xml
COPY ../common ../common

# Build common module
WORKDIR /app/../common
RUN mvn clean install -DskipTests

# Build api-gateway
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xmx256m -Xms128m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
