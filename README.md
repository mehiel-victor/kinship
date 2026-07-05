# Kinship - People & Culture Platform

Este repositório contém a **Kinship**, uma plataforma centralizada e inteligente de Gestão de Pessoas e Cultura, projetada para automatizar e gerenciar todo o ciclo de vida do colaborador em pequenas empresas.

## Estrutura do Monorepo

O projeto é estruturado como um monorepo dividido em:

- [client](client/): Front-end desenvolvido com React.js (com TypeScript), Tailwind CSS e Vite. Apresenta uma interface de alta fidelidade com suporte a temas claro/escuro, animações micro-interativas e painéis dinâmicos para todas as verticais do produto.
- [server](server/): Back-end em Node.js / Express / TypeScript contendo a lógica de negócios e as regras de compliance (Payroll, Climate, Performance, Talent).

## Módulos Implementados (Backend & Frontend)

1. **Core/Auth**: Controle de acesso por cargo (RBAC) e consentimento LGPD.
2. **Talent**: Motor de recrutamento com score de matching de candidatos.
3. **Onboarding**: Checklists de progresso e verificação/assinatura de documentos com assinatura digital SHA-256.
4. **Performance**: Módulo de avaliação 360° com cálculo automático de médias.
5. **Climate**: Coletor de eNPS com anonimato assegurado e agregação restrita a times com 3 ou mais membros.
6. **Payroll & Compliance**: Regras de férias, cálculo de limite de período concessivo, bloqueio de sobreposição de férias críticas e exportação CNAB mockada.
7. **Analytics**: Headcount, turnover, absenteísmo e análise de correlação preditiva.

## Login da Demo

O front-end publicado na Vercel usa autenticação mockada por email/senha para demonstrar RBAC sem depender de backend local. As credenciais abaixo são apenas para a demo:

| Perfil | Email | Senha | Permissões demonstradas |
| --- | --- | --- | --- |
| Colaborador | `joao.silva@kinship.demo` | `Kinship@2026` | Feedback 360, pesquisa de clima e férias |
| Gestora técnica | `maria.santos@kinship.demo` | `Kinship@2026` | Time, vagas, performance e compliance |
| Recursos Humanos | `carla.pereira@kinship.demo` | `Kinship@2026` | People Ops completo |
| Administrador | `admin@kinship.demo` | `Kinship@2026` | Visão administrativa geral |

## Como Executar o Projeto

### Pré-requisitos
- Node.js (v18+)
- Yarn ou npm

### Instalação

Na raiz do projeto, instale as dependências:
```bash
yarn install
```

### Inicialização

1. **Iniciar o servidor (Backend)**:
   ```bash
   cd server
   yarn dev
   ```
   A API rodará em `http://localhost:3001`.

2. **Executar Testes do Backend**:
   ```bash
   cd server
   yarn test
   ```

3. **Iniciar a aplicação (Frontend)**:
   ```bash
   cd client
   yarn dev
   ```
   O front-end iniciará em `http://localhost:5173`.
