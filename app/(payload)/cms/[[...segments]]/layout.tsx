export const metadata = {
  title: 'CMS Admin | 28Web Connect',
  description: 'Painel administrativo do Payload CMS',
};

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  // Return minimal layout - the page component handles the actual rendering
  return <>{children}</>;
}
