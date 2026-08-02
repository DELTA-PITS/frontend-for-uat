import { auth } from '@/auth';
import { Header } from '@components/layout/Header';
import BfcacheRefresh from '@components/layout/BfcacheRefresh';
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
          <BfcacheRefresh />
          <Header session={session} />
          {/* Plain flex-col, not `items-center justify-center` — that would
              force every page to be vertically centered like a landing-page
              card. Pages that want centering (Verify/Register upload card,
              ResultView) already do it themselves via `mx-auto my-auto`,
              which still works here (flex-item auto margins absorb free
              space regardless of the parent's align-items/justify-content).
              Content-heavy top-anchored pages (Dashboard) render normally
              instead of floating in the middle of a tall viewport when
              their content is short (e.g. an error/empty state). */}
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
