import type { LocaleObject } from 'yup'

export const yupEsMX: LocaleObject = {
  mixed: {
    default: 'Valor inválido',
    required: 'Campo obligatorio',
    defined: 'Campo obligatorio',
    notNull: 'Campo obligatorio',
    oneOf: ({ values }) => `Debe ser uno de los siguientes valores: ${values}`,
    notOneOf: ({ values }) => `No puede ser uno de los siguientes valores: ${values}`,
    notType: ({ type }) => {
      const types: Record<string, string> = {
        string: 'texto',
        number: 'número',
        boolean: 'booleano',
        date: 'fecha',
        object: 'objeto',
        array: 'lista',
      }
      return `Debe ser un ${types[type] ?? type} válido`
    },
  },
  string: {
    length: ({ length }) => `Debe tener exactamente ${length} carácter(es)`,
    min: ({ min }) => `Debe tener al menos ${min} carácter(es)`,
    max: ({ max }) => `Debe tener como máximo ${max} carácter(es)`,
    matches: 'Formato inválido',
    email: 'Correo electrónico inválido',
    url: 'URL inválida',
    uuid: 'UUID inválido',
    datetime: 'Fecha y hora inválidas',
    trim: 'No debe contener espacios al inicio o al final',
    lowercase: 'Debe estar en minúsculas',
    uppercase: 'Debe estar en mayúsculas',
  },
  number: {
    min: ({ min }) => `Debe ser mayor o igual a ${min}`,
    max: ({ max }) => `Debe ser menor o igual a ${max}`,
    lessThan: ({ less }) => `Debe ser menor que ${less}`,
    moreThan: ({ more }) => `Debe ser mayor que ${more}`,
    positive: 'Debe ser un número positivo',
    negative: 'Debe ser un número negativo',
    integer: 'Debe ser un número entero',
  },
  date: {
    min: ({ min }) => `La fecha debe ser posterior a ${new Date(min).toLocaleDateString('es-MX')}`,
    max: ({ max }) => `La fecha debe ser anterior a ${new Date(max).toLocaleDateString('es-MX')}`,
  },
  boolean: {
    isValue: ({ value }) => `Debe ser ${value ? 'verdadero' : 'falso'}`,
  },
  object: {
    noUnknown: ({ unknown }) => `Campos desconocidos en el objeto: ${unknown}`,
  },
  array: {
    min: ({ min }) => `Debe tener al menos ${min} elemento(s)`,
    max: ({ max }) => `Debe tener como máximo ${max} elemento(s)`,
    length: ({ length }) => `Debe tener exactamente ${length} elemento(s)`,
  },
}
