import { CollectionConfig } from 'payload/types';
import { isAdmin } from '../lib/payload-access';

const Portfolio: CollectionConfig = {
  slug: 'portfolio',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'client', 'completedAt', 'featured'],
    preview: (doc) => `/portfolio/${doc.slug}`,
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Auto-generate slug if not provided
        if (!data.slug && data.title) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 100);
        }

        return data;
      },
    ],
  },
  versions: {
    drafts: true,
    maxPerDoc: 5,
  },
  defaultSort: '-completedAt',
  timestamps: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Nome do Projeto',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL amigável para o projeto (gerado automaticamente se vazio)',
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      editor: 'slate',
      label: 'Descrição Detalhada',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Descrição Curta',
      admin: {
        description: 'Resumo para cards de listagem (máx. 150 caracteres)',
      },
    },
    {
      name: 'client',
      type: 'text',
      label: 'Cliente',
      admin: {
        description: 'Nome do cliente (deixe em branco para anônimo)',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Categoria',
      options: [
        { label: 'ERP', value: 'erp' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'Landing Page', value: 'landing-page' },
        { label: 'Sistema Customizado', value: 'sistema-customizado' },
        { label: 'Aplicativo Mobile', value: 'app-mobile' },
        { label: 'Integração', value: 'integracao' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'technologies',
      type: 'array',
      label: 'Tecnologias',
      admin: {
        description: 'Tecnologias utilizadas no projeto',
      },
      fields: [
        {
          name: 'technology',
          type: 'text',
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      label: 'Galeria de Imagens',
      admin: {
        description: 'Imagens do projeto (recomendado: 1920x1080px)',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Legenda',
        },
      ],
    },
    {
      name: 'projectUrl',
      type: 'text',
      label: 'URL do Projeto',
      admin: {
        description: 'Link para o projeto ao vivo (se público)',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      required: true,
      label: 'Data de Conclusão',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Destaque',
      defaultValue: false,
      admin: {
        description: 'Destacar na página inicial',
        position: 'sidebar',
      },
    },
    // SEO Fields
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      admin: {
        description: 'Configurações de SEO para este projeto',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Título SEO',
          admin: {
            description: 'Título para motores de busca (fallback: nome do projeto)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Descrição SEO',
          admin: {
            description: 'Descrição para motores de busca (máx. 160 caracteres)',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Imagem Open Graph',
          admin: {
            description: 'Imagem para compartilhamento social (recomendado: 1200x630px)',
          },
        },
      ],
    },
  ],
};

export default Portfolio;
