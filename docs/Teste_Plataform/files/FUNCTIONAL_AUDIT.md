# 🔍 JADA — Auditoria Funcional Completa

> Metodologia: Para cada área da aplicação, levantamos TODAS as perguntas funcionais possíveis.  
> Para cada pergunta: **existe tecnicamente?** → **funciona como esperado?** → **tem falha ou pode ser bypassado?**

---

## 📐 Como ler este documento

| Símbolo | Significado |
|---------|-------------|
| ✅ | Funcionalidade existe e funciona corretamente |
| ⚠️ | Existe mas tem falha, gap ou risco identificado |
| ❌ | Não existe — funcionalidade ausente ou não implementada |
| 🔴 | Pode ser bypassado / burlar segurança |
| 🟡 | Risco parcial / depende de comportamento não documentado |
| 🟢 | Seguro conforme documentação |

---

## ÁREA 1 — AUTENTICAÇÃO

### Perguntas Funcionais

| # | Pergunta | Existe? | Funciona? | Pode burlar? |
|---|----------|---------|-----------|--------------|
| A01 | Usuário consegue criar conta? | ✅ `/api/auth/signup` | ✅ | 🟢 |
| A02 | Usuário consegue fazer login? | ✅ `/api/auth/[...nextauth]` | ✅ | 🟢 |
| A03 | Usuário consegue fazer logout? | ✅ NextAuth signout | ✅ | 🟢 |
| A04 | Usuário consegue recuperar senha? | ✅ `/api/auth/forgot-password` + `/api/auth/reset-password` | ✅ | 🟢 |
| A05 | Usuário consegue redefinir senha com token expirado? | ✅ endpoint existe | ⚠️ Depende de validação de expiração | 🔴 **Se expiração não for verificada, token antigo funciona** |
| A06 | Usuário consegue logar com email de outro usuário? | ✅ endpoint existe | ✅ Bcrypt protege | 🟢 |
| A07 | Email é normalizado para minúsculo? | ✅ documentado | ⚠️ Se só no cadastro, login com maiúscula pode falhar | 🟡 |
| A08 | Existe limite de tentativas de login? | ❌ Não documentado | ❌ Não implementado | 🔴 **Brute force possível sem rate limiting** |
| A09 | Dois usuários podem ter o mesmo email? | ✅ `email unique` no schema | ✅ | 🟢 |
| A10 | Sessão expira em tempo razoável? | ⚠️ JWT de longa duração | ⚠️ Documentado como risco | 🔴 **Sessão mantém privilégios antigos após rebaixamento de role** |
| A11 | Existe diferença entre `/api/auth/signup` e `/api/auth/signup-with-billing`? | ✅ Dois endpoints | ⚠️ Propósito separado mas ambos públicos | 🟡 Testar se ambos criam empresa com mesmo CNPJ |
| A12 | Token de reset pode ser usado mais de uma vez? | ❌ Não documentado explicitamente | ⚠️ Depende de deleção após uso | 🔴 **Se não deletar token após uso, pode ser reutilizado** |

---

## ÁREA 2 — GATE DE ACESSO / PAGAMENTO

### Perguntas Funcionais

| # | Pergunta | Existe? | Funciona? | Pode burlar? |
|---|----------|---------|-----------|--------------|
| B01 | Usuário acessa a plataforma ANTES de pagar? | ✅ Gate existe | ✅ Redirecionado para `/aguardando-pagamento` | 🔴 **APIs de marketplace NÃO verificam billingStatus — apenas UI/layout** |
| B02 | Usuário acessa a plataforma ANTES da aprovação do admin? | ✅ Gate existe | ✅ Redirecionado para `/aguardando-pagamento` | 🔴 **Mesmo risco: APIs verificam? Não documentado que sim para todas** |
| B03 | `billingManuallyApproved=true` libera acesso sem pagamento? | ✅ Documentado | ✅ Bypass operacional intencional | 🟡 Quem pode setar esse campo? Só admin? |
| B04 | Usuário com `billingStatus=past_due` é bloqueado? | ✅ Gate no layout | ✅ Redireciona para aguardando | 🔴 **APIs de criação de request/proposal verificam isso?** |
| B05 | Usuário com `billingStatus=canceled` é bloqueado? | ✅ Gate no layout | ✅ Redireciona para aguardando | 🔴 **Mesmo risco das APIs diretas** |
| B06 | Usuário acessa `/buyer/*` sendo seller? | ⚠️ Middleware não distingue buyer/seller, apenas verifica JWT | ⚠️ Depende do layout | 🔴 **Seller pode tentar acessar `/buyer/create-request` diretamente se layout não bloquear por tipo** |
| B07 | Usuário acessa `/seller/*` sendo buyer? | ⚠️ Mesmo problema | ⚠️ Depende do layout | 🔴 **Buyer pode tentar acessar `/seller/opportunities` ou criar proposta via API** |
| B08 | Após pagamento, acesso é liberado automaticamente? | ✅ Webhook + fallback | ✅ Webhook ou polling | 🟡 Se webhook falhar, usuário fica preso sem o fallback |
| B09 | Usuário vê link de pagamento correto? | ✅ `/api/company/payment-link` | ✅ | 🟡 Link de outra empresa pode vazar? |
| B10 | Usuário sem sessão acessa `/aguardando-pagamento`? | ✅ Middleware protege | ✅ Redireciona para login | 🟢 |

