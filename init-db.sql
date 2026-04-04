-- Create database and user for Veerha WMS
CREATE DATABASE veerha_wms_dev;
CREATE USER veerha WITH PASSWORD 'veerha123';
GRANT ALL PRIVILEGES ON DATABASE veerha_wms_dev TO veerha;
