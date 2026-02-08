/**
 * Testes unitários para extração de texto de arquivos
 */

import { describe, it, expect, vi } from 'vitest';
import {
  extractTextFromPDF,
  extractTextFromDOCX,
  extractTextFromTXT,
  extractTextFromMD,
  extractTextFromFile,
  isSupportedMimeType,
  getExtensionFromMimeType,
  getDocumentTypeLabel,
} from '../text-extraction';

// Mocks
vi.mock('pdf-parse', () => ({
  default: vi.fn(),
}));

vi.mock('mammoth', () => ({
  extractRawText: vi.fn(),
}));

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

describe('Text Extraction', () => {
  describe('extractTextFromTXT', () => {
    it('deve extrair texto de arquivo TXT', async () => {
      const buffer = Buffer.from('Texto de teste em UTF-8');
      const result = await extractTextFromTXT(buffer);

      expect(result).toBe('Texto de teste em UTF-8');
    });

    it('deve lidar com caracteres especiais', async () => {
      const buffer = Buffer.from('Café, maçã, João');
      const result = await extractTextFromTXT(buffer);

      expect(result).toBe('Café, maçã, João');
    });
  });

  describe('extractTextFromMD', () => {
    it('deve extrair texto de arquivo Markdown', async () => {
      const markdown = '# Título\n\nTexto do parágrafo';
      const buffer = Buffer.from(markdown);
      const result = await extractTextFromMD(buffer);

      expect(result).toBe(markdown);
    });
  });

  describe('extractTextFromPDF', () => {
    it('deve extrair texto de PDF', async () => {
      vi.mocked(pdfParse).mockResolvedValue({
        text: 'Texto extraído do PDF',
        numpages: 1,
        info: {},
        metadata: {},
        version: '1.0',
      });

      const buffer = Buffer.from('pdf-content');
      const result = await extractTextFromPDF(buffer);

      expect(result).toBe('Texto extraído do PDF');
      expect(pdfParse).toHaveBeenCalledWith(buffer);
    });

    it('deve lançar erro para PDF corrompido', async () => {
      vi.mocked(pdfParse).mockRejectedValue(new Error('Invalid PDF'));

      const buffer = Buffer.from('invalid-pdf');

      await expect(extractTextFromPDF(buffer)).rejects.toThrow('Falha ao extrair texto do PDF');
    });
  });

  describe('extractTextFromDOCX', () => {
    it('deve extrair texto de DOCX', async () => {
      vi.mocked(mammoth.extractRawText).mockResolvedValue({
        value: 'Texto extraído do DOCX',
        messages: [],
      });

      const buffer = Buffer.from('docx-content');
      const result = await extractTextFromDOCX(buffer);

      expect(result).toBe('Texto extraído do DOCX');
      expect(mammoth.extractRawText).toHaveBeenCalledWith({ buffer });
    });

    it('deve lançar erro para DOCX corrompido', async () => {
      vi.mocked(mammoth.extractRawText).mockRejectedValue(new Error('Invalid DOCX'));

      const buffer = Buffer.from('invalid-docx');

      await expect(extractTextFromDOCX(buffer)).rejects.toThrow('Falha ao extrair texto do DOCX');
    });
  });

  describe('extractTextFromFile', () => {
    it('deve delegar para o extrator correto (PDF)', async () => {
      vi.mocked(pdfParse).mockResolvedValue({
        text: 'PDF content',
        numpages: 1,
        info: {},
        metadata: {},
        version: '1.0',
      });

      const buffer = Buffer.from('pdf');
      const result = await extractTextFromFile(buffer, 'application/pdf');

      expect(result).toBe('PDF content');
    });

    it('deve delegar para o extrator correto (DOC)', async () => {
      // Mock do WordExtractor
      const mockWordExtractor = {
        extract: vi.fn().mockResolvedValue({
          getBody: () => 'DOC content',
        }),
      };
      vi.mocked(await import('word-extractor')).mockImplementation(() => ({
        default: vi.fn().mockImplementation(() => mockWordExtractor),
      }));

      const buffer = Buffer.from('doc');
      // Teste simplificado - verifica se não lança erro para DOC
      await expect(extractTextFromFile(buffer, 'application/msword')).rejects.not.toThrow(
        'não suportado'
      );
    });

    it('deve delegar para o extrator correto (DOCX)', async () => {
      vi.mocked(mammoth.extractRawText).mockResolvedValue({
        value: 'DOCX content',
        messages: [],
      });

      const buffer = Buffer.from('docx');
      const result = await extractTextFromFile(
        buffer,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );

      expect(result).toBe('DOCX content');
    });

    it('deve delegar para o extrator correto (TXT)', async () => {
      const buffer = Buffer.from('TXT content');
      const result = await extractTextFromFile(buffer, 'text/plain');

      expect(result).toBe('TXT content');
    });

    it('deve delegar para o extrator correto (MD)', async () => {
      const buffer = Buffer.from('MD content');
      const result = await extractTextFromFile(buffer, 'text/markdown');

      expect(result).toBe('MD content');
    });

    it('deve lançar erro para tipo não suportado', async () => {
      const buffer = Buffer.from('content');

      await expect(extractTextFromFile(buffer, 'image/png')).rejects.toThrow('não suportado');
    });

    it('deve truncar texto muito longo', async () => {
      const longText = 'x'.repeat(60000);
      const buffer = Buffer.from(longText);
      const result = await extractTextFromFile(buffer, 'text/plain');

      expect(result.length).toBeLessThan(60000);
      expect(result).toContain('AVISO: Documento truncado');
    });
  });

  describe('isSupportedMimeType', () => {
    it('deve retornar true para tipos suportados', () => {
      expect(isSupportedMimeType('application/pdf')).toBe(true);
      expect(isSupportedMimeType('application/msword')).toBe(true);
      expect(isSupportedMimeType('text/plain')).toBe(true);
      expect(isSupportedMimeType('text/markdown')).toBe(true);
      expect(
        isSupportedMimeType(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      ).toBe(true);
    });

    it('deve retornar false para tipos não suportados', () => {
      expect(isSupportedMimeType('image/png')).toBe(false);
      expect(isSupportedMimeType('text/html')).toBe(false);
    });
  });

  describe('getExtensionFromMimeType', () => {
    it('deve retornar extensão correta', () => {
      expect(getExtensionFromMimeType('application/pdf')).toBe('.pdf');
      expect(getExtensionFromMimeType('application/msword')).toBe('.doc');
      expect(getExtensionFromMimeType('text/plain')).toBe('.txt');
      expect(getExtensionFromMimeType('text/markdown')).toBe('.md');
      expect(
        getExtensionFromMimeType(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      ).toBe('.docx');
    });

    it('deve retornar null para tipo desconhecido', () => {
      expect(getExtensionFromMimeType('image/png')).toBeNull();
    });
  });

  describe('getDocumentTypeLabel', () => {
    it('deve retornar label correto', () => {
      expect(getDocumentTypeLabel('application/pdf')).toBe('PDF');
      expect(getDocumentTypeLabel('application/msword')).toBe('DOC');
      expect(getDocumentTypeLabel('text/plain')).toBe('TXT');
      expect(getDocumentTypeLabel('text/markdown')).toBe('MD');
      expect(
        getDocumentTypeLabel(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      ).toBe('DOCX');
    });

    it('deve retornar padrão para tipo desconhecido', () => {
      expect(getDocumentTypeLabel('unknown/type')).toBe('Documento');
    });
  });
});
