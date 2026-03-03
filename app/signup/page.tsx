'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';
import { Mail, Lock, User, Building, Phone, Eye, EyeOff, Check } from 'lucide-react';

type PlanOption = { id: string; slug: string; name: string; price: number };

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan') || 'starter';

  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<{
    companyName: string;
    cnpj: string;
    companyType: 'buyer' | 'seller' | 'both';
    ownerName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    plan: string;
    acceptTerms: boolean;
  }>({
    companyName: '',
    cnpj: '',
    companyType: 'both',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    plan: planParam,
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/plans')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((list: PlanOption[]) => {
        setPlans(list);
        const slugExists = list.some((p) => p.slug === planParam);
        if (slugExists && formData.plan === planParam) {
          setFormData((prev) => ({ ...prev, plan: planParam }));
        } else if (list.length > 0 && !list.some((p) => p.slug === formData.plan)) {
          setFormData((prev) => ({ ...prev, plan: list[0].slug }));
        }
        setPlansLoaded(true);
      })
      .catch(() => setPlansLoaded(true));
  }, []);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Nome da empresa é obrigatório';
    }
    const cnpjDigits = (formData.cnpj || '').replace(/\D/g, '');
    if (!formData.cnpj?.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (cnpjDigits.length !== 14) {
      newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
    }
    if (!formData.companyType) {
      newErrors.companyType = 'Selecione o tipo de empresa';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Nome é obrigatório';
    }
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      setErrors({ acceptTerms: 'Você deve aceitar os termos de uso' });
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          cnpj: formData.cnpj,
          companyType: formData.companyType,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          plan: formData.plan,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ email: data.error || 'Erro ao criar conta. Tente novamente.' });
        setIsLoading(false);
        return;
      }
      const signInRes = await signIn('credentials', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });
      if (signInRes?.error) {
        router.push('/login');
        return;
      }
      const dashboard = formData.companyType === 'seller' ? '/seller/dashboard' : '/buyer/dashboard';
      router.push(dashboard);
      router.refresh();
    } catch {
      setErrors({ email: 'Erro ao criar conta. Tente novamente.' });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <Link href="/">
              <Image src="/logo.jpg" alt="JADA" width={120} height={44} className="h-11 w-auto mx-auto" />
            </Link>
          </div>
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step > s ? <Check className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        step > s ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 space-x-16">
              <span className={`text-sm ${step === 1 ? 'font-semibold text-primary-600' : 'text-gray-600'}`}>
                Empresa
              </span>
              <span className={`text-sm ${step === 2 ? 'font-semibold text-primary-600' : 'text-gray-600'}`}>
                Responsável
              </span>
              <span className={`text-sm ${step === 3 ? 'font-semibold text-primary-600' : 'text-gray-600'}`}>
                Plano
              </span>
            </div>
          </div>

          <Card>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Company Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Informações da Empresa</h2>
                    <p className="text-gray-600">Preencha os dados da sua empresa</p>
                  </div>

                  <Input
                    label="Nome da Empresa"
                    placeholder="Minha Empresa Ltda"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    error={errors.companyName}
                    icon={<Building className="w-5 h-5" />}
                    required
                  />

                  <Input
                    label="CNPJ"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    error={errors.cnpj}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Empresa <span className="text-danger-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'buyer', label: 'Comprador' },
                        { value: 'seller', label: 'Vendedor' },
                        { value: 'both', label: 'Ambos' },
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, companyType: type.value as 'buyer' | 'seller' | 'both' })}
                          className={`p-4 border-2 rounded-lg text-center transition-all ${
                            formData.companyType === type.value
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                    {errors.companyType && (
                      <p className="mt-1 text-sm text-danger-600">{errors.companyType}</p>
                    )}
                  </div>

                  <Button type="button" onClick={handleNext} className="w-full">
                    Continuar
                  </Button>
                </div>
              )}

              {/* Step 2: Owner Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Dados do Responsável</h2>
                    <p className="text-gray-600">Informações do administrador da conta</p>
                  </div>

                  <Input
                    label="Nome Completo"
                    placeholder="João Silva"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    error={errors.ownerName}
                    icon={<User className="w-5 h-5" />}
                    required
                  />

                  <Input
                    label="E-mail"
                    type="email"
                    placeholder="joao@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    icon={<Mail className="w-5 h-5" />}
                    required
                  />

                  <Input
                    label="Telefone"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone}
                    icon={<Phone className="w-5 h-5" />}
                    required
                  />

                  <Input
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                    icon={<Lock className="w-5 h-5" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    }
                    required
                  />

                  <Input
                    label="Confirmar Senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                    icon={<Lock className="w-5 h-5" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    }
                    required
                  />

                  <div className="flex space-x-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Voltar
                    </Button>
                    <Button type="button" onClick={handleNext} className="flex-1">
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Plan Selection */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha seu Plano</h2>
                    <p className="text-gray-600">Selecione o plano que melhor se adapta à sua empresa</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {!plansLoaded ? (
                      <p className="text-gray-500 col-span-full">Carregando planos...</p>
                    ) : plans.length === 0 ? (
                      <p className="text-gray-500 col-span-full">Nenhum plano disponível no momento.</p>
                    ) : (
                      plans.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, plan: plan.slug })}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            formData.plan === plan.slug
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="font-semibold text-lg text-gray-900 mb-1">{plan.name}</div>
                          <div className="text-2xl font-bold text-primary-600 mb-2">
                            R$ {plan.price}
                            <span className="text-sm text-gray-600 font-normal">/mês</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      required
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                      Eu aceito os{' '}
                      <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                        Termos de Uso
                      </Link>{' '}
                      e a{' '}
                      <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                        Política de Privacidade
                      </Link>
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-sm text-danger-600">{errors.acceptTerms}</p>
                  )}

                  <div className="flex space-x-4">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Voltar
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="flex-1">
                      Finalizar Cadastro
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-12 bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto"><p className="text-gray-600">Carregando...</p></Card>
        </main>
        <Footer />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}

