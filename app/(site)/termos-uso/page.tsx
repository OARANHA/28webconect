import type { Metadata } from 'next';
import { LEGAL } from '@/lib/constants';
import { generateMetadata } from '@/lib/seo';
import {
  LegalText,
  LegalSection,
  LegalSubsection,
  LegalList,
  LegalListItem,
  LegalHighlight,
} from '@/components/ui/LegalText';
import BackToTop from '@/components/ui/BackToTop';

export const metadata: Metadata = generateMetadata({
  title: 'Termos de Uso',
  description:
    'Termos e condições de uso da plataforma 28Web Connect. Direitos, responsabilidades e regras de utilização.',
  path: 'termos-uso',
  keywords: ['termos de uso', 'condições', 'regras', 'contrato', 'legal'],
});

export default function TermosUsoPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-8 pb-12 md:pt-16 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-white mb-4">
              Termos de <span className="text-accent-primary">Uso</span>
            </h1>
            <p className="text-neutral-gray">Última atualização: {LEGAL.lastUpdated}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LegalText>
            <LegalSection title="1. Aceitação dos Termos" index={1}>
              <p>
                Ao criar uma conta na plataforma {LEGAL.companyName}, você concorda em cumprir estes
                Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá
                utilizar nossos serviços.
              </p>
              <LegalHighlight>
                <strong>Restrição de Idade:</strong> Menores de 18 anos não podem criar conta sem
                autorização e supervisão dos pais ou responsáveis legais.
              </LegalHighlight>
            </LegalSection>

            <LegalSection title="2. Descrição do Serviço" index={2}>
              <p>A {LEGAL.companyName} oferece:</p>
              <LegalList>
                <LegalListItem>
                  <strong>Desenvolvimento de software:</strong> ERP, e-commerce, landing pages e
                  integrações personalizadas
                </LegalListItem>
                <LegalListItem>
                  <strong>Portal do cliente:</strong> acompanhamento de projetos, comunicação e
                  gestão de arquivos
                </LegalListItem>
                <LegalListItem>
                  <strong>Chat de IA:</strong> suporte automatizado e qualificação de leads
                </LegalListItem>
              </LegalList>
              <p>
                Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer parte do
                serviço a qualquer momento, com aviso prévio.
              </p>
            </LegalSection>

            <LegalSection title="3. Cadastro e Conta" index={3}>
              <LegalSubsection title="3.1 Informações Verdadeiras">
                <p>
                  Você se compromete a fornecer informações verdadeiras, precisas e atualizadas
                  durante o cadastro. É sua responsabilidade manter essas informações atualizadas.
                </p>
              </LegalSubsection>

              <LegalSubsection title="3.2 Segurança da Conta">
                <LegalList>
                  <LegalListItem>Mantenha sua senha em segurança e confidencialidade</LegalListItem>
                  <LegalListItem>Não compartilhe suas credenciais de acesso</LegalListItem>
                  <LegalListItem>
                    Notifique-nos imediatamente sobre uso não autorizado
                  </LegalListItem>
                  <LegalListItem>Você é responsável por toda atividade em sua conta</LegalListItem>
                </LegalList>
              </LegalSubsection>

              <LegalSubsection title="3.3 Suspensão de Conta">
                <p>
                  Podemos suspender ou encerrar contas que apresentem atividade suspeita, violação
                  destes termos ou comportamento fraudulento.
                </p>
              </LegalSubsection>
            </LegalSection>

            <LegalSection title="4. Uso Aceitável" index={4}>
              <LegalSubsection title="4.1 Proibições">
                <p>É estritamente proibido:</p>
                <LegalList>
                  <LegalListItem>Enviar spam ou conteúdo não solicitado</LegalListItem>
                  <LegalListItem>Publicar ou transmitir conteúdo ilegal</LegalListItem>
                  <LegalListItem>Tentar acessar áreas restritas sem autorização</LegalListItem>
                  <LegalListItem>Realizar engenharia reversa da plataforma</LegalListItem>
                  <LegalListItem>Usar recursos de forma abusiva (excesso de upload)</LegalListItem>
                  <LegalListItem>Interferir no funcionamento normal do serviço</LegalListItem>
                </LegalList>
              </LegalSubsection>

              <LegalSubsection title="4.2 Limites de Uso">
                <p>
                  O uso deve respeitar os limites definidos no plano contratado: espaço de
                  armazenamento, número de usuários, volume de requisições à API e outros recursos.
                </p>
              </LegalSubsection>
            </LegalSection>

            <LegalSection title="5. Propriedade Intelectual" index={5}>
              <LegalSubsection title="5.1 Nossa Propriedade">
                <p>
                  Todo o código-fonte, design, logotipos, textos e conteúdo da plataforma são
                  propriedade exclusiva da {LEGAL.companyName} e estão protegidos por leis de
                  direitos autorais.
                </p>
              </LegalSubsection>

              <LegalSubsection title="5.2 Sua Propriedade">
                <p>
                  Arquivos, briefings, documentos e conteúdo enviado por você continua sendo de sua
                  propriedade. Você concede à {LEGAL.companyName} uma licença limitada para usar
                  esse conteúdo exclusivamente para prestação dos serviços contratados.
                </p>
              </LegalSubsection>

              <LegalSubsection title="5.3 Dados Agregados">
                <p>
                  Podemos usar dados agregados e anonimizados (estatísticas de uso, padrões de
                  comportamento) para melhorar nossos serviços, desde que não identifiquem
                  indivíduos específicos.
                </p>
              </LegalSubsection>
            </LegalSection>

            <LegalSection title="6. Limitação de Responsabilidade" index={6}>
              <LegalSubsection title="6.1 'Como Está'">
                <p>
                  O serviço é fornecido 'como está' e 'conforme disponível'. Não garantimos que o
                  serviço será ininterrupto, seguro ou livre de erros.
                </p>
              </LegalSubsection>

              <LegalSubsection title="6.2 Exclusões">
                <LegalList>
                  <LegalListItem>
                    Não nos responsabilizamos por perda de dados causada por você
                  </LegalListItem>
                  <LegalListItem>Meta de uptime: 99.5%, sem garantia absoluta</LegalListItem>
                  <LegalListItem>
                    Você é responsável por manter backups dos seus dados
                  </LegalListItem>
                  <LegalListItem>Prejuízos indiretos não estão cobertos</LegalListItem>
                </LegalList>
              </LegalSubsection>

              <LegalHighlight>
                <strong>Importante:</strong> Recomendamos que você mantenha cópias de segurança de
                todos os dados importantes enviados à plataforma.
              </LegalHighlight>
            </LegalSection>

            <LegalSection title="7. Cancelamento e Rescisão" index={7}>
              <LegalSubsection title="7.1 Pelo Cliente">
                <p>
                  Você pode cancelar sua conta a qualquer momento através de{' '}
                  <strong>Configurações da Conta</strong>. Seus dados serão tratados conforme nossa{' '}
                  <a href="/politica-privacidade" className="text-accent-primary hover:underline">
                    Política de Privacidade
                  </a>
                  .
                </p>
              </LegalSubsection>

              <LegalSubsection title="7.2 Por Nós">
                <p>
                  Podemos suspender ou encerrar contas que violem estes termos, com aviso prévio de
                  7 dias, exceto em casos de violação grave (fraude, atividades ilegais) onde a
                  suspensão pode ser imediata.
                </p>
              </LegalSubsection>

              <LegalSubsection title="7.3 Efeitos do Cancelamento">
                <p>
                  Após o cancelamento, você perderá acesso aos dados na plataforma. Recomendamos
                  fazer backup antes de cancelar. Certos dados podem ser retidos conforme obrigações
                  legais.
                </p>
              </LegalSubsection>
            </LegalSection>

            <LegalSection title="8. Modificações nos Termos" index={8}>
              <p>
                Podemos alterar estes termos a qualquer momento. Alterações significativas serão
                notificadas por email com 30 dias de antecedência. O uso continuado após o período
                de notificação constitui aceitação dos novos termos.
              </p>
            </LegalSection>

            <LegalSection title="9. Lei Aplicável e Foro" index={9}>
              <p>
                Estes termos são regidos pelas leis da República Federativa do Brasil. Para resolver
                quaisquer disputas, fica eleito o foro da comarca de São Paulo/SP, com exclusão de
                qualquer outro, por mais privilegiado que seja.
              </p>
            </LegalSection>

            <LegalSection title="10. Contato" index={10}>
              <p>
                Para dúvidas sobre estes termos ou qualquer outro assunto, entre em contato conosco:
              </p>

              <LegalHighlight>
                <strong>Email Geral:</strong> {LEGAL.companyEmail}
                <br />
                <strong>DPO:</strong> {LEGAL.dpoEmail}
                <br />
                <strong>Site:</strong> {LEGAL.siteUrl}
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
