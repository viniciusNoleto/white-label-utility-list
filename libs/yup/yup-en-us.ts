import type { LocaleObject } from 'yup'

export const yupEnUS: LocaleObject = {
  mixed: {
    default: 'Invalid value',
    required: 'Required field',
    defined: 'Required field',
    notNull: 'Required field',
    oneOf: ({ values }) => `Must be one of the following values: ${values}`,
    notOneOf: ({ values }) => `Cannot be one of the following values: ${values}`,
    notType: ({ type }) => {
      const types: Record<string, string> = {
        string: 'text',
        number: 'number',
        boolean: 'boolean',
        date: 'date',
        object: 'object',
        array: 'list',
      }
      return `Must be a valid ${types[type] ?? type}`
    },
  },
  string: {
    length: ({ length }) => `Must be exactly ${length} character(s)`,
    min: ({ min }) => `Must be at least ${min} character(s)`,
    max: ({ max }) => `Must be at most ${max} character(s)`,
    matches: 'Invalid format',
    email: 'Invalid email address',
    url: 'Invalid URL',
    uuid: 'Invalid UUID',
    datetime: 'Invalid date and time',
    trim: 'Must not contain leading or trailing spaces',
    lowercase: 'Must be in lowercase',
    uppercase: 'Must be in uppercase',
  },
  number: {
    min: ({ min }) => `Must be greater than or equal to ${min}`,
    max: ({ max }) => `Must be less than or equal to ${max}`,
    lessThan: ({ less }) => `Must be less than ${less}`,
    moreThan: ({ more }) => `Must be greater than ${more}`,
    positive: 'Must be a positive number',
    negative: 'Must be a negative number',
    integer: 'Must be an integer',
  },
  date: {
    min: ({ min }) => `Date must be after ${new Date(min).toLocaleDateString('en-US')}`,
    max: ({ max }) => `Date must be before ${new Date(max).toLocaleDateString('en-US')}`,
  },
  boolean: {
    isValue: ({ value }) => `Must be ${value ? 'true' : 'false'}`,
  },
  object: {
    noUnknown: ({ unknown }) => `Unknown fields in object: ${unknown}`,
  },
  array: {
    min: ({ min }) => `Must have at least ${min} item(s)`,
    max: ({ max }) => `Must have at most ${max} item(s)`,
    length: ({ length }) => `Must have exactly ${length} item(s)`,
  },
}
