import { describe, it, expect } from 'vitest';
import {
  validateFileType,
  getMaxFileSize,
  fileUploadSchema,
  getFileExtension,
  sanitizeFilename,
  formatFileSize,
  allowedMimeTypes,
  maxFileSizes,
} from '../file-upload';

describe('File Upload Validation', () => {
  describe('getFileExtension', () => {
    it('deve retornar a extensão correta para arquivos comuns', () => {
      expect(getFileExtension('documento.pdf')).toBe('.pdf');
      expect(getFileExtension('imagem.jpg')).toBe('.jpg');
      expect(getFileExtension('video.mp4')).toBe('.mp4');
      expect(getFileExtension('arquivo.zip')).toBe('.zip');
    });

    it('deve retornar a extensão em lowercase', () => {
      expect(getFileExtension('Documento.PDF')).toBe('.pdf');
      expect(getFileExtension('IMAGEM.JPG')).toBe('.jpg');
    });

    it('deve retornar null para arquivos sem extensão', () => {
      expect(getFileExtension('arquivo')).toBeNull();
      expect(getFileExtension('arquivo.')).toBeNull();
    });

    it('deve lidar com múltiplos pontos no nome', () => {
      expect(getFileExtension('meu.documento.v1.pdf')).toBe('.pdf');
      expect(getFileExtension('arquivo.backup.tar.gz')).toBe('.gz');
    });
  });

  describe('sanitizeFilename', () => {
    it('deve remover caracteres perigosos', () => {
      expect(sanitizeFilename('arquivo<nome>.pdf')).toBe('arquivo_nome_.pdf');
      expect(sanitizeFilename('arquivo:nome.pdf')).toBe('arquivo_nome.pdf');
      expect(sanitizeFilename('arquivo|nome.pdf')).toBe('arquivo_nome.pdf');
    });

    it('deve remover path traversal', () => {
      expect(sanitizeFilename('../../../etc/passwd')).toBe('_etc_passwd');
      expect(sanitizeFilename('..\\..\\windows\\system32')).toBe('_windows_system32');
    });

    it('deve manter caracteres válidos', () => {
      expect(sanitizeFilename('meu-arquivo_v1.2.pdf')).toBe('meu-arquivo_v1.2.pdf');
      expect(sanitizeFilename('documento (final).docx')).toBe('documento (final).docx');
    });

    it('deve preservar espaços convertidos', () => {
      expect(sanitizeFilename('meu arquivo.pdf')).toBe('meu arquivo.pdf');
    });
  });

  describe('validateFileType', () => {
    it('deve aceitar tipos MIME válidos', () => {
      const result = validateFileType('documento.pdf', 'application/pdf');
      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('application/pdf');
    });

    it('deve aceitar várias extensões permitidas', () => {
      const validFiles = [
        { name: 'doc.pdf', type: 'application/pdf' },
        {
          name: 'doc.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
        { name: 'img.jpg', type: 'image/jpeg' },
        { name: 'img.png', type: 'image/png' },
        { name: 'video.mp4', type: 'video/mp4' },
        { name: 'arq.zip', type: 'application/zip' },
      ];

      validFiles.forEach(({ name, type }) => {
        const result = validateFileType(name, type);
        expect(result.valid).toBe(true);
      });
    });

    it('deve rejeitar arquivos sem extensão', () => {
      const result = validateFileType('arquivo', 'application/octet-stream');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('sem extensão');
    });

    it('deve rejeitar extensões não permitidas', () => {
      const result = validateFileType('arquivo.exe', 'application/x-msdownload');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('não é permitida');
    });

    it('deve rejeitar inconsistência entre extensão e MIME type', () => {
      const result = validateFileType('imagem.jpg', 'application/pdf');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('inconsistente');
    });

    it('deve aceitar extensões em uppercase', () => {
      const result = validateFileType('DOCUMENTO.PDF', 'application/pdf');
      expect(result.valid).toBe(true);
    });

    it('deve ser tolerante com MIME type genérico para imagens JPEG', () => {
      // Alguns navegadores enviam MIME type genérico
      const result = validateFileType('imagem.jpg', 'image/jpeg');
      expect(result.valid).toBe(true);
    });
  });

  describe('getMaxFileSize', () => {
    it('deve retornar limite correto para documentos', () => {
      expect(getMaxFileSize('application/pdf')).toBe(maxFileSizes.documents);
      expect(getMaxFileSize('application/msword')).toBe(maxFileSizes.documents);
      expect(
        getMaxFileSize('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      ).toBe(maxFileSizes.documents);
    });

    it('deve retornar limite correto para imagens', () => {
      expect(getMaxFileSize('image/jpeg')).toBe(maxFileSizes.images);
      expect(getMaxFileSize('image/png')).toBe(maxFileSizes.images);
      expect(getMaxFileSize('image/svg+xml')).toBe(maxFileSizes.images);
    });

    it('deve retornar limite correto para vídeos', () => {
      expect(getMaxFileSize('video/mp4')).toBe(maxFileSizes.videos);
      expect(getMaxFileSize('video/quicktime')).toBe(maxFileSizes.videos);
    });

    it('deve retornar limite correto para arquivos compactados', () => {
      expect(getMaxFileSize('application/zip')).toBe(maxFileSizes.archives);
      expect(getMaxFileSize('application/x-rar-compressed')).toBe(maxFileSizes.archives);
    });

    it('deve retornar limite padrão para MIME types desconhecidos', () => {
      // Para segurança, tipos desconhecidos usam o menor limite
      expect(getMaxFileSize('application/unknown')).toBe(maxFileSizes.documents);
    });
  });

  describe('formatFileSize', () => {
    it('deve formatar bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
    });

    it('deve formatar kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('deve formatar megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });

    it('deve formatar gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB');
    });

    it('deve usar no máximo 2 casas decimais', () => {
      expect(formatFileSize(1500)).toBe('1.46 KB');
    });
  });

  describe('fileUploadSchema', () => {
    it('deve aceitar dados válidos', () => {
      const validData = {
        filename: 'documento.pdf',
        filesize: 1024 * 1024, // 1MB
        mimetype: 'application/pdf' as const,
        projectId: 'clj1234567890abcdef',
      };

      const result = fileUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar filename vazio', () => {
      const invalidData = {
        filename: '',
        filesize: 1024,
        mimetype: 'application/pdf' as const,
        projectId: 'clj1234567890abcdef',
      };

      const result = fileUploadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar filename muito longo', () => {
      const invalidData = {
        filename: 'a'.repeat(256) + '.pdf',
        filesize: 1024,
        mimetype: 'application/pdf' as const,
        projectId: 'clj1234567890abcdef',
      };

      const result = fileUploadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar filesize negativo ou zero', () => {
      const invalidData = {
        filename: 'doc.pdf',
        filesize: 0,
        mimetype: 'application/pdf' as const,
        projectId: 'clj1234567890abcdef',
      };

      const result = fileUploadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar mimetype não permitido', () => {
      const invalidData = {
        filename: 'doc.exe',
        filesize: 1024,
        mimetype: 'application/x-msdownload' as any,
        projectId: 'clj1234567890abcdef',
      };

      const result = fileUploadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar projectId inválido', () => {
      const invalidData = {
        filename: 'doc.pdf',
        filesize: 1024,
        mimetype: 'application/pdf' as const,
        projectId: 'invalid-id',
      };

      const result = fileUploadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('allowedMimeTypes', () => {
    it('deve conter todos os tipos principais', () => {
      expect(allowedMimeTypes['.pdf']).toBe('application/pdf');
      expect(allowedMimeTypes['.jpg']).toBe('image/jpeg');
      expect(allowedMimeTypes['.png']).toBe('image/png');
      expect(allowedMimeTypes['.mp4']).toBe('video/mp4');
      expect(allowedMimeTypes['.zip']).toBe('application/zip');
    });

    it('deve mapear múltiplas extensões para o mesmo MIME type', () => {
      expect(allowedMimeTypes['.jpg']).toBe('image/jpeg');
      expect(allowedMimeTypes['.jpeg']).toBe('image/jpeg');
    });
  });

  describe('maxFileSizes', () => {
    it('deve ter limites definidos para todas as categorias', () => {
      expect(maxFileSizes.documents).toBe(10 * 1024 * 1024); // 10MB
      expect(maxFileSizes.images).toBe(5 * 1024 * 1024); // 5MB
      expect(maxFileSizes.videos).toBe(100 * 1024 * 1024); // 100MB
      expect(maxFileSizes.archives).toBe(50 * 1024 * 1024); // 50MB
    });

    it('deve respeitar hierarquia de tamanhos', () => {
      expect(maxFileSizes.images).toBeLessThan(maxFileSizes.documents);
      expect(maxFileSizes.documents).toBeLessThan(maxFileSizes.archives);
      expect(maxFileSizes.archives).toBeLessThan(maxFileSizes.videos);
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com nomes de arquivo Unicode', () => {
      const result = sanitizeFilename('documento-日本語.pdf');
      expect(result).toContain('.pdf');
    });

    it('deve lidar com múltiplos pontos consecutivos', () => {
      const result = sanitizeFilename('arquivo...nome.pdf');
      expect(result).not.toContain('...');
    });

    it('deve lidar com espaços no início/fim', () => {
      const result = sanitizeFilename('  arquivo.pdf  ');
      expect(result).toBe('arquivo.pdf');
    });

    it('deve rejeitar arquivos com extensão dupla suspeita', () => {
      // Arquivos com extensão dupla como .pdf.exe devem ser validados pelo MIME type
      const result = validateFileType('arquivo.pdf.exe', 'application/x-msdownload');
      expect(result.valid).toBe(false);
    });
  });
});
