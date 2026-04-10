<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use PDO;
use Throwable;

class BackupDatabaseCommand extends Command
{
    protected $signature = 'app:backup-database {path? : Full path to the .sql backup file} {--connection= : Database connection name}';

    protected $description = 'Create a SQL database backup using Laravel when mysqldump is unavailable';

    public function handle(): int
    {
        $connection = (string) ($this->option('connection') ?: config('database.default'));
        $path = $this->argument('path');

        if (!is_string($path) || trim($path) === '') {
            $database = (string) config("database.connections.{$connection}.database", 'database');
            $timestamp = Carbon::now()->format('Ymd_His');
            $path = storage_path("app/backups/{$database}_{$timestamp}.sql");
        }

        $directory = dirname($path);
        if (!is_dir($directory) && !mkdir($directory, 0777, true) && !is_dir($directory)) {
            $this->error("Unable to create directory: {$directory}");
            return self::FAILURE;
        }

        try {
            $db = DB::connection($connection);
            $pdo = $db->getPdo();
            $databaseName = (string) ($db->getDatabaseName() ?: config("database.connections.{$connection}.database", 'database'));
            $tables = $db->select("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");

            $handle = fopen($path, 'wb');
            if ($handle === false) {
                throw new \RuntimeException("Cannot open file for writing: {$path}");
            }

            fwrite($handle, "-- Format ERP database backup\n");
            fwrite($handle, "-- Generated at: " . Carbon::now()->toDateTimeString() . "\n");
            fwrite($handle, "-- Database: {$databaseName}\n");
            fwrite($handle, "-- Connection: {$connection}\n\n");
            fwrite($handle, "SET NAMES utf8mb4;\n");
            fwrite($handle, "SET FOREIGN_KEY_CHECKS=0;\n");
            fwrite($handle, "SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';\n\n");

            $this->info("Creating SQL backup for [{$databaseName}]...");

            foreach ($tables as $tableRow) {
                $rowValues = array_values((array) $tableRow);
                $table = (string) ($rowValues[0] ?? '');

                if ($table === '') {
                    continue;
                }

                $this->line(" - {$table}");

                $createRow = $db->selectOne("SHOW CREATE TABLE `{$table}`");
                $createValues = array_values((array) $createRow);
                $createSql = (string) ($createValues[1] ?? '');

                fwrite($handle, "-- --------------------------------------------------------\n");
                fwrite($handle, "-- Table structure for `{$table}`\n");
                fwrite($handle, "-- --------------------------------------------------------\n");
                fwrite($handle, "DROP TABLE IF EXISTS `{$table}`;\n");
                fwrite($handle, $createSql . ";\n\n");

                $statement = $pdo->query("SELECT * FROM `{$table}`");
                if ($statement === false) {
                    fwrite($handle, "\n");
                    continue;
                }

                $rowCount = 0;
                while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
                    if (!is_array($row)) {
                        continue;
                    }

                    $columns = array_map(
                        static fn (string $column): string => '`' . str_replace('`', '``', $column) . '`',
                        array_keys($row)
                    );

                    $values = array_map(
                        fn ($value): string => $this->toSqlValue($pdo, $value),
                        array_values($row)
                    );

                    fwrite(
                        $handle,
                        "INSERT INTO `{$table}` (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $values) . ");\n"
                    );
                    $rowCount++;
                }

                if ($rowCount > 0) {
                    fwrite($handle, "\n");
                }
            }

            fwrite($handle, "SET FOREIGN_KEY_CHECKS=1;\n");
            fclose($handle);

            $this->info("Backup written to: {$path}");
            return self::SUCCESS;
        } catch (Throwable $e) {
            if (isset($handle) && is_resource($handle)) {
                fclose($handle);
            }

            if (is_string($path) && is_file($path)) {
                @unlink($path);
            }

            $this->error('Backup failed: ' . $e->getMessage());
            return self::FAILURE;
        }
    }

    private function toSqlValue(PDO $pdo, mixed $value): string
    {
        if ($value === null) {
            return 'NULL';
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        $quoted = $pdo->quote((string) $value);

        if ($quoted === false) {
            return "'" . str_replace("'", "''", (string) $value) . "'";
        }

        return $quoted;
    }
}
