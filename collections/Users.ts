import { CollectionConfig } from 'payload/types';

const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    useAPIKey: true,
    disableLocalStrategy: true,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
    disableDuplicate: true,
  },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
    admin: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    },
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Cliente', value: 'CLIENTE' },
        { label: 'Admin', value: 'ADMIN' },
        { label: 'Super Admin', value: 'SUPER_ADMIN' },
      ],
      defaultValue: 'CLIENTE',
    },
    {
      name: 'image',
      type: 'text',
      label: 'Avatar URL',
    },
  ],
};

export default Users;
