'use client';

import './globals.css';
import { AppProvider, useApp } from '@/data/store';
import { usePathname } from 'next/navigation';

function ThemeWrapper({ children }) {
  const { theme, isLoaded } = useApp();
  const pathname = usePathname();
  
  // Splash (/), login, register, and add-child pages always use the default neutral theme at root level.
  // Add-child will handle its own boy/girl preview selection theme locally.
  const isNeutralPage = pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/add-child';
  const activeTheme = isNeutralPage ? 'default' : theme;

  if (!isLoaded) {
    // Render neutral pages immediately without a brief blank loader flash
    if (isNeutralPage) {
      return (
        <div data-theme="default">
          {children}
        </div>
      );
    }

    return (
      <div data-theme="default" style={{ 
        minHeight: '100vh', 
        background: '#FAF5F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          border: '3px solid #FEEFE6',
          borderTopColor: '#8F2318',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div data-theme={activeTheme}>
      {children}
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="description" content="FirstYears — Digital Child Vaccination Record & Reminder. Never miss a vaccine, never lose a record." />
        <title>FirstYears — Digital Vaccination Record</title>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="shortcut icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>
        <AppProvider>
          <ThemeWrapper>
            {children}
          </ThemeWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
