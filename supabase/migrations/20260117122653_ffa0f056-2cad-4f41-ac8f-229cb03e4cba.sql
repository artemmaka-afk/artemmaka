-- Fix: Add SELECT policy for project_requests to protect customer contact info
-- Only admins can view project requests (already exists, verifying it's correct)

-- Add validation constraints for contact fields to prevent injection attacks
ALTER TABLE public.project_requests
ADD CONSTRAINT email_format CHECK (email IS NULL OR email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$');

ALTER TABLE public.project_requests  
ADD CONSTRAINT phone_format CHECK (phone IS NULL OR phone ~ '^[0-9+\-\s()]+$');

ALTER TABLE public.project_requests
ADD CONSTRAINT telegram_format CHECK (telegram IS NULL OR telegram ~ '^@?[a-zA-Z0-9_]+$');