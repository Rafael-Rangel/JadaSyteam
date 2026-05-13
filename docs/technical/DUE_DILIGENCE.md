# Due Diligence de Empresas

## Stack em camadas

- Base cadastral: `CNPJ.ws` (fallback para `BrasilAPI`).
- Processos judiciais: `Escavador` (sob demanda no painel admin, como o Serasa).
- Score financeiro: `Serasa` (sob demanda por ação do admin).

## Fluxo

1. Cadastro cria empresa com `verificationStatus=pending`.
2. Orquestrador roda consulta cadastral (`CNPJ.ws`) e persiste em `DueDiligenceReport` / `Company`.
3. Admin pode disparar **Escavador** (processos) e **Serasa** manualmente pelo menu de ações da empresa.
4. Se já existir relatório judicial anterior, nova due diligence cadastral reaproveita esse contexto para `verificationStatus` / `riskLevel`.

## Campos persistidos

- `Company.riskLevel`
- `Company.lastDueDiligenceAt`
- `Company.judicialFlags`
- `Company.serasaScore`
- `Company.serasaCheckedAt`
- `DueDiligenceReport` (histórico completo por provedor/tipo)

## Limites e custo

- CNPJ.ws: limite gratuito baixo (ex.: 3 req/min), com rate limit interno.
- Escavador: consulta com token, **somente** quando o admin aciona no painel; sujeito à cota da conta.
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
