
Hotel Management Microservices - Enterprise (Option A) - Minimal but feature-complete scaffold.

Includes:
- config-server (Spring Cloud Config)
- service-registry (Eureka)
- api-gateway (Spring Cloud Gateway)
- common (shared DTOs)
- user-service (with basic JWT stub)
- hotel-service
- booking-service (calls hotel & user)
- payment-service (strategy stub)
- review-service
- notification-service (Kafka consumer stub)
- analytics-service (aggregation stub)
- docker-compose.yml to run MongoDB and Kafka (zookeeper) locally
- simple frontend (static HTML) hitting the gateway

Notes:
- This is a scaffold with runnable modules. Replace placeholders (like secrets, real payment integrations) for production.
- Required: JDK 17+, Maven, Docker (for compose), Node if extending frontend.
