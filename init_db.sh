#!/bin/bash
cd ~/RoundCut

# Create the PostgreSQL initialization script if it doesn't exist
mkdir -p docker-entrypoint-initdb.d

cat > docker-entrypoint-initdb.d/01-schema.sql << 'SQLEOF'
-- Create schema
CREATE SCHEMA IF NOT EXISTS metal_project;

-- Set default schema for this database  
ALTER DATABASE metal_project SET search_path TO metal_project, public;
SQLEOF

# Remove old database volume to force reinitialization
docker-compose down -v

# Rebuild and start containers
docker-compose up -d --build

# Wait for database to be ready
echo "Waiting for database initialization..."
sleep 10

# Check backend status
docker-compose logs backend --tail=20
