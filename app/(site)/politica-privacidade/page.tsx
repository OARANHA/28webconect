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

export const metadata = generateMetadata({
  title: 'Política de Privacidade',
  description:
    'Política de Privacidade e proteção de dados da 28Web Connect. Conformidade com a LGPD.',
  path: 'politica-privacidade',
  keywords: [
    'política de privacidade',
    'LGPD',
    'proteção de dados',
    'privacidade',
    'dados pessoais',
    'direitos do titular',
    '28Web Connect',
  ],
});

export default function PoliticaPrivacidadePage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-8 pb-12 md:pt-16 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-white mb-4">
              Política de <span className="text-accent-primary">Privacidade</span>
            </h1>
            <p className="text-neutral-gray">Última atualização: {LEGAL.lastUpdated}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LegalText>
            <LegalSection title="1. Identificação do Controlador" index={1}>
              <p>
                <strong>{LEGAL.companyName}</strong> é a controladora dos dados pessoais coletados
                através desta plataforma. Somos responsáveis por garantir a proteção e privacidade
                das informações dos nossos usuários.
              </p>
              <LegalHighlight>
                <strong>Dados de Contato:</strong>
                <br />
                Email: {LEGAL.companyEmail}
                <br />
                DPO (Encarregado de Dados): {LEGAL.dpoEmail}
              </LegalHighlight>
            </LegalSection>

            <LegalSection title="2. Dados Coletados e Finalidades" index={2}>
              <LegalSubsection title="2.1 Dados Essenciais (Base Legal: Execução de Contrato)">
                <p>Coletamos os seguintes dados para criar e gerenciar sua conta:</p>
                <LegalList>
                  <LegalListItem>
                    <strong>Nome completo:</strong> identificação do usuário
                  </LegalListItem>
                  <LegalListItem>
                    <strong>Email:</strong> login, comunicação e notificações
                  </LegalListItem>
                  <LegalListItem>
                    <strong>Senha (criptografada):</strong> autenticação segura
                  </LegalListItem>
                  <LegalListItem>
                    <strong>Telefone (opcional):</strong> contato para suporte
                  </LegalListItem>
                  <LegalListItem>
                    <strong>Empresa (opcional):</strong> personalização do serviço
                  </LegalListItem>
                </LegalList>
              </LegalSubsection>

              <LegalSubsection title="2.2 Dados Opcionais (Base Legal: Consentimento)">
                <p>Com seu consentimento explícito, podemos coletar:</p>
                <LegalList>
                  <LegalListItem>
                    <strong>CNPJ:</strong> para emissão de notas fiscais
                  </LegalListItem>
                  <LegalListItem>
                    <strong>Cargo:</strong> personalização de comunicações
                  </LegalListItem>
                  <LegalListItem>
                    <strong>Preferências de comunicação:</strong> marketing
                  </LegalListItem>
                  <LegalListItem>
                    <strong>Dados de analytics:</strong> uso do site (anonimizados)
                  </LegalListItem>
                </LegalList>
              </LegalSubsection>

              <LegalSubsection title="2.3 Dados Gerados pelo Uso">
                <p>Durante a utilização da plataforma, geramos automaticamente:</p>
                <LegalList>
                  <LegalListItem>Logs de acesso (IP, horário, páginas visitadas)</LegalListItem>
                  <LegalListItem>Histórico de conversas com chat IA</LegalListItem>
                  <LegalListItem>Arquivos enviados para projetos</LegalListItem>
                  <LegalListItem>Histórico de briefings e propostas</LegalListItem>
                </LegalList>
              </LegalSubsection>
            </LegalSection>

            <LegalSection title="3. Bases Legais para Tratamento" index={3}>
              <p>Em conformidade com a LGPD, processamos dados nas seguintes bases:</p>

              <LegalSubsection title="3.1 Execução de Contrato (Art. 7º, V)">
                <p>
                  Dados necessários para criar sua conta, gerenciar projetos, comunicar-se sobre
                  entregas e fornecer suporte técnico.
                </p>
              </LegalSubsection>

              <LegalSubsection title="3.2 Consentimento (Art. 7º, I)">
                <p>
                  Marketing, envio de newsletters, analytics detalhados e cookies não essenciais.
                  Você pode revogar este consentimento a qualquer momento.
                </p>
              </LegalSubsection>

              <LegalSubsection title="3.3 Legítimo Interesse (Art. 7º, IX)">
                <p>
                  Segurança da plataforma, prevenção de fraudes, melhorias no serviço baseadas em
                  uso agregado e anônimo.
                </p>
              </LegalSubsection>
            </LegalSection>

            <LegalSection title="4. Compartilhamento com Terceiros" index={4}>
              <p>Seus dados podem ser compartilhados com:</p>

              <LegalList>
                <LegalListItem>
                  <strong>Mailgun:</strong> envio de emails transacionais. Dados: email, nome.
                  Localização: EUA (com cláusulas contratuais padrão de proteção de dados).
                </LegalListItem>
                <LegalListItem>
                  <strong>Umami Analytics:</strong> métricas de uso (self-hosted, dados
                  anonimizados). Localização: VPS Contabo (Brasil/Europa).
                </LegalListItem>
                <LegalListItem>
                  <strong>Mistral AI:</strong> processamento de conversas do chat IA. Localização:
                  Europa (GDPR compliant).
                </LegalListItem>
                <LegalListItem>
                  <strong>Contabo:</strong> hospedagem e VPS. Localização: Alemanha (GDPR
                  compliant).
                </LegalListItem>
              </LegalList>

              <LegalHighlight>
                <strong>Importante:</strong> Nunca vendemos seus dados. O compartilhamento ocorre
                apenas conforme necessário para prestação dos serviços.
              </LegalHighlight>
            </LegalSection>

            <LegalSection title="5. Seus Direitos (Art. 18, LGPD)" index={5}>
              <p>Como titular dos dados, você tem os seguintes direitos:</p>

              <LegalList>
                <LegalListItem>
                  <strong>Confirmação:</strong> saber se seus dados estão sendo tratados
                </LegalListItem>
                <LegalListItem>
                  <strong>Acesso:</strong> obter cópia dos seus dados
                </LegalListItem>
                <LegalListItem>
                  <strong>Correção:</strong> corrigir dados incompletos ou desatualizados
                </LegalListItem>
                <LegalListItem>
                  <strong>Portabilidade:</strong> transferir dados para outro serviço
                </LegalListItem>
                <LegalListItem>
                  <strong>Exclusão:</strong> solicitar a eliminação dos dados
                </LegalListItem>
              </LegalList>

              <LegalSubsection title="Como Exercer Seus Direitos">
                <p>
                  A maioria dos direitos pode ser exercida diretamente em{' '}
                  <strong>Configurações da Conta</strong>. Para solicitações complexas, envie email
                  para {LEGAL.dpoEmail} com assunto "Exercício de Direito LGPD". Responderemos em
                  até 15 dias úteis.
                </p>
              </LegalSubsection>
            </LegalSection>

            <LegalSection title="6. Retenção e Exclusão de Dados" index={6}>
              <LegalSubsection title="6.1 Clientes Ativos">
                <p>
                  Mantemos seus dados enquanto sua conta estiver ativa. Você pode solicitar a
                  exclusão a qualquer momento.
                </p>
              </LegalSubsection>

              <LegalSubsection title="6.2 Clientes Inativos">
                <p>
                  Após 11 meses de inatividade, enviamos um aviso. Após 12 meses, seus dados serão
                  excluídos ou anonimizados, exceto quando houver obrigação legal de retenção.
                </p>
              </LegalSubsection>

              <LegalSubsection title="6.3 Outras Retenções">
                <LegalList>
                  <LegalListItem>Briefings não convertidos: 2 anos → anonimização</LegalListItem>
                  <LegalListItem>Logs de segurança: 6 meses → exclusão</LegalListItem>
                  <LegalListItem>Dados financeiros: 5 anos (obrigação legal fiscal)</LegalListItem>
                </LegalList>
              </LegalSubsection>
            </LegalSection>

            <LegalSection title="7. Medidas de Segurança" index={7}>
              <LegalSubsection title="7.1 Medidas Técnicas">
                <LegalList>
                  <LegalListItem>Comunicação criptografada via HTTPS/TLS</LegalListItem>
                  <LegalListItem>Senhas armazenadas com bcrypt (hash + salt)</LegalListItem>
                  <LegalListItem>Backups automatizados e criptografados</LegalListItem>
                  <LegalListItem>Firewall e proteção contra ataques</LegalListItem>
                  <LegalListItem>Autenticação de dois fatores (2FA) opcional</LegalListItem>
                </LegalList>
              </LegalSubsection>

              <LegalSubsection title="7.2 Medidas Administrativas">
                <LegalList>
                  <LegalListItem>Controle de acesso baseado em papéis (RBAC)</LegalListItem>
                  <LegalListItem>Logs de auditoria de acessos</LegalListItem>
                  <LegalListItem>Treinamento da equipe em LGPD</LegalListItem>
                  <LegalListItem>Confidencialidade contratual</LegalListItem>
                </LegalList>
              </LegalSubsection>
            </LegalSection>

            <LegalSection title="8. Uso de Cookies" index={8}>
              <p>
                Utilizamos cookies para melhorar sua experiência. Para mais detalhes, consulte nossa{' '}
                <a href="/politica-cookies" className="text-accent-primary hover:underline">
                  Política de Cookies
                </a>
                .
              </p>

              <LegalHighlight>
                Você pode gerenciar suas preferências de cookies através do banner que aparece na
                primeira visita ou nas configurações do site.
              </LegalHighlight>
            </LegalSection>

            <LegalSection title="9. Alterações nesta Política" index={9}>
              <p>
                Podemos atualizar esta política periodicamente. Alterações significativas serão
                notificadas por email e exigirão novo consentimento quando aplicável. A data da
                última atualização está sempre visível no topo desta página.
              </p>
            </LegalSection>

            <LegalSection title="10. Contato do DPO" index={10}>
              <p>
                Para questões sobre proteção de dados, exercício de direitos ou reclamações, entre
                em contato com nosso Encarregado de Dados:
              </p>

              <LegalHighlight>
                <strong>Email:</strong> {LEGAL.dpoEmail}
                <br />
                <strong>Responsabilidades:</strong>
                <br />
                • Aceitar reclamações e comunicações dos titulares
                <br />
                • Prestar esclarecimentos e orientações
                <br />
                • Comunicação com a ANPD quando necessário
                <br />• Responder em até 15 dias úteis
              </LegalHighlight>
            </LegalSection>

            {/* CTA para Download de Dados */}
            <div className="mt-12 animate-fade-in">
              <LegalHighlight>
                <h3 className="text-xl font-bold text-neutral-white mb-3">
                  📥 Download dos Seus Dados
                </h3>
                <p className="text-neutral-gray mb-4">
                  Conforme seu direito de portabilidade (Art. 18, VI, LGPD), você pode baixar uma
                  cópia de todos os seus dados pessoais armazenados em nossa plataforma.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="/dashboard/configuracoes/privacidade"
                    className="inline-flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-secondary text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Acessar Configurações de Privacidade
                  </a>
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 border border-neutral-gray/30 hover:border-accent-primary text-neutral-light hover:text-accent-primary px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Fazer Login
                  </a>
                </div>
                <p className="text-sm text-neutral-gray mt-4">
                  Não tem uma conta?{' '}
                  <a href="/cadastro" className="text-accent-primary hover:underline">
                    Cadastre-se aqui
                  </a>
                  .
                </p>
              </LegalHighlight>
            </div>
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
