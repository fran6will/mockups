-- Add unique constraint to user_id in subscriptions table
-- This ensures that upsert works correctly for 1:1 user-subscription relationship
alter table subscriptions add constraint subscriptions_user_id_key unique (user_id);
