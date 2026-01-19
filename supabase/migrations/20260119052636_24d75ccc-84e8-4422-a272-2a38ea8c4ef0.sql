-- Fix: Add RLS policies to prevent unauthorized role modifications
-- The user_roles table should only allow admins to insert/update/delete roles
-- Note: First admin is assigned via the assign-first-admin edge function which uses service role key

-- Policy to allow only existing admins to insert new roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy to allow only existing admins to update roles
CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy to allow only existing admins to delete roles
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));