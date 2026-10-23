# Componente UtilsTable

`import { UtilsTable } from '@/src/components/utils/Table';`

## Interface

```ts
type TableProps<T extends object, U extends Record<string, string>> = {
  rows: T[];           // dados da tabela
  columns: U;          // mapeamento campo → label da coluna
  title?: string;      // título acima da tabela (opcional)
  alias?: ReactNode;   // slot direito do título (botões de ação)
  loading?: boolean;   // exibe LoadingOverlay com blur sobre a tabela
  emptyText?: string;  // texto quando rows está vazio (padrão: 'Nenhum dado encontrado')
  rowKey?: (ctx: { item: T; index: number }) => React.Key;
  actions?: TableAction<T>[] | ((ctx: { item: T; index: number }) => TableAction<T>[]);
  renderCells?: Partial<Record<keyof U, (ctx: { item: T; index: number }) => ReactNode>>;
  onReorder?: (ctx: { item: T; index: number; newIndex: number }) => void; // ativa drag-and-drop das linhas
} & (
  { lastPage: number; page: number; setPage: (page: number) => void }  // com paginação
  | { lastPage?: never; page?: never; setPage?: never }                 // sem paginação
);

type TableAction<T> = FormButtonProps & {
  label?: string;
  icon?: string;       // ícone Iconify (ex: 'lucide:trash-2')
  onClick?: (ctx: { item: T; index: number }) => void;
};
```

## Quando usar

Para listas de dados tabulares com loading automático, estado vazio e ações por linha com tooltip. Substitui tabelas HTML manuais.

## Padrões corretos

```tsx
{/* Tabela básica sem paginação */}
<UtilsTable
  rows={students}
  rowKey={({ item }) => item.id}
  columns={{
    name: 'Nome',
    registration: 'Matrícula',
    status: 'Status',
  }}
  emptyText="Nenhum aluno cadastrado."
/>

{/* Com paginação */}
<UtilsTable
  rows={charges}
  rowKey={({ item }) => item.id}
  loading={chargesIsFetching}
  lastPage={chargesMeta.last_page!}
  page={page}
  setPage={(newPage) => {
    setPage(newPage);
    chargesRefetch();
  }}
  columns={{ description: 'Descrição', amount: 'Valor', status: 'Status' }}
  emptyText="Nenhum item encontrado."
/>

{/* Com renderCells customizados */}
<UtilsTable
  rows={subjects}
  rowKey={({ item }) => item.id}
  columns={{
    name: 'Disciplina',
    courseName: 'Curso',
    hours: 'C/H',
  }}
  loading={isLoading}
  emptyText="Nenhuma disciplina encontrada."
  renderCells={{
    courseName: ({ item }) => (
      <span className="font-semibold uppercase">{item.courseName}</span>
    ),
    hours: ({ item }) => (
      <span className="font-bold text-gray-500">{item.hours}h</span>
    ),
  }}
/>

{/* Com ações dinâmicas por linha */}
<UtilsTable
  rows={payments}
  rowKey={({ item }) => item.id}
  columns={{ description: 'Descrição', amount: 'Valor', status: 'Status' }}
  actions={({ item }) => [
    {
      variant: 'outline',
      icon: item.status === 'pago' ? 'lucide:eye' : 'lucide:check-circle-2',
      label: item.status === 'pago' ? 'Ver comprovante' : 'Marcar como pago',
      onClick: ({ item }) => handleAction(item),
    },
  ]}
/>
```

## Coluna de ações — sempre centralizada

A coluna de ações (via prop `actions` **ou** via uma coluna manual de chave `actions` em `columns`/`renderCells`) é sempre centralizada — cabeçalho e conteúdo. Isso já é aplicado internamente pelo componente para a chave `actions`; ao renderizar botões manualmente nessa coluna (ex: ações condicionais por linha que não cabem no formato `TableAction`), use `justify-center` no wrapper, nunca `justify-end`.

```tsx
{/* Ação manual (ex: botões condicionais por linha) — sempre justify-center */}
renderCells={{
  actions: ({ item }) => (
    <div className="flex items-center justify-center gap-1">
      <FormButton
        variant="outline"
        icon="lucide:pencil"
        onClick={() => openUpdate(item)}
      />
    </div>
  ),
}}
```

## Botões de ação — sempre `variant="outline"`

Todo botão de ação de linha de tabela (via prop `actions` do `TableAction` ou via `FormButton` renderizado manualmente numa célula `actions`) deve usar `variant="outline"` do Mantine. Passe `variant: 'outline'` no objeto de `TableAction` — ele é repassado direto como `FormButtonProps`.

```tsx
actions={({ item }) => [
  {
    variant: 'outline',
    icon: 'lucide:pencil',
    tooltip: 'Editar',
    onClick: ({ item }) => openUpdate(item),
  },
  {
    variant: 'outline',
    color: 'red',
    icon: 'lucide:trash-2',
    tooltip: 'Excluir',
    onClick: ({ item }) => handleDelete(item),
  },
]}
```

