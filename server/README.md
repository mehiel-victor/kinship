# Kinship Server

Backend Express/TypeScript da plataforma Kinship, com regras de domínio para People Ops, compliance trabalhista, clima organizacional, performance e recrutamento.

## Módulos

- `payroll`: validação de férias, limite concessivo, auditoria de folha e exportação CNAB de remessa.
- `climate`: respostas de clima/eNPS e agregação com regra de anonimato.
- `performance`: avaliações 360 e consolidação por competência.
- `talent`: candidatos, vagas e matching score.
- `employees`: base de colaboradores, departamentos e status de onboarding.

## Comandos

```bash
yarn install
yarn dev
yarn test
```

A API local roda em `http://localhost:3001`.
