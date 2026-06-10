import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold text-slate-900">Dashboard</span>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome, {user?.name}
          </h1>
          <p className="mt-2 text-slate-500">
            You are signed in as{' '}
            <span className="font-medium text-slate-700">{user?.email}</span>.
            This page is protected by a JWT-guarded API endpoint.
          </p>
        </div>
      </main>
    </div>
  );
}
