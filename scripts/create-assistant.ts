/**
 * Cria conta de assistente JADA (empresa sistema + usuário assistant).
 * Uso: npm run create-assistant
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { getPlatformCompanyId } from '../lib/platformCompanyDb';
import * as fs from 'fs';
import * as path from 'path';

const ASSISTANT_EMAIL = process.env.ASSISTANT_EMAIL ?? 'assistente@jada.com.br';
const ASSISTANT_NAME = process.env.ASSISTANT_NAME ?? 'Assistente JADA';
const ASSISTANT_PASSWORD = process.env.ASSISTANT_PASSWORD ?? 'JadaAssist2025!';

async function main() {
  const platformCompanyId = await getPlatformCompanyId();
  if (!platformCompanyId) {
    console.error('Empresa sistema não encontrada. Execute: npm run create-admin');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email: ASSISTANT_EMAIL } });
  if (existing) {
    console.log('Já existe usuário com e-mail', ASSISTANT_EMAIL);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(ASSISTANT_PASSWORD, 12);
  await prisma.user.create({
    data: {
      email: ASSISTANT_EMAIL,
      password: hashedPassword,
      name: ASSISTANT_NAME,
      role: 'assistant',
      companyId: platformCompanyId,
      restrictToAssignedCompanies: true,
    },
  });

  const lines = [
    '--- Credenciais do assistente (apague após copiar) ---',
    '',
    `Login: ${ASSISTANT_EMAIL}`,
    `Senha: ${ASSISTANT_PASSWORD}`,
    '',
    'Atribua empresas em Admin > Assistentes.',
    '---',
  ];
  const content = lines.join('\n');
  console.log(content);

  const credentialsPath = path.join(process.cwd(), 'assistant-credentials.txt');
  fs.writeFileSync(credentialsPath, content, 'utf8');
  console.log('\nCredenciais salvas em:', credentialsPath);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
