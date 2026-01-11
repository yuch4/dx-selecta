-- Ensure tenant creation also backfills public.users for existing auth accounts
CREATE OR REPLACE FUNCTION public.create_tenant_with_owner(
  tenant_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
    u.raw_user_meta_data->>'avatar_url'
  FROM auth.users AS u
  WHERE u.id = auth.uid()
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.tenants (name)
  VALUES (tenant_name)
  RETURNING id INTO new_tenant_id;

  INSERT INTO public.tenant_members (tenant_id, user_id, role)
  VALUES (new_tenant_id, auth.uid(), 'owner');

  RETURN new_tenant_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_tenant_with_owner(TEXT) TO authenticated;
