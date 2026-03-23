/**
 * Script para verificar se o banco de dados está configurado corretamente
 * Execute: node scripts/check-database.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env
dotenv.config({ path: join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  console.log('Verifique se o arquivo .env existe e contém:');
  console.log('  - VITE_SUPABASE_URL');
  console.log('  - VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTable(tableName) {
  try {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
      // Se o erro for de permissão RLS, a tabela existe mas está protegida
      // Isso é um estado válido - a tabela está configurada corretamente
      if (error.message.includes('permission denied') || 
          error.message.includes('row-level security') ||
          error.message.includes('RLS')) {
        return { exists: true, rlsProtected: true };
      }
      // Se o erro for "relation does not exist", a tabela não existe
      if (error.message.includes('does not exist') || 
          error.message.includes('relation') && error.message.includes('not found')) {
        return { exists: false, error: error.message };
      }
      // Outros erros podem indicar problemas de configuração
      return { exists: false, error: error.message };
    }
    return { exists: true, count: data?.length || 0 };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

async function main() {
  console.log('🔍 Verificando configuração do banco de dados...\n');
  
  const tables = [
    'profiles',
    'user_roles',
    'models',
    'clients',
    'quotation_requests',
    'payments',
    'client_packages',
    'package_activities',
  ];
  
  console.log('📊 Status das Tabelas:\n');
  
  let allOk = true;
  for (const table of tables) {
    const result = await checkTable(table);
    if (result.exists) {
      if (result.rlsProtected) {
        console.log(`✅ ${table.padEnd(25)} - OK (RLS ativo)`);
      } else {
        console.log(`✅ ${table.padEnd(25)} - OK`);
      }
    } else {
      console.log(`❌ ${table.padEnd(25)} - ERRO: ${result.error}`);
      allOk = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allOk) {
    console.log('✅ Todas as tabelas estão configuradas corretamente!');
    
    // Verificar dados
    console.log('\n📦 Verificando dados iniciais...\n');
    
    const { data: models } = await supabase.from('models').select('id, name').limit(5);
    const { data: clients } = await supabase.from('clients').select('id, company_name').limit(5);
    
    console.log(`📸 Modelos: ${models?.length || 0} encontrados`);
    console.log(`👥 Clientes: ${clients?.length || 0} encontrados`);
    
    if ((models?.length || 0) === 0) {
      console.log('\n💡 Dica: Execute o script seed-data.sql para inserir dados iniciais');
    }
  } else {
    console.log('❌ Algumas tabelas não estão configuradas');
    console.log('\n📝 Execute o script setup-database.sql no SQL Editor do Supabase');
  }
}

main().catch(console.error);

