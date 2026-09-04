import type { LocaleObject } from 'yup'

export const yupPtBR: LocaleObject = {
  mixed: {
    default: 'Valor inválido',
    required: 'Campo obrigatório',
    defined: 'Campo obrigatório',
    notNull: 'Campo obrigatório',
    oneOf: ({ values }) => `Deve ser um dos seguintes valores: ${values}`,
    notOneOf: ({ values }) => `Não pode ser um dos seguintes valores: ${values}`,
    notType: ({ type }) => {
      const types: Record<string, string> = {
        string: 'texto',
        number: 'número',
        boolean: 'booleano',
        date: 'data',
        object: 'objeto',
        array: 'lista',
      }
      return `Deve ser um(a) ${types[type] ?? type} válido`
    },
  },
  string: {
    length: ({ length }) => `Deve ter exatamente ${length} caractere(s)`,
    min: ({ min }) => `Deve ter no mínimo ${min} caractere(s)`,
    max: ({ max }) => `Deve ter no máximo ${max} caractere(s)`,
    matches: 'Formato inválido',
    email: 'E-mail inválido',
    url: 'URL inválida',
    uuid: 'UUID inválido',
    datetime: 'Data e hora inválidas',
    trim: 'Não deve conter espaços no início ou no fim',
    lowercase: 'Deve estar em letras minúsculas',
    uppercase: 'Deve estar em letras maiúsculas',
  },
  number: {
    min: ({ min }) => `Deve ser maior ou igual a ${min}`,
    max: ({ max }) => `Deve ser menor ou igual a ${max}`,
    lessThan: ({ less }) => `Deve ser menor que ${less}`,
    moreThan: ({ more }) => `Deve ser maior que ${more}`,
    positive: 'Deve ser um número positivo',
    negative: 'Deve ser um número negativo',
    integer: 'Deve ser um número inteiro',
  },
  date: {
    min: ({ min }) => `Data deve ser posterior a ${new Date(min).toLocaleDateString('pt-BR')}`,
    max: ({ max }) => `Data deve ser anterior a ${new Date(max).toLocaleDateString('pt-BR')}`,
  },
  boolean: {
    isValue: ({ value }) => `Deve ser ${value ? 'verdadeiro' : 'falso'}`,
  },
  object: {
    noUnknown: ({ unknown }) => `Campos desconhecidos no objeto: ${unknown}`,
  },
  array: {
    min: ({ min }) => `Deve ter no mínimo ${min} item(s)`,
    max: ({ max }) => `Deve ter no máximo ${max} item(s)`,
    length: ({ length }) => `Deve ter exatamente ${length} item(s)`,
  },
}
