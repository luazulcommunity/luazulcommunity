-- ============================================
-- 🚀 SISTEMA DE MISSÕES E CONTRATOS
-- Execute este script no SQL Editor do Supabase Dashboard
-- Link: https://supabase.com/dashboard/project/fdpnerksqonprirohxkr/sql/new
-- ============================================
-- 
-- Este script adiciona:
-- ✅ Novos roles (luazul, influencer, associado)
-- ✅ Tabela de missões
-- ✅ Tabela de candidaturas de missões
-- ✅ Tabela de missões concluídas
-- ✅ Tabela de contratos
-- ✅ Políticas RLS
-- ✅ Triggers
--
-- ⚠️ IMPORTANTE: Execute após o script 000_SETUP-COMPLETO-TUDO.sql
-- ============================================

-- ============================================
-- 1. ATUALIZAR ENUM DE ROLES
-- ============================================

-- ⚠️ IMPORTANTE: Execute PRIMEIRO o script 001A_ADD-ENUM-VALUES.sql
-- Ou execute os comandos abaixo UM POR VEZ no SQL Editor:
--
-- 1. ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'luazul';
-- 2. ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'influencer';
-- 3. ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'associado';
--
-- Cada comando deve ser executado separadamente e commitado antes do próximo.
-- Após executar os 3 comandos acima, continue com este script.
-- ============================================

-- ============================================
-- 2. CRIAR TABELAS
-- ============================================

-- Tabela de Missões (criadas pela Luazul)
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  requirements TEXT,
  compensation DECIMAL(10,2),
  compensation_type TEXT DEFAULT 'fixed', -- fixed, hourly, per_post
  deadline DATE,
  status TEXT DEFAULT 'open', -- open, closed, completed, cancelled
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Candidaturas de Missões (influenciadores se candidatam)
CREATE TABLE IF NOT EXISTS public.mission_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE NOT NULL,
  influencer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (mission_id, influencer_id)
);

-- Tabela de Missões Concluídas (com notas do estabelecimento)
CREATE TABLE IF NOT EXISTS public.mission_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE NOT NULL,
  influencer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES public.mission_applications(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (mission_id, influencer_id)
);

-- Tabela de Contratos (para associados)
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  associado_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contract_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active', -- active, completed, cancelled, on_hold
  total_value DECIMAL(10,2),
  paid_value DECIMAL(10,2) DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Atividades do Contrato (marcar o que já foi feito)
CREATE TABLE IF NOT EXISTS public.contract_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  activity_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. HABILITAR RLS
-- ============================================

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_activities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. REMOVER POLÍTICAS ANTIGAS (SE EXISTIREM)
-- ============================================

DROP POLICY IF EXISTS "Luazul can manage missions" ON public.missions;
DROP POLICY IF EXISTS "Influencers can view open missions" ON public.missions;
DROP POLICY IF EXISTS "Influencers can apply to missions" ON public.mission_applications;
DROP POLICY IF EXISTS "Influencers can view their applications" ON public.mission_applications;
DROP POLICY IF EXISTS "Luazul can manage applications" ON public.mission_applications;
DROP POLICY IF EXISTS "Luazul can view completions" ON public.mission_completions;
DROP POLICY IF EXISTS "Associados can view their contracts" ON public.contracts;
DROP POLICY IF EXISTS "Luazul can manage contracts" ON public.contracts;
DROP POLICY IF EXISTS "Luazul can manage contract activities" ON public.contract_activities;
DROP POLICY IF EXISTS "Associados can view their contract activities" ON public.contract_activities;

-- ============================================
-- 5. CRIAR POLÍTICAS RLS
-- ============================================

-- MISSIONS
-- Luazul pode gerenciar todas as missões
CREATE POLICY "Luazul can manage missions"
  ON public.missions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'luazul'
    )
  );

-- Influenciadores podem ver missões abertas
CREATE POLICY "Influencers can view open missions"
  ON public.missions FOR SELECT
  USING (
    status = 'open' AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'influencer'
    )
  );

