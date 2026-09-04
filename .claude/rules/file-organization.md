# Organização de arquivos

## Resources — nomenclatura de módulos

O nome do módulo é sempre **singular**. As subpastas de características são sempre **plural**.

```
src/resources/
├── course/           ← singular
│   ├── enums/        ← plural
│   ├── fragments/    ← plural
│   ├── logics/       ← plural
│   ├── mocks/        ← plural
│   ├── models/       ← plural
│   ├── schemas/      ← plural
│   └── services/     ← plural
├── discipline/       ← singular
├── student/          ← singular
└── source-activity/  ← singular (kebab-case para nomes compostos)
```

Subpastas permitidas dentro de um módulo:

| Pasta | Conteúdo |
|---|---|
| `enums/` | String enums de slugs da API |
| `fragments/` | Seções/abas de páginas relacionadas ao recurso |
| `logics/` | Hooks + componentes de UI de ações (create, update, disable…) |
| `mocks/` | Handlers MSW para o recurso |
| `models/` | Interface `I{Resource}` e classe opcional `{Resource}` |
| `schemas/` | Schemas Yup compartilhados entre logics |
| `services/` | Funções de chamada HTTP, uma por endpoint |

---

## Fragments — seções de página dentro de resources

Quando uma página de detalhe possui seções/abas que envolvem um recurso específico, esses fragmentos ficam em `src/resources/{module}/fragments/{PageName}/`.

O nome da pasta do fragmento corresponde ao nome da variável lazy da página (ex: `CoursesCourseId`).

```
src/resources/course/fragments/
└── CoursesCourseId/
    ├── classes.tsx       ← aba de turmas na página /courses/:course_id
    └── disciplines.tsx   ← aba de disciplinas na página /courses/:course_id
```

Um fragmento é um componente React normal — exportado como default ou named — que recebe os dados necessários via props.

---

## `components/` (raiz) — apenas contexto global

A pasta `components/` na raiz do projeto (`components/form`, `components/utils`, `components/layout`, etc.) é reservada **exclusivamente** para componentes de uso global/transversal — usados por múltiplas rotas ou múltiplos resources sem relação com uma tela específica (ex: `FormTextInput`, `UtilsTable`, `UtilsCard`, `AppHeader`).

**Nunca crie uma subpasta em `components/` nomeada a partir de uma rota ou feature específica** (ex: `components/list/`, `components/courses/`). Se o componente só faz sentido no contexto de uma rota, ele pertence a essa rota.

### Onde colocar componente específico de uma rota (`app/**`)

Use uma pasta `_components/` dentro da própria rota em `app/`, ao lado do `page.tsx`. O prefixo `_` impede que o Next.js trate a pasta como segmento de rota.

```
app/(protected)/list/
├── page.tsx
└── _components/
    ├── DynamicRecordFields.tsx
    ├── dynamicSchema.ts
    └── formatColumnValue.tsx
```

Se o componente precisar ser importado fora da própria árvore de rota (ex: por um `logic` em `resources/{recurso}/logics/`), importe-o via alias absoluto apontando para a pasta da rota — não duplique o arquivo e não o mova de volta para `components/`:

```ts
import { DynamicRecordFields } from '@/src/app/(protected)/list/_components/DynamicRecordFields';
```

**Regra de decisão:**

| Situação | Local |
|---|---|
| Usado por múltiplas rotas/resources sem relação com uma tela específica | `components/{categoria}/` |
| Usado apenas por uma rota (ainda que também referenciado por um `logic` dessa mesma feature) | `app/{rota}/_components/` |
| Seção/aba de uma página de detalhe de um resource | `src/resources/{module}/fragments/{PageName}/` (ver acima) |
