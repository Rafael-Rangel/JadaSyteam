# Apresentação da Plataforma Jada
## Sistema de Cotação Inteligente

---

## 1. VISÃO GERAL DA PLATAFORMA

A **Jada** é uma plataforma SaaS completa que conecta compradores e vendedores de forma inteligente e eficiente. Nossa solução permite que empresas compradoras publiquem suas necessidades e recebam múltiplas propostas competitivas de fornecedores qualificados, otimizando o processo de cotação e fechamento de negócios.

### Objetivo Principal
Revolucionar a forma como empresas encontram fornecedores e como fornecedores encontram oportunidades de negócio, criando um ecossistema transparente, seguro e eficiente para todos os participantes.

---

## 2. TIPOS DE USUÁRIOS E PERMISSÕES

### 2.1 ADMINISTRADOR GERAL
**Perfil:** Equipe interna da Jada

**Funcionalidades:**
- Dashboard administrativo com métricas completas da plataforma
- Gestão de todas as empresas cadastradas (ativar, suspender, visualizar)
- Criação e edição de planos de assinatura
- Acompanhamento financeiro (faturamento, assinaturas, receitas)
- Visualização de logs e auditoria do sistema
- Suporte e resolução de problemas

**Acesso:** Painel administrativo completo com visão global do negócio

---

### 2.2 EMPRESAS COMPRADORAS

#### 2.2.1 Dono/Administrador da Empresa
**Permissões:**
- Gerenciar assinatura e pagamentos
- Criar e gerenciar usuários internos (gerentes e funcionários)
- Criar requisições (cotação de produtos/serviços)
- Visualizar e analisar todas as propostas recebidas
- Aceitar propostas e escolher fornecedores
- Acessar relatórios e estatísticas completas
- Editar perfil da empresa

#### 2.2.2 Gerente
**Permissões:**
- Criar requisições
- Visualizar e analisar propostas
- Aprovar propostas (conforme permissão)
- Gerenciar usuários funcionários
- Acessar relatórios básicos
- **Não pode:** Alterar plano ou assinatura

#### 2.2.3 Funcionário
**Permissões:**
- Criar requisições
- Visualizar propostas recebidas
- **Não pode:** Aceitar propostas sem permissão do gerente/dono

---

### 2.3 EMPRESAS VENDEDORAS

#### 2.3.1 Dono/Administrador da Empresa
**Permissões:**
- Gerenciar assinatura e pagamentos
- Criar e gerenciar equipe interna (gerentes e vendedores)
- Receber todas as oportunidades de negócio
- Enviar propostas para compradores
- Configurar preferências (raio, categorias, seguir compradores)
- Acessar relatórios e estatísticas completas
- Editar perfil da empresa

#### 2.3.2 Gerente
**Permissões:**
- Gerenciar produtos e catálogo
- Criar e enviar propostas
- Acompanhar negociações
- Visualizar oportunidades
- **Não pode:** Alterar plano ou assinatura

#### 2.3.3 Vendedor
**Permissões:**
- Enviar propostas
- Acompanhar status das propostas (enviada, visualizada, aceita, recusada)
- Visualizar oportunidades disponíveis
- **Não pode:** Editar configurações da empresa

---

## 3. FUNCIONALIDADES PRINCIPAIS

### 3.1 PARA COMPRADORES

#### 3.1.1 Criação de Requisições
- **Formulário completo** com campos para:
  - Título da requisição
  - Descrição detalhada da necessidade
  - Quantidade e unidade de medida
  - Categoria do produto/serviço
  - Prazo de entrega desejado
  - Endereço completo de entrega (com geolocalização)
  - Anexos opcionais (PDFs, imagens)
  - Opção de tornar pública ou privada (apenas para seguidores)

#### 3.1.2 Gestão de Requisições
- **Lista completa** de todas as requisições criadas
- **Filtros avançados:**
  - Por status (aberto, recebendo propostas, proposta aceita, finalizado)
  - Por data de criação
  - Por categoria
  - Busca por palavra-chave
- **Ações disponíveis:**
  - Visualizar detalhes e propostas recebidas
  - Editar requisição (enquanto estiver aberta)
  - Cancelar requisição

