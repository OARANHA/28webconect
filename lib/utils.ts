import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FileText, Image, Video, Archive, File, LucideIcon } from 'lucide-react';

/**
 * Combina classes do Tailwind CSS, mesclando e removendo duplicatas
 * @param inputs Classes CSS a serem combinadas
 * @returns String de classes otimizada
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um número de telefone brasileiro
 * Aplica máscara: (XX) XXXXX-XXXX para celular (11 dígitos) ou (XX) XXXX-XXXX para fixo (10 dígitos)
 * @param value Valor digitado pelo usuário
 * @returns Telefone formatado
 */
export function formatPhoneNumber(value: string): string {
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '');

  // Limita a 11 dígitos
  const limited = digits.slice(0, 11);

  // Aplica a máscara conforme a quantidade de dígitos
  if (limited.length <= 10) {
    // Formato fixo: (XX) XXXX-XXXX
    return limited
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  } else {
    // Formato celular: (XX) XXXXX-XXXX
    return limited
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }
}

/**
 * Remove a formatação do telefone, retornando apenas os dígitos
 * @param formattedPhone Telefone formatado
 * @returns Apenas os dígitos
 */
export function unformatPhoneNumber(formattedPhone: string): string {
  return formattedPhone.replace(/\D/g, '');
}

/**
 * Formata uma data para exibição em português
 * @param date Data a ser formatada
 * @returns String formatada (ex: "01/01/2024")
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formata um valor monetário para exibição em reais
 * @param value Valor numérico
 * @returns String formatada (ex: "R$ 1.234,56")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Trunca um texto se ele exceder o tamanho máximo
 * @param text Texto a ser truncado
 * @param maxLength Tamanho máximo
 * @returns Texto truncado com ellipsis se necessário
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Gera um slug a partir de uma string
 * @param text Texto a ser convertido
 * @returns Slug formatado (minúsculo, sem acentos, espaços viram hífens)
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Espaços viram hífens
    .replace(/[^\w\-]+/g, '') // Remove caracteres especiais
    .replace(/\-\-+/g, '-'); // Múltiplos hífens viram um
}

/**
 * Aguarda um tempo determinado (util para delays controlados)
 * @param ms Milissegundos a aguardar
 * @returns Promise que resolve após o tempo
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Verifica se um email é válido
 * @param email Email a ser verificado
 * @returns true se válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formata tamanho de arquivo em bytes para string legível
 * @param bytes Tamanho em bytes
 * @returns String formatada (ex: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * Retorna as iniciais de um nome
 * @param name Nome completo
 * @returns Iniciais (máximo 2 caracteres)
 */
export function getInitials(name: string | null): string {
  if (!name) return '?';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const firstInitial = parts[0][0];
  const lastInitial = parts[parts.length - 1][0];
  return (firstInitial + lastInitial).toUpperCase();
}

/**
 * Gera uma cor determinística baseada em uma string
 * @param str String para gerar a cor
 * @returns Cor em formato hsl
 */
export function getStringColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 45%)`;
}

/**
 * Retorna o ícone Lucide apropriado para um tipo MIME
 * @param mimetype Tipo MIME do arquivo
 * @returns Componente de ícone do Lucide
 */
export function getFileIcon(mimetype: string): LucideIcon {
  if (mimetype.startsWith('image/')) {
    return Image;
  }
  if (mimetype.startsWith('video/')) {
    return Video;
  }
  if (
    mimetype.includes('pdf') ||
    mimetype.includes('word') ||
    mimetype.includes('excel') ||
    mimetype.includes('text')
  ) {
    return FileText;
  }
  if (
    mimetype.includes('zip') ||
    mimetype.includes('rar') ||
    mimetype.includes('compressed') ||
    mimetype.includes('archive')
  ) {
    return Archive;
  }
  return File;
}

/**
 * Formata a última atividade em formato legível
 * @param date Data da última atividade
 * @returns String formatada (ex: "Hoje", "3 dias atrás", "01/01/2024")
 */
export function formatLastActivity(date: Date | null | undefined): string {
  if (!date) return 'Nunca';

  const now = new Date();
  const activityDate = new Date(date);
  const diffInMs = now.getTime() - activityDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 24) {
    return 'Hoje';
  }

  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'} atrás`;
  }

  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} atrás`;
  }

  return formatDate(date);
}

/**
 * Calcula a taxa de conversão percentual
 * @param total Total de itens
 * @param converted Itens convertidos
 * @returns String formatada (ex: "75.5%")
 */
export function calculateConversionRate(total: number, converted: number): string {
  if (total === 0) return '0%';
  const rate = (converted / total) * 100;
  return `${rate.toFixed(1)}%`;
}