## Coluna de ordem — sem título, sempre primeira

Uma coluna de chave `order` (usada com `onReorder` + `<UtilsTableDragHandle />`) nunca deve ter título — o componente ignora o `label` passado e renderiza o cabeçalho vazio automaticamente — e é sempre reordenada para ser a primeira coluna, independente da posição em que aparece em `columns`. Ainda assim, declare-a como primeira chave em `columns` (com label `''`) para manter o código legível e consistente com o resultado renderizado.

## Reordenação por arrastar-e-soltar (`onReorder`)

Passe `onReorder` para permitir que o usuário reordene as linhas arrastando-as (via `@dnd-kit`), em vez de setas de mover-cima/mover-baixo. `onReorder` recebe o item arrastado, seu índice original (`index`) e o índice de destino (`newIndex`) — a tabela não reordena `rows` sozinha, apenas notifica; o chamador recalcula as posições e persiste (ex: via mutation), deixando o `refetch` atualizar `rows`.

Dentro de `renderCells`, use `<UtilsTableDragHandle />` (mesmo import de `UtilsTable`) para renderizar a alça de arraste — ela só funciona dentro de uma linha gerenciada pela tabela quando `onReorder` está definido.

`rowKey` é obrigatório na prática quando `onReorder` é usado — ele vira o id estável de cada linha para o `@dnd-kit`.

### Reordenação sempre otimista

O reorder deve atualizar a UI imediatamente (via `queryClient.setQueryData` no `onMutate`), sem esperar a requisição — a resposta da API serve apenas para confirmar (ou, em caso de erro, reverter via `onError` com o snapshot salvo em `onMutate`). Nunca dependa apenas do `refetch()` em `onSuccess` para refletir a nova ordem — isso causa um "flash" da ordem antiga até a requisição terminar.

Padrão: calcule todas as mudanças de posição de uma vez, dispare uma única `mutation` com o lote, e faça o `setQueryData` otimista **antes** da requisição sair.

```tsx
import { UtilsTable, UtilsTableDragHandle } from '@/src/components/utils/Table';
import type { AppApiResponse } from '@/src/utils/appClient';

const reorderMutation = useMutation({
  mutationFn: (changes: { columnId: number; position: number }[]) =>
    Promise.all(changes.map(({ columnId, position }) => updateColumnService({ columnId, body: { position } }))),
  onMutate: async (changes) => {
    await queryClient.cancelQueries({ queryKey: GET_COLUMNS_KEY });

    const previousColumnsData = queryClient.getQueryData<AppApiResponse<IColumn[]>>(GET_COLUMNS_KEY);
    const positionByColumnId = new Map(changes.map(({ columnId, position }) => [columnId, position]));

    queryClient.setQueryData<AppApiResponse<IColumn[]>>(GET_COLUMNS_KEY, old => old && ({
      ...old,
      data: old.data.map(column => positionByColumnId.has(column.id) ? { ...column, position: positionByColumnId.get(column.id)! } : column),
    }));

    return { previousColumnsData };
  },
  onError: (err, _changes, context) => {
    if (context?.previousColumnsData) {
      queryClient.setQueryData(GET_COLUMNS_KEY, context.previousColumnsData);
    }
    // notifications.show({ ... });
  },
  onSettled: () => {
    columnsRefetch();
  },
});

function reorderColumns(fromIndex: number, toIndex: number) {
  const reordered = [...columns];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);

  const changes = reordered
    .map((column, index) => ({ columnId: column.id, position: index, changed: column.position !== index }))
    .filter(change => change.changed)
    .map(({ columnId, position }) => ({ columnId, position }));

  if (changes.length === 0) return;

  reorderMutation.mutate(changes);
}

<UtilsTable
  rows={columns}
  rowKey={({ item }) => item.id}
  onReorder={({ index, newIndex }) => reorderColumns(index, newIndex)}
  columns={{ order: '', label: 'Rótulo', actions: 'Ações' }}
  renderCells={{
    order: () => <UtilsTableDragHandle />,
  }}
/>
```

## Notas

- `columns` define a ordem das colunas. Campos não listados não aparecem.
- `renderCells` sobrescreve apenas as células listadas; as demais exibem o valor bruto.
- `loading={true}` exibe `LoadingOverlay` com blur — não precisa de `UtilsIf` externo.
- Ações usam `label` como tooltip automático e como texto do botão quando não há `icon`.
- `lastPage`, `page` e `setPage` são todos obrigatórios ou todos ausentes (union discriminada).
- `setPage` deve sempre chamar `refetch()` em seguida — veja `paginated-list.md`.
- A coluna `actions` é sempre centralizada (cabeçalho e conteúdo).
- Botões de ação de tabela sempre usam `variant="outline"` do Mantine.
- A coluna `order` nunca tem título e é sempre movida para a primeira posição pelo componente.
- Reorder via `onReorder` sempre é otimista — atualize a query via `setQueryData` no `onMutate`, nunca só no `onSuccess`/`refetch`.
