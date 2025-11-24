-- Add is_trending column to products table
alter table products 
add column if not exists is_trending boolean default false;

-- Index for faster querying
create index if not exists products_is_trending_idx on products (is_trending);
