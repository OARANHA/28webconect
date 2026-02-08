import { CollectionConfig } from 'payload/types';
import { isAdmin } from '../lib/payload-access';

const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'author', 'publishedAt'],
    preview: (doc) => `/blog/${doc.slug}`,
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Auto-generate slug if not provided
        if (!data.slug && data.title) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 100);
        }

        // Set publishedAt when status changes to published
        if (data.status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString();
        }

        return data;
      },
    ],
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  timestamps: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL amigável para o post (gerado automaticamente se vazio)',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: 'slate',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Resumo curto para listagens (máx. 200 caracteres recomendados)',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Autor do post',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Data de publicação do post',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Rascunho', value: 'draft' },
        { label: 'Publicado', value: 'published' },
        { label: 'Arquivado', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Imagem destacada do post (recomendado: 1200x630px)',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Tecnologia', value: 'tecnologia' },
        { label: 'Negócios', value: 'negocios' },
        { label: 'Tutoriais', value: 'tutoriais' },
        { label: 'Novidades', value: 'novidades' },
        { label: 'Cases', value: 'cases' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Tags para organização do conteúdo',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    // SEO Fields
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      admin: {
        description: 'Configurações de SEO para este post',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Título SEO',
          admin: {
            description: 'Título para motores de busca (fallback: título do post)',
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

export default Posts;