#### 3.1.3 Análise de Propostas
- **Visualização comparativa** de todas as propostas recebidas
- **Informações exibidas:**
  - Preço total
  - Prazo de entrega
  - Condições e detalhes
  - Reputação do vendedor (avaliações)
  - Distância do fornecedor
  - Validade da proposta
- **Filtros:**
  - Por preço (menor para maior)
  - Por prazo de entrega
  - Por reputação
  - Por distância

#### 3.1.4 Aceite de Proposta
- **Processo simplificado:**
  - Comprador escolhe a melhor proposta
  - Sistema libera automaticamente os dados de contato do vendedor
  - Contato liberado inclui:
    - Número de telefone
    - Link direto para WhatsApp
    - E-mail
  - Notificação automática enviada para ambos os lados
  - Negócio continua fora da plataforma (WhatsApp, telefone, e-mail)

#### 3.1.5 Gestão de Usuários Internos
- **CRUD completo** de usuários da empresa
- **Atribuição de funções:**
  - Dono/Administrador
  - Gerente
  - Funcionário
- **Controle de limites** baseado no plano contratado
- **Visualização de status** de cada usuário (ativo/inativo)

#### 3.1.6 Dashboard e Relatórios
- **Métricas principais:**
  - Requisições ativas
  - Propostas recebidas
  - Requisições restantes do plano
  - Pendentes de resposta
- **Gráficos e estatísticas:**
  - Histórico de requisições
  - Taxa de resposta de vendedores
  - Economia estimada
  - Comparativo de preços

---

### 3.2 PARA VENDEDORES

#### 3.2.1 Visualização de Oportunidades
- **Lista completa** de requisições disponíveis
- **Filtros avançados:**
  - **Busca geral:** Por título, descrição ou comprador
  - **Palavra-chave:** Busca em qualquer campo
  - **Produto específico:** Busca exata do produto
  - **Categoria:** Filtrar por tipo de produto/serviço
  - **Empresa específica:** Filtrar por comprador
  - **Raio de distância:** Filtrar por km (ex: até 20km)
  - **Cidade:** Filtrar por localidade
  - **Estado:** Filtrar por região
- **Informações exibidas:**
  - Título e descrição da requisição
  - Comprador
  - Distância em km
  - Cidade e estado
  - Categoria
  - Prazo de entrega desejado
  - Status (se já enviou proposta)

#### 3.2.2 Envio de Propostas
- **Formulário completo:**
  - Preço total (em R$)
  - Prazo de entrega (em dias úteis)
  - Detalhes e condições (campo de texto livre)
  - Validade da proposta (data limite)
  - Anexos opcionais
- **Validações:**
  - Verificação de limites do plano
  - Confirmação antes do envio
- **Notificação automática** ao comprador

#### 3.2.3 Edição de Propostas
- **Permissão para editar** enquanto a proposta estiver com status "Enviada" ou "Visualizada"
- **Bloqueio automático** após o comprador aceitar
- **Histórico de alterações** (para auditoria)

#### 3.2.4 Acompanhamento de Propostas
- **Lista de todas as propostas enviadas**
- **Status em tempo real:**
  - Enviada (aguardando visualização)
  - Visualizada (comprador viu mas não decidiu)
  - Aceita (comprador escolheu esta proposta)
  - Recusada (comprador recusou)
- **Filtros:**
  - Por status
  - Por comprador
  - Por data
  - Busca por palavra-chave

#### 3.2.5 Configurações de Oportunidades
- **Raio de distância:**
  - Configuração padrão (ex: 20km)
  - Slider para ajuste (5km a 100km)
  - Opção de receber todas (ignorar raio)
- **Categorias de interesse:**
  - Seleção múltipla de categorias
  - Receber apenas oportunidades dessas categorias
- **Seguir compradores:**
  - Lista de compradores seguidos
  - Ao seguir, recebe TODAS as requisições desse comprador
  - Independente de raio ou categoria
  - Opção de deixar de seguir

#### 3.2.6 Gestão de Usuários Internos
- **CRUD completo** de usuários da empresa
- **Atribuição de funções:**
  - Dono/Administrador
  - Gerente
  - Vendedor
- **Controle de limites** baseado no plano contratado

