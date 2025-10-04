import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CaseManager - AI-Powered Analytics',
  description: 'Advanced case management with AI analytics and insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <main className="flex-1 lg:ml-64">
            <div className="min-h-screen">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}