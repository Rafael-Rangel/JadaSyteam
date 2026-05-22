import { redirect } from 'next/navigation';

/** Redireciona rota legada para equipe unificada. */
export default function AdminAssistantsRedirectPage() {
  redirect('/admin/users');
}