---

## ÁREA 3 — PLANOS

### Perguntas Funcionais

| # | Pergunta | Existe? | Funciona? | Pode burlar? |
|---|----------|---------|-----------|--------------|
| C01 | Usuário consegue VER os planos disponíveis? | ✅ `/api/plans` público | ✅ | 🟢 |
| C02 | Usuário consegue MUDAR de plano? | ❌ **Não existe endpoint documentado para mudança de plano pelo usuário** | ❌ | 🔴 **Funcionalidade ausente — usuário não tem como fazer upgrade/downgrade sozinho** |
| C03 | Admin consegue mudar o plano de uma empresa? | ⚠️ `/api/admin/companies/[id]` tem PATCH | ⚠️ Depende se `plan` está na whitelist de campos editáveis | 🟡 |
| C04 | Mudança de plano recalcula billing no Asaas? | ❌ Não documentado | ❌ Não implementado | 🔴 **Se plano mudar, assinatura no Asaas não é atualizada automaticamente** |
| C05 | Limites do plano são verificados em tempo real? | ✅ Documentado | ✅ Por runtime em cada endpoint | 🟢 |
| C06 | Usuário no plano starter pode criar mais usuários que o limite? | ✅ Check existe | ✅ Retorna 4xx | 🟡 Testar se limite=0 bloqueia imediatamente |
| C07 | Downgrade de plano bloqueia recursos já criados? | ❌ Não documentado | ❌ Não implementado | ⚠️ Usuário pode ter mais usuários que o novo limite |
| C08 | Plano inativo/deletado bloqueia criação? | ⚠️ `plan` é slug string sem FK | ⚠️ Depende de validação em runtime | 🔴 **Se plano for deletado pelo admin, empresa fica com slug órfão** |
| C09 | Admin consegue criar planos? | ✅ `POST /api/admin/plans` | ✅ | 🟢 |
| C10 | Admin consegue deletar plano com empresas vinculadas? | ✅ `DELETE /api/admin/plans/[id]` | ⚠️ Sem FK, não há proteção automática de integridade | 🔴 **Admin pode deletar plano ativo — empresas ficam com plano inexistente** |

---

## ÁREA 4 — EMPRESA (COMPANY/TENANT)

### Perguntas Funcionais

