import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { Providers } from './providers';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Upscalor - AI Image Upscaling',
  description: 'Enhance your images with AI-powered upscaling technology',
};

// Add a style block to ensure the header has a background before JS loads
const headerStyle = `
  header {
    background-color: rgba(17, 24, 39, 0.8);
    backdrop-filter: blur(8px);
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <style>{headerStyle}</style>
      </head>
      <body className={`${poppins.variable} font-sans bg-gray-950 text-white antialiased overflow-x-hidden`} suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            <Header />
            <main className="pt-20 md:pt-24">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
} 