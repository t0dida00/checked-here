import type { Metadata } from 'next';
import 'mapbox-gl/dist/mapbox-gl.css';
import './globals.scss';
import QueryProvider from '@/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'Globe View',
  description:
    'Interactive 3-D globe with dark and light mode, country hover highlighting, and rotation controls.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <a href="#globe-main" className="skip-link">
          Skip to globe
        </a>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