| # | Pergunta | Existe? | Funciona? | Pode burlar? |
|---|----------|---------|-----------|--------------|
| D01 | Usuário consegue ver os dados da sua empresa? | ✅ `GET /api/company` | ✅ | 🟢 |
| D02 | Usuário consegue editar dados da empresa? | ✅ `PATCH /api/company` | ✅ | 🔴 **Depende da whitelist: `approvalStatus`, `billingStatus`, `plan` são editáveis?** |
| D03 | Usuário consegue ver assinatura/limites? | ✅ `GET /api/company/subscription` | ✅ | 🟢 |
| D04 | Usuário de empresa A acessa dados de empresa B? | ⚠️ API usa `session.user.companyId` | ✅ Se bem implementado | 🔴 **Se `companyId` puder ser injetado via query string ou body, é IDOR** |
| D05 | Empresa pode ter CNPJ duplicado? | ✅ Normalização existe | ⚠️ Único no banco? Não explicitamente documentado | 🔴 **Se não houver constraint UNIQUE no CNPJ, dois cadastros com mesmo CNPJ** |
| D06 | Empresa pode mudar tipo (buyer→seller)? | ⚠️ PATCH existe mas type não está na whitelist documentada | ❌ Não documentado como permitido | 🔴 **Se `type` puder ser mudado, empresa buyer vira seller sem aprovação** |
| D07 | Admin vê todas as empresas? | ✅ `GET /api/admin/companies` | ✅ | 🟢 |
| D08 | Admin aprova empresa já aprovada? | ✅ Validação documentada: retorna erro | ✅ | 🟢 |
| D09 | Admin rejeita empresa? | ⚠️ `PATCH /api/admin/companies/[id]` | ⚠️ Não documentado explicitamente o fluxo de rejeição | 🟡 |
| D10 | Admin revalida CNPJ? | ✅ `POST /api/admin/companies/[id]/verify` | ✅ | 🟢 |

---

## ÁREA 5 — USUÁRIOS DA EMPRESA

### Perguntas Funcionais

| # | Pergunta | Existe? | Funciona? | Pode burlar? |
|---|----------|---------|-----------|--------------|
| E01 | Owner consegue convidar/criar usuários? | ✅ `POST /api/company/users` | ✅ | 🟢 |
| E02 | Limite de usuários do plano é respeitado? | ✅ Documentado | ✅ | 🟡 Testar com limite=0 |
| E03 | Usuário pode criar conta em empresa de outra pessoa? | ⚠️ `companyId` vem da sessão | ✅ Se bem implementado | 🔴 **Se `companyId` puder ser injetado no body do POST** |
| E04 | Usuário employee tem acesso igual ao owner? | ⚠️ Roles documentados | ⚠️ Sem enforcement granular documentado por role interno | 🔴 **Employee pode chamar `/api/company/users` e criar mais usuários?** |
| E05 | Usuário pode promover a si mesmo para role superior? | ⚠️ Sem documentação de proteção explícita | ❌ Não documentado | 🔴 **Employee pode mandar `role: "admin"` no POST `/api/company/users`?** |
| E06 | Admin global pode listar usuários de qualquer empresa? | ✅ Via `/api/admin/companies/[id]` | ✅ | 🟢 |
| E07 | Usuário deletado ainda consegue logar? | ❌ Soft delete não documentado | ⚠️ JWT mantém sessão até expirar | 🔴 **Usuário removido do banco mas com JWT ativo ainda tem sessão válida** |
| E08 | Usuário consegue ver usuários de outra empresa? | ⚠️ `GET /api/company/users` usa `companyId` da sessão | ✅ Se bem implementado | 🔴 **`?companyId=outro` como query param pode vazar dados** |

---

## ÁREA 6 — BUYER: REQUESTS

### Perguntas Funcionais

| # | Pergunta | Existe? | Funciona? | Pode burlar? |
|---|----------|---------|-----------|--------------|
| F01 | Buyer consegue criar request? | ✅ `POST /api/requests` | ✅ | 🟢 |
| F02 | Seller consegue criar request? | ✅ Verificação por tipo | ✅ Retorna erro | 🔴 **Empresa `both` pode criar request? Sim, documentado. E `seller` puro? Deve ser bloqueado.** |
| F03 | Request nasce com status `open`? | ✅ Documentado | ✅ | 🟢 |
| F04 | Buyer consegue ver suas próprias requests? | ✅ `GET /api/requests` | ✅ | 🟢 |
| F05 | Buyer consegue ver requests de outro buyer? | ⚠️ Depende do filtro na API | ⚠️ Não documentado se filtra por `buyerId` da sessão | 🔴 **GET `/api/requests` retorna só as da empresa ou todas?** |
| F06 | Buyer consegue editar request após proposta aceita? | ✅ `PATCH /api/requests/[id]` | ⚠️ Sem validação de status documentada para edição | 🔴 **Buyer pode alterar request com status `selected` ou `closed`?** |
| F07 | Buyer consegue fechar/cancelar request? | ⚠️ PATCH existe | ⚠️ Sem endpoint explícito de cancelamento | 🟡 |
| F08 | Limite mensal de requests é aplicado? | ✅ Documentado | ✅ Retorna 4xx | 🟢 |
| F09 | Seller consegue ver requests `isPublic=false`? | ⚠️ Não documentado | ⚠️ Depende do filtro da API | 🔴 **Requests privadas podem aparecer para sellers?** |
| F10 | Buyer acessa request de outro buyer diretamente por ID? | ⚠️ `GET /api/requests/[id]` | ⚠️ Sem documentação de isolamento por tenant | 🔴 **IDOR: buyer pode acessar `/api/requests/req-de-outro-buyer`?** |

