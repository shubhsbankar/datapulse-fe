"use client";

import { MainLayout } from '@/components/layout/MainLayout';
import { store, persistor } from '@/store/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning={true} lang="en">
      <body>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <MainLayout>{children}</MainLayout>
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
