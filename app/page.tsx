import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

export default function RootPage() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  redirect(token ? '/products' : '/login');
}