---

## ÁREA 7 — SELLER: PROPOSALS

### Perguntas Funcionais

| # | Pergunta | Existe? | Funciona? | Pode burlar? |
|---|----------|---------|-----------|--------------|
| G01 | Seller consegue criar proposta? | ✅ `POST /api/proposals/create` | ✅ | 🟢 |
| G02 | Buyer consegue criar proposta? | ✅ Verificação por tipo | ✅ Retorna erro para buyer puro | 🟢 |
| G03 | Seller propõe para própria request? | ✅ Validação documentada | ✅ Retorna erro | 🟢 |
| G04 | Seller envia proposta duplicada? | ✅ Validação documentada | ✅ Retorna erro | 🟢 |
| G05 | Seller vê propostas de outro seller? | ⚠️ `GET /api/proposals` | ⚠️ Filtra por `sellerId` da sessão? | 🔴 **IDOR: seller pode ver propostas de concorrente?** |
| G06 | Limite mensal de propostas é aplicado? | ✅ Documentado | ✅ | 🟢 |
| G07 | Seller aceita proposta de outro seller? | ✅ Validação documentada | ✅ Só owner da request aceita | 🟢 |
| G08 | Buyer aceita proposta de request que não é sua? | ✅ Validação documentada | ✅ Retorna erro | 🟢 |
| G09 | Seller consegue ver todas as oportunidades públicas? | ✅ `GET /api/requests` (público para sellers) | ✅ | 🟢 |
| G10 | Seller com billing `past_due` consegue criar proposta? | ⚠️ Gate no layout | ⚠️ **A API `/api/proposals/create` verifica billingStatus?** | 🔴 **Se não verificar, seller inadimplente cria propostas diretamente na API** |
| G11 | Status da proposta progride corretamente? (sent→viewed→accepted/rejected) | ⚠️ Documentado | ⚠️ `viewed` não tem endpoint documentado | 🟡 |

---

## ÁREA 8 — BILLING / ASSINATURA

### Perguntas Funcionais

| # | Pergunta | Existe? | Funciona? | Pode burlar? |
|---|----------|---------|-----------|--------------|
| H01 | Usuário consegue criar assinatura manualmente? | ✅ `POST /api/billing/asaas/subscribe` | ✅ | 🔴 **Usuário pode criar segunda assinatura se não houver idempotência** |
| H02 | Assinatura duplicada é evitada? | ⚠️ Documentado como risco | ⚠️ "Deve ser idempotente" — não confirmado como implementado | 🔴 **Alta prioridade: cliente cobrado duas vezes** |
| H03 | Usuário vê status da assinatura? | ✅ `GET /api/company/subscription` | ✅ | 🟢 |
| H04 | Usuário consegue cancelar assinatura? | ❌ Não existe endpoint de cancelamento pelo usuário | ❌ | ⚠️ **Usuário precisa pedir ao admin para cancelar** |
| H05 | Usuário consegue mudar método de pagamento? | ❌ Não existe endpoint documentado | ❌ | ⚠️ **Funcionalidade ausente — usuário não pode trocar PIX por BOLETO após cadastro** |
| H06 | Pagamento confirmado libera acesso imediatamente? | ✅ Via webhook | ✅ + fallback no payment-link | 🟡 Depende de webhook funcionando |
| H07 | Webhook aceita eventos sem autenticação? | ✅ Proteção por token | ✅ Retorna 403 sem token | 🟢 |
| H08 | Evento de pagamento duplicado é processado duas vezes? | ⚠️ Sem deduplicação por event ID | ⚠️ Documentado como gap | 🔴 **Evento duplicado pode ativar billing duas vezes / gerar inconsistência** |
| H09 | Evento de cobrança atualiza empresa errada? | ⚠️ Depende do mapeamento customer→company | ⚠️ Se `billingCustomerId` for duplicado, risco | 🔴 **Sem validação de que o customer no evento pertence à empresa** |
| H10 | `billingManuallyApproved` pode ser setado pelo usuário? | ❌ Campo protegido | ✅ Deve ser só admin | 🔴 **Se PATCH `/api/company` não tiver whitelist, usuário pode se auto-aprovar** |

