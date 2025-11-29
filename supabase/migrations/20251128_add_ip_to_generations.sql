-- Add ip_address column to generations table
ALTER TABLE generations
ADD COLUMN IF NOT EXISTS ip_address INET;

-- Create an index for faster IP lookups
CREATE INDEX IF NOT EXISTS idx_generations_ip_address ON generations(ip_address);
