# 🌌 Luazul Community (Elevate)

**Luazul Elevate** é um ecossistema digital premium projetado para profissionais do mercado de moda, modelos e marketing digital. A plataforma oferece ferramentas avançadas de gestão, orçamentos e presença digital.

## 🚀 Tecnologias Utilizadas

O projeto utiliza uma stack moderna de alto desempenho:

- **Frontend:** [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **Backend/Database:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Gerenciamento de Estado:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Ícones:** [Lucide React](https://lucide.dev/)

## 🛠️ Funcionalidades Principais

- **Gestão de Modelos:** Cadastro e exibição de perfis profissionais com galeria de fotos.
- **Solicitações de Orçamento:** Fluxo completo para pedidos de orçamento vinculados a modelos.
- **Painel do Cliente:** Área dedicada para clientes gerenciarem seus pacotes e serviços.
- **Sistema de Pagamentos:** Acompanhamento de status financeiro e histórico.
- **Controle de Acesso (RBAC):** Diferentes níveis de acesso para Administradores e Clientes.

## ⚙️ Configuração Local

Para rodar o projeto em sua máquina:

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:
   ```env
   VITE_SUPABASE_URL=https://fdpnerksqonprirohxkr.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anon_aqui
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   O projeto estará disponível em `http://localhost:8080`.

## 🗄️ Estrutura do Banco de Dados (Supabase)

O banco de dados PostgreSQL no Supabase contém as seguintes tabelas principais:
- `profiles`: Dados básicos dos usuários.
- `user_roles`: Permissões (admin, client, etc).
- `models`: Portfólio de modelos.
- `clients`: Registro de clientes e tiers de assinatura.
- `quotation_requests`: Pedidos de serviço.
- `payments`, `client_packages`, `package_activities`: Gestão financeira e operacional.

## 🔗 Links Úteis

- **Produção:** [https://luazul-elevate.vercel.app](https://luazul-elevate.vercel.app)
- **Supabase Dashboard:** [https://supabase.com/dashboard/project/fdpnerksqonprirohxkr](https://supabase.com/dashboard/project/fdpnerksqonprirohxkr)

---
*Este é o documento principal de referência para o projeto Luazul Community.*
