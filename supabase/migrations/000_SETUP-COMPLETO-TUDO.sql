-- ============================================
-- 🚀 SCRIPT ÚNICO COMPLETO - CRIAR TUDO DE UMA VEZ
-- Execute este script no SQL Editor do Supabase Dashboard
-- Link: https://supabase.com/dashboard/project/fdpnerksqonprirohxkr/sql/new
-- ============================================
-- 
-- Este script cria:
-- ✅ Todas as tabelas
-- ✅ Todas as funções
-- ✅ Todas as políticas RLS (corrigidas)
-- ✅ Todos os triggers
-- ✅ Storage bucket para imagens
-- ✅ Sistema de serviços
-- ✅ Permissões e configurações
--
-- ⚠️ IMPORTANTE: Execute este script UMA VEZ para configurar tudo!
-- ============================================

-- ============================================
-- 1. CRIAR ENUM E TIPOS
-- ============================================

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'client');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. CRIAR TODAS AS TABELAS (PRIMEIRO!)
-- ============================================

-- Tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Tabela models
CREATE TABLE IF NOT EXISTS public.models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  age INTEGER,
  height INTEGER,
  measurements TEXT,
  email TEXT,
  phone TEXT,
  instagram TEXT,
  profile_image_url TEXT,
  gallery_images TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela clients
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  subscription_tier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela quotation_requests
CREATE TABLE IF NOT EXISTS public.quotation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id UUID REFERENCES public.models(id) ON DELETE CASCADE NOT NULL,
  project_description TEXT NOT NULL,
  event_date DATE,
  budget_range TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela client_packages
CREATE TABLE IF NOT EXISTS public.client_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela package_activities
CREATE TABLE IF NOT EXISTS public.package_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.client_packages(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  completed_date DATE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  base_price DECIMAL(10,2),
  unit TEXT DEFAULT 'hour',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela package_services
CREATE TABLE IF NOT EXISTS public.package_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.client_packages(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (package_id, service_id)
);

-- ============================================
-- 3. CRIAR FUNÇÕES (DEPOIS DAS TABELAS)
-- ============================================

-- Função para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Função para criar perfil ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================
-- 4. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_services ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. REMOVER POLÍTICAS ANTIGAS (SE EXISTIREM)
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- User roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can view their roles" ON public.user_roles;

-- Models
DROP POLICY IF EXISTS "Anyone can view active models" ON public.models;
DROP POLICY IF EXISTS "Admins can manage models" ON public.models;
DROP POLICY IF EXISTS "Admins can view all models" ON public.models;

-- Clients
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can manage clients" ON public.clients;

-- Quotation requests
DROP POLICY IF EXISTS "Users can view their own requests" ON public.quotation_requests;
DROP POLICY IF EXISTS "Authenticated users can create requests" ON public.quotation_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.quotation_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.quotation_requests;

-- Payments
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Clients can view their payments" ON public.payments;

-- Client packages
DROP POLICY IF EXISTS "Admins can manage packages" ON public.client_packages;
DROP POLICY IF EXISTS "Clients can view their packages" ON public.client_packages;

-- Package activities
DROP POLICY IF EXISTS "Admins can manage activities" ON public.package_activities;
DROP POLICY IF EXISTS "Clients can view their activities" ON public.package_activities;

-- Services
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;

-- Package services
DROP POLICY IF EXISTS "Admins can manage package services" ON public.package_services;
DROP POLICY IF EXISTS "Clients can view their package services" ON public.package_services;

-- Storage policies
DROP POLICY IF EXISTS "Public can view model photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload model photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update model photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete model photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload model photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update model photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete model photos" ON storage.objects;

-- ============================================
-- 6. CRIAR POLÍTICAS RLS CORRETAS
-- ============================================

-- Profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- User roles (CORRIGIDO - permite acesso autenticado)
CREATE POLICY "Authenticated users can view their roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- Models
CREATE POLICY "Anyone can view active models"
  ON public.models FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all models"
  ON public.models FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage models"
  ON public.models FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Clients
CREATE POLICY "Admins can view all clients"
  ON public.clients FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage clients"
  ON public.clients FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Quotation requests
CREATE POLICY "Users can view their own requests"
  ON public.quotation_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create requests"
  ON public.quotation_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
  ON public.quotation_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests"
  ON public.quotation_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Payments
CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      JOIN public.profiles ON profiles.email = clients.email
      WHERE clients.id = payments.client_id
      AND profiles.id = auth.uid()
    )
  );

-- Client packages
CREATE POLICY "Admins can manage packages"
  ON public.client_packages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their packages"
  ON public.client_packages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      JOIN public.profiles ON profiles.email = clients.email
      WHERE clients.id = client_packages.client_id
      AND profiles.id = auth.uid()
    )
  );

-- Package activities
CREATE POLICY "Admins can manage activities"
  ON public.package_activities FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their activities"
  ON public.package_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_packages cp
      JOIN public.clients c ON c.id = cp.client_id
      JOIN public.profiles p ON p.email = c.email
      WHERE cp.id = package_activities.package_id
      AND p.id = auth.uid()
    )
  );

