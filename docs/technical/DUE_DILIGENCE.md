# Due Diligence de Empresas

## Stack em camadas

- Base cadastral: `CNPJ.ws` (fallback para `BrasilAPI`) — automático no cadastro.
- Processos judiciais: `Escavador` — **manual** no painel admin.
- Relatório financeiro Serasa Experian: **API Asaas** (`POST /v3/creditBureauReport`) — **manual** no painel admin.

## Fluxo

1. Cadastro cria empresa com `verificationStatus=pending`.
2. Orquestrador roda consulta cadastral (`CNPJ.ws`) e persiste em `DueDiligenceReport` / `Company`.
3. Admin pode disparar **Escavador** (processos) e **Serasa (via Asaas)** no menu de ações da empresa.
4. Se já existir relatório judicial anterior, nova due diligence cadastral reaproveita esse contexto para `verificationStatus` / `riskLevel`.

## Serasa via Asaas

- Endpoint: `POST /v3/creditBureauReport` com `cpfCnpj` ou `customer` (`Company.billingCustomerId`).
- Requer **permissão** na conta Asaas (gerente de contas) e **saldo**; cada consulta é cobrada.
- Resposta: `downloadUrl` (PDF até 23:59 do dia) e opcionalmente `reportFile` (Base64 só na criação).
- O score numérico está **no PDF**, não no JSON — `Company.serasaScore` pode ficar `null`.
- Código: `lib/providers/asaasSerasa.ts`, `lib/asaas.ts` (`asaasCreateCreditBureauReport`).

## Escavador

- Variável: `ESCAVADOR_API_TOKEN` em `.env` / `.env.production`.
- Sem token: botão desabilitado no admin; API retorna `pending` com mensagem clara.
- Após obter o token: adicionar na VPS e `deploy/scripts/deploy.sh` em `/opt/jada` apenas.

## Campos persistidos

- `Company.riskLevel`, `lastDueDiligenceAt`, `judicialFlags`
- `Company.serasaScore`, `serasaCheckedAt`
- `DueDiligenceReport` (`provider`: `cnpjws`, `brasilapi`, `escavador`, `asaas`)

## Limites e custo

- CNPJ.ws: ~3 req/min (API pública); rate limit interno.
- Escavador: cota da conta; só sob demanda do admin.
- Serasa (Asaas): custo por consulta na fatura Asaas; timeout HTTP 45s.

## Variáveis de ambiente

- `CNPJWS_*`, `BRASILAPI_BASE_URL` (opcional)
- `ASAAS_ENV`, `ASAAS_API_KEY` (cobrança + Serasa)
- `ESCAVADOR_BASE_URL`, `ESCAVADOR_API_TOKEN`

Status das integrações (admin): `GET /api/admin/integrations/status`
