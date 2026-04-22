import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Umurava | AI Recruiter Dashboard',
  description: 'Enterprise AI Candidate Evaluation Pipeline',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans bg-slate-50 flex h-screen overflow-hidden`}>
        <Sidebar />
        <main className="flex-1 max-h-screen overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
