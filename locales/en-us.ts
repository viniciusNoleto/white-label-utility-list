const enUS = {
  language: {
    label: 'Language',
    'pt-br': 'Português (Brasil)',
    'es-mx': 'Español (México)',
    'en-us': 'English (US)',
  },

  common: {
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
    },
    table: {
      emptyDefault: 'No data found',
      actionsColumn: 'Actions',
      perPage: 'Rows per page',
    },
    notifications: {
      errorTitle: 'Error',
    },
    words: {
      yes: 'Yes',
      no: 'No',
    },
    loading: 'Loading...',
  },

  errorBoundary: {
    title: 'Something went wrong.',
    description: 'Reload the page or contact support.',
  },

  home: {
    subtitle: 'A generic, configurable listing system',
    description: 'Create an account, wait for an administrator to approve it, and manage fully configurable lists — fields, columns and option lists, all without touching code.',
    ctaPrimary: 'Sign in',
    ctaSecondary: 'Create account',
  },

  header: {
    menu: 'Menu',
    colorScheme: {
      label: 'Appearance',
      light: 'Light',
      dark: 'Dark',
      auto: 'System',
    },
    logout: 'Sign out',
  },

  footer: {
    createdBy: 'Created by',
  },

  nav: {
    list: 'List',
    approvals: 'Approvals',
    settings: 'Settings',
  },

  auth: {
    login: {
      title: 'Sign in',
      subtitle: 'Access your account to continue',
      email: { label: 'Email', placeholder: 'you@email.com' },
      password: { label: 'Password', placeholder: '••••••••' },
      submit: 'Sign in',
      registerPrompt: "Don't have an account yet?",
      registerLink: 'Sign up',
      validation: {
        emailRequired: 'Email is required',
        emailInvalid: 'Invalid email',
        passwordRequired: 'Password is required',
      },
      notifications: {
        error: 'Could not sign in. Please try again.',
      },
    },
    register: {
      title: 'Create account',
      subtitle: 'Your account will be reviewed by an administrator',
      name: { label: 'Name', placeholder: 'Your full name' },
      email: { label: 'Email', placeholder: 'you@email.com' },
      password: { label: 'Password', placeholder: '••••••••' },
      submit: 'Sign up',
      loginPrompt: 'Already have an account?',
      loginLink: 'Sign in',
      successTitle: 'Registration submitted!',
      successDescription: 'Your account is awaiting approval from an administrator. You will be able to sign in once it is approved.',
      backToLogin: 'Back to sign in',
      validation: {
        nameRequired: 'Name is required',
        emailRequired: 'Email is required',
        emailInvalid: 'Invalid email',
        passwordRequired: 'Password is required',
        passwordMin: 'Password must be at least 8 characters',
      },
      notifications: {
        error: 'Could not complete registration. Please try again.',
      },
    },
  },

  admin: {
    users: {
      page: {
        title: 'Account approvals',
        subtitle: 'Approve or reject requests for access to the system',
      },
      tabs: {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
      },
      table: {
        empty: 'No users found.',
        columns: {
          name: 'Name',
          email: 'Email',
          status: 'Status',
        },
      },
      status: {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
      },
      actions: {
        approve: 'Approve',
        reject: 'Reject',
      },
      notifications: {
        approveError: 'Could not approve the user.',
        rejectError: 'Could not reject the user.',
      },
    },

    settings: {
      page: {
        title: 'Settings',
        subtitle: 'Configure the fields, columns and lists of the main table',
      },
      tabs: {
        fields: 'Fields',
        columns: 'Columns',
        lists: 'Lists',
        objects: 'Objects',
      },

      fields: {
        description: 'Define the pieces of information that make up each record in the list.',
        actions: { new: 'New field' },
        table: {
          empty: 'No fields registered.',
          columns: {
            label: 'Label',
            key: 'Key',
            type: 'Type',
            required: 'Required',
            order: 'Order',
          },
        },
        types: {
          text: 'Short text',
          long_text: 'Long text',
          date: 'Date',
          select: 'Selection (list)',
          object: 'Object',
          number: 'Number',
        },
        modals: {
          create: 'New field',
          update: 'Edit field',
          delete: 'Delete field',
        },
        label: { label: 'Label', placeholder: 'E.g.: Requester' },
        key: { label: 'Key', placeholder: 'e.g.: requester', description: 'Internal, unique identifier, lowercase (a-z, 0-9, _). Cannot be changed later.' },
        type: { label: 'Type' },
        required: { label: 'Required field' },
        internalList: { label: 'List', placeholder: 'Select the option list' },
        object: { label: 'Object', placeholder: 'Select the object' },
        validation: {
          keyRequired: 'Key is required',
          keyFormat: 'Use only lowercase letters, numbers and "_"',
          labelRequired: 'Label is required',
        },
        delete: {
          confirm: 'Are you sure you want to delete the field "{{label}}"? Data already filled in for this field will be kept on existing records, but it will no longer appear on forms.',
        },
        notifications: {
          createError: 'Could not create the field.',
          updateError: 'Could not update the field.',
          deleteError: 'Could not delete the field.',
        },
      },

      columns: {
        description: 'Define which pieces of information appear as columns in the table, and in which order.',
        actions: { new: 'New column' },
        table: {
          empty: 'No columns registered.',
          columns: {
            label: 'Label',
            field: 'Field',
            order: 'Order',
          },
        },
        modals: {
          create: 'New column',
          update: 'Edit column',
          delete: 'Delete column',
        },
        field: { label: 'Field', placeholder: 'Select the field' },
        subPath: { label: 'Sub-field' },
        label: { label: 'Column label', placeholder: 'E.g.: Address' },
        validation: {
          fieldRequired: 'Field is required',
          labelRequired: 'Label is required',
        },
        delete: {
          confirm: 'Are you sure you want to delete the column "{{label}}"? It will no longer appear in the table.',
        },
        notifications: {
          createError: 'Could not create the column.',
          updateError: 'Could not update the column.',
          deleteError: 'Could not delete the column.',
        },
      },

      lists: {
        description: 'Manage option lists, such as the names available for "Requester".',
        actions: { new: 'New list', edit: 'Edit', delete: 'Delete list' },
        table: { empty: 'No lists registered.' },
        item: {
          label: 'New item',
          placeholder: 'Type a name...',
          empty: 'No items in this list.',
          count_one: '{{count}} item',
          count_other: '{{count}} items',
          color: {
            label: 'Color',
            placeholder: 'Select a color',
            options: {
              gray: 'Gray',
              red: 'Red',
              pink: 'Pink',
              grape: 'Grape',
              violet: 'Violet',
              indigo: 'Indigo',
              blue: 'Blue',
              cyan: 'Cyan',
              teal: 'Teal',
              green: 'Green',
              lime: 'Lime',
              yellow: 'Yellow',
              orange: 'Orange',
            },
          },
        },
        displayStyle: {
          label: 'Display style',
          description: 'Defines how this list\'s items appear when shown.',
          options: {
            text: 'Text',
            badge: 'Badge',
          },
        },
        modals: {
          create: 'New list',
          update: 'Edit list',
          updateItem: 'Edit item',
          delete: 'Delete list',
        },
        name: { label: 'List name', placeholder: 'E.g.: Requesters' },
        key: { label: 'Key', placeholder: 'e.g.: requesters', description: 'Internal, unique identifier, lowercase (a-z, 0-9, _).' },
        validation: {
          keyRequired: 'Key is required',
          keyFormat: 'Use only lowercase letters, numbers and "_"',
          nameRequired: 'Name is required',
          itemLabelRequired: 'Label is required',
        },
        delete: {
          confirm: 'Are you sure you want to delete the list "{{name}}"? This action cannot be undone.',
        },
        notifications: {
          createError: 'Could not create the list.',
          updateListError: 'Could not update the list.',
          deleteError: 'Could not delete the list.',
          updateError: 'Could not update the item.',
          updateItemError: 'Could not update the item.',
          createItemError: 'Could not add the item.',
          deleteItemError: 'Could not remove the item.',
        },
      },

      objects: {
        description: 'Manage reusable composite objects, such as "Person", with fully custom fields.',
        actions: { new: 'New object', delete: 'Delete object' },
        table: { empty: 'No objects registered.' },
        modals: {
          create: 'New object',
          editParts: 'Edit parts — {{name}}',
          delete: 'Delete object',
        },
        name: { label: 'Object name', placeholder: 'E.g.: Person' },
        key: { label: 'Key', placeholder: 'e.g.: person', description: 'Internal, unique identifier, lowercase (a-z, 0-9, _).' },
        validation: {
          keyRequired: 'Key is required',
          keyFormat: 'Use only lowercase letters, numbers and "_"',
          nameRequired: 'Name is required',
        },
        delete: {
          confirm: 'Are you sure you want to delete the object "{{name}}"? This action cannot be undone.',
        },
        notifications: {
          createError: 'Could not create the object.',
          deleteError: 'Could not delete the object.',
        },
        fields: {
          table: { empty: 'No fields registered.' },
          label: { placeholder: 'Label' },
          key: { placeholder: 'key' },
          required: { label: 'Required field' },
        },
        parts: {
          label: 'Parts',
          actions: { add: 'Part', edit: 'Edit parts', save: 'Save object' },
          empty: 'Add the first part — e.g. "Name".',
          count_one: '{{count}} part',
          count_other: '{{count}} parts',
          validation: {
            labelRequired: 'Label is required',
            keyRequired: 'Key is required',
            keyFormat: 'Use only lowercase letters, numbers and "_"',
            internalListRequired: 'Select a list',
          },
          notifications: {
            saveSuccess: 'Object parts updated successfully.',
            saveError: 'Could not save the object parts.',
          },
        },
      },
    },
  },

  list: {
    page: {
      title: 'List',
      subtitle: 'Manage the records of the main table',
    },
    actions: { new: 'New record', export: 'Export' },
    filters: { column: 'Select column', search: 'Search...', add: 'Add filter', remove: 'Remove filter' },
    table: { empty: 'No records found.' },
    modals: {
      create: 'New record',
      update: 'Edit record',
      delete: 'Delete record',
      export: 'Export records',
    },
    delete: {
      confirm: 'Are you sure you want to delete this record? This action cannot be undone.',
    },
    export: {
      filterApplied: 'The current filter below will be considered in the export.',
      filterIgnored: 'The current filter below will be ignored — all records will be exported.',
      noFilter: 'No valid filter is set — all records will be exported.',
      applyFilter: 'Apply current filter to the export',
      estimatedSize: '{{rows}} record(s) — estimated size: {{size}}',
      actions: {
        calculate: 'Check estimated size',
        confirm: 'Confirm and download',
      },
      notifications: {
        title: 'Export',
        preparing: 'Generating the spreadsheet file...',
        success: 'Download of "{{filename}}" completed.',
        error: 'Could not generate the export file.',
      },
    },
    form: {
      validation: {
        required: 'The field "{{label}}" is required',
      },
      select: { placeholder: 'Select an option' },
      objectBadge: 'Object',
    },
    notifications: {
      createError: 'Could not create the record.',
      updateError: 'Could not update the record.',
      deleteError: 'Could not delete the record.',
    },
  },
}

export default enUS