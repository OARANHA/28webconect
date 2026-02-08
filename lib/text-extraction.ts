/**
 * Biblioteca de extração de texto de arquivos
 * Suporta PDF, DOC, DOCX, TXT e MD
 */

import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import WordExtractor from 'word-extractor';

// Limite máximo de caracteres extraídos
const MAX_EXTRACTED_TEXT_LENGTH = 50000;

/**
 * Extrai texto de um arquivo PDF
 * @param buffer Buffer do arquivo
 * @returns Texto extraído
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdf = new PDFParse();
    const data = await pdf.parseBuffer(buffer);
    return truncateText(data.text);
  } catch (error) {
    console.error('Erro ao extrair texto de PDF:', error);
    throw new Error('Falha ao extrair texto do PDF. O arquivo pode estar corrompido.');
  }
}

/**
 * Extrai texto de um arquivo DOC (formato antigo)
 * @param buffer Buffer do arquivo
 * @returns Texto extraído
 */
export async function extractTextFromDOC(buffer: Buffer): Promise<string> {
  try {
    const extractor = new WordExtractor();
    const extracted = await extractor.extract(buffer);
    return truncateText(extracted.getBody() || '');
  } catch (error) {
    console.error('Erro ao extrair texto de DOC:', error);
    throw new Error('Falha ao extrair texto do DOC. O arquivo pode estar corrompido ou protegido.');
  }
}

/**
 * Extrai texto de um arquivo DOCX
 * @param buffer Buffer do arquivo
 * @returns Texto extraído
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return truncateText(result.value);
  } catch (error) {
    console.error('Erro ao extrair texto de DOCX:', error);
    throw new Error('Falha ao extrair texto do DOCX. O arquivo pode estar corrompido.');
  }
}

/**
 * Extrai texto de um arquivo TXT
 * @param buffer Buffer do arquivo
 * @returns Texto extraído
 */
export async function extractTextFromTXT(buffer: Buffer): Promise<string> {
  try {
    const text = buffer.toString('utf-8');
    return truncateText(text);
  } catch (error) {
    console.error('Erro ao extrair texto de TXT:', error);
    throw new Error('Falha ao extrair texto do arquivo TXT.');
  }
}

/**
 * Extrai texto de um arquivo Markdown
 * @param buffer Buffer do arquivo
 * @returns Texto extraído
 */
export async function extractTextFromMD(buffer: Buffer): Promise<string> {
  try {
    const text = buffer.toString('utf-8');
    return truncateText(text);
  } catch (error) {
    console.error('Erro ao extrair texto de MD:', error);
    throw new Error('Falha ao extrair texto do arquivo Markdown.');
  }
}

/**
 * Função principal que delega extração baseado no mimetype
 * @param buffer Buffer do arquivo
 * @param mimetype MIME type do arquivo
 * @returns Texto extraído
 */
export async function extractTextFromFile(buffer: Buffer, mimetype: string): Promise<string> {
  switch (mimetype) {
    case 'application/pdf':
      return extractTextFromPDF(buffer);
    case 'application/msword':
      return extractTextFromDOC(buffer);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractTextFromDOCX(buffer);
    case 'text/plain':
      return extractTextFromTXT(buffer);
    case 'text/markdown':
      return extractTextFromMD(buffer);
    default:
      throw new Error(`Tipo de arquivo não suportado para extração: ${mimetype}`);
  }
}

/**
 * Trunca texto se exceder o limite máximo
 * @param text Texto a ser truncado
 * @returns Texto truncado com aviso
 */
function truncateText(text: string): string {
  if (text.length > MAX_EXTRACTED_TEXT_LENGTH) {
    return (
      text.substring(0, MAX_EXTRACTED_TEXT_LENGTH) +
      '\n\n[AVISO: Documento truncado - excede o limite de 50.000 caracteres]'
    );
  }
  return text;
}

/**
 * Verifica se o mimetype é suportado para extração
 * @param mimetype MIME type do arquivo
 * @returns true se suportado
 */
export function isSupportedMimeType(mimetype: string): boolean {
  const supportedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
  ];
  return supportedTypes.includes(mimetype);
}

/**
 * Retorna extensão do arquivo baseado no mimetype
 * @param mimetype MIME type do arquivo
 * @returns Extensão com ponto ou null
 */
export function getExtensionFromMimeType(mimetype: string): string | null {
  const mimeToExt: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'text/markdown': '.md',
  };
  return mimeToExt[mimetype] || null;
}

/**
 * Retorna label amigável para o tipo de documento
 * @param mimetype MIME type do arquivo
 * @returns Label formatado
 */
export function getDocumentTypeLabel(mimetype: string): string {
  const labels: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'text/plain': 'TXT',
    'text/markdown': 'MD',
  };
  return labels[mimetype] || 'Documento';
}