-- Services
CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active services"
  ON public.services FOR SELECT
  USING (is_active = true);

-- Package services
CREATE POLICY "Admins can manage package services"
  ON public.package_services FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their package services"
  ON public.package_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_packages cp
      JOIN public.clients c ON c.id = cp.client_id
      JOIN public.profiles p ON p.email = c.email
      WHERE cp.id = package_services.package_id
      AND p.id = auth.uid()
    )
  );

-- ============================================
-- 7. CRIAR TRIGGERS
-- ============================================

-- Trigger para criar perfil ao criar usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_models_updated_at ON public.models;
CREATE TRIGGER update_models_updated_at
  BEFORE UPDATE ON public.models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotation_requests_updated_at ON public.quotation_requests;
CREATE TRIGGER update_quotation_requests_updated_at
  BEFORE UPDATE ON public.quotation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_packages_updated_at ON public.client_packages;
CREATE TRIGGER update_client_packages_updated_at
  BEFORE UPDATE ON public.client_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_package_activities_updated_at ON public.package_activities;
CREATE TRIGGER update_package_activities_updated_at
  BEFORE UPDATE ON public.package_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_package_services_updated_at ON public.package_services;
CREATE TRIGGER update_package_services_updated_at
  BEFORE UPDATE ON public.package_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8. GARANTIR PERMISSÕES DO SCHEMA
-- ============================================

-- Garantir que anon e authenticated têm acesso ao schema public
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Garantir permissões nas tabelas existentes
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Garantir permissões para tabelas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;

-- Garantir permissões específicas para cada tabela
GRANT SELECT ON public.models TO anon, authenticated;
GRANT SELECT ON public.user_roles TO anon, authenticated;
GRANT SELECT ON public.quotation_requests TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.clients TO anon, authenticated;
GRANT SELECT ON public.services TO anon, authenticated;

-- ============================================
-- 9. CRIAR STORAGE BUCKET PARA IMAGENS
-- ============================================

-- Remover bucket antigo se existir (para recriar com configurações corretas)
DELETE FROM storage.buckets WHERE id = 'models';

-- Criar bucket "models" (nome usado no código)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'models',
  'models',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Políticas de storage para bucket "models"
CREATE POLICY "Public can view model photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'models');

-- Permitir que QUALQUER usuário autenticado faça upload
CREATE POLICY "Authenticated users can upload model photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'models' AND
    auth.uid() IS NOT NULL
  );

-- Permitir que QUALQUER usuário autenticado atualize fotos
CREATE POLICY "Authenticated users can update model photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'models' AND
    auth.uid() IS NOT NULL
  );

-- Permitir que QUALQUER usuário autenticado delete fotos
CREATE POLICY "Authenticated users can delete model photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'models' AND
    auth.uid() IS NOT NULL
  );

-- ============================================
-- 10. INSERIR SERVIÇOS INICIAIS
-- ============================================

INSERT INTO public.services (name, description, category, base_price, unit) VALUES
  ('Produção de Conteúdo Audiovisual', 'Produção de conteúdo audiovisual premiado', 'Produção', 150.00, 'hour'),
  ('Gestão de Redes Sociais', 'Gestão completa de redes sociais', 'Marketing', 100.00, 'hour'),
  ('Criação de Conteúdo', 'Criação de posts, stories e reels', 'Marketing', 80.00, 'hour'),
  ('Fotografia Profissional', 'Sessão de fotografia profissional', 'Produção', 200.00, 'session'),
  ('Videografia', 'Gravação e edição de vídeos', 'Produção', 180.00, 'hour'),
  ('Consultoria em Marketing Digital', 'Consultoria estratégica em marketing', 'Consultoria', 120.00, 'hour')
ON CONFLICT DO NOTHING;

-- ============================================
-- 11. MENSAGEM DE SUCESSO
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ SCRIPT EXECUTADO COM SUCESSO!                            ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Todas as tabelas criadas/verificadas';
  RAISE NOTICE '✅ Todas as funções criadas';
  RAISE NOTICE '✅ Todas as políticas RLS configuradas (incluindo correções)';
  RAISE NOTICE '✅ Todos os triggers criados';
  RAISE NOTICE '✅ Storage bucket "models" criado';
  RAISE NOTICE '✅ Serviços iniciais inseridos';
  RAISE NOTICE '✅ Permissões garantidas';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Próximos passos:';
  RAISE NOTICE '   1. Recarregue o site';
  RAISE NOTICE '   2. Faça login novamente';
  RAISE NOTICE '   3. Execute este SQL para tornar seu usuário admin:';
  RAISE NOTICE '      INSERT INTO public.user_roles (user_id, role)';
  RAISE NOTICE '      SELECT id, ''admin''::app_role';
  RAISE NOTICE '      FROM auth.users';
  RAISE NOTICE '      WHERE email = ''seu-email@exemplo.com'';';
  RAISE NOTICE '';
END $$;

