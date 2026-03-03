'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Lock, CheckCircle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError('Link inválido ou expirado.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Não foi possível redefinir a senha.');
        setIsLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card>
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">Link inválido ou expirado. Solicite um novo na página Esqueci minha senha.</p>
          <Link href="/forgot-password">
            <Button>Solicitar novo link</Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (success) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Senha alterada!</h2>
          <p className="text-gray-600 mb-6">Faça login com sua nova senha.</p>
          <Link href="/login">
            <Button>Ir para o Login</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nova senha</h1>
        <p className="text-gray-600">Digite e confirme sua nova senha.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-800 text-sm">
            {error}
          </div>
        )}
        <Input
          label="Nova senha"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <Input
          label="Confirmar nova senha"
          type="password"
          placeholder="Repita a senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />
        <Button type="submit" isLoading={isLoading} className="w-full">
          Redefinir senha
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-primary-600 hover:text-primary-700">
          Voltar para o login
        </Link>
      </div>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow py-12 bg-gray-50 flex items-center">
        <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<Card><p className="py-8 text-center text-gray-600">Carregando...</p></Card>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
