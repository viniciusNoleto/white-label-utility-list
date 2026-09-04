import type enUs from './en-us'

const esMX = {
  language: {
    label: 'Idioma',
    'pt-br': 'Português (Brasil)',
    'es-mx': 'Español (México)',
    'en-us': 'English (US)',
  },

  common: {
    actions: {
      save: 'Guardar',
      cancel: 'Cancelar',
      close: 'Cerrar',
      edit: 'Editar',
      delete: 'Eliminar',
      add: 'Agregar',
    },
    table: {
      emptyDefault: 'No se encontraron datos',
      actionsColumn: 'Acciones',
      perPage: 'Registros por página',
    },
    notifications: {
      errorTitle: 'Error',
    },
    words: {
      yes: 'Sí',
      no: 'No',
    },
    loading: 'Cargando...',
  },

  errorBoundary: {
    title: 'Algo salió mal.',
    description: 'Recarga la página o contacta al soporte.',
  },

  home: {
    subtitle: 'Sistema genérico y configurable de listados',
    description: 'Crea una cuenta, espera la aprobación de un administrador y gestiona listas totalmente configurables — campos, columnas y listas de opciones, todo sin tocar código.',
    ctaPrimary: 'Iniciar sesión',
    ctaSecondary: 'Crear cuenta',
  },

  header: {
    menu: 'Menú',
    colorScheme: {
      label: 'Apariencia',
      light: 'Claro',
      dark: 'Oscuro',
      auto: 'Sistema',
    },
    logout: 'Cerrar sesión',
  },

  footer: {
    createdBy: 'Creado por',
  },

  nav: {
    list: 'Lista',
    approvals: 'Aprobaciones',
    settings: 'Configuración',
  },

  auth: {
    login: {
      title: 'Iniciar sesión',
      subtitle: 'Accede a tu cuenta para continuar',
      email: { label: 'Correo electrónico', placeholder: 'tu@correo.com' },
      password: { label: 'Contraseña', placeholder: '••••••••' },
      submit: 'Iniciar sesión',
      registerPrompt: '¿Aún no tienes una cuenta?',
      registerLink: 'Regístrate',
      validation: {
        emailRequired: 'El correo electrónico es obligatorio',
        emailInvalid: 'Correo electrónico inválido',
        passwordRequired: 'La contraseña es obligatoria',
      },
      notifications: {
        error: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
      },
    },
    register: {
      title: 'Crear cuenta',
      subtitle: 'Tu cuenta será revisada por un administrador',
      name: { label: 'Nombre', placeholder: 'Tu nombre completo' },
      email: { label: 'Correo electrónico', placeholder: 'tu@correo.com' },
      password: { label: 'Contraseña', placeholder: '••••••••' },
      submit: 'Registrarme',
      loginPrompt: '¿Ya tienes una cuenta?',
      loginLink: 'Iniciar sesión',
      successTitle: '¡Registro enviado!',
      successDescription: 'Tu cuenta está esperando la aprobación de un administrador. Podrás iniciar sesión en cuanto sea aprobada.',
      backToLogin: 'Volver al inicio de sesión',
      validation: {
        nameRequired: 'El nombre es obligatorio',
        emailRequired: 'El correo electrónico es obligatorio',
        emailInvalid: 'Correo electrónico inválido',
        passwordRequired: 'La contraseña es obligatoria',
        passwordMin: 'La contraseña debe tener al menos 8 caracteres',
      },
      notifications: {
        error: 'No se pudo completar el registro. Inténtalo de nuevo.',
      },
    },
  },

  admin: {
    users: {
      page: {
        title: 'Aprobaciones de cuenta',
        subtitle: 'Aprueba o rechaza solicitudes de acceso al sistema',
      },
      tabs: {
        pending: 'Pendientes',
        approved: 'Aprobados',
        rejected: 'Rechazados',
      },
      table: {
        empty: 'No se encontraron usuarios.',
        columns: {
          name: 'Nombre',
          email: 'Correo electrónico',
          status: 'Estado',
        },
      },
      status: {
        pending: 'Pendiente',
        approved: 'Aprobado',
        rejected: 'Rechazado',
      },
      actions: {
        approve: 'Aprobar',
        reject: 'Rechazar',
      },
      notifications: {
        approveError: 'No se pudo aprobar al usuario.',
        rejectError: 'No se pudo rechazar al usuario.',
      },
    },

    settings: {
      page: {
        title: 'Configuración',
        subtitle: 'Configura los campos, columnas y listas de la tabla principal',
      },
      tabs: {
        fields: 'Campos',
        columns: 'Columnas',
        lists: 'Listas',
        objects: 'Objetos',
      },

      fields: {
        description: 'Define la información que compone cada registro de la lista.',
        actions: { new: 'Nuevo campo' },
        table: {
          empty: 'No hay campos registrados.',
          columns: {
            label: 'Etiqueta',
            key: 'Clave',
            type: 'Tipo',
            required: 'Obligatorio',
            order: 'Orden',
          },
        },
        types: {
          text: 'Texto corto',
          long_text: 'Texto largo',
          date: 'Fecha',
          select: 'Selección (lista)',
          object: 'Objeto',
          number: 'Número',
        },
        modals: {
          create: 'Nuevo campo',
          update: 'Editar campo',
          delete: 'Eliminar campo',
        },
        label: { label: 'Etiqueta', placeholder: 'Ej: Solicitante' },
        key: { label: 'Clave', placeholder: 'ej: solicitante', description: 'Identificador interno, único, en minúsculas (a-z, 0-9, _). No se puede cambiar después.' },
        type: { label: 'Tipo' },
        required: { label: 'Campo obligatorio' },
        internalList: { label: 'Lista', placeholder: 'Selecciona la lista de opciones' },
        object: { label: 'Objeto', placeholder: 'Selecciona el objeto' },
        validation: {
          keyRequired: 'La clave es obligatoria',
          keyFormat: 'Usa solo letras minúsculas, números y "_"',
          labelRequired: 'La etiqueta es obligatoria',
        },
        delete: {
          confirm: '¿Seguro que deseas eliminar el campo "{{label}}"? Los datos ya completados de este campo se conservarán en los registros existentes, pero dejará de aparecer en los formularios.',
        },
        notifications: {
          createError: 'No se pudo crear el campo.',
          updateError: 'No se pudo actualizar el campo.',
          deleteError: 'No se pudo eliminar el campo.',
        },
      },

      columns: {
        description: 'Define qué información aparece como columna en la tabla y en qué orden.',
        actions: { new: 'Nueva columna' },
        table: {
          empty: 'No hay columnas registradas.',
          columns: {
            label: 'Etiqueta',
            field: 'Campo',
            order: 'Orden',
          },
        },
        modals: {
          create: 'Nueva columna',
          update: 'Editar columna',
          delete: 'Eliminar columna',
        },
        field: { label: 'Campo', placeholder: 'Selecciona el campo' },
        subPath: { label: 'Subcampo' },
        label: { label: 'Etiqueta de la columna', placeholder: 'Ej: Dirección' },
        validation: {
          fieldRequired: 'El campo es obligatorio',
          labelRequired: 'La etiqueta es obligatoria',
        },
        delete: {
          confirm: '¿Seguro que deseas eliminar la columna "{{label}}"? Dejará de aparecer en la tabla.',
        },
        notifications: {
          createError: 'No se pudo crear la columna.',
          updateError: 'No se pudo actualizar la columna.',
          deleteError: 'No se pudo eliminar la columna.',
        },
      },

      lists: {
        description: 'Gestiona listas de opciones, como los nombres disponibles para "Responsable".',
        actions: { new: 'Nueva lista', edit: 'Editar', delete: 'Eliminar lista' },
        table: { empty: 'No hay listas registradas.' },
        item: {
          label: 'Nuevo elemento',
          placeholder: 'Escribe un nombre...',
          empty: 'No hay elementos en esta lista.',
          count_one: '{{count}} elemento',
          count_other: '{{count}} elementos',
          color: {
            label: 'Color',
            placeholder: 'Selecciona un color',
            options: {
              gray: 'Gris',
              red: 'Rojo',
              pink: 'Rosa',
              grape: 'Morado',
              violet: 'Violeta',
              indigo: 'Índigo',
              blue: 'Azul',
              cyan: 'Cian',
              teal: 'Verde azulado',
              green: 'Verde',
              lime: 'Lima',
              yellow: 'Amarillo',
              orange: 'Naranja',
            },
          },
        },
        displayStyle: {
          label: 'Estilo de visualización',
          description: 'Define cómo aparecen los elementos de esta lista cuando se muestran.',
          options: {
            text: 'Texto',
            badge: 'Badge',
          },
        },
        modals: {
          create: 'Nueva lista',
          update: 'Editar lista',
          updateItem: 'Editar elemento',
          delete: 'Eliminar lista',
        },
        name: { label: 'Nombre de la lista', placeholder: 'Ej: Responsables' },
        key: { label: 'Clave', placeholder: 'ej: responsables', description: 'Identificador interno, único, en minúsculas (a-z, 0-9, _).' },
        validation: {
          keyRequired: 'La clave es obligatoria',
          keyFormat: 'Usa solo letras minúsculas, números y "_"',
          nameRequired: 'El nombre es obligatorio',
          itemLabelRequired: 'La etiqueta es obligatoria',
        },
        delete: {
          confirm: '¿Seguro que deseas eliminar la lista "{{name}}"? Esta acción no se puede deshacer.',
        },
        notifications: {
          createError: 'No se pudo crear la lista.',
          updateListError: 'No se pudo actualizar la lista.',
          deleteError: 'No se pudo eliminar la lista.',
          updateError: 'No se pudo actualizar el elemento.',
          updateItemError: 'No se pudo actualizar el elemento.',
          createItemError: 'No se pudo agregar el elemento.',
          deleteItemError: 'No se pudo eliminar el elemento.',
        },
      },

      objects: {
        description: 'Gestiona objetos compuestos reutilizables, como "Persona", con campos totalmente personalizados.',
        actions: { new: 'Nuevo objeto', delete: 'Eliminar objeto' },
        table: { empty: 'No hay objetos registrados.' },
        modals: {
          create: 'Nuevo objeto',
          editParts: 'Editar partes — {{name}}',
          delete: 'Eliminar objeto',
        },
        name: { label: 'Nombre del objeto', placeholder: 'Ej: Persona' },
        key: { label: 'Clave', placeholder: 'ej: persona', description: 'Identificador interno, único, en minúsculas (a-z, 0-9, _).' },
        validation: {
          keyRequired: 'La clave es obligatoria',
          keyFormat: 'Usa solo letras minúsculas, números y "_"',
          nameRequired: 'El nombre es obligatorio',
        },
        delete: {
          confirm: '¿Seguro que deseas eliminar el objeto "{{name}}"? Esta acción no se puede deshacer.',
        },
        notifications: {
          createError: 'No se pudo crear el objeto.',
          deleteError: 'No se pudo eliminar el objeto.',
        },
        fields: {
          table: { empty: 'No hay campos registrados.' },
          label: { placeholder: 'Etiqueta' },
          key: { placeholder: 'clave' },
          required: { label: 'Campo obligatorio' },
        },
        parts: {
          label: 'Partes',
          actions: { add: 'Parte', edit: 'Editar partes', save: 'Guardar objeto' },
          empty: 'Agrega la primera parte — por ejemplo "Nombre".',
          count_one: '{{count}} parte',
          count_other: '{{count}} partes',
          validation: {
            labelRequired: 'La etiqueta es obligatoria',
            keyRequired: 'La clave es obligatoria',
            keyFormat: 'Usa solo letras minúsculas, números y "_"',
            internalListRequired: 'Selecciona una lista',
          },
          notifications: {
            saveSuccess: 'Partes del objeto actualizadas con éxito.',
            saveError: 'No se pudieron guardar las partes del objeto.',
          },
        },
      },
    },
  },

  list: {
    page: {
      title: 'Lista',
      subtitle: 'Gestiona los registros de la tabla principal',
    },
    actions: { new: 'Nuevo registro' },
    filters: { column: 'Seleccione la columna', search: 'Buscar...', add: 'Agregar filtro', remove: 'Quitar filtro' },
    table: { empty: 'No se encontraron registros.' },
    modals: {
      create: 'Nuevo registro',
      update: 'Editar registro',
      delete: 'Eliminar registro',
    },
    delete: {
      confirm: '¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer.',
    },
    form: {
      validation: {
        required: 'El campo "{{label}}" es obligatorio',
      },
      select: { placeholder: 'Selecciona una opción' },
      objectBadge: 'Objeto',
    },
    notifications: {
      createError: 'No se pudo crear el registro.',
      updateError: 'No se pudo actualizar el registro.',
      deleteError: 'No se pudo eliminar el registro.',
    },
  },
} satisfies typeof enUs

export default esMX