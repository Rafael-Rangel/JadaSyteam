/** Rótulos PT-BR para status de cobrança do Asaas (pagamentos de assinatura). */
export function asaasPaymentStatusLabelPt(status: string | undefined): string {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'CONFIRMED':
    case 'RECEIVED':
    case 'RECEIVED_IN_CASH':
    case 'CHECKOUT_PAID':
      return 'Pago';
    case 'PENDING':
      return 'Pendente';
    case 'AWAITING_RISK_ANALYSIS':
      return 'Em análise';
    case 'OVERDUE':
      return 'Vencido';
    case 'REFUNDED':
      return 'Estornado';
    case 'CHARGEBACK_REQUESTED':
    case 'CHARGEBACK_DISPUTE':
      return 'Contestação';
    case 'AWAITING_CHARGEBACK_REVERSAL':
      return 'Aguardando reversão';
    case 'DUNNING_RECEIVED':
    case 'DUNNING_REQUESTED':
      return 'Negativação';
    case 'CANCELED':
      return 'Cancelado';
    default:
      return status || 'Desconhecido';
  }
}

export function asaasBillingTypeLabelPt(t: string | undefined): string {
  const x = (t || '').toUpperCase();
  if (x === 'PIX') return 'PIX';
  if (x === 'CREDIT_CARD') return 'Cartão de crédito';
  if (x === 'BOLETO') return 'Boleto';
  return t || '—';
}
