
#!/bin/bash
# Start services sequentially (requires mvn and Java 17)
for d in service-registry config-server api-gateway user-service hotel-service booking-service payment-service review-service notification-service analytics-service; do
  echo "Starting $d... (in background)"
  (cd $d && mvn -q spring-boot:run) &
  sleep 2
done
echo "Started (check logs)."
