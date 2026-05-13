import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo.jpg"
                alt="JADA"
                width={140}
                height={48}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="mb-4 max-w-md text-neutral-400">
              Plataforma de cotação que conecta compradores e vendedores de forma inteligente e eficiente.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 transition-colors hover:text-primary-400">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 transition-colors hover:text-primary-400">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 transition-colors hover:text-primary-400">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/plans" className="hover:text-primary-400 transition-colors">
                  Planos
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-400 transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:contato@jada.com.br" className="hover:text-primary-400 transition-colors">
                  contato@jada.com.br
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+5511999999999" className="hover:text-primary-400 transition-colors">
                  (11) 99999-9999
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-800 pt-8 text-center text-sm text-neutral-400">
          <p>&copy; {new Date().getFullYear()} JADA - Service &amp; Support. Todos os direitos reservados.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-primary-400 transition-colors">
              Política de Privacidade
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-primary-400 transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}



