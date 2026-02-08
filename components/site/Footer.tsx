'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LEGAL } from '@/lib/constants';

const socialLinks = [
  {
    href: 'https://facebook.com',
    label: 'Facebook',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    href: 'https://instagram.com',
    label: 'Instagram',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
      </svg>
    ),
  },
  {
    href: 'https://linkedin.com',
    label: 'LinkedIn',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

const serviceLinks = [
  { href: '/servicos/erp', label: 'Sistemas ERP' },
  { href: '/servicos/ecommerce', label: 'E-commerce' },
  { href: '/servicos/landing', label: 'Landing Pages' },
  { href: '/servicos/ia', label: 'Agentes de IA' },
  { href: '/servicos/social', label: 'Social Media' },
];

const companyLinks = [
  { href: '/sobre', label: 'Sobre Nós' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contato', label: 'Contato' },
  { href: '/blog', label: 'Blog' },
  { href: '/portfolio', label: 'Portfólio' },
];

const legalLinks = [
  { href: '/politica-privacidade', label: 'Política de Privacidade' },
  { href: '/termos-uso', label: 'Termos de Uso' },
  { href: '/politica-cookies', label: 'Política de Cookies' },
];

/**
 * Footer com links organizados e informações de contato
 * Otimizado com prefetch=false para links de baixa prioridade
 */
export default function Footer() {
  return (
    <footer className="bg-dark-bg-secondary border-t border-neutral-gray/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Coluna 1 - Sobre */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/28connect.jpg"
                  alt="28Web Connect"
                  width={32}
                  height={32}
                  className="rounded-lg"
                  sizes="32px"
                />
                <span className="font-bold text-neutral-white">28Web Connect</span>
              </div>
              <p className="text-sm text-neutral-gray leading-relaxed">
                Especialistas em transformar ideias em soluções digitais. Desenvolvimento web, ERP,
                e-commerce e inteligência artificial.
              </p>
              <div className="flex items-center gap-4 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-neutral-gray hover:text-accent-primary transition-colors"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Coluna 2 - Serviços - prefetch false */}
            <div>
              <h3 className="font-semibold text-neutral-white mb-4">Serviços</h3>
              <ul className="space-y-3">
                {serviceLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className="text-sm text-neutral-gray hover:text-accent-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coluna 3 - Empresa - prefetch false */}
            <div>
              <h3 className="font-semibold text-neutral-white mb-4">Empresa</h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className="text-sm text-neutral-gray hover:text-accent-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coluna 4 - Legal - prefetch false */}
            <div>
              <h3 className="font-semibold text-neutral-white mb-4">Legal</h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className="text-sm text-neutral-gray hover:text-accent-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-neutral-gray/10">
                <p className="text-sm text-neutral-gray">
                  <span className="font-medium">DPO:</span>
                  <br />
                  <a
                    href={`mailto:${LEGAL.dpoEmail}`}
                    className="hover:text-accent-primary transition-colors"
                  >
                    {LEGAL.dpoEmail}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-neutral-gray/10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="text-center text-sm text-neutral-gray">
              © {new Date().getFullYear()} 28Web Connect. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
