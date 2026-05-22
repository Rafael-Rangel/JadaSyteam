'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Headphones, LogOut } from 'lucide-react';

export default function AssistantModeBanner() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const role = (session?.user as { role?: string })?.role;
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role !== 'assistant') return;
    fetch('/api/assistant/context')
      .then((r) => r.json())
      .then((data) => {
        if (data?.active?.name) setCompanyName(data.active.name);
      })
      .catch(() => null);
  }, [role]);

  if (role !== 'assistant') return null;

  async function handleExit() {
    setLoading(true);
    try {
      await fetch('/api/assistant/context', { method: 'DELETE' });
      await update({ actingCompanyId: null, actingCompanyType: null });
      router.push('/assistant');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-amber-600 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
      <div className="flex items-center gap-2">
        <Headphones className="w-4 h-4 shrink-0" />
        <span>
          Modo assistente
          {companyName ? (
            <>
              {' — '}
              <strong>{companyName}</strong>
            </>
          ) : null}
          <span className="opacity-90"> (suporte operacional; billing do cliente pode estar em tolerância)</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/assistant" className="underline hover:no-underline">
          Trocar empresa
        </Link>
        <button
          type="button"
          onClick={handleExit}
          disabled={loading}
          className="inline-flex items-center gap-1 font-medium hover:opacity-90 disabled:opacity-60"
        >
          <LogOut className="w-4 h-4" />
          Sair do modo cliente
        </button>
      </div>
    </div>
  );
}
