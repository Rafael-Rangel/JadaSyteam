# Due Diligence de Empresas

## Stack em camadas

- Base cadastral: `CNPJ.ws` (fallback para `BrasilAPI`).
- Processos judiciais: `Escavador` (automático no onboarding/verificação).
- Score financeiro: `Serasa` (sob demanda por ação do admin).

## Fluxo

1. Cadastro cria empresa com `verificationStatus=pending`.
2. Orquestrador roda consulta cadastral (`CNPJ.ws`).
3. Em seguida roda risco judicial (`Escavador`).
4. Sistema persiste relatórios em `DueDiligenceReport` e atualiza `Company`.
5. Admin pode disparar Serasa manualmente pelo painel.

## Campos persistidos

- `Company.riskLevel`
- `Company.lastDueDiligenceAt`
- `Company.judicialFlags`
- `Company.serasaScore`
- `Company.serasaCheckedAt`
- `DueDiligenceReport` (histórico completo por provedor/tipo)

## Limites e custo

- CNPJ.ws: limite gratuito baixo (ex.: 3 req/min), com rate limit interno.
- Escavador: consulta com token, sujeito à cota da conta.
- Serasa: custo mais alto; somente demanda explícita do admin.

## Variáveis de ambiente

- `CNPJWS_BASE_URL`
- `CNPJWS_API_KEY`
- `CNPJWS_RATE_LIMIT_PER_MIN`
- `ESCAVADOR_BASE_URL`
- `ESCAVADOR_API_TOKEN`
- `SERASA_BASE_URL`
- `SERASA_CLIENT_ID`
- `SERASA_CLIENT_SECRET`
