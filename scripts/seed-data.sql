-- Script de dados iniciais (Seed Data)
-- Execute este script APÓS criar o usuário de teste no frontend
-- IMPORTANTE: Substitua 'USER_ID_DO_TESTE' pelo ID real do usuário de teste

-- ============================================
-- 1. CRIAR USUÁRIO ADMIN (se ainda não existir)
-- ============================================
-- Nota: O usuário precisa ser criado via frontend primeiro
-- Depois, execute este comando substituindo USER_ID pelo ID real:

/*
-- Tornar usuário de teste como admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_DO_TESTE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
*/

-- ============================================
-- 2. INSERIR MODELOS DE EXEMPLO
-- ============================================

INSERT INTO public.models (name, bio, age, height, measurements, instagram, is_active)
VALUES 
  (
    'Sophia Laurent',
    'Modelo profissional com 5 anos de experiência em moda, editorial e campanhas publicitárias. Especializada em fotografia de moda e eventos corporativos.',
    25,
    175,
    '90-60-90',
    '@sophialaurent',
    true
  ),
  (
    'Emma Dubois',
    'Modelo versátil com experiência em diferentes tipos de projetos. Trabalha com moda, beauty e lifestyle. Disponível para eventos e campanhas.',
    23,
    172,
    '88-58-88',
    '@emmadubois',
    true
  ),
  (
    'Isabella Martin',
    'Modelo profissional especializada em editorial e campanhas de luxo. Experiência internacional e fluente em 3 idiomas.',
    27,
    178,
    '92-62-92',
    '@isabellamartin',
    true
  ),
  (
    'Léa Moreau',
    'Modelo fitness e lifestyle com forte presença digital. Ideal para campanhas de bem-estar e produtos esportivos.',
    24,
    170,
    '86-60-88',
    '@leamoreau',
    true
  ),
  (
    'Camille Rousseau',
    'Modelo comercial e editorial com experiência em TV e vídeo. Carismática e profissional.',
    26,
    174,
    '89-61-90',
    '@camillerousseau',
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. INSERIR CLIENTES DE EXEMPLO
-- ============================================

INSERT INTO public.clients (company_name, contact_name, email, phone, subscription_tier, is_active)
VALUES 
  (
    'Fashion Brand Switzerland',
    'Jean-Pierre Dubois',
    'contact@fashionbrand.ch',
    '+41 21 123 45 67',
    'premium',
    true
  ),
  (
    'Luxury Events SA',
    'Marie-Claire Bernard',
    'info@luxuryevents.ch',
    '+41 22 234 56 78',
    'standard',
    true
  ),
  (
    'Digital Marketing Pro',
    'Thomas Müller',
    'hello@digitalmarketing.ch',
    '+41 44 345 67 89',
    'basic',
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. VERIFICAÇÕES
-- ============================================

-- Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'user_roles', 'models', 'clients', 'quotation_requests', 'payments', 'client_packages', 'package_activities')
ORDER BY table_name;

-- Verificar modelos inseridos
SELECT 'Modelos inseridos:' as status;
SELECT name, age, is_active FROM public.models;

-- Verificar clientes inseridos
SELECT 'Clientes inseridos:' as status;
SELECT company_name, subscription_tier, is_active FROM public.clients;

