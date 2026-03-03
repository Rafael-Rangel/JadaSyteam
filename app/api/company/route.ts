import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeCnpj, isValidCnpjFormat, verifyCnpjWithBrasilApi } from '@/lib/cnpjVerification';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    include: {
      users: {
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      },
    },
  });

  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  const owner = company.users.find((u) => u.role === 'owner');
  const res: Record<string, unknown> = {
    id: company.id,
    name: company.name,
    cnpj: company.cnpj,
    type: company.type,
    plan: company.plan,
    verificationStatus: company.verificationStatus,
    verifiedAt: company.verifiedAt,
    address: company.address,
    city: company.city,
    state: company.state,
    zipCode: company.zipCode,
    description: company.description,
    ownerName: owner?.name ?? null,
    ownerEmail: owner?.email ?? null,
    ownerPhone: owner?.phone ?? null,
  };
  if (company.type === 'seller' || company.type === 'both') {
    res.sellerRadius = company.sellerRadius ?? 20;
    res.sellerReceiveAll = company.sellerReceiveAll ?? false;
    res.sellerCategories = company.sellerCategories ? JSON.parse(company.sellerCategories) : [];
  }
  return NextResponse.json(res);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, cnpj, address, city, state, zipCode, description, ownerName, ownerPhone, sellerRadius, sellerReceiveAll, sellerCategories } = body;

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      include: { users: true },
    });
    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = String(name).trim();
    if (cnpj !== undefined) {
      const cnpjStr = (cnpj as string)?.trim() ?? '';
      if (!cnpjStr) {
        return NextResponse.json({ error: 'CNPJ é obrigatório.' }, { status: 400 });
      }
      if (!isValidCnpjFormat(cnpjStr)) {
        return NextResponse.json({ error: 'CNPJ inválido. Informe 14 dígitos.' }, { status: 400 });
      }
      const cnpjNormalized = normalizeCnpj(cnpjStr);
      if (cnpjNormalized !== company.cnpj) {
        data.cnpj = cnpjNormalized;
        data.verificationStatus = 'pending';
        data.verifiedAt = null;
        data.verificationPayload = null;
      }
    }
    if (address !== undefined) data.address = (address as string)?.trim() || null;
    if (city !== undefined) data.city = (city as string)?.trim() || null;
    if (state !== undefined) data.state = (state as string)?.trim() || null;
    if (zipCode !== undefined) data.zipCode = (zipCode as string)?.trim() || null;
    if (description !== undefined) data.description = (description as string)?.trim() || null;
    if (company.type === 'seller' || company.type === 'both') {
      if (sellerRadius !== undefined) data.sellerRadius = typeof sellerRadius === 'number' ? sellerRadius : null;
      if (sellerReceiveAll !== undefined) data.sellerReceiveAll = Boolean(sellerReceiveAll);
      if (sellerCategories !== undefined) data.sellerCategories = Array.isArray(sellerCategories) ? JSON.stringify(sellerCategories) : null;
    }

    if (Object.keys(data).length > 0) {
      const updated = await prisma.company.update({
        where: { id: session.user.companyId },
        data,
      });
      if (data.cnpj !== undefined && data.verificationStatus === 'pending') {
        const verification = await verifyCnpjWithBrasilApi(updated.cnpj);
        await prisma.company.update({
          where: { id: session.user.companyId },
          data: {
            verificationStatus: verification.status,
            verifiedAt: new Date(),
            verificationPayload: verification.raw ?? undefined,
          },
        });
      }
    }

    if (ownerName !== undefined || ownerPhone !== undefined) {
      const ownerUser = company.users.find((u) => u.role === 'owner');
      if (ownerUser) {
        const userData: Record<string, unknown> = {};
        if (ownerName !== undefined) userData.name = String(ownerName).trim();
        if (ownerPhone !== undefined) userData.phone = (ownerPhone as string)?.trim() || null;
        if (Object.keys(userData).length > 0) {
          await prisma.user.update({
            where: { id: ownerUser.id },
            data: userData,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Company PATCH error:', e);
    return NextResponse.json({ error: 'Erro ao atualizar perfil.' }, { status: 500 });
  }
}
