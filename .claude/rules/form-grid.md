# Layout de formulários — `form-grid`

`.form-grid` (em `app/globals.css`) = `grid grid-cols-12 gap-6`.

## Regras

- Todo layout de campos em grid dentro de um formulário (modais incluídas) usa `className="form-grid"`. Nunca crie grids ad-hoc (`grid grid-cols-1 sm:grid-cols-2 ...`).
- **Nunca altere as colunas da grid** (`sm:grid-cols-2`, etc.). A responsividade é controlada só pelo span de cada input: `col-span-12`, `sm:col-span-6`, etc.
- Todo filho direto da grid declara seu span explicitamente — inclusive `col-span-12`.
- **Formulários pequenos** (modais `md`/`lg`, poucos campos) usam **um input por linha**: todos `col-span-12`. Não tente colocar campos lado a lado.
- Lado a lado (`col-span-12 sm:col-span-6`) só em formulários grandes/dinâmicos (modal `xl`, muitos campos), ou para inputs curtos e relacionados dentro de um item repetido.
- Campos longos (textarea, blocos agrupados) são sempre `col-span-12`.
- Evite `flex flex-wrap` com larguras fixas (`w-36`, `min-w-[140px]`) para dispor inputs — gera quebras imprevisíveis e difíceis de ler.

## Padrões corretos

```tsx
{/* Formulário pequeno — um input por linha */}
<div className="form-grid">
  <FormTextInput
    label="Nome"
    {...listField('name')}
    required
    className="col-span-12"
  />

  <FormSelect
    label="Estilo"
    data={OPTIONS}
    {...listField('display_style')}
    className="col-span-12"
  />
</div>

{/* Formulário grande — duas colunas a partir de sm */}
<div className="form-grid">
  <FormTextInput
    label="Nome"
    {...recordField('name')}
    className="col-span-12 sm:col-span-6"
  />

  <FormTextarea
    label="Observações"
    {...recordField('notes')}
    className="col-span-12"
  />
</div>
```

## Exceção — formulários dinâmicos (`form-flex`)

Quando os campos são definidos em runtime (ex: `DynamicRecordFields`), a quantidade/ordem dos campos é imprevisível e a grid deixa buracos (campo de meia largura sozinho na linha). Nesses casos use `.form-flex` (também em `app/globals.css`):

- Container: `className="form-flex"` (flex + wrap + gap via `--form-flex-gap`).
- Campos curtos: `form-flex-half` — base `calc((100% - gap) / 2)` a partir de `sm`, com `flex-grow`, então ocupam metade da linha quando há par e a linha inteira quando ficam sozinhos.
- Campos longos/blocos: `form-flex-full`.
- Abaixo de `sm` todos ocupam 100%.

Não use `form-flex` em formulários estáticos — lá continue com `form-grid`.
