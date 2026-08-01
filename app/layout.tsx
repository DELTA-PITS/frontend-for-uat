import { auth } from '@/auth';
import { Header } from '@components/layout/Header';
import { LocaleProvider } from '@lib/i18n/LocaleContext';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import "@styles/globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default async function RootLayout({ children }: { readonly children: React.ReactNode }) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`h-full antialiased ${jakarta.variable} ${inter.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider>
          <Header session={session} />
          <main className="flex-1 flex items-center justify-center">
            {children}
          </main>
          <footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
