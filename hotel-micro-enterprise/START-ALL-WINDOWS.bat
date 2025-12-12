@echo off
REM Hotel Management System - Windows Startup Script
REM This script starts all microservices in separate command windows

echo ========================================
echo Hotel Management System - Windows
echo ========================================
echo.

REM Detect Maven command (mvn or mvnw)
set MVN_CMD=mvn
where mvn >nul 2>&1
if errorlevel 1 (
    echo Maven not found in PATH. Using Maven Wrapper...
    if exist mvnw.cmd (
        set MVN_CMD=mvnw.cmd
    ) else (
        echo ERROR: Neither Maven nor Maven Wrapper found!
        echo Please install Maven from: https://maven.apache.org/download.cgi
        pause
        exit /b 1
    )
) else (
    echo ✓ Maven found in PATH
)
echo Using: %MVN_CMD%
echo.

REM Check if MongoDB is running
echo [Step 1/11] Checking MongoDB Service...
sc query MongoDB | find "RUNNING" >nul
if errorlevel 1 (
    echo MongoDB is not running. Starting MongoDB...
    net start MongoDB
    if errorlevel 1 (
        echo ERROR: Failed to start MongoDB. Please start it manually.
        echo Run: net start MongoDB
        pause
        exit /b 1
    )
) else (
    echo ✓ MongoDB is already running
)
timeout /t 3

echo.
echo [Step 2/11] Starting Service Registry (Eureka) on port 8761...
cd service-registry
start "Service Registry - Port 8761" cmd /k "echo Service Registry (Eureka) && echo Port: 8761 && echo. && %MVN_CMD% spring-boot:run"
cd ..
echo ✓ Service Registry started (waiting 30 seconds for initialization...)
timeout /t 30

echo.
echo [Step 3/11] Starting User Service on port 8091...
cd user-service
start "User Service - Port 8091" cmd /k "echo User Service && echo Port: 8091 && echo. && %MVN_CMD% spring-boot:run"
cd ..
echo ✓ User Service started
timeout /t 10

echo.
echo [Step 4/11] Starting Hotel Service on port 8092...
cd hotel-service
start "Hotel Service - Port 8092" cmd /k "echo Hotel Service && echo Port: 8092 && echo. && %MVN_CMD% spring-boot:run"
cd ..
echo ✓ Hotel Service started
timeout /t 10

echo.
echo [Step 5/11] Starting Booking Service on port 8093...
cd booking-service
start "Booking Service - Port 8093" cmd /k "echo Booking Service && echo Port: 8093 && echo. && %MVN_CMD% spring-boot:run"
cd ..
echo ✓ Booking Service started
timeout /t 10

echo.
echo [Step 6/11] Starting Payment Service on port 8094...
cd payment-service
start "Payment Service - Port 8094" cmd /k "echo Payment Service && echo Port: 8094 && echo. && %MVN_CMD% spring-boot:run"
cd ..
echo ✓ Payment Service started
timeout /t 10

echo.
echo [Step 7/11] Starting Review Service on port 8095...
cd review-service
start "Review Service - Port 8095" cmd /k "echo Review Service && echo Port: 8095 && echo. && %MVN_CMD% spring-boot:run"
cd ..
echo ✓ Review Service started
timeout /t 10

echo.
echo [Step 8/11] Starting Notification Service on port 8096...
cd notification-service
start "Notification Service - Port 8096" cmd /k "echo Notification Service && echo Port: 8096 && echo. && %MVN_CMD% spring-boot:run"
cd ..
echo ✓ Notification Service started
timeout /t 10

echo.
echo [Step 9/11] Starting Analytics Service on port 8097...
cd analytics-service
start "Analytics Service - Port 8097" cmd /k "echo Analytics Service && echo Port: 8097 && echo. && %MVN_CMD% spring-boot:run"
cd ..
echo ✓ Analytics Service started
timeout /t 10

echo.
echo [Step 10/11] Starting API Gateway on port 8080...
cd api-gateway
start "API Gateway - Port 8080" cmd /k "echo API Gateway && echo Port: 8080 && echo. && %MVN_CMD% spring-boot:run"
cd ..
echo ✓ API Gateway started
timeout /t 10

echo.
echo ========================================
echo ✅ All Backend Services Started!
echo ========================================
echo.
echo 9 service windows have been opened.
echo.
echo 📊 Service Dashboard (Eureka):
echo    http://localhost:8761
echo.
echo 🌐 API Gateway:
echo    http://localhost:8080
echo.
echo 📝 Login Credentials:
echo    Admin: admin@hotel.com / password123
echo    User:  john.smith@example.com / password123
echo.
echo ⏰ Wait 2-3 minutes for all services to register with Eureka.
echo.
echo [Step 11/11] Starting Angular Frontend...
echo.
set /p startFrontend="Do you want to start the Angular frontend? (Y/N): "
if /i "%startFrontend%"=="Y" (
    cd ..\enterprise-dashboard
    start "Angular Frontend - Port 4200" cmd /k "echo Angular Frontend && echo Port: 4200 && echo URL: http://localhost:4200 && echo. && npm start"
    cd ..\hotel-micro-enterprise
    echo ✓ Angular Frontend started on http://localhost:4200
) else (
    echo.
    echo To start frontend manually later:
    echo   cd ..\enterprise-dashboard
    echo   npm start
)

echo.
echo ========================================
echo 🎉 Startup Complete!
echo ========================================
echo.
pause
