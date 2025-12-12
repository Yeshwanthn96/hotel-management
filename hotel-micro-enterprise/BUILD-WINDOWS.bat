@echo off
REM Hotel Management System - Build Script for Windows
REM This script builds all microservices

echo ========================================
echo Building Hotel Management System
echo ========================================
echo.

REM Detect Maven command (mvn or mvnw)
set MVN_CMD=mvn
where mvn >nul 2>&1
if errorlevel 1 (
    echo Maven not found in PATH. Checking for Maven Wrapper...
    if exist mvnw.cmd (
        set MVN_CMD=mvnw.cmd
        echo ✓ Using Maven Wrapper (mvnw.cmd)
    ) else (
        echo.
        echo ❌ ERROR: Neither Maven nor Maven Wrapper found!
        echo.
        echo Please install Maven:
        echo   1. Download from: https://maven.apache.org/download.cgi
        echo   2. Extract to: C:\Program Files\Apache\maven
        echo   3. Add to PATH:
        echo      setx MAVEN_HOME "C:\Program Files\Apache\maven" /M
        echo      setx PATH "%%PATH%%;%%MAVEN_HOME%%\bin" /M
        echo.
        pause
        exit /b 1
    )
) else (
    echo ✓ Using Maven from PATH
)
echo.

REM Check JAVA_HOME
if not defined JAVA_HOME (
    echo ⚠️  Warning: JAVA_HOME is not set!
    echo Looking for Java in PATH...
    where java >nul 2>&1
    if errorlevel 1 (
        echo ❌ ERROR: Java not found!
        echo Please install JDK 17 or higher and set JAVA_HOME
        pause
        exit /b 1
    )
    echo ✓ Java found in PATH
) else (
    echo ✓ JAVA_HOME: %JAVA_HOME%
)
echo.

echo Starting build process...
echo This will take 3-5 minutes...
echo.

%MVN_CMD% clean install -DskipTests

if errorlevel 1 (
    echo.
    echo ❌ Build FAILED!
    echo Please check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ Build Successful!
echo ========================================
echo.
echo All services have been compiled and packaged.
echo.
echo Next steps:
echo   1. Initialize MongoDB: mongosh ^< initialize-mongodb.js
echo   2. Start services: START-ALL-WINDOWS.bat
echo.
pause
