/**
 * Biblioteca para scraping de páginas públicas do site
 * Indexa conteúdo para a base de conhecimento RAG
 */

import type { ScrapedPage } from '@/types/admin-knowledge';

// URLs a serem indexadas
const PAGES_TO_SCRAPE = [
  { url: '/', name: 'Home', priority: 1 },
  { url: '/servicos', name: 'Serviços', priority: 2 },
  { url: '/sobre', name: 'Sobre', priority: 3 },
  { url: '/faq', name: 'FAQ', priority: 4 },
  { url: '/contato', name: 'Contato', priority: 5 },
];

// Delay entre requests (ms)
const REQUEST_DELAY = 1000;

/**
 * Faz delay entre requests
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extrai texto relevante do HTML
 * Remove scripts, styles, nav, footer e outros elementos não relevantes
 */
function extractTextFromHTML(html: string, url: string): string {
  // Remove script tags e seu conteúdo
  let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove style tags
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove nav, footer, header (comuns)
  cleaned = cleaned.replace(/<(nav|footer|header)[^>]*>[\s\S]*?<\/\1>/gi, '');

  // Remove elementos com classes comuns de navegação/rodapé
  cleaned = cleaned.replace(
    /<[^>]+class="[^"]*(?:nav|navigation|footer|header|menu|sidebar)[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi,
    ''
  );

  // Remove tags HTML, mantendo o texto
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // Decodifica entidades HTML
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Normaliza espaços em branco
  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  return cleaned;
}

/**
 * Extrai título da página do HTML
 */
function extractTitleFromHTML(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Fallback: procura h1
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].trim();
  }

  return 'Página sem título';
}

/**
 * Faz scraping de uma página
 */
async function scrapePage(
  baseUrl: string,
  path: string,
  name: string
): Promise<ScrapedPage | null> {
  try {
    const url = `${baseUrl}${path}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': '28Web-Bot/1.0 (Knowledge Base Indexer)',
      },
    });

    if (!response.ok) {
      console.warn(`Falha ao buscar ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const title = extractTitleFromHTML(html);
    const content = extractTextFromHTML(html, url);

    // Filtra conteúdo muito curto (provavelmente página de erro ou redirecionamento)
    if (content.length < 100) {
      console.warn(`Conteúdo muito curto em ${url}: ${content.length} caracteres`);
      return null;
    }

    return {
      url,
      title: title || name,
      content,
      metadata: {
        type: 'page',
        source: 'scraping',
        url,
        title: title || name,
        scrapedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error(`Erro ao fazer scraping de ${path}:`, error);
    return null;
  }
}

/**
 * Faz scraping de todas as páginas públicas configuradas
 */
export async function scrapePublicPages(): Promise<ScrapedPage[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const results: ScrapedPage[] = [];

  // Ordena por prioridade
  const sortedPages = [...PAGES_TO_SCRAPE].sort((a, b) => a.priority - b.priority);

  for (const page of sortedPages) {
    const scraped = await scrapePage(baseUrl, page.url, page.name);
    if (scraped) {
      results.push(scraped);
    }

    // Delay entre requests para não sobrecarregar
    if (page !== sortedPages[sortedPages.length - 1]) {
      await delay(REQUEST_DELAY);
    }
  }

  return results;
}

/**
 * Retorna lista de páginas configuradas para scraping
 */
export function getConfiguredPages(): Array<{ url: string; name: string; priority: number }> {
  return [...PAGES_TO_SCRAPE];
}

/**
 * Adiciona uma nova página para scraping (em runtime)
 */
export function addPageToScrape(url: string, name: string, priority: number): void {
  const exists = PAGES_TO_SCRAPE.find((p) => p.url === url);
  if (!exists) {
    PAGES_TO_SCRAPE.push({ url, name, priority });
  }
}

/**
 * Verifica se uma página já existe na base de conhecimento
 */
export async function checkPageExists(url: string): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/prisma');
    const existing = await prisma.document.findFirst({
      where: {
        metadata: {
          path: ['url'],
          equals: url,
        },
      },
    });
    return !!existing;
  } catch (error) {
    console.error('Erro ao verificar página existente:', error);
    return false;
  }
}
