import Badge from '@/components/ui/Badge';

export function requestStatusBadge(status: string) {
  const map: Record<string, { label: string; tone: 'info' | 'warning' | 'success' | 'neutral' }> = {
    open: { label: 'Aberto', tone: 'info' },
    receiving: { label: 'Recebendo propostas', tone: 'warning' },
    selected: { label: 'Proposta aceita', tone: 'success' },
    closed: { label: 'Finalizado', tone: 'neutral' },
  };
  const m = map[status] ?? map.open;
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function roleBadge(role: string) {
  const map: Record<string, { label: string; tone: 'primary' | 'success' | 'neutral' }> = {
    owner: { label: 'Dono', tone: 'primary' },
    manager: { label: 'Gerente', tone: 'success' },
    employee: { label: 'Funcionário', tone: 'neutral' },
  };
  const m = map[role] ?? map.employee;
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function proposalStatusBadge(status: string) {
  const map: Record<string, { label: string; tone: 'info' | 'warning' | 'success' | 'danger' | 'neutral' }> = {
    sent: { label: 'Enviada', tone: 'info' },
    viewed: { label: 'Visualizada', tone: 'warning' },
    accepted: { label: 'Aceita', tone: 'success' },
    rejected: { label: 'Recusada', tone: 'danger' },
  };
  const m = map[status] ?? { label: status, tone: 'neutral' };
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
