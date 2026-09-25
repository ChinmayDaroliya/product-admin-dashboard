'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

const navItems = [
  { href: '/products', label: 'Products', icon: BoxIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile top bar + slide-down nav */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-2 text-ink-700 hover:bg-bg lg:hidden"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav"
              aria-label="Toggle navigation menu"
            >
              <MenuIcon />
            </button>
            <span className="text-sm font-semibold text-ink-900 lg:hidden">Product Admin</span>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden text-sm text-ink-500 sm:inline">
                {user.firstName} {user.lastName}
              </span>
            )}
            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </div>
        </header>

        {mobileNavOpen && (
          <nav id="mobile-nav" className="border-b border-border bg-surface px-4 py-2 lg:hidden">
            <SidebarLinks pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
          </nav>
        )}

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <>
      <div className="flex items-center gap-2 border-b border-border px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-white">
          <BoxIcon className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-ink-900">Product Admin</span>
      </div>
      <nav className="flex-1 px-3 py-4">
        <SidebarLinks pathname={pathname} />
      </nav>
    </>
  );
}

function SidebarLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active ? 'bg-accent-soft text-accent-hover' : 'text-ink-700 hover:bg-bg'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function BoxIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
