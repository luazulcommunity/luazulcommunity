-- ============================================
-- 🚀 ADICIONAR VALORES AO ENUM (EXECUTE PRIMEIRO)
-- Execute este script ANTES do 001_SISTEMA-MISSOES-CONTRATOS.sql
-- Link: https://supabase.com/dashboard/project/fdpnerksqonprirohxkr/sql/new
-- ============================================
-- 
-- ⚠️ IMPORTANTE: Execute cada comando SEPARADAMENTE
-- No Supabase SQL Editor, execute um comando por vez
-- ============================================

-- Comando 1: Adicionar 'luazul'
-- Execute este comando primeiro, depois clique em "Run"
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'luazul';

-- ============================================
-- Após executar o comando acima, execute o próximo:
-- ============================================

-- Comando 2: Adicionar 'influencer'
-- Execute este comando depois do primeiro
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'influencer';

-- ============================================
-- Após executar o comando acima, execute o próximo:
-- ============================================

-- Comando 3: Adicionar 'associado'
-- Execute este comando por último
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'associado';

-- ============================================
-- ✅ Após executar os 3 comandos acima, você pode executar:
-- supabase/migrations/001_SISTEMA-MISSOES-CONTRATOS.sql
-- ============================================

