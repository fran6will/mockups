-- Fix security warning: Function public.update_updated_at_column has a role mutable search_path
-- We set the search_path to 'public' to prevent malicious code execution if someone manipulates the path.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
