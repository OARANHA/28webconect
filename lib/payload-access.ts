import { Access } from 'payload/config';

export const isAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
};

export const isAdminFieldLevel = ({ req: { user } }) => {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
};
