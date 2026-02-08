import { auth } from './auth';
import { UserRole } from '../types';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

/**
 * Hash de senha usando bcryptjs
 *
 * @description Cria um hash seguro da senha usando bcrypt com 12 rounds de salt.
 * Utilizado durante o registro de usuários e redefinição de senha.
 *
 * @param password - Senha em texto plano (mínimo 8 caracteres)
 * @returns Promise<string> - Hash da senha no formato bcrypt
 * @throws {Error} Se a senha tiver menos de 8 caracteres
 *
 * @example
 * ```typescript
 * const hashedPassword = await hashPassword('minhaSenhaSegura123');
 * // Retorna: $2a$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 * ```
 */
export async function hashPassword(password: string): Promise<string> {
  if (password.length < 8) {
    throw new Error('A senha deve ter no mínimo 8 caracteres');
  }
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compara senha em texto plano com hash
 *
 * @description Verifica se uma senha em texto plano corresponde ao hash armazenado.
 * Utilizado durante o login para validar as credenciais do usuário.
 *
 * @param password - Senha em texto plano fornecida pelo usuário
 * @param hashedPassword - Hash da senha armazenado no banco de dados
 * @returns Promise<boolean> - true se a senha corresponder, false caso contrário
 *
 * @example
 * ```typescript
 * const isValid = await comparePassword('senhaDigitada', user.password);
 * if (isValid) {
 *   // Login bem-sucedido
 * }
 * ```
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Valida requisitos mínimos de senha
 *
 * @description Verifica se a senha atende aos requisitos mínimos de segurança.
 * Atualmente requer pelo menos 8 caracteres.
 *
 * @param password - Senha a ser validada
 * @returns { valid: boolean; error?: string } - Objeto indicando se é válida e mensagem de erro opcional
 *
 * @example
 * ```typescript
 * const validation = validatePassword('123');
 * // Retorna: { valid: false, error: 'A senha deve ter no mínimo 8 caracteres' }
 *
 * const validation = validatePassword('senhaSegura123');
 * // Retorna: { valid: true }
 * ```
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'A senha deve ter no mínimo 8 caracteres' };
  }
  return { valid: true };
}

/**
 * Obtém a sessão do servidor
 *
 * @description Recupera a sessão atual do usuário no servidor.
 * Não redireciona, apenas retorna a sessão ou null.
 *
 * @returns Promise<Session | null> - A sessão atual ou null se não autenticado
 *
 * @example
 * ```typescript
 * const session = await getServerSession();
 * if (session) {
 *   console.log('Usuário:', session.user.name);
 * }
 * ```
 */
export async function getServerSession() {
  const session = await auth();
  return session;
}

/**
 * Requer autenticação para acessar uma página ou action
 *
 * @description Verifica se o usuário está autenticado.
 * Redireciona para /login se não estiver autenticado.
 * Deve ser usada em Server Actions e páginas protegidas.
 *
 * @returns Promise<Session> - A sessão garantida (não-null)
 * @throws {never} Redireciona em vez de lançar erro
 *
 * @example
 * ```typescript
 * // Em uma Server Action
 * export async function minhaAction() {
 *   const session = await requireAuth();
 *   // A partir daqui, session.user está garantido
 *   const userId = session.user.id;
 * }
 * ```
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return session;
}

/**
 * Requer uma role específica para acessar uma página ou action
 *
 * @description Verifica se o usuário possui uma das roles permitidas.
 * Primeiro verifica autenticação, depois a role.
 * Redireciona para /dashboard se a role não for suficiente.
 *
 * @param allowedRoles - Array de roles permitidas (ex: ['ADMIN', 'SUPER_ADMIN'])
 * @returns Promise<Session> - A sessão com role validada
 * @throws {never} Redireciona em vez de lançar erro
 *
 * @example
 * ```typescript
 * // Apenas admins podem acessar
 * export async function adminAction() {
 *   const session = await requireRole(['ADMIN', 'SUPER_ADMIN']);
 *   // A partir daqui, o usuário é garantidamente um admin
 * }
 * ```
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();

  if (!session.user.role || !allowedRoles.includes(session.user.role as UserRole)) {
    redirect('/dashboard');
  }

  return session;
}

/**
 * Requer que o email esteja verificado para acessar uma página ou action
 *
 * @description Verifica se o email do usuário foi verificado.
 * Primeiro verifica autenticação, depois a verificação de email.
 * Redireciona para /verificar-email se o email não estiver verificado.
 *
 * @returns Promise<Session> - A sessão com email verificado
 * @throws {never} Redireciona em vez de lançar erro
 *
 * @example
 * ```typescript
 * // Área restrita a emails verificados
 * export async function dashboardAction() {
 *   const session = await requireEmailVerified();
 *   // A partir daqui, o email está garantidamente verificado
 * }
 * ```
 */
export async function requireEmailVerified() {
  const session = await requireAuth();

  if (!session.user.emailVerified) {
    redirect('/verificar-email');
  }

  return session;
}
