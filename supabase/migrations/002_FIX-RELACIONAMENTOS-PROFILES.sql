-- ============================================
-- 🔧 CORRIGIR RELACIONAMENTOS COM PROFILES
-- Execute este script no SQL Editor do Supabase Dashboard
-- Link: https://supabase.com/dashboard/project/fdpnerksqonprirohxkr/sql/new
-- ============================================
-- 
-- Este script corrige relacionamentos indiretos para permitir
-- queries como: mission_applications -> profiles
-- ============================================

-- ============================================
-- 1. CRIAR VIEWS PARA RELACIONAMENTOS INDIRETOS
-- ============================================

-- View para mission_applications com profiles
CREATE OR REPLACE VIEW public.mission_applications_with_profiles AS
SELECT 
  ma.*,
  p.full_name,
  p.email
FROM public.mission_applications ma
LEFT JOIN public.profiles p ON p.id = ma.influencer_id;

-- View para mission_completions com profiles
CREATE OR REPLACE VIEW public.mission_completions_with_profiles AS
SELECT 
  mc.*,
  p.full_name
FROM public.mission_completions mc
LEFT JOIN public.profiles p ON p.id = mc.influencer_id;

-- ============================================
-- 2. GARANTIR PERMISSÕES NAS VIEWS
-- ============================================

GRANT SELECT ON public.mission_applications_with_profiles TO anon, authenticated;
GRANT SELECT ON public.mission_completions_with_profiles TO anon, authenticated;

-- ============================================
-- 3. MENSAGEM DE SUCESSO
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Views criadas para relacionamentos com profiles';
  RAISE NOTICE '✅ Agora é possível fazer queries indiretas';
END $$;

