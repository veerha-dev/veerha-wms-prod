#!/bin/bash

# Setup script for local PostgreSQL database

echo "🔧 Setting up Veerha WMS Database..."

# Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
  echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
  echo "   Run: brew services start postgresql@16"
  exit 1
fi

echo "✅ PostgreSQL is running"

# Create database (try without password first)
echo "📦 Creating database 'veerha_wms_dev'..."

# Try to create database
psql postgres -c "CREATE DATABASE veerha_wms_dev;" 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ Database created successfully"
else
  echo "⚠️  Database might already exist or need credentials"
  echo "   Try manually: psql postgres -c \"CREATE DATABASE veerha_wms_dev;\""
fi

# Test connection
echo "🔌 Testing database connection..."
psql veerha_wms_dev -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Database connection successful"
  echo ""
  echo "📝 Update your .env file with:"
  echo "   DATABASE_URL=postgresql://localhost:5432/veerha_wms_dev"
else
  echo "⚠️  Could not connect to database"
  echo "   You may need to configure PostgreSQL authentication"
  echo ""
  echo "📝 Your DATABASE_URL format should be:"
  echo "   DATABASE_URL=postgresql://username:password@localhost:5432/veerha_wms_dev"
fi

echo ""
echo "Next steps:"
echo "1. Update apps/backend/.env with your DATABASE_URL"
echo "2. Run: npm run migrate"
echo "3. Run: npm run start:dev"
