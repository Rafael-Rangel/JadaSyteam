# Instruções de Instalação e Execução - Jada Platform

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🚀 Instalação

1. Instale as dependências:
```bash
npm install
```

## 🏃 Executar o Projeto

Para executar em modo de desenvolvimento:

```bash
npm run dev
```

O projeto estará disponível em: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
jada-platform/
├── app/                    # Páginas Next.js (App Router)
│   ├── buyer/             # Páginas do Comprador
│   ├── seller/            # Páginas do Vendedor
│   ├── admin/             # Páginas do Admin
│   ├── about/             # Páginas públicas
│   ├── faq/
│   ├── contact/
│   ├── plans/
│   ├── login/
│   └── signup/
├── components/             # Componentes reutilizáveis
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── Card.tsx
└── styles/                 # Estilos globais
```

## 🎨 Páginas Implementadas

### Públicas
- ✅ Landing Page (`/`)
- ✅ Planos (`/plans`)
- ✅ Login (`/login`)
- ✅ Cadastro (`/signup`)
- ✅ Sobre (`/about`)
- ✅ FAQ (`/faq`)
- ✅ Contato (`/contact`)
- ✅ Termos de Uso (`/terms`)
- ✅ Política de Privacidade (`/privacy`)
- ✅ Recuperação de Senha (`/forgot-password`)

### Comprador
- ✅ Dashboard (`/buyer/dashboard`)
- ✅ Criar Requisição (`/buyer/create-request`)
- ✅ Minhas Requisições (`/buyer/requests`)
- ✅ Detalhes da Requisição (`/buyer/requests/[id]`)
- ✅ Gestão de Usuários (`/buyer/users`)
- ✅ Perfil (`/buyer/profile`)
- ✅ Assinatura (`/buyer/subscription`)

### Vendedor
- ✅ Dashboard (`/seller/dashboard`)
- ✅ Oportunidades (`/seller/opportunities`)
- ✅ Detalhes da Oportunidade (`/seller/opportunities/[id]`)
- ✅ Minhas Propostas (`/seller/proposals`)
- ✅ Configurações (`/seller/settings`)
- ✅ Gestão de Usuários (`/seller/users`)
- ✅ Perfil (`/seller/profile`)

### Admin
- ✅ Dashboard (`/admin/dashboard`)
- ✅ Empresas (`/admin/companies`)
- ✅ Planos (`/admin/plans`)

## 🎯 Funcionalidades Visuais Implementadas

- ✅ Navegação completa entre todas as páginas
- ✅ Formulários com validação visual
- ✅ Modais e popups funcionais
- ✅ Sistema de badges e status
- ✅ Cards e componentes reutilizáveis
- ✅ Design responsivo (mobile-first)
- ✅ Identidade visual consistente
- ✅ Estados de loading
- ✅ Mensagens de erro e sucesso

## 🎨 Identidade Visual

- **Cores Principais:**
  - Primary: Azul (#0ea5e9)
  - Secondary: Roxo (#a855f7)
  - Success: Verde (#22c55e)
  - Warning: Amarelo (#f59e0b)
  - Danger: Vermelho (#ef4444)

- **Tipografia:**
  - Sistema de fontes do sistema (San Francisco, Segoe UI, etc.)

## 📝 Notas Importantes

⚠️ **Este é um protótipo visual apenas!**

- Não há integração com backend
- Não há banco de dados
- Os dados são simulados/mockados
- Formulários validam visualmente mas não salvam dados
- Navegação funciona mas não há autenticação real

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa linter

## 📦 Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização
- **React Icons** - Ícones
- **Lucide React** - Ícones adicionais

## 🎯 Próximos Passos (Para Implementação Real)

1. Integração com backend/API
2. Sistema de autenticação real
3. Banco de dados (PostgreSQL recomendado)
4. Integração com Stripe para pagamentos
5. Sistema de notificações
6. Upload de arquivos
7. Geolocalização real
8. Testes automatizados

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do Next.js: https://nextjs.org/docs