---

## ÁREA 9 — ADMIN

### Perguntas Funcionais

| # | Pergunta | Existe? | Funciona? | Pode burlar? |
|---|----------|---------|-----------|--------------|
| I01 | Usuário comum acessa `/admin/*`? | ✅ Middleware bloqueia | ✅ Redireciona para login | 🟢 |
| I02 | Usuário comum acessa `GET /api/admin/stats` diretamente? | ✅ Verificação server-side | ✅ `role=admin` verificado | 🟢 |
| I03 | Admin pode criar admin via `/api/company/users`? | ⚠️ Endpoint de usuários de empresa | ⚠️ `role=admin` é role global, não de empresa | 🔴 **Confusão de role context: admin global vs role interno da empresa** |
| I04 | Admin vê dados financeiros? | ✅ `GET /api/admin/financial` | ✅ | 🟢 |
| I05 | Admin deleta plano com empresas usando? | ✅ `DELETE /api/admin/plans/[id]` | ⚠️ Sem proteção de FK | 🔴 **Pode corromper empresas com plano deletado** |
| I06 | Existe log/auditoria de ações do admin? | ⚠️ Só `BillingEvent` documentado | ⚠️ Outras ações admin não são auditadas | 🟡 |
| I07 | Admin pode logar como outro usuário (impersonation)? | ❌ Não documentado | ❌ Não implementado | ⚠️ Ausência pode dificultar suporte |
| I08 | Admin consegue ver estatísticas em tempo real? | ✅ `GET /api/admin/stats` | ✅ | 🟢 |

---

## 🚨 TOP 10 RISCOS IDENTIFICADOS (Ordenados por Impacto)

| Rank | ID | Risco | Impacto |
|------|----|-------|---------|
| 🥇 | B01/B02 | **APIs de marketplace não verificam `billingStatus` — apenas UI/layout** | Usuário sem pagamento opera via chamada direta à API |
| 🥈 | H02 | **Criação de assinatura duplicada no Asaas** | Cliente cobrado duas vezes |
| 🥉 | C02 | **Não existe endpoint de mudança de plano pelo usuário** | Funcionalidade ausente crítica |
| 4 | A08 | **Sem rate limiting em auth** | Brute force em senhas |
| 5 | D02/D06 | **PATCH `/api/company` pode aceitar campos protegidos** | Mass assignment: usuário se auto-aprova |
| 6 | A12 | **Token de reset pode ser reutilizável** | Sequestro de conta |
| 7 | C10/I05 | **Admin pode deletar plano com empresas vinculadas** | Corrupção de dados |
| 8 | G10 | **Seller inadimplente cria propostas via API direta** | Bypass de gate de billing |
| 9 | E05 | **Usuário pode promover role via criação de usuário** | Escalonamento de privilégios |
| 10 | F05/F10/G05 | **IDOR em requests e proposals** | Vazamento de dados entre tenants |

---

## ❌ FUNCIONALIDADES AUSENTES (Não Implementadas)

| ID | Funcionalidade | Impacto |
|----|---------------|---------|
| MISS-01 | Mudança de plano pelo usuário | Crítico — usuário preso no plano inicial |
| MISS-02 | Cancelamento de assinatura pelo usuário | Alto — depende do admin para cancelar |
| MISS-03 | Mudança de método de pagamento pós-cadastro | Médio — usuário não pode trocar PIX por boleto |
| MISS-04 | Status `viewed` de proposal sem endpoint | Baixo — rastreabilidade de proposta incompleta |
| MISS-05 | Auditoria de ações admin | Médio — sem log de quem aprovou o quê |
| MISS-06 | Impersonation admin | Baixo — dificulta suporte ao cliente |
| MISS-07 | Soft delete de usuário | Médio — usuário removido com JWT ativo |
| MISS-08 | Proteção de downgrade de plano | Médio — dados excedentes ficam sem política |
