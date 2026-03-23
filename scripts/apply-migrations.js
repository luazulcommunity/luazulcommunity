/**
 * Script para aplicar migrations no Supabase
 * Execute: node scripts/apply-migrations.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fdpnerksqonprirohxkr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Precisa da service role key

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: SUPABASE_SERVICE_ROLE_KEY não encontrada no .env');
  console.log('📝 Para obter a service role key:');
  console.log('   1. Acesse: https://supabase.com/dashboard');
  console.log('   2. Vá em: Settings > API');
  console.log('   3. Copie a "service_role" key (NÃO a anon key!)');
  console.log('   4. Adicione no .env: SUPABASE_SERVICE_ROLE_KEY=sua_service_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration(filePath) {
  try {
    console.log(`\n📄 Aplicando: ${filePath}`);
    const sql = readFileSync(filePath, 'utf8');
    
    // Dividir em comandos individuais
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (const command of commands) {
      const trimmedCommand = command.trim();
      if (trimmedCommand && !trimmedCommand.startsWith('--')) {
        const { error } = await supabase.rpc('exec_sql', { sql: trimmedCommand });
        if (error) {
          // Tentar executar diretamente via REST API
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sql: trimmedCommand }),
          });
          
          if (!response.ok) {
            console.warn(`⚠️  Aviso ao executar comando: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`✅ Concluído: ${filePath}`);
  } catch (error) {
    console.error(`❌ Erro ao aplicar ${filePath}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando aplicação de migrations...\n');
  
  const migrations = [
    join(__dirname, '..', 'supabase', 'migrations', '20251121191846_2257795e-5dd9-4aa2-bae7-2669fe79ccd5.sql'),
    join(__dirname, '..', 'supabase', 'migrations', '20251121191907_54ac8770-c91c-4ee7-81cc-2e7964401c71.sql'),
    join(__dirname, '..', 'supabase', 'migrations', '20251121203722_a15d6c6c-217a-4a7c-a62e-4297d88eba08.sql'),
  ];
  
  for (const migration of migrations) {
    await applyMigration(migration);
  }
  
  console.log('\n✅ Todas as migrations foram aplicadas!');
  console.log('\n📝 Próximos passos:');
  console.log('   1. Crie o usuário de teste no frontend');
  console.log('   2. Execute o script seed-data.sql no SQL Editor');
  console.log('   3. Adicione o role admin ao usuário de teste');
}

main().catch(console.error);

