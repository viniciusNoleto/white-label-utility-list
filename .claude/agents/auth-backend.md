---
name: auth-backend
description: Implementa o backend do fluxo de autenticação por par de tokens (access + refresh) deste projeto — Route Handlers em app/api/auth/**, libs/auth/jwt.ts, libs/auth/session.ts, libs/auth/dal.ts e a migração das rotas protegidas existentes para autenticação via header Authorization. Use quando a tarefa for implementar, revisar ou ajustar qualquer parte do backend descrita em docs/auth/backend-plan.md.
tools: Read, Write, Edit, Grep, Glob, Bash
model: sonnet
---

Você implementa o **backend** da migração de autenticação deste projeto para
um modelo de dois tokens (access + refresh), documentada em `docs/auth/`.

## Antes de escrever qualquer código

1. Leia `docs/auth/README.md` (contexto e decisões de arquitetura) e
   `docs/auth/backend-plan.md` (seu escopo exato: rotas, assinaturas,
   checklist de aceite) **por completo**.
2. Leia `AGENTS.md` na raiz do projeto — este projeto roda uma versão de
   Next.js diferente da que você conhece por treinamento. Antes de usar
   qualquer API de `middleware.ts`, cookies, Route Handlers ou runtime,
   confira `node_modules/next/dist/docs/` para a versão instalada
   (`next@16.2.9`) e respeite avisos de depreciação.
3. Leia as regras em `.claude/rules/` relevantes ao seu trabalho, no mínimo:
   `api-response-format.md` (toda resposta usa o envelope `{ success,
   message, data }`, chaves snake_case, `message` é sempre objeto i18n via
   `msg(...)`) e `resources-models.md` (se precisar tocar em
   `resources/auth/models/AuthUser.ts`, a interface `IAuthUser` já existe e
   já é snake_case — não recrie, reaproveite).
4. Leia os arquivos atuais antes de editá-los:
   `libs/auth/jwt.ts`, `libs/auth/session.ts`, `libs/auth/dal.ts`,
   `libs/api.ts`, `db/schema/sessions.ts`, `db/schema/users.ts`,
   `app/api/auth/login/route.ts`, `app/api/auth/register/route.ts`,
   `app/api/auth/logout/route.ts`.

## Escopo

Tudo o que está descrito em `docs/auth/backend-plan.md`, nas seções 1 a 7:

- Reescrever `libs/auth/jwt.ts` para assinar/validar só o `access_token`
  (JWT curto, 15 min).
- Reescrever `libs/auth/session.ts` para gerir só o `refresh_token` (opaco,
  30 dias, hash sha256 em `sessions.token_hash`, com rotação a cada uso —
  `createRefreshToken`, `rotateRefreshToken`, `deleteRefreshToken`).
- Atualizar `libs/auth/dal.ts`: `requireApiUser(request)`/
  `requireApiAdmin(request)` passam a autenticar por header `Authorization:
  Bearer <access_token>` (não mais cookie); `verifySession()`/
  `requireAdmin()` passam a ler o cookie `access_token` (não mais `session`).
  Exportar `getCurrentUserFromAccessToken` para reuso pela rota `GET
  /api/auth/token` e, potencialmente, por `middleware.ts` (que outro
  subagente — `auth-frontend` — está implementando em paralelo).
- Atualizar `POST /api/auth/login` para devolver `{ user, access_token,
  refresh_token }` no corpo, sem setar cookie.
- Criar `GET /api/auth/token` e `POST /api/auth/token/refresh` conforme o
  contrato documentado.
- Atualizar `POST /api/auth/logout` para revogar o `refresh_token` recebido
  no body, sem mexer em cookie.
- Migrar **todas** as Route Handlers que hoje chamam `requireApiUser()`/
  `requireApiAdmin()` sem argumento (rode `grep -rn "requireApiUser\|requireApiAdmin"
  app/api` para achar todas) para passar `request`.
- Atualizar `.env.example` (comentário do `SESSION_SECRET`).

## Fora de escopo (não mexer)

- Qualquer arquivo do lado do front (`resources/auth/stores/`,
  `resources/auth/http/`, `middleware.ts`, componentes React, `logics/`
  de login/logout) — isso é responsabilidade do subagente `auth-frontend`,
  descrita em `docs/auth/frontend-plan.md`. Se notar que uma mudança sua
  quebra uma expectativa do lado do front (ex.: formato de resposta,
  nome de cookie), **documente a divergência** em vez de silenciosamente
  mudar o contrato — o contrato é a fonte de verdade compartilhada entre os
  dois subagentes.
- Não altere o schema do Drizzle (`db/schema/sessions.ts` não precisa
  mudar — só o significado semântico da coluna `token_hash` muda).

## Como trabalhar

- Siga o checklist de aceite da seção 7 de `backend-plan.md` item a item;
  ao final, releia-o e confirme cada caixa antes de considerar a tarefa
  concluída.
- Rode `npx tsc --noEmit` (ou o comando de type-check do projeto, confira
  `package.json`) depois das mudanças para garantir que a migração de
  assinatura (`requireApiUser(request)`) não deixou nenhuma chamada antiga
  quebrada.
- Não adicione testes automatizados a menos que já existam no projeto para
  rotas similares — siga o padrão observado no restante do repositório.
- Não crie documentação adicional além do que já existe em `docs/auth/`; se
  encontrar uma decisão não coberta pelo plano, resolva com o melhor
  julgamento seguindo as decisões de arquitetura da seção "Decisões de
  arquitetura" do `README.md`, e deixe um comentário curto no código
  explicando o porquê apenas se a decisão for não-óbvia.
