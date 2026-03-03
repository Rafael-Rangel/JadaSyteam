/**
 * Cria a conta de administrador da plataforma (empresa sistema + usuário admin).
 * Uso: npm run create-admin
 * Credenciais são impressas no console e opcionalmente em admin-credentials.txt.
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

const ADMIN_EMAIL = 'admin@jada.com.br';
const ADMIN_NAME = 'Administrador';
const ADMIN_PASSWORD = 'JadaAdmin2025!';
const COMPANY_NAME = 'JADA Administração';

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    console.log('Já existe um usuário com o e-mail', ADMIN_EMAIL);
    console.log('Se for o admin, use "Esqueci minha senha" ou altere a senha pelo perfil.');
    process.exit(0);
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const company = await prisma.company.create({
    data: {
      name: COMPANY_NAME,
      type: 'both',
      plan: 'enterprise',
    },
  });

  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      role: 'admin',
      companyId: company.id,
    },
  });

  const lines = [
    '--- Credenciais do administrador (apague este arquivo após copiar) ---',
    '',
    `Login: ${ADMIN_EMAIL}`,
    `Senha: ${ADMIN_PASSWORD}`,
    '',
    'Acesse /login e troque a senha após o primeiro acesso.',
    '---',
  ];
  const content = lines.join('\n');

  console.log(content);

  const credentialsPath = path.join(process.cwd(), 'admin-credentials.txt');
  fs.writeFileSync(credentialsPath, content, 'utf8');
  console.log('\nCredenciais também salvas em:', credentialsPath);
  console.log('Remova o arquivo após copiar (não commite).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