#### 3.2.7 Dashboard e Relatórios
- **Métricas principais:**
  - Oportunidades novas recebidas
  - Propostas enviadas
  - Propostas aceitas
  - Taxa de conversão
  - Aguardando resposta
- **Gráficos e estatísticas:**
  - Histórico de propostas
  - Taxa de aceitação
  - Receita estimada
  - Performance por categoria

---

### 3.3 SISTEMA DE PLANOS E ASSINATURAS

#### 3.3.1 Planos Disponíveis

**STARTER (R$ 49/mês)**
- 3 usuários por empresa
- 20 requisições/mês (comprador)
- 100 propostas/mês (vendedor)
- Raio padrão: 20km (configurável)
- 3 categorias desbloqueadas
- Relatórios básicos
- Suporte por e-mail (48h)

**GROWTH (R$ 199/mês)**
- 10 usuários por empresa
- 200 requisições/mês (comprador)
- 1.000 propostas/mês (vendedor)
- Raio padrão: 50km (configurável)
- 10 categorias desbloqueadas
- Destaque de requisição (limitado)
- Export CSV
- Integrações básicas de ERP
- Suporte e-mail + chat (horário comercial)

**ENTERPRISE (R$ 799/mês)**
- Usuários ilimitados
- Requisições ilimitadas
- Propostas ilimitadas
- Raio ilimitado (configurável)
- Todas as categorias desbloqueadas
- Integração via API
- SSO/LDAP
- SLA de suporte
- Relatórios avançados
- Conta dedicada
- Suporte prioritário

#### 3.3.2 Flexibilidade de Uso
- **Comprador apenas:** Acesso para criar requisições
- **Vendedor apenas:** Acesso para enviar propostas
- **Ambos:** Acesso completo para comprar e vender

#### 3.3.3 Gestão de Assinatura
- **Painel de assinatura** com:
  - Plano atual e preço
  - Próxima data de cobrança
  - Uso do plano (requisições, propostas, usuários)
  - Método de pagamento cadastrado
  - Histórico de faturas
- **Ações disponíveis:**
  - Alterar plano (upgrade/downgrade)
  - Alterar método de pagamento
  - Cancelar assinatura
- **Suspensão automática** em caso de inadimplência

---

## 4. PÁGINAS E INTERFACES

### 4.1 PÁGINAS PÚBLICAS

#### 4.1.1 Landing Page (/)
- **Hero Section:** Apresentação visual impactante
- **Seção de Features:** Benefícios principais
- **Como Funciona:** Processo em 3 passos
- **Call-to-Action:** Botões para criar conta ou ver planos
- **Design moderno e responsivo**

#### 4.1.2 Página de Planos (/plans)
- **Cards dos 3 planos** com:
  - Nome e preço
  - Lista completa de features
  - Badge "Mais Popular" no plano Growth
  - Botão de assinatura
- **FAQ sobre planos**
- **Comparativo visual**

#### 4.1.3 Login (/login)
- **Formulário simples:**
  - E-mail
  - Senha (com opção de mostrar/esconder)
  - Checkbox "Lembrar-me"
  - Link "Esqueceu a senha"
- **Link para cadastro**
- **Validação visual em tempo real**

#### 4.1.4 Cadastro (/signup)
- **Processo em 3 etapas:**
  1. **Informações da Empresa:**
     - Nome da empresa
     - CNPJ (opcional)
     - Tipo (Comprador/Vendedor/Ambos)
  2. **Dados do Responsável:**
     - Nome completo
     - E-mail
     - Telefone
     - Senha e confirmação
  3. **Escolha do Plano:**
     - Seleção visual dos planos
     - Checkbox de aceite de termos
- **Barra de progresso visual**
- **Validação em cada etapa**

#### 4.1.5 Páginas Institucionais
- **Sobre (/about):** Missão, valores e história
- **FAQ (/faq):** Perguntas frequentes com accordion
- **Contato (/contact):** Formulário de contato
- **Termos de Uso (/terms):** Documento completo
- **Política de Privacidade (/privacy):** Documento completo
- **Recuperação de Senha (/forgot-password):** Formulário de recuperação

---

### 4.2 ÁREA DO COMPRADOR

#### 4.2.1 Dashboard (/buyer/dashboard)
- **Cards de métricas:**
  - Requisições ativas
  - Propostas recebidas
  - Requisições restantes
  - Pendentes de resposta
