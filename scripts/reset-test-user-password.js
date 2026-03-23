/**
 * Script para resetar a senha do usuário de teste
 * Execute: node scripts/reset-test-user-password.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const TEST_USER_EMAIL = 'test@luazul.com';
const TEST_USER_PASSWORD = 'test123456';

async function resetPassword() {
  console.log('🔐 Resetando senha do usuário de teste...\n');

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error('❌ Variáveis de ambiente não configuradas');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  try {
    console.log('📧 Enviando email de reset de senha...');
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(TEST_USER_EMAIL, {
      redirectTo: 'https://luazul-elevate.vercel.app/auth?reset=true',
    });

    if (error) {
      console.error('❌ Erro:', error.message);
      console.log('\n💡 O usuário pode não existir. Crie manualmente:');
      console.log('   https://supabase.com/dashboard/project/fdpnerksqonprirohxkr/auth/users');
      process.exit(1);
    }

    console.log('✅ Email de reset enviado!');
    console.log('📧 Verifique o email ou use o link no console do Supabase');
    console.log('\n💡 Alternativa: Redefina a senha manualmente no Supabase:');
    console.log('   1. Acesse: https://supabase.com/dashboard/project/fdpnerksqonprirohxkr/auth/users');
    console.log(`   2. Encontre: ${TEST_USER_EMAIL}`);
    console.log('   3. Clique nos 3 pontos (...) > "Reset password"');
    console.log(`   4. Defina a senha como: ${TEST_USER_PASSWORD}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

resetPassword();

