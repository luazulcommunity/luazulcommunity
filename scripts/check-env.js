/**
 * Script para verificar se as variáveis de ambiente do Supabase estão configuradas
 * Execute: node scripts/check-env.js
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('\n🔍 Verificando variáveis de ambiente do Supabase...\n');

const checks = {
  'VITE_SUPABASE_URL': {
    value: SUPABASE_URL,
    isValid: SUPABASE_URL && 
             SUPABASE_URL.startsWith('https://') &&
             SUPABASE_URL.includes('.supabase.co'),
    required: true
  },
  'VITE_SUPABASE_PUBLISHABLE_KEY': {
    value: SUPABASE_PUBLISHABLE_KEY ? `${SUPABASE_PUBLISHABLE_KEY.substring(0, 20)}...` : null,
    isValid: SUPABASE_PUBLISHABLE_KEY && 
             SUPABASE_PUBLISHABLE_KEY.startsWith('eyJ') &&
             SUPABASE_PUBLISHABLE_KEY.length > 100,
    required: true
  }
};

let allValid = true;

for (const [key, check] of Object.entries(checks)) {
  const status = check.isValid ? '✅' : '❌';
  const value = check.value || 'Não configurada';
  
  console.log(`${status} ${key}: ${value}`);
  
  if (!check.isValid && check.required) {
    allValid = false;
  }
}

console.log('\n' + '='.repeat(60));

if (allValid) {
  console.log('✅ Todas as variáveis estão configuradas corretamente!');
} else {
  console.log('❌ Algumas variáveis não estão configuradas.');
  console.log('\n📖 Para configurar:');
  console.log('1. Local: Crie um arquivo .env na raiz do projeto');
  console.log('2. Vercel: Vá em Settings > Environment Variables');
  console.log('\n📚 Veja o guia: CONFIGURAR-VERCEL-RAPIDO.md');
}

console.log('='.repeat(60) + '\n');

process.exit(allValid ? 0 : 1);

