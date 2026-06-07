import { BrowserRouter, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthContext';
import Header from './components/Header';
import AppRoutes from './routes';
import { gaPageView } from './analytics/gtag';

function AnalyticsListener() {
  const { pathname } = useLocation();

  useEffect(() => {
    gaPageView(pathname);
  }, [pathname]);

  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <BrowserRouter>
      <AnalyticsListener />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
              <AppRoutes />
            </main>
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
