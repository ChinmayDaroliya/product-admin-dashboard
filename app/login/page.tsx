import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path
                d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-ink-900">Product Admin Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to manage your catalog.</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
          <LoginForm />
        </div>

        <p className="mt-4 text-center text-xs text-ink-300">
          Demo credentials: <span className="font-mono text-ink-500">emilys</span> /{' '}
          <span className="font-mono text-ink-500">emilyspass</span>
        </p>
      </div>
    </div>
  );
}
