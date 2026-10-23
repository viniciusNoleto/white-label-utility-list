import 'server-only';

import { db } from '@/libs/db';
import { listFields, objectFields } from '@/db/schema';
import { msg } from '@/libs/api';
import type { ApiMessage } from '@/shared/types/api';

function isFilled(value: unknown) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

/**
 * Valida os valores de um registro contra os campos configurados.
 * Espelha `buildListRecordSchema` do front: subcampos obrigatórios de um objeto
 * só são exigidos quando o objeto é obrigatório ou foi parcialmente preenchido.
 * Retorna a mensagem do primeiro erro encontrado, ou `null` se os valores são válidos.
 */
export async function validateListRecordValues(values: Record<string, any>): Promise<ApiMessage | null> {
  const fields = await db.select().from(listFields);
  const objectFieldRows = await db.select().from(objectFields);

  for (const field of fields) {
    const value = values[field.key];

    if (field.type === 'object') {
      const subFields = objectFieldRows.filter(sub => sub.object_id === field.object_id);
      const isPartiallyFilled = subFields.some(sub => isFilled(value?.[sub.key]));

      if (!field.required && !isPartiallyFilled) continue;

      const missingSubField = subFields.find(sub => sub.required && !isFilled(value?.[sub.key]));

      if (missingSubField) {
        return msg(
          `O campo "${missingSubField.label}" é obrigatório em "${field.label}".`,
          `El campo "${missingSubField.label}" es obligatorio en "${field.label}".`,
          `Field "${missingSubField.label}" is required in "${field.label}".`,
        );
      }

      continue;
    }

    if (field.required && !isFilled(value)) {
      return msg(`O campo "${field.label}" é obrigatório.`, `El campo "${field.label}" es obligatorio.`, `Field "${field.label}" is required.`);
    }
  }

  return null;
}
