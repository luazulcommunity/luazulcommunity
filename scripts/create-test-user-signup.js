/**
 * Script para criar usuário de teste via signUp (API pública)
 * Execute: node scripts/create-test-user-signup.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Credenciais do usuário de teste
const TEST_USER_EMAIL = 'test@luazul.com';
const TEST_USER_PASSWORD = 'test123456';

async function createTestUserViaSignUp() {
  console.log('🔐 Criando usuário de teste via signUp...\n');

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error('❌ Erro: Variáveis de ambiente não configuradas');
    console.log('\n📝 Certifique-se de que o arquivo .env contém:');
    console.log('VITE_SUPABASE_URL=https://fdpnerksqonprirohxkr.supabase.co');
    console.log('VITE_SUPABASE_PUBLISHABLE_KEY=[sua chave anon public]');
    process.exit(1);
  }

  try {
    // Criar cliente Supabase com chave pública
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    console.log('📧 Tentando criar usuário...');
    
    // Tentar criar usuário via signUp
    const { data, error } = await supabase.auth.signUp({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      options: {
        emailRedirectTo: undefined, // Não redirecionar
      }
    });

    if (error) {
      // Se o usuário já existe, tentar fazer login
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        console.log('ℹ️  Usuário já existe. Tentando fazer login...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        });

        if (signInError) {
          console.error('❌ Erro ao fazer login:', signInError.message);
          console.log('\n📝 O usuário existe mas pode precisar de confirmação de email.');
          console.log('💡 Crie o usuário manualmente no Supabase Dashboard:');
          console.log('   1. Acesse: https://supabase.com/dashboard/project/fdpnerksqonprirohxkr/auth/users');
          console.log('   2. Clique em "Add user"');
          console.log(`   3. Email: ${TEST_USER_EMAIL}`);
          console.log(`   4. Password: ${TEST_USER_PASSWORD}`);
          console.log('   5. Marque "Auto Confirm User"');
          console.log('   6. Clique em "Create user"');
          process.exit(1);
        }

        console.log('✅ Login bem-sucedido!');
        console.log(`   ID: ${signInData.user.id}`);
        console.log(`   Email: ${signInData.user.email}`);
        console.log(`   Email confirmado: ${signInData.user.email_confirmed_at ? 'Sim' : 'Não'}`);
        console.log('\n✅ Usuário de teste está pronto!');
        console.log(`   Email: ${TEST_USER_EMAIL}`);
        console.log(`   Senha: ${TEST_USER_PASSWORD}`);
        return;
      }

      console.error('❌ Erro ao criar usuário:', error.message);
      throw error;
    }

    if (data.user) {
      console.log('✅ Usuário criado com sucesso!');
      console.log(`   ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Email confirmado: ${data.user.email_confirmed_at ? 'Sim' : 'Não'}`);
      
      if (!data.user.email_confirmed_at) {
        console.log('\n⚠️  ATENÇÃO: O email precisa ser confirmado.');
        console.log('📧 Verifique o email ou confirme manualmente no Supabase Dashboard.');
        console.log('\n💡 Para confirmar manualmente:');
        console.log('   1. Acesse: https://supabase.com/dashboard/project/fdpnerksqonprirohxkr/auth/users');
        console.log(`   2. Encontre o usuário: ${TEST_USER_EMAIL}`);
        console.log('   3. Clique nos 3 pontos (...) > "Confirm email"');
      }
      
      console.log('\n🎉 Usuário de teste criado!');
      console.log(`   Email: ${TEST_USER_EMAIL}`);
      console.log(`   Senha: ${TEST_USER_PASSWORD}`);
    }

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.log('\n💡 Crie o usuário manualmente no Supabase Dashboard:');
    console.log('   1. Acesse: https://supabase.com/dashboard/project/fdpnerksqonprirohxkr/auth/users');
    console.log('   2. Clique em "Add user"');
    console.log(`   3. Email: ${TEST_USER_EMAIL}`);
    console.log(`   4. Password: ${TEST_USER_PASSWORD}`);
    console.log('   5. Marque "Auto Confirm User"');
    console.log('   6. Clique em "Create user"');
    process.exit(1);
  }
}

// Executar
createTestUserViaSignUp();

