import { asaasPaymentStatusLabelPt, asaasBillingTypeLabelPt } from '@/lib/paymentLabels';

describe('paymentLabels', () => {
  it('traduz status conhecidos', () => {
    expect(asaasPaymentStatusLabelPt('RECEIVED')).toBe('Pago');
    expect(asaasPaymentStatusLabelPt('PENDING')).toBe('Pendente');
  });

  it('traduz tipo de cobrança', () => {
    expect(asaasBillingTypeLabelPt('CREDIT_CARD')).toBe('Cartão de crédito');
  });
});
