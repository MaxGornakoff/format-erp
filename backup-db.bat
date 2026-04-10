@echo off
setlocal EnableExtensions

REM =============================================================
REM Format ERP - Simple MySQL backup with 3-file rotation
REM Saves backups into .\backups\ and overwrites the oldest slot.
REM =============================================================

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

set "ENV_FILE=%ROOT_DIR%\backend\.env"
set "ARTISAN=%ROOT_DIR%\backend\artisan"
set "BACKUP_DIR=%ROOT_DIR%\backups"
set "STATE_FILE=%BACKUP_DIR%\.backup-slot"

REM Optional: set an explicit path if mysqldump.exe is not in PATH
set "MYSQLDUMP_PATH="
set "PHP_EXE="

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

if not exist "%ENV_FILE%" (
    echo [ERROR] File not found: %ENV_FILE%
    exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
    if /I "%%A"=="DB_HOST" set "DB_HOST=%%B"
    if /I "%%A"=="DB_PORT" set "DB_PORT=%%B"
    if /I "%%A"=="DB_DATABASE" set "DB_DATABASE=%%B"
    if /I "%%A"=="DB_USERNAME" set "DB_USERNAME=%%B"
    if /I "%%A"=="DB_PASSWORD" set "DB_PASSWORD=%%B"
)

if not defined DB_HOST set "DB_HOST=127.0.0.1"
if not defined DB_PORT set "DB_PORT=3306"

set "MYSQLDUMP_EXE="
if defined MYSQLDUMP_PATH if exist "%MYSQLDUMP_PATH%" set "MYSQLDUMP_EXE=%MYSQLDUMP_PATH%"
if not defined MYSQLDUMP_EXE for %%I in (mysqldump.exe) do set "MYSQLDUMP_EXE=%%~$PATH:I"
if not defined MYSQLDUMP_EXE if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" set "MYSQLDUMP_EXE=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe"
if not defined MYSQLDUMP_EXE if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe" set "MYSQLDUMP_EXE=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe"
if not defined MYSQLDUMP_EXE if exist "C:\xampp\mysql\bin\mysqldump.exe" set "MYSQLDUMP_EXE=C:\xampp\mysql\bin\mysqldump.exe"
if not defined MYSQLDUMP_EXE if exist "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqldump.exe" set "MYSQLDUMP_EXE=C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqldump.exe"

if not defined PHP_EXE for %%I in (php.exe) do set "PHP_EXE=%%~$PATH:I"
if not defined PHP_EXE if exist "C:\php\php.exe" set "PHP_EXE=C:\php\php.exe"

set "SLOT=1"
if exist "%STATE_FILE%" set /p SLOT=<"%STATE_FILE%"
if "%SLOT%"=="" set "SLOT=1"
if %SLOT% LSS 1 set "SLOT=1"
if %SLOT% GTR 3 set "SLOT=1"

set "BACKUP_FILE=%BACKUP_DIR%\%DB_DATABASE%_backup_%SLOT%.sql"
set "INFO_FILE=%BACKUP_DIR%\%DB_DATABASE%_backup_%SLOT%.txt"

echo [INFO] Creating backup for database "%DB_DATABASE%" into slot %SLOT%...

set "BACKUP_OK=0"

if defined MYSQLDUMP_EXE (
    echo [INFO] Using mysqldump: "%MYSQLDUMP_EXE%"
    if defined DB_PASSWORD (
        "%MYSQLDUMP_EXE%" --host="%DB_HOST%" --port=%DB_PORT% --user="%DB_USERNAME%" --password="%DB_PASSWORD%" --default-character-set=utf8mb4 --single-transaction --routines --triggers --column-statistics=0 "%DB_DATABASE%" > "%BACKUP_FILE%"
    ) else (
        "%MYSQLDUMP_EXE%" --host="%DB_HOST%" --port=%DB_PORT% --user="%DB_USERNAME%" --default-character-set=utf8mb4 --single-transaction --routines --triggers --column-statistics=0 "%DB_DATABASE%" > "%BACKUP_FILE%"
    )

    if not errorlevel 1 set "BACKUP_OK=1"
)

if "%BACKUP_OK%"=="0" (
    if exist "%BACKUP_FILE%" del /q "%BACKUP_FILE%"

    if not defined PHP_EXE (
        echo [ERROR] php.exe was not found, and mysqldump.exe is unavailable.
        exit /b 1
    )

    echo [WARN] mysqldump.exe not available or failed. Using Laravel fallback exporter...
    "%PHP_EXE%" "%ARTISAN%" app:backup-database "%BACKUP_FILE%"

    if not errorlevel 1 set "BACKUP_OK=1"
)

if not "%BACKUP_OK%"=="1" (
    echo [ERROR] Backup failed.
    if exist "%BACKUP_FILE%" del /q "%BACKUP_FILE%"
    exit /b 1
)

> "%INFO_FILE%" echo Backup created: %DATE% %TIME%
>> "%INFO_FILE%" echo Database: %DB_DATABASE%
>> "%INFO_FILE%" echo Host: %DB_HOST%:%DB_PORT%
>> "%INFO_FILE%" echo File: %BACKUP_FILE%

set /a NEXT_SLOT=SLOT+1
if %NEXT_SLOT% GTR 3 set "NEXT_SLOT=1"
> "%STATE_FILE%" echo %NEXT_SLOT%

echo [OK] Backup saved to:
echo      %BACKUP_FILE%
echo [OK] Next run will use slot %NEXT_SLOT%

exit /b 0
