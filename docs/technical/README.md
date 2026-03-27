# JADA Technical Documentation

Este diretório concentra a documentação técnica detalhada do projeto JADA, com foco em arquitetura, APIs, banco, regras de negócio, infraestrutura e segurança.

## Índice

- `ARCHITECTURE.md`: arquitetura de aplicação, camadas, componentes e integrações.
- `ROUTES_AND_APIS.md`: catálogo completo de rotas de UI e APIs, com método HTTP, autorização e finalidade.
- `DATABASE_MODEL.md`: modelo de dados Prisma/PostgreSQL, relacionamentos, estados e decisões de persistência.
- `BUSINESS_LOGIC.md`: fluxos de negócio ponta a ponta (cadastro, aprovação, cobrança, requests/proposals).
- `SECURITY_AND_INFRA.md`: controles de segurança implementados, riscos, hardening e visão de infraestrutura.
- `OPERATIONS_RUNBOOK.md`: operação diária, checklist de ambiente, deploy, troubleshooting e observabilidade.
- `COMPLIANCE_MATRIX.md`: matriz de conformidade dos itens da auditoria funcional/segurança.
- `SECURITY_AUDIT_REPORT.md`: relatório da execução da auditoria automatizada e riscos residuais.

## Escopo

- Conteúdo baseado no estado atual do código em `app/`, `lib/`, `prisma/`, `middleware.ts`, scripts e documentação existente.
- Priorização em arquitetura de backend/infra e mecanismos de segurança aplicados.
- Documento voltado para engenharia, SRE/DevOps e segurança de aplicação.
