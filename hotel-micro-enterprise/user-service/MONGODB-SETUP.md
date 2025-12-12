# MongoDB Setup Instructions

The User Service is currently running **WITHOUT MongoDB** using in-memory storage. Follow these steps to enable MongoDB when ready.

## Current Status

✅ User Service is running with **in-memory HashMap** storage
✅ Demo user available: `admin@hotel.com` / `admin123`
✅ All auth endpoints working without database

## When You're Ready to Enable MongoDB:

### 1. Install and Start MongoDB

```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0

# Or run manually
mongod --config /opt/homebrew/etc/mongod.conf --fork
```

### 2. Uncomment MongoDB Configuration

#### File: `pom.xml`

Uncomment lines 30-34:

```xml
<!-- MongoDB -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

#### File: `src/main/resources/application.yml`

Uncomment lines 6-9:

```yaml
data:
  mongodb:
    uri: mongodb://localhost:27017/userdb
```

#### File: `UserServiceApplication.java`

Uncomment:

```java
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@EnableMongoRepositories
```

#### File: `model/User.java`

Uncomment:

```java
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Document(collection = "users")
@Id
@Indexed(unique = true)
```

#### File: `repository/UserRepository.java`

Uncomment the entire interface:

```java
@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

#### File: `service/AuthService.java`

Replace the in-memory implementation with MongoDB:

```java
// Comment out the HashMap
// private final Map<String, User> userStore = new HashMap<>();

// Uncomment the repository
@Autowired
private UserRepository userRepository;

// Update methods to use repository instead of userStore
```

### 3. Restart the User Service

```bash
# Kill the current service
ps aux | grep "user-service" | grep java | awk '{print $2}' | xargs kill -9

# Restart from project root
cd /path/to/hotel-micro-enterprise
mvn spring-boot:run -pl user-service
```

### 4. Verify MongoDB Connection

Check logs for:

```
MongoClient with metadata ... created with settings
```

## Current In-Memory Storage Details

- **Location**: `AuthService.java` constructor
- **Demo Users**: 1 admin user pre-loaded
- **Limitation**: Data lost on service restart
- **Password Encoding**: BCrypt (same as MongoDB version)

## MongoDB Connection String

Default: `mongodb://localhost:27017/userdb`

To use a different MongoDB instance, update the URI in `application.yml`.
