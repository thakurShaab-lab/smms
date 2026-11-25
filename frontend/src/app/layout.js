import './globals.css';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/context/QueryProvider';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Student Media Management System',
  description: 'AI-powered student media management'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
