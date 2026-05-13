'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Mail, Shield, ArrowLeft, LogOut } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Skeleton from '@/components/ui/Skeleton';

export default function AdminProfilePage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const user = session?.user;
  const name = user?.name ?? 'Admin';
  const email = user?.email ?? '';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Perfil do administrador"
        description="Dados da sua conta de administrador da plataforma."
      />

      <Card padding="lg">
        <div className="flex items-center gap-4 pb-5 border-b border-neutral-200">
          {loading ? (
            <Skeleton width={56} height={56} rounded="full" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-primary-600 text-white flex items-center justify-center text-base font-semibold">
              {initials || 'A'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-base font-semibold text-neutral-900">
              {loading ? <Skeleton width={140} height={18} /> : name}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium text-primary-700 bg-primary-50 ring-1 ring-inset ring-primary-200 rounded-full px-2 py-0.5">
              <Shield className="w-3 h-3" />
              Acesso total à área administrativa
            </p>
          </div>
        </div>

        <dl className="mt-6 space-y-5">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-neutral-400 mt-0.5" />
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                E-mail
              </dt>
              <dd className="mt-0.5 text-sm text-neutral-800 break-all">
                {loading ? <Skeleton width={200} height={14} /> : email || '—'}
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-6 pt-5 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800 focus-ring rounded-md">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao dashboard
          </Link>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<LogOut className="w-4 h-4" />}
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Sair
          </Button>
        </div>
      </Card>
    </div>
  );
}