- **Requisições recentes** com:
  - Título
  - Status
  - Número de propostas
  - Data de criação
  - Botão "Ver Detalhes"
- **CTA:** Botão "Nova Requisição"

#### 4.2.2 Criar Requisição (/buyer/create-request)
- **Formulário completo** com todos os campos necessários
- **Validação em tempo real**
- **Upload de anexos** (drag & drop)
- **Opção de tornar pública/privada**
- **Preview antes de publicar**

#### 4.2.3 Minhas Requisições (/buyer/requests)
- **Lista completa** de requisições
- **Filtros:**
  - Busca por palavra-chave
  - Filtro por status
- **Ações:**
  - Ver detalhes
  - Editar (se aberta)
  - Cancelar (se aberta)
- **Informações exibidas:**
  - Título
  - Status com badge colorido
  - Número de propostas
  - Data de criação e expiração

#### 4.2.4 Detalhes da Requisição (/buyer/requests/[id])
- **Layout em 2 colunas:**
  - **Esquerda:** Detalhes da requisição
  - **Direita:** Lista de propostas recebidas
- **Cada proposta mostra:**
  - Nome do vendedor
  - Preço destacado
  - Prazo de entrega
  - Reputação (estrelas)
  - Distância
  - Detalhes e condições
  - Botões "Aceitar" e "Recusar"
- **Modal de confirmação** ao aceitar proposta
- **Liberação de contato** após aceite

#### 4.2.5 Gestão de Usuários (/buyer/users)
- **Tabela completa** com:
  - Nome e avatar
  - E-mail
  - Telefone
  - Função (com badge)
  - Status
  - Ações (editar, excluir)
- **Modal para adicionar usuário**
- **Contador de limite** do plano

#### 4.2.6 Perfil da Empresa (/buyer/profile)
- **3 seções:**
  1. Informações da Empresa
  2. Endereço
  3. Dados do Responsável
- **Formulário editável**
- **Validação e salvamento**

#### 4.2.7 Assinatura (/buyer/subscription)
- **Plano atual** com:
  - Nome e preço
  - Status (ativa)
  - Próxima cobrança
  - Lista de features
- **Uso do plano:**
  - Barras de progresso visuais
  - Requisições usadas/limite
  - Propostas usadas/limite
  - Usuários usados/limite
- **Método de pagamento**
- **Ações:** Alterar plano, cancelar

---

### 4.3 ÁREA DO VENDEDOR

#### 4.3.1 Dashboard (/seller/dashboard)
- **Cards de métricas:**
  - Oportunidades novas
  - Propostas enviadas
  - Propostas aceitas
  - Aguardando resposta
- **Oportunidades recentes** com:
  - Título
  - Comprador
  - Distância
  - Categoria
  - Data de criação
  - Botão "Ver Oportunidade"

#### 4.3.2 Oportunidades (/seller/opportunities)
- **Busca principal** no topo
- **Botão "Filtros"** com contador de filtros ativos
- **Filtros avançados (expandível):**
  - Palavra-chave
  - Produto específico
  - Categoria
  - Empresa específica
  - Raio máximo (km)
  - Cidade
  - Estado
- **Contador de resultados**
- **Lista de oportunidades** com:
  - Título e descrição
  - Comprador
  - Distância e localização
  - Categoria (badge)
  - Prazo de entrega
  - Status (se já enviou proposta)
  - Botão "Ver Detalhes"

#### 4.3.3 Detalhes da Oportunidade (/seller/opportunities/[id])
- **Card com informações completas:**
  - Título e descrição
  - Quantidade e unidade
  - Categoria
  - Prazo desejado
  - Comprador
  - Endereço completo
- **Botão "Enviar Proposta"** (ou badge "Proposta Enviada")
- **Modal de envio de proposta** com formulário completo

#### 4.3.4 Minhas Propostas (/seller/proposals)
- **Lista de todas as propostas enviadas**
- **Filtros:**
  - Busca por palavra-chave
  - Filtro por status
- **Informações exibidas:**
  - Título da requisição
  - Comprador
  - Preço
  - Prazo
  - Status (com badge colorido)
  - Data de envio
