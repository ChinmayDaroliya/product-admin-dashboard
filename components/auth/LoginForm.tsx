'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface FieldErrors {
  username?: string;
  password?: string;
}

export function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!username.trim()) errors.username = 'Username is required.';
    if (!password) errors.password = 'Password is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // `isLoggingIn` already disables the button, but this guard also blocks
    // a form submission triggered by pressing Enter multiple times fast.
    if (isLoggingIn) return;
    if (!validate()) return;
    try {
      await login(username, password);
    } catch {
      // loginError from context already surfaces the message; nothing else to do.
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Username"
        name="username"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={fieldErrors.username}
        placeholder="emilys"
        disabled={isLoggingIn}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        placeholder="••••••••"
        disabled={isLoggingIn}
      />

      {loginError && (
        <p role="alert" className="rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger">
          {loginError}
        </p>
      )}

      <Button type="submit" isLoading={isLoggingIn} className="mt-1 w-full">
        {isLoggingIn ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
