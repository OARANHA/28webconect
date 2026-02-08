// User roles
export enum UserRole {
  CLIENTE = 'CLIENTE',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// Base types (serão expandidos nas próximas fases)
export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};
