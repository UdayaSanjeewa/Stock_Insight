'use client';

import { useAuth } from '@/contexts/AuthContext';
import { StockCityDashboard } from '@/components/StockCityDashboard';
import { LandingPage } from '@/components/LandingPage';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <main className="min-h-screen">
      <StockCityDashboard />
    </main>
  );
}