- **Ações:**
  - Ver detalhes
  - Editar (se permitido)

#### 4.3.5 Configurações (/seller/settings)
- **3 seções principais:**
  1. **Raio de Oportunidades:**
     - Slider para ajustar km (5-100km)
     - Checkbox "Receber todas"
  2. **Categorias de Interesse:**
     - Lista de categorias com checkboxes
  3. **Compradores Seguidos:**
     - Lista de compradores seguidos
     - Botão "Deixar de Seguir" para cada um
- **Botão "Salvar Configurações"**

#### 4.3.6 Gestão de Usuários (/seller/users)
- **Mesma estrutura** da área do comprador
- **Funções específicas:** Dono, Gerente, Vendedor

#### 4.3.7 Perfil da Empresa (/seller/profile)
- **Mesma estrutura** da área do comprador

---

### 4.4 ÁREA DO ADMINISTRADOR

#### 4.4.1 Dashboard (/admin/dashboard)
- **6 cards de métricas:**
  - Total de empresas
  - Usuários ativos
  - Requisições do mês
  - Propostas do mês
  - Faturamento do mês
  - Assinaturas vencidas
- **Gráficos de crescimento** (percentual vs mês anterior)
- **2 colunas:**
  - Empresas recentes
  - Ações necessárias (alertas)

#### 4.4.2 Gestão de Empresas (/admin/companies)
- **Tabela completa** com:
  - Nome da empresa
  - CNPJ
  - Tipo (Comprador/Vendedor/Ambos) com badge
  - Plano atual
  - Número de usuários
  - Status (Ativa/Suspensa/Pendente) com badge
  - Data de criação
  - Ações (ver, suspender/ativar)
- **Filtros:**
  - Busca por nome ou CNPJ
  - Filtro por status

#### 4.4.3 Gestão de Planos (/admin/plans)
- **Cards dos planos** com:
  - Nome e preço
  - Limites (usuários, requisições, propostas, categorias)
  - Badge "Ativo"
  - Botões "Editar" e "Excluir"
- **Botão "Novo Plano"**
- **Modal para criar/editar plano**

---

## 5. DIFERENCIAIS E BENEFÍCIOS

### 5.1 Para Compradores
✅ **Economia garantida:** Compare múltiplas propostas e escolha a melhor
✅ **Tempo otimizado:** Receba propostas sem precisar procurar fornecedores
✅ **Transparência:** Veja reputação, distância e histórico dos vendedores
✅ **Controle total:** Gerencie equipe, requisições e escolhas
✅ **Segurança:** Dados protegidos, contato liberado apenas após aceite

### 5.2 Para Vendedores
✅ **Oportunidades qualificadas:** Receba apenas requisições relevantes
✅ **Alcance ampliado:** Conecte-se com compradores da sua região
✅ **Configuração flexível:** Ajuste raio, categorias e siga compradores
✅ **Acompanhamento:** Veja status das propostas em tempo real
✅ **Crescimento:** Aumente sua base de clientes de forma organizada

### 5.3 Para a Plataforma
✅ **SaaS escalável:** Modelo de assinatura recorrente
✅ **Multi-empresa:** Suporta múltiplas empresas com isolamento de dados
✅ **Multi-usuário:** Gestão de equipes com diferentes níveis de acesso
✅ **Geolocalização:** Filtros inteligentes por distância
✅ **Sistema de avaliações:** Construção de reputação
✅ **Notificações:** Comunicação automática entre partes

---

## 6. FLUXOS PRINCIPAIS

### 6.1 Fluxo do Comprador
1. **Cadastro** → Escolhe plano → Paga assinatura
2. **Cria usuários** internos (conforme limite do plano)
3. **Cria requisição** → Preenche detalhes → Publica
4. **Recebe notificação** quando vendedores enviam propostas
5. **Visualiza propostas** → Compara preços, prazos, condições
6. **Aceita melhor proposta** → Contato do vendedor é liberado
7. **Finaliza negócio** fora da plataforma (WhatsApp, telefone, e-mail)
8. **Avalia vendedor** (opcional, após negócio)

### 6.2 Fluxo do Vendedor
1. **Cadastro** → Escolhe plano → Paga assinatura
2. **Configura preferências:**
   - Define raio de distância
   - Seleciona categorias de interesse
   - Opcionalmente segue compradores específicos
