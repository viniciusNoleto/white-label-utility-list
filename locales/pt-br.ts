import type enUs from './en-us'

const ptBR = {
  language: {
    label: 'Idioma',
    'pt-br': 'Português (Brasil)',
    'es-mx': 'Español (México)',
    'en-us': 'English (US)',
  },

  common: {
    actions: {
      save: 'Salvar',
      cancel: 'Cancelar',
      close: 'Fechar',
      edit: 'Editar',
      delete: 'Excluir',
      add: 'Adicionar',
    },
    table: {
      emptyDefault: 'Nenhum dado encontrado',
      actionsColumn: 'Ações',
      perPage: 'Registros por página',
    },
    notifications: {
      errorTitle: 'Erro',
    },
    words: {
      yes: 'Sim',
      no: 'Não',
    },
    loading: 'Carregando...',
  },

  errorBoundary: {
    title: 'Algo deu errado.',
    description: 'Recarregue a página ou entre em contato com o suporte.',
  },

  home: {
    subtitle: 'Sistema genérico e configurável de listagem',
    description: 'Crie contas, aguarde a aprovação de um administrador e gerencie listas totalmente configuráveis — campos, colunas e listas de opções, tudo sem precisar mexer em código.',
    ctaPrimary: 'Entrar',
    ctaSecondary: 'Criar conta',
  },

  header: {
    menu: 'Menu',
    colorScheme: {
      label: 'Aparência',
      light: 'Claro',
      dark: 'Escuro',
      auto: 'Sistema',
    },
    logout: 'Sair',
  },

  footer: {
    createdBy: 'Criado por',
  },

  nav: {
    list: 'Lista',
    approvals: 'Aprovações',
    settings: 'Configurações',
  },

  auth: {
    login: {
      title: 'Entrar',
      subtitle: 'Acesse sua conta para continuar',
      email: { label: 'E-mail', placeholder: 'seu@email.com' },
      password: { label: 'Senha', placeholder: '••••••••' },
      submit: 'Entrar',
      registerPrompt: 'Ainda não tem uma conta?',
      registerLink: 'Cadastre-se',
      validation: {
        emailRequired: 'E-mail é obrigatório',
        emailInvalid: 'E-mail inválido',
        passwordRequired: 'Senha é obrigatória',
      },
      notifications: {
        error: 'Não foi possível entrar. Tente novamente.',
      },
    },
    register: {
      title: 'Criar conta',
      subtitle: 'Sua conta será revisada por um administrador',
      name: { label: 'Nome', placeholder: 'Seu nome completo' },
      email: { label: 'E-mail', placeholder: 'seu@email.com' },
      password: { label: 'Senha', placeholder: '••••••••' },
      submit: 'Cadastrar',
      loginPrompt: 'Já tem uma conta?',
      loginLink: 'Entrar',
      successTitle: 'Cadastro enviado!',
      successDescription: 'Sua conta está aguardando aprovação de um administrador. Você poderá entrar assim que ela for aprovada.',
      backToLogin: 'Voltar para o login',
      validation: {
        nameRequired: 'Nome é obrigatório',
        emailRequired: 'E-mail é obrigatório',
        emailInvalid: 'E-mail inválido',
        passwordRequired: 'Senha é obrigatória',
        passwordMin: 'Senha deve ter no mínimo 8 caracteres',
      },
      notifications: {
        error: 'Não foi possível concluir o cadastro. Tente novamente.',
      },
    },
  },

  admin: {
    users: {
      page: {
        title: 'Aprovações de conta',
        subtitle: 'Aprove ou rejeite solicitações de acesso ao sistema',
      },
      tabs: {
        pending: 'Pendentes',
        approved: 'Aprovados',
        rejected: 'Rejeitados',
      },
      table: {
        empty: 'Nenhum usuário encontrado.',
        columns: {
          name: 'Nome',
          email: 'E-mail',
          status: 'Status',
        },
      },
      status: {
        pending: 'Pendente',
        approved: 'Aprovado',
        rejected: 'Rejeitado',
      },
      actions: {
        approve: 'Aprovar',
        reject: 'Rejeitar',
      },
      notifications: {
        approveError: 'Não foi possível aprovar o usuário.',
        rejectError: 'Não foi possível rejeitar o usuário.',
      },
    },

    settings: {
      page: {
        title: 'Configurações',
        subtitle: 'Configure os campos, colunas e listas da tabela principal',
      },
      tabs: {
        fields: 'Campos',
        columns: 'Colunas',
        lists: 'Listas',
        objects: 'Objetos',
      },

      fields: {
        description: 'Defina as informações que compõem cada registro da lista.',
        actions: { new: 'Novo campo' },
        table: {
          empty: 'Nenhum campo cadastrado.',
          columns: {
            label: 'Rótulo',
            key: 'Chave',
            type: 'Tipo',
            required: 'Obrigatório',
            order: 'Ordem',
          },
        },
        types: {
          text: 'Texto curto',
          long_text: 'Texto longo',
          date: 'Data',
          select: 'Seleção (lista)',
          object: 'Objeto',
          number: 'Número',
        },
        modals: {
          create: 'Novo campo',
          update: 'Editar campo',
          delete: 'Excluir campo',
        },
        label: { label: 'Rótulo', placeholder: 'Ex: Solicitante' },
        key: { label: 'Chave', placeholder: 'ex: solicitante', description: 'Identificador interno, único, em minúsculas (a-z, 0-9, _). Não pode ser alterado depois.' },
        type: { label: 'Tipo' },
        required: { label: 'Campo obrigatório' },
        internalList: { label: 'Lista', placeholder: 'Selecione a lista de opções' },
        object: { label: 'Objeto', placeholder: 'Selecione o objeto' },
        validation: {
          keyRequired: 'Chave é obrigatória',
          keyFormat: 'Use apenas letras minúsculas, números e "_"',
          labelRequired: 'Rótulo é obrigatório',
        },
        delete: {
          confirm: 'Tem certeza que deseja excluir o campo "{{label}}"? Os dados já preenchidos deste campo serão preservados nos registros existentes, mas ele deixará de aparecer nos formulários.',
        },
        notifications: {
          createError: 'Não foi possível criar o campo.',
          updateError: 'Não foi possível atualizar o campo.',
          deleteError: 'Não foi possível excluir o campo.',
        },
      },

      columns: {
        description: 'Defina quais informações aparecem como colunas na tabela e em que ordem.',
        actions: { new: 'Nova coluna' },
        table: {
          empty: 'Nenhuma coluna cadastrada.',
          columns: {
            label: 'Rótulo',
            field: 'Campo',
            order: 'Ordem',
          },
        },
        modals: {
          create: 'Nova coluna',
          update: 'Editar coluna',
          delete: 'Excluir coluna',
        },
        field: { label: 'Campo', placeholder: 'Selecione o campo' },
        subPath: { label: 'Subcampo' },
        label: { label: 'Rótulo da coluna', placeholder: 'Ex: Endereço' },
        validation: {
          fieldRequired: 'Campo é obrigatório',
          labelRequired: 'Rótulo é obrigatório',
        },
        delete: {
          confirm: 'Tem certeza que deseja excluir a coluna "{{label}}"? Ela deixará de aparecer na tabela.',
        },
        notifications: {
          createError: 'Não foi possível criar a coluna.',
          updateError: 'Não foi possível atualizar a coluna.',
          deleteError: 'Não foi possível excluir a coluna.',
        },
      },

      lists: {
        description: 'Gerencie listas de opções, como os nomes disponíveis para "Responsável".',
        actions: { new: 'Nova lista', edit: 'Editar', delete: 'Excluir lista' },
        table: { empty: 'Nenhuma lista cadastrada.' },
        item: {
          label: 'Novo item',
          placeholder: 'Digite um nome...',
          empty: 'Nenhum item nesta lista.',
          count_one: '{{count}} item',
          count_other: '{{count}} itens',
          color: {
            label: 'Cor',
            placeholder: 'Selecione uma cor',
            options: {
              gray: 'Cinza',
              red: 'Vermelho',
              pink: 'Rosa',
              grape: 'Roxo',
              violet: 'Violeta',
              indigo: 'Índigo',
              blue: 'Azul',
              cyan: 'Ciano',
              teal: 'Verde-azulado',
              green: 'Verde',
              lime: 'Lima',
              yellow: 'Amarelo',
              orange: 'Laranja',
            },
          },
        },
        displayStyle: {
          label: 'Estilo de exibição',
          description: 'Define como os itens desta lista aparecem quando exibidos.',
          options: {
            text: 'Texto',
            badge: 'Badge',
          },
        },
        modals: {
          create: 'Nova lista',
          update: 'Editar lista',
          updateItem: 'Editar item',
          delete: 'Excluir lista',
        },
        name: { label: 'Nome da lista', placeholder: 'Ex: Responsáveis' },
        key: { label: 'Chave', placeholder: 'ex: responsaveis', description: 'Identificador interno, único, em minúsculas (a-z, 0-9, _).' },
        validation: {
          keyRequired: 'Chave é obrigatória',
          keyFormat: 'Use apenas letras minúsculas, números e "_"',
          nameRequired: 'Nome é obrigatório',
          itemLabelRequired: 'Rótulo é obrigatório',
        },
        delete: {
          confirm: 'Tem certeza que deseja excluir a lista "{{name}}"? Esta ação não pode ser desfeita.',
        },
        notifications: {
          createError: 'Não foi possível criar a lista.',
          updateListError: 'Não foi possível atualizar a lista.',
          deleteError: 'Não foi possível excluir a lista.',
          updateError: 'Não foi possível atualizar o item.',
          updateItemError: 'Não foi possível atualizar o item.',
          createItemError: 'Não foi possível adicionar o item.',
          deleteItemError: 'Não foi possível remover o item.',
        },
      },

      objects: {
        description: 'Gerencie objetos compostos reutilizáveis, como "Pessoa", com campos totalmente personalizados.',
        actions: { new: 'Novo objeto', delete: 'Excluir objeto' },
        table: { empty: 'Nenhum objeto cadastrado.' },
        modals: {
          create: 'Novo objeto',
          editParts: 'Editar partes — {{name}}',
          delete: 'Excluir objeto',
        },
        name: { label: 'Nome do objeto', placeholder: 'Ex: Pessoa' },
        key: { label: 'Chave', placeholder: 'ex: pessoa', description: 'Identificador interno, único, em minúsculas (a-z, 0-9, _).' },
        validation: {
          keyRequired: 'Chave é obrigatória',
          keyFormat: 'Use apenas letras minúsculas, números e "_"',
          nameRequired: 'Nome é obrigatório',
        },
        delete: {
          confirm: 'Tem certeza que deseja excluir o objeto "{{name}}"? Esta ação não pode ser desfeita.',
        },
        notifications: {
          createError: 'Não foi possível criar o objeto.',
          deleteError: 'Não foi possível excluir o objeto.',
        },
        fields: {
          table: { empty: 'Nenhum campo cadastrado.' },
          label: { placeholder: 'Rótulo' },
          key: { placeholder: 'chave' },
          required: { label: 'Campo obrigatório' },
        },
        parts: {
          label: 'Partes',
          actions: { add: 'Parte', edit: 'Editar partes', save: 'Salvar objeto' },
          empty: 'Adicione a primeira parte — por exemplo "Nome".',
          count_one: '{{count}} parte',
          count_other: '{{count}} partes',
          validation: {
            labelRequired: 'Rótulo é obrigatório',
            keyRequired: 'Chave é obrigatória',
            keyFormat: 'Use apenas letras minúsculas, números e "_"',
            internalListRequired: 'Selecione uma lista',
          },
          notifications: {
            saveSuccess: 'Partes do objeto atualizadas com sucesso.',
            saveError: 'Não foi possível salvar as partes do objeto.',
          },
        },
      },
    },
  },

  list: {
    page: {
      title: 'Lista',
      subtitle: 'Gerencie os registros da tabela principal',
    },
    actions: { new: 'Novo registro' },
    filters: { column: 'Selecione a coluna', search: 'Pesquisar...', add: 'Adicionar filtro', remove: 'Remover filtro' },
    table: { empty: 'Nenhum registro encontrado.' },
    modals: {
      create: 'Novo registro',
      update: 'Editar registro',
      delete: 'Excluir registro',
    },
    delete: {
      confirm: 'Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.',
    },
    form: {
      validation: {
        required: 'O campo "{{label}}" é obrigatório',
      },
      select: { placeholder: 'Selecione uma opção' },
      objectBadge: 'Objeto',
    },
    notifications: {
      createError: 'Não foi possível criar o registro.',
      updateError: 'Não foi possível atualizar o registro.',
      deleteError: 'Não foi possível excluir o registro.',
    },
  },
} satisfies typeof enUs

export default ptBR