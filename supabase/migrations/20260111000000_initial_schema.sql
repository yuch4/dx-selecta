-- DX Selecta Initial Migration
-- Creates core tables: users, tenants, tenant_members
-- With RLS policies for secure multi-tenant access

-- ============================================================
-- 1. USERS TABLE (linked to Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. TENANTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'business', 'enterprise')),
  search_scope TEXT NOT NULL DEFAULT 'JP_ONLY' CHECK (search_scope IN ('JP_ONLY', 'JP_GLOBAL')),
  ingestion_mode TEXT NOT NULL DEFAULT 'CURATED' CHECK (ingestion_mode IN ('CURATED', 'BROAD')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Users can only access tenants they are members of
CREATE POLICY "Users can view tenants they belong to"
  ON public.tenants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members
      WHERE tenant_members.tenant_id = tenants.id
      AND tenant_members.user_id = auth.uid()
    )
  );

-- Only owners/admins can update tenant
CREATE POLICY "Owners and admins can update tenant"
  ON public.tenants
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members
      WHERE tenant_members.tenant_id = tenants.id
      AND tenant_members.user_id = auth.uid()
      AND tenant_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tenant_members
      WHERE tenant_members.tenant_id = tenants.id
      AND tenant_members.user_id = auth.uid()
      AND tenant_members.role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- 3. TENANT_MEMBERS TABLE (join table)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Enable RLS
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

-- Users can view members of tenants they belong to
CREATE POLICY "Users can view tenant members"
  ON public.tenant_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members AS tm
      WHERE tm.tenant_id = tenant_members.tenant_id
      AND tm.user_id = auth.uid()
    )
  );

-- Only owners/admins can add members
CREATE POLICY "Owners and admins can add members"
  ON public.tenant_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tenant_members AS tm
      WHERE tm.tenant_id = tenant_members.tenant_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
    OR
    -- Allow first member (owner) to be created
    NOT EXISTS (
      SELECT 1 FROM public.tenant_members AS tm
      WHERE tm.tenant_id = tenant_members.tenant_id
    )
  );

-- Only owners can remove members or owners/admins can remove non-owners
CREATE POLICY "Owners and admins can remove members"
  ON public.tenant_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members AS tm
      WHERE tm.tenant_id = tenant_members.tenant_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'owner'
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM public.tenant_members AS tm
        WHERE tm.tenant_id = tenant_members.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
      )
      AND tenant_members.role = 'member'
    )
  );

-- ============================================================
-- 4. HELPER FUNCTIONS
-- ============================================================

-- Function to create a new tenant and add the creator as owner
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
  -- Create tenant
  INSERT INTO public.tenants (name)
  VALUES (tenant_name)
  RETURNING id INTO new_tenant_id;
  
  -- Add creator as owner
  INSERT INTO public.tenant_members (tenant_id, user_id, role)
  VALUES (new_tenant_id, auth.uid(), 'owner');
  
  RETURN new_tenant_id;
END;
$$;

-- ============================================================
-- 5. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON public.tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON public.tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================================
-- 6. UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to users
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Apply to tenants
DROP TRIGGER IF EXISTS set_tenants_updated_at ON public.tenants;
CREATE TRIGGER set_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
