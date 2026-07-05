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
6. **Payroll & Compliance**: Regras de férias, cálculo de limite de período concessivo, bloqueio de sobreposição de férias críticas e exportação CNAB de remessa.
7. **Analytics**: Headcount, turnover, absenteísmo e análise de correlação preditiva.

## Oferta Comercial

A entrada pública do produto posiciona a Kinship como **Kinship Risk Desk**, uma oferta de piloto pago para Heads de RH, People Ops e COOs que precisam reduzir risco operacional em clima, onboarding, DP/compliance e sucessão.

O fluxo público inclui:

- landing page focada no ICP de empresas tech/serviços B2B com 80-300 funcionários;
- oferta de piloto de 30 dias com faixa de preço sugerida de `R$ 1.500 - R$ 3.000/mês`;
- CTA de diagnóstico de People Ops com qualificação por headcount, área de risco e urgência;
- formulário que calcula prioridade comercial, recomenda próximo passo e mantém o lead no pipeline comercial do workspace;
- acesso separado ao workspace autenticado do produto.

## Melhorias de Produto

A landing pública inclui melhorias focadas em conversão comercial e validação de demanda:

- qualificação de lead com score de 1 a 9 para separar nutrição, discovery e piloto pago;
- resposta pós-envio com prioridade, recomendação comercial e próximo passo;
- microprovas no hero destacando diagnóstico em 48h, plano semanal de risco e piloto assistido.

## Acessos do Workspace

O front-end publicado na Vercel usa autenticação por email/senha para apresentar a experiência por perfil sem exigir provisionamento externo. As credenciais abaixo representam contas da empresa cliente OrbitaTech:

| Perfil | Email | Senha | Permissões |
| --- | --- | --- | --- |
| Colaborador | `joao.silva@orbitatech.com` | `Kinship@2026` | Feedback 360, pesquisa de clima e férias |
| Gestora técnica | `maria.santos@orbitatech.com` | `Kinship@2026` | Time, vagas, performance e compliance |
| Recursos Humanos | `carla.pereira@orbitatech.com` | `Kinship@2026` | People Ops completo |
| Administrador | `admin@orbitatech.com` | `Kinship@2026` | Visão administrativa geral |

As contas compartilham histórico operacional. Para testar a interação, entre como gestora, crie uma vaga ou envie um feedback, saia e entre como RH/Admin para ver a ação no painel **Atividade entre contas**.

## Workspace de Produto

A primeira tela após login é a aba **Cockpit Operacional**, que apresenta um fluxo completo de trabalho:

1. gestora cria demanda e feedback;
2. colaborador gera sinais de clima e DP;
3. RH revisa riscos, onboarding e histórico;
4. admin valida governança e compliance.

Essa aba também mostra o que acompanhar na operação, últimas evidências registradas e um botão para reiniciar o cenário operacional.

Os casos de uso destacados cobrem problemas reais de empresas: contratação sem contexto entre gestor e RH, sinais de clima chegando tarde demais e risco trabalhista/DP operando sem governança visível.

## CI/CD Vercel

O repositório inclui o workflow `.github/workflows/vercel-ci.yml` para GitHub Actions:

- valida PRs e pushes com lint do cliente, build do cliente e testes do servidor;
- cria deploy preview na Vercel para PRs abertos no próprio repositório;
- publica produção na Vercel em todo push para `master`.

Secrets usados pelo workflow:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

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
