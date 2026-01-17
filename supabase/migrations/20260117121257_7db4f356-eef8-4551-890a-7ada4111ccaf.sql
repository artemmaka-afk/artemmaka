-- Add hide_pricing column to calculator_config
ALTER TABLE public.calculator_config 
ADD COLUMN hide_pricing boolean NOT NULL DEFAULT false;