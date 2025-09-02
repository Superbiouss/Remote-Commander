/**
 * @fileoverview This is the root layout file for the Next.js application.
 * It wraps all pages and is the place to include global styles, providers, and metadata.
 * Any component included here will be present on every page of the application.
 */
import type {Metadata} from 'next';
import './globals.css';
import {ThemeProvider} from '@/components/providers/theme-provider';
import {Toaster} from '@/components/ui/toaster';

/**
 * Metadata object for the application.
 * This information is used for SEO and for the browser tab title.
 */
export const metadata: Metadata = {
  title: 'Remote Commander',
  description: 'Launch your laptop apps from your phone.',
};

/**
 * The RootLayout component.
 * @param children - The page content that will be rendered inside this layout.
 * This is automatically passed by Next.js.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for performance. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* The Inter font is used throughout the application. */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {/* The ThemeProvider handles light and dark mode for the application. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* The main content of the current page is rendered here. */}
          {children}
          {/* The Toaster component is responsible for displaying all toast notifications. */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
