'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 503 && data.error) {
        setError('Recuperação de senha temporariamente indisponível. Entre em contato pelo e-mail contato@jada.com.br.');
        setIsLoading(false);
        return;
      }
      if (res.status >= 400 && data.error) {
        setError(data.error);
        setIsLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-12 bg-gray-50 flex items-center">
          <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">E-mail enviado!</h2>
                <p className="text-gray-600 mb-6">
                  Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha. Verifique a caixa de entrada e o spam.
                </p>
                <Link href="/login">
                  <Button>Voltar para o Login</Button>
                </Link>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow py-12 bg-gray-50 flex items-center">
        <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-primary-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Esqueceu sua senha?</h1>
              <p className="text-gray-600">
                Informe seu e-mail e enviaremos um link para redefinir sua senha (válido por 1 hora).
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-800 text-sm">
                  {error}
                </div>
              )}
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" isLoading={isLoading} className="w-full">
                Enviar link de recuperação
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-primary-600 hover:text-primary-700">
                Voltar para o login
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
