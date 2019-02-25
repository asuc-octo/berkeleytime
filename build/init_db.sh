#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE ROLE bt WITH superuser login;
    CREATE DATABASE bt_main;
    GRANT ALL PRIVILEGES ON DATABASE bt_main TO bt;
EOSQL

psql bt_main < /bt_main.sql