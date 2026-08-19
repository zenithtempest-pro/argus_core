import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export const metadata: Metadata = {
  title: 'ArgusCore | Network Diagnostics & OSINT Platform',
  description: 'Enterprise MXToolbox-style network diagnostic suite, blocklist checker, MX lookup, DMARC analyzer, and OSINT Python script repository.',
  keywords: ['MX Lookup', 'Blacklist Check', 'DMARC', 'SuperTool', 'OSINT', 'Email Header Analyzer', 'ArgusCore'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-white dark:bg-[#090d16] text-argus-900 dark:text-slate-100 font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
