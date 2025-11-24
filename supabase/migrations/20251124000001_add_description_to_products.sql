-- Add description column to products table
alter table products
add column if not exists description text;
