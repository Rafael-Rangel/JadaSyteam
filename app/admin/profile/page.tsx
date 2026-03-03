'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import { User, Mail, Shield } from 'lucide-react';

export default function AdminProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header userType="admin" userName="Admin" />
        <main className="flex-grow py-8 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Carregando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const user = session?.user;
  const name = user?.name ?? 'Admin';
  const email = user?.email ?? '';

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="admin" userName={name} />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Perfil do administrador</h1>
            <p className="text-gray-600 mt-1">Dados da sua conta de administrador da plataforma.</p>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Administrador</p>
                <p className="text-sm text-gray-500">Acesso total à área administrativa</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="text-gray-900">{name || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">E-mail</p>
                  <p className="text-gray-900">{email || '—'}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link
                href="/admin/dashboard"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                ← Voltar ao dashboard
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
