import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export const metadata: Metadata = {
  title: 'CMS Admin | 28Web Connect',
  robots: {
    index: false,
    follow: false,
  },
};

// Payload admin page component - renders Payload admin UI
export default async function PayloadAdminPage({ params }: { params: { segments?: string[] } }) {
  // Check authentication
  const session = await auth();

  if (!session?.user) {
    return (
      <html lang="pt-BR">
        <head>
          <meta httpEquiv="refresh" content={`0;url=/login?callbackUrl=/cms`} />
          <title>Redirecting...</title>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.location.href = "/login?callbackUrl=/cms";`,
            }}
          />
          <style>{`
          body {
            background: #0a0a0a;
            color: #fff;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
          }
          .loading {
            text-align: center;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #333;
            border-top-color: #ff6b35;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        </head>
        <body>
          <div className="loading">
            <div className="spinner" />
            <p>Redirecionando para login...</p>
          </div>
        </body>
      </html>
    );
  }

  // Check role - only ADMIN or SUPER_ADMIN can access
  const userRole = session.user.role;
  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    return (
      <html lang="pt-BR">
        <head>
          <meta httpEquiv="refresh" content="0;url=/" />
          <title>Acesso Negado</title>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.location.href = "/";`,
            }}
          />
        </head>
        <body
          style={{
            background: '#0a0a0a',
            color: '#fff',
            fontFamily: 'system-ui, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            margin: 0,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p>Acesso negado. Redirecionando...</p>
          </div>
        </body>
      </html>
    );
  }

  // Initialize Payload and generate admin HTML
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    // Generate the admin HTML
    const adminHTML = await payload.generateAdminHTML();

    // Return the admin HTML with proper headers
    return (
      <html lang="pt-BR">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>CMS Admin | 28Web Connect</title>
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body style={{ margin: 0, padding: 0 }}>
          <div id="payload-admin" dangerouslySetInnerHTML={{ __html: adminHTML }} />
        </body>
      </html>
    );
  } catch (error) {
    console.error('Error generating Payload admin:', error);
    notFound();
  }
}

// Generate static params for all admin routes
export async function generateStaticParams() {
  return [{ segments: [] }];
}