3. **Recebe notificação** de nova oportunidade
4. **Visualiza oportunidade** → Analisa detalhes
5. **Envia proposta** → Preenche preço, prazo, condições
6. **Acompanha status** → Visualizada, aceita ou recusada
7. **Se aceita:** Recebe notificação e contato do comprador é liberado
8. **Finaliza negócio** fora da plataforma

### 6.3 Fluxo de Assinatura e Pagamento
1. **Escolha do plano** durante cadastro
2. **Integração com gateway** de pagamento (Stripe)
3. **Cobrança recorrente** mensal automática
4. **Webhook de confirmação** ativa assinatura
5. **Acesso liberado** conforme plano
6. **Em caso de falha:**
   - Notificação por e-mail
   - Tentativa de retry automática
   - Após período de carência: suspensão automática
7. **Ao pagar:** Reativação automática

---

## 7. TECNOLOGIAS E ARQUITETURA

### 7.1 Frontend
- **Next.js 14** (App Router)
- **TypeScript** (tipagem estática)
- **TailwindCSS** (estilização)
- **React Icons & Lucide** (ícones)
- **Design responsivo** (mobile-first)

### 7.2 Estrutura
- **Componentes reutilizáveis:**
  - Header (com navegação dinâmica)
  - Footer
  - Button (com variantes e estados)
  - Input (com validação visual)
  - Modal (popups funcionais)
  - Card (containers padronizados)
- **Sistema de design consistente:**
  - Cores primárias e secundárias
  - Badges de status
  - Formulários padronizados
  - Modais e popups

---

## 8. PRÓXIMOS PASSOS (ROADMAP)

### Fase 1 - MVP (Atual - Protótipo Visual)
✅ Todas as páginas e interfaces
✅ Fluxos visuais completos
✅ Formulários com validação
✅ Modais e popups funcionais
✅ Design responsivo

### Fase 2 - Backend e Integrações
- [ ] API REST completa
- [ ] Banco de dados PostgreSQL + PostGIS
- [ ] Autenticação JWT
- [ ] Integração Stripe (pagamentos)
- [ ] Sistema de notificações por e-mail
- [ ] Upload de arquivos (S3)

### Fase 3 - Funcionalidades Avançadas
- [ ] Geolocalização real
- [ ] Sistema de avaliações
- [ ] Chat interno (opcional)
- [ ] Relatórios avançados com gráficos
- [ ] Export CSV/Excel
- [ ] API pública para integrações

### Fase 4 - Escala e Otimizações
- [ ] Cache e performance
- [ ] Testes automatizados
- [ ] Monitoramento e logs
- [ ] CI/CD
- [ ] Documentação completa

---

## 9. CONCLUSÃO

A **Plataforma Jada** representa uma solução completa e moderna para conectar compradores e vendedores de forma inteligente. Com interface intuitiva, funcionalidades robustas e sistema de planos flexível, estamos prontos para revolucionar o mercado de cotações.

**Principais destaques:**
- ✅ Interface moderna e intuitiva
- ✅ Sistema completo de permissões
- ✅ Filtros avançados e inteligentes
- ✅ Gestão completa de assinaturas
- ✅ Fluxos otimizados para ambos os lados
- ✅ Design responsivo e acessível

**Status atual:** Protótipo visual completo e funcional, pronto para apresentação e validação com clientes.

---

## 10. DEMONSTRAÇÃO

Durante a apresentação, recomendamos navegar pelas seguintes páginas para demonstrar as funcionalidades:

1. **Landing Page** → Mostrar proposta de valor
2. **Planos** → Explicar diferenciais de cada plano
3. **Cadastro** → Demonstrar processo simplificado
4. **Dashboard Comprador** → Mostrar criação de requisição
5. **Oportunidades Vendedor** → Demonstrar filtros avançados
6. **Envio de Proposta** → Mostrar processo completo
7. **Aceite de Proposta** → Demonstrar liberação de contato
8. **Configurações Vendedor** → Mostrar personalização
9. **Dashboard Admin** → Visão geral da plataforma

---

**Desenvolvido com foco em experiência do usuário, escalabilidade e resultados.**

