-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. RLS policies for user_roles (users can read their own roles)
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- 6. Update calculator_config: admins can update
CREATE POLICY "Admins can update calculator config"
ON public.calculator_config FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Update project_requests: admins can SELECT, UPDATE
CREATE POLICY "Admins can view all project requests"
ON public.project_requests FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update project requests"
ON public.project_requests FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Add scenario_price to calculator_config
ALTER TABLE public.calculator_config 
ADD COLUMN IF NOT EXISTS scenario_price_per_min integer NOT NULL DEFAULT 20000;