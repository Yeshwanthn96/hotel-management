@echo off
REM Hotel Management System - Windows Stop Script
REM This script stops all running microservices

echo ========================================
echo Stopping Hotel Management System
echo ========================================
echo.

echo Stopping all service windows...

REM Stop all service command windows by title
taskkill /F /FI "WINDOWTITLE eq Service Registry*" 2>nul
taskkill /F /FI "WINDOWTITLE eq User Service*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Hotel Service*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Booking Service*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Payment Service*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Review Service*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Notification Service*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Analytics Service*" 2>nul
taskkill /F /FI "WINDOWTITLE eq API Gateway*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Angular Frontend*" 2>nul

echo.
echo Stopping any remaining Java processes (Spring Boot)...
REM Kill any Spring Boot processes on specific ports
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8761" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8091" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8092" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8093" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8094" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8095" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8096" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8097" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo.
echo Stopping Angular (port 4200)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":4200" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo.
echo ✅ All services stopped successfully!
echo.
echo MongoDB is still running. To stop MongoDB:
echo   net stop MongoDB
echo.
pause
