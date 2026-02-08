import type { Metadata } from 'next';
import Section from '@/components/ui/Section';
import ContactForm from '@/components/site/ContactForm';
import EventTracker from '@/components/analytics/EventTracker';
import Card from '@/components/ui/Card';
import StructuredData, { createOrganizationSchema } from '@/components/seo/StructuredData';
import { generateMetadata } from '@/lib/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://28webconnect.com';
const companyEmail = process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'contato@28webconnect.com';
const dpoEmail = process.env.NEXT_PUBLIC_DPO_EMAIL || 'seuemail@28webconnect.com';

export const metadata: Metadata = generateMetadata({
  title: 'Contato',
  description:
    'Entre em contato conosco. Tire suas dúvidas, solicite uma proposta ou inicie seu projeto. Atendimento em até 24 horas.',
  path: 'contato',
  keywords: ['contato', 'fale conosco', 'email', 'telefone', 'suporte', '28Web Connect'],
  type: 'website',
});

const contactInfo = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    title: 'Email',
    content: companyEmail,
    href: `mailto:${companyEmail}`,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    ),
    title: 'Telefone',
    content: '(11) 99999-9999',
    href: 'tel:+5511999999999',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: 'Horário de Atendimento',
    content: 'Seg - Sex: 9h às 18h',
    href: null,
  },
];

const socialLinks = [
  {
    name: 'Facebook',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    href: 'https://facebook.com/28webconnect',
  },
  {
    name: 'Instagram',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
      </svg>
    ),
    href: 'https://instagram.com/28webconnect',
  },
  {
    name: 'LinkedIn',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    href: 'https://linkedin.com/company/28webconnect',
  },
];

export default function ContatoPage() {
  return (
    <>
      <EventTracker event="pagina_contato_aberta" trigger="mount" />
      {/* JSON-LD Structured Data - Organization schema is already in root layout */}

      {/* Hero Section */}
      <section className="pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-white mb-6">
              Entre em{' '}
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                Contato
              </span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-gray">
              Tire suas dúvidas, solicite uma proposta ou inicie seu projeto. Estamos aqui para
              ajudar.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <Section className="py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Form Column */}
          <div className="animate-fade-in">
            <Card variant="default" className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-neutral-white mb-6">Envie uma Mensagem</h2>
              <ContactForm />
            </Card>
          </div>

          {/* Info Column */}
          <div className="space-y-8 animate-fade-in">
            {/* Contact Info Cards */}
            <div className="space-y-4">
              {contactInfo.map((info) => (
                <Card key={info.title} variant="elevated">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent-primary/20 rounded-xl flex items-center justify-center text-accent-primary flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-white">{info.title}</h3>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-neutral-gray hover:text-accent-primary transition-colors"
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-neutral-gray">{info.content}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <h3 className="font-semibold text-neutral-white mb-4">Siga-nos nas redes</h3>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="w-12 h-12 bg-dark-bg-secondary border border-neutral-gray/20 rounded-xl flex items-center justify-center text-neutral-gray hover:text-accent-primary hover:border-accent-primary transition-colors"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* DPO Info */}
            <div className="bg-dark-bg-secondary/50 rounded-xl p-6 border border-neutral-gray/10">
              <h3 className="font-semibold text-neutral-white mb-2">
                Data Protection Officer (DPO)
              </h3>
              <p className="text-sm text-neutral-gray mb-2">
                Para questões relacionadas à proteção de dados e LGPD:
              </p>
              <a
                href={`mailto:${dpoEmail}`}
                className="text-accent-primary hover:underline text-sm"
              >
                {dpoEmail}
              </a>
            </div>

            {/* Illustration */}
            <div className="relative">
              <div className="w-full aspect-video bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 rounded-2xl border-2 border-dashed border-accent-primary/30 flex items-center justify-center">
                <div className="text-8xl">📧</div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
