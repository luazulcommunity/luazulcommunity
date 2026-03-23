import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Credenciais do usuário de teste
const TEST_USER_EMAIL = 'test@luazul.com';
const TEST_USER_PASSWORD = 'test123456';

async function createTestUser() {
  console.log('🔐 Criando usuário de teste...\n');

  // Verificar se temos as credenciais necessárias
  if (!SUPABASE_URL) {
    console.error('❌ Erro: VITE_SUPABASE_URL não configurada no .env');
    console.log('\n📝 Adicione no arquivo .env:');
    console.log('VITE_SUPABASE_URL=https://fdpnerksqonprirohxkr.supabase.co');
    process.exit(1);
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY não encontrada.');
    console.log('\n📝 Para criar usuários automaticamente, você precisa:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/fdpnerksqonprirohxkr/settings/api');
    console.log('2. Copie a chave "service_role" (NÃO a anon public)');
    console.log('3. Adicione no arquivo .env:');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=[cole a chave service_role aqui]');
    console.log('\n🔄 Ou crie o usuário manualmente:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/fdpnerksqonprirohxkr/auth/users');
    console.log('2. Clique em "Add user"');
    console.log(`3. Email: ${TEST_USER_EMAIL}`);
    console.log(`4. Password: ${TEST_USER_PASSWORD}`);
    console.log('5. Marque "Auto Confirm User"');
    console.log('6. Clique em "Create user"');
    process.exit(1);
  }

  try {
    // Criar cliente Supabase com service_role (tem permissões de admin)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('📧 Verificando se o usuário já existe...');
    
    // Verificar se o usuário já existe
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      throw listError;
    }

    const userExists = existingUsers.users.find(user => user.email === TEST_USER_EMAIL);
    
    if (userExists) {
      console.log(`✅ Usuário ${TEST_USER_EMAIL} já existe!`);
      console.log(`   ID: ${userExists.id}`);
      console.log(`   Email confirmado: ${userExists.email_confirmed_at ? 'Sim' : 'Não'}`);
      
      if (!userExists.email_confirmed_at) {
        console.log('\n🔄 Confirmando email do usuário...');
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          userExists.id,
          { email_confirm: true }
        );
        
        if (updateError) {
          console.error('❌ Erro ao confirmar email:', updateError.message);
        } else {
          console.log('✅ Email confirmado com sucesso!');
        }
      }
      
      console.log('\n✅ Usuário pronto para uso!');
      console.log(`   Email: ${TEST_USER_EMAIL}`);
      console.log(`   Senha: ${TEST_USER_PASSWORD}`);
      return;
    }

    console.log('👤 Criando novo usuário...');
    
    // Criar o usuário
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true, // Confirmar email automaticamente
    });

    if (createError) {
      console.error('❌ Erro ao criar usuário:', createError.message);
      throw createError;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log(`   ID: ${newUser.user.id}`);
    console.log(`   Email: ${newUser.user.email}`);
    console.log(`   Email confirmado: Sim`);
    
    console.log('\n🎉 Usuário de teste criado e pronto para uso!');
    console.log(`   Email: ${TEST_USER_EMAIL}`);
    console.log(`   Senha: ${TEST_USER_PASSWORD}`);
    console.log('\n💡 Agora você pode fazer login no site com essas credenciais.');

  } catch (error) {
    console.error('\n❌ Erro ao criar usuário:', error.message);
    console.log('\n📝 Alternativa: Crie o usuário manualmente:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/fdpnerksqonprirohxkr/auth/users');
    console.log('2. Clique em "Add user"');
    console.log(`3. Email: ${TEST_USER_EMAIL}`);
    console.log(`4. Password: ${TEST_USER_PASSWORD}`);
    console.log('5. Marque "Auto Confirm User"');
    console.log('6. Clique em "Create user"');
    process.exit(1);
  }
}

// Executar
createTestUser();

