-- Fix tenant_members RLS recursion by using security definer helpers

CREATE OR REPLACE FUNCTION public.is_tenant_member(check_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_members tm
    WHERE tm.tenant_id = check_tenant_id
      AND tm.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_role(check_tenant_id uuid, required_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_members tm
    WHERE tm.tenant_id = check_tenant_id
      AND tm.user_id = auth.uid()
      AND tm.role = required_role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_role_in(check_tenant_id uuid, required_roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_members tm
    WHERE tm.tenant_id = check_tenant_id
      AND tm.user_id = auth.uid()
      AND tm.role = ANY(required_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_empty(check_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.tenant_members tm
    WHERE tm.tenant_id = check_tenant_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_tenant_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_tenant_role_in(uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_empty(uuid) TO authenticated;

DROP POLICY IF EXISTS "Users can view tenant members" ON public.tenant_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.tenant_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.tenant_members;

CREATE POLICY "Users can view tenant members"
  ON public.tenant_members
  FOR SELECT
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Owners and admins can add members"
  ON public.tenant_members
  FOR INSERT
  WITH CHECK (
    public.has_tenant_role_in(tenant_id, ARRAY['owner', 'admin'])
    OR (
      public.is_tenant_empty(tenant_id)
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

CREATE POLICY "Owners and admins can remove members"
  ON public.tenant_members
  FOR DELETE
  USING (
    public.has_tenant_role(tenant_id, 'owner')
    OR (
      public.has_tenant_role(tenant_id, 'admin')
      AND role = 'member'
    )
  );
