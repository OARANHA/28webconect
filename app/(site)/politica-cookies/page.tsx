import type { Metadata } from 'next';
import { LEGAL, COOKIES_LIST, COOKIE_HELP_LINKS } from '@/lib/constants';
import { generateMetadata } from '@/lib/seo';
import {
  LegalText,
  LegalSection,
  LegalSubsection,
  LegalList,
  LegalListItem,
  LegalHighlight,
  LegalTable,
} from '@/components/ui/LegalText';
import BackToTop from '@/components/ui/BackToTop';

export const metadata: Metadata = generateMetadata({
  title: 'Política de Cookies',
  description:
    'Como utilizamos cookies na 28Web Connect. Categorias, finalidades e como gerenciar suas preferências.',
  path: 'politica-cookies',
  keywords: ['cookies', 'privacidade', 'rastreamento', 'analytics', 'LGPD'],
});

export default function PoliticaCookiesPage() {
  // Filter cookies by category for the table
  const cookieRows = COOKIES_LIST.map((cookie) => [
    cookie.name,
    <span key={`${cookie.name}-type`} className="capitalize">
      {cookie.type}
    </span>,
    cookie.purpose,
    cookie.duration,
    cookie.provider,
  ]);

  return (
    <>
      {/* Hero */}
      <section className="pt-8 pb-12 md:pt-16 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-white mb-4">
              Política de <span className="text-accent-primary">Cookies</span>
            </h1>
            <p className="text-neutral-gray">Última atualização: {LEGAL.lastUpdated}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LegalText>
            <LegalSection title="1. O que são Cookies" index={1}>
              <p>
                Cookies são pequenos arquivos de texto armazenados no seu navegador quando você
                visita um site. Eles servem para memorizar informações sobre sua visita, como
                preferências de idioma, itens no carrinho de compras, ou dados de login.
              </p>
              <p>
                Além dos cookies tradicionais, utilizamos tecnologias similares como localStorage e
                sessionStorage para armazenar preferências de forma mais segura e eficiente.
              </p>
            </LegalSection>

            <LegalSection title="2. Tipos de Cookies Utilizados" index={2}>
              <LegalSubsection title="2.1 Essenciais (Sempre Ativos)">
                <p>
                  Estes cookies são necessários para o funcionamento básico do site e não podem ser
                  desativados. Eles incluem:
                </p>
                <LegalList>
                  <LegalListItem>Autenticação e sessão de usuário</LegalListItem>
                  <LegalListItem>Tokens de segurança (CSRF protection)</LegalListItem>
                  <LegalListItem>Preferências de cookies (consentimento)</LegalListItem>
                </LegalList>
              </LegalSubsection>

              <LegalSubsection title="2.2 Analytics (Requer Consentimento)">
                <p>
                  Utilizamos <strong>Umami Analytics</strong>, uma ferramenta de analytics
                  self-hosted e privacy-friendly. Os dados coletados são:
                </p>
                <LegalList>
                  <LegalListItem>Páginas visitadas e tempo de permanência</LegalListItem>
                  <LegalListItem>Origem do tráfego (referral)</LegalListItem>
                  <LegalListItem>Tipo de dispositivo e navegador</LegalListItem>
                </LegalList>
                <LegalHighlight>
                  <strong>Importante:</strong> Não utilizamos Google Analytics ou ferramentas que
                  rastreiem você através de diferentes sites. Todos os dados são anonimizados.
                </LegalHighlight>
              </LegalSubsection>

              <LegalSubsection title="2.3 Funcionais (Requer Consentimento)">
                <p>Estes cookies melhoram a funcionalidade do site:</p>
                <LegalList>
                  <LegalListItem>
                    <strong>Chat IA:</strong> Histórico de conversas para usuários logados
                  </LegalListItem>
                  <LegalListItem>
                    <strong>Preferências:</strong> Configurações de notificações e UI
                  </LegalListItem>
                </LegalList>
              </LegalSubsection>
            </LegalSection>

            <LegalSection title="3. Lista de Cookies" index={3}>
              <p>Abaixo estão todos os cookies utilizados em nossa plataforma:</p>
              <LegalTable
                headers={['Cookie', 'Tipo', 'Finalidade', 'Duração', 'Provedor']}
                rows={cookieRows}
              />
            </LegalSection>

            <LegalSection title="4. Gerenciamento de Cookies" index={4}>
              <p>
                Ao acessar nosso site pela primeira vez, você verá um banner de cookies onde pode
                escolher quais categorias aceitar. Você pode alterar suas preferências a qualquer
                momento:
              </p>
              <LegalList>
                <LegalListItem>
                  Clicando no link "Gerenciar Cookies" no rodapé do site
                </LegalListItem>
                <LegalListItem>Através das configurações do seu navegador</LegalListItem>
              </LegalList>

              <LegalSubsection title="Como Bloquear Cookies no Navegador">
                <p>
                  Você pode configurar seu navegador para bloquear cookies. Consulte a documentação
                  oficial do seu navegador:
                </p>
                <LegalList>
                  <LegalListItem>
                    <a
                      href={COOKIE_HELP_LINKS.chrome}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:underline"
                    >
                      Google Chrome
                    </a>
                  </LegalListItem>
                  <LegalListItem>
                    <a
                      href={COOKIE_HELP_LINKS.firefox}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:underline"
                    >
                      Mozilla Firefox
                    </a>
                  </LegalListItem>
                  <LegalListItem>
                    <a
                      href={COOKIE_HELP_LINKS.safari}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:underline"
                    >
                      Apple Safari
                    </a>
                  </LegalListItem>
                  <LegalListItem>
                    <a
                      href={COOKIE_HELP_LINKS.edge}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:underline"
                    >
                      Microsoft Edge
                    </a>
                  </LegalListItem>
                </LegalList>
                <LegalHighlight>
                  <strong>Atenção:</strong> Bloquear cookies essenciais pode impedir o funcionamento
                  correto do site, incluindo login e segurança.
                </LegalHighlight>
              </LegalSubsection>
            </LegalSection>

            <LegalSection title="5. Duração dos Cookies" index={5}>
              <p>Os cookies podem ter diferentes durações:</p>
              <LegalList>
                <LegalListItem>
                  <strong>Session (Sessão):</strong> Expiram quando você fecha o navegador
                </LegalListItem>
                <LegalListItem>
                  <strong>Persistentes:</strong> Mantêm-se até a data de expiração ou até serem
                  excluídos manualmente
                </LegalListItem>
              </LegalList>
              <p>Nossos cookies persistentes têm duração máxima de 1 ano.</p>
            </LegalSection>

            <LegalSection title="6. Seus Direitos" index={6}>
              <p>Você tem os seguintes direitos em relação aos cookies:</p>
              <LegalList>
                <LegalListItem>Aceitar ou recusar cookies não essenciais</LegalListItem>
                <LegalListItem>Alterar suas preferências a qualquer momento</LegalListItem>
                <LegalListItem>Remover cookies armazenados pelo navegador</LegalListItem>
                <LegalListItem>Navegar em modo anônimo/privado (cookies temporários)</LegalListItem>
              </LegalList>
            </LegalSection>

            <LegalSection title="7. Cookies de Terceiros" index={7}>
              <p>
                Utilizamos cookies de terceiros estritamente necessários para o funcionamento de
                determinadas funcionalidades:
              </p>
              <LegalList>
                <LegalListItem>
                  <strong>Umami Analytics:</strong> Métricas de uso (self-hosted, dados
                  anonimizados). Localização: VPS Contabo (Brasil/Europa).
                </LegalListItem>
                <LegalListItem>
                  <strong>Mistral AI:</strong> Funcionamento do chat IA. Localização: Europa (GDPR
                  compliant). Apenas ativo se você consentir cookies funcionais.
                </LegalListItem>
              </LegalList>
              <LegalHighlight>
                <strong>Importante:</strong> Não utilizamos cookies de publicidade ou rastreamento
                de terceiros como Facebook Pixel ou Google Ads.
              </LegalHighlight>
            </LegalSection>

            <LegalSection title="8. Atualizações" index={8}>
              <p>
                Podemos atualizar esta política quando novos cookies forem adicionados ou quando
                houver mudanças regulatórias. A data da última atualização está sempre visível no
                topo desta página.
              </p>
            </LegalSection>

            <LegalSection title="9. Contato" index={9}>
              <p>Para dúvidas sobre cookies ou exercício de direitos, entre em contato:</p>
              <LegalHighlight>
                <strong>DPO:</strong> {LEGAL.dpoEmail}
                <br />
                <strong>Email Geral:</strong> {LEGAL.companyEmail}
              </LegalHighlight>
            </LegalSection>
          </LegalText>

          {/* Back to top button */}
          <div className="fixed bottom-8 right-8 animate-fade-in">
            <BackToTop />
          </div>
        </div>
      </section>
    </>
  );
}
