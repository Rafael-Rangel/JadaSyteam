'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react';

const FORMSUBMIT_EMAIL = 'contato@jada.com.br';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          _subject: formData.subject || 'Contato pelo site JADA',
          message: formData.message,
        }),
      });
      const data = await res.json();
      if (data.success === 'true' || res.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setError('Não foi possível enviar. Tente novamente ou envie um e-mail para contato@jada.com.br.');
      }
    } catch {
      setError('Erro ao enviar. Verifique sua conexão ou envie um e-mail para contato@jada.com.br.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Entre em Contato</h1>
            <p className="text-xl text-gray-600">Estamos aqui para ajudar você</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">E-mail</h3>
                  <a href="mailto:contato@jada.com.br" className="text-primary-600 hover:text-primary-700">
                    contato@jada.com.br
                  </a>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Telefone</h3>
                  <a href="tel:+5511999999999" className="text-primary-600 hover:text-primary-700">
                    (11) 99999-9999
                  </a>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Mensagem enviada!</h2>
                <p className="text-gray-600 mb-6">
                  Obrigado pelo contato. Entraremos em contato em breve.
                </p>
                <Button onClick={() => setSuccess(false)} variant="outline">
                  Enviar outra mensagem
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-800 text-sm">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="E-mail"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <Input
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <Input
                  label="Assunto"
                  placeholder="Como podemos ajudar?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem <span className="text-danger-500">*</span>
                  </label>
                  <textarea
                    className="input min-h-[150px] resize-none"
                    placeholder="Sua mensagem..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" isLoading={isLoading} className="w-full">
                  <MessageSquare className="w-5 h-5 mr-2 inline" />
                  Enviar mensagem
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