-- MISSION_APPLICATIONS
-- Influenciadores podem se candidatar e ver suas candidaturas
CREATE POLICY "Influencers can apply to missions"
  ON public.mission_applications FOR INSERT
  WITH CHECK (
    influencer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'influencer'
    )
  );

CREATE POLICY "Influencers can view their applications"
  ON public.mission_applications FOR SELECT
  USING (
    influencer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'luazul'
    )
  );

-- Luazul pode gerenciar candidaturas
CREATE POLICY "Luazul can manage applications"
  ON public.mission_applications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'luazul'
    )
  );

-- MISSION_COMPLETIONS
-- Luazul pode ver e criar conclusões
CREATE POLICY "Luazul can manage completions"
  ON public.mission_completions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'luazul'
    )
  );

-- Influenciadores podem ver suas conclusões
CREATE POLICY "Influencers can view their completions"
  ON public.mission_completions FOR SELECT
  USING (
    influencer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'influencer'
    )
  );

-- CONTRACTS
-- Associados podem ver seus contratos
CREATE POLICY "Associados can view their contracts"
  ON public.contracts FOR SELECT
  USING (
    associado_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'associado'
    )
  );

-- Luazul pode gerenciar todos os contratos
CREATE POLICY "Luazul can manage contracts"
  ON public.contracts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'luazul'
    )
  );

-- CONTRACT_ACTIVITIES
-- Luazul pode gerenciar atividades
CREATE POLICY "Luazul can manage contract activities"
  ON public.contract_activities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'luazul'
    )
  );

-- Associados podem ver atividades de seus contratos
CREATE POLICY "Associados can view their contract activities"
  ON public.contract_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      JOIN public.user_roles ur ON ur.user_id = c.associado_id
      WHERE c.id = contract_activities.contract_id
      AND c.associado_id = auth.uid()
      AND ur.role = 'associado'
    )
  );

-- ============================================
-- 6. CRIAR TRIGGERS
-- ============================================

-- Trigger para updated_at em missions
DROP TRIGGER IF EXISTS update_missions_updated_at ON public.missions;
CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at em mission_applications
DROP TRIGGER IF EXISTS update_mission_applications_updated_at ON public.mission_applications;
CREATE TRIGGER update_mission_applications_updated_at
  BEFORE UPDATE ON public.mission_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at em mission_completions
DROP TRIGGER IF EXISTS update_mission_completions_updated_at ON public.mission_completions;
CREATE TRIGGER update_mission_completions_updated_at
  BEFORE UPDATE ON public.mission_completions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at em contracts
DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at em contract_activities
DROP TRIGGER IF EXISTS update_contract_activities_updated_at ON public.contract_activities;
CREATE TRIGGER update_contract_activities_updated_at
  BEFORE UPDATE ON public.contract_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 7. GARANTIR PERMISSÕES
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.missions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_applications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_completions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_activities TO anon, authenticated;

-- ============================================
-- 8. MENSAGEM DE SUCESSO
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ SISTEMA DE MISSÕES E CONTRATOS CRIADO COM SUCESSO!        ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Novos roles adicionados: luazul, influencer, associado';
  RAISE NOTICE '✅ Tabela missions criada';
  RAISE NOTICE '✅ Tabela mission_applications criada';
  RAISE NOTICE '✅ Tabela mission_completions criada';
  RAISE NOTICE '✅ Tabela contracts criada';
  RAISE NOTICE '✅ Tabela contract_activities criada';
  RAISE NOTICE '✅ Políticas RLS configuradas';
  RAISE NOTICE '✅ Triggers criados';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Próximos passos:';
  RAISE NOTICE '   1. Atualizar o frontend para usar os novos roles';
  RAISE NOTICE '   2. Criar dashboards específicos para cada tipo de usuário';
  RAISE NOTICE '';
END $$;

