import { AdminClientListItem, ClientCSVData } from '@/types/admin-client';
import { formatDate } from './utils';

/**
 * Converte um array de objetos para formato CSV
 * @param data Array de objetos para converter
 * @param filename Nome do arquivo (sem extensão)
 */
export function exportToCSV(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[],
  filename: string
): void {
  if (data.length === 0) {
    console.warn('Nenhum dado para exportar');
    return;
  }

  // Obter headers das chaves do primeiro objeto
  const headers = Object.keys(data[0]);

  // Criar linha de headers
  const headerRow = headers.join(';');

  // Criar linhas de dados
  const rows = data.map((item) => {
    return headers
      .map((header) => {
        const value = item[header];
        // Tratar valores nulos/undefined
        if (value === null || value === undefined) {
          return '';
        }
        // Escapar valores que contêm ponto-e-vírgula ou aspas
        const stringValue = String(value);
        if (stringValue.includes(';') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(';');
  });

  // Combinar headers e linhas
  const csvContent = [headerRow, ...rows].join('\n');

  // Adicionar BOM UTF-8 para suporte a acentos (especialmente no Excel)
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;

  // Criar Blob e fazer download
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Limpar URL object
  URL.revokeObjectURL(url);
}

/**
 * Formata dados de clientes para exportação CSV
 * @param clients Lista de clientes
 * @returns Array de objetos formatados para CSV
 */
export function formatClientDataForCSV(clients: AdminClientListItem[]): ClientCSVData[] {
  return clients.map((client) => {
    const projetosAtivos =
      client.projects?.filter((p) => p.status === 'ATIVO' || p.status === 'AGUARDANDO_APROVACAO')
        .length || 0;

    return {
      nome: client.name || 'N/A',
      email: client.email,
      empresa: client.company || 'N/A',
      telefone: client.phone || 'N/A',
      dataCadastro: formatDate(client.createdAt),
      ultimoLogin: client.lastLoginAt ? formatDate(client.lastLoginAt) : 'Nunca',
      totalBriefings: client._count.briefings,
      projetosAtivos,
    };
  });
}

/**
 * Gera nome de arquivo CSV com timestamp
 * @param prefix Prefixo do arquivo
 * @returns Nome do arquivo formatado
 */
export function generateCSVFilename(prefix: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${prefix}-${timestamp}`;
}
