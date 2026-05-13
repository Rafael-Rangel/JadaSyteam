export type ProviderVerificationStatus = 'approved' | 'rejected' | 'pending' | 'error';
export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';

export type CadastralResult = {
  provider: 'cnpjws' | 'brasilapi';
  status: ProviderVerificationStatus;
  reason: string;
  companyName?: string;
  legalNature?: string;
  cnaePrimary?: string;
  cnaeSecondary?: string[];
  size?: string;
  capitalSocial?: number | null;
  simplesNacional?: boolean | null;
  mei?: boolean | null;
  qsa?: Array<{ name: string; qualification?: string | null; share?: number | null }>;
  raw: Record<string, unknown> | null;
};

export type JudicialResult = {
  provider: 'escavador';
  status: ProviderVerificationStatus;
  reason: string;
  totalCases: number;
  laborCases: number;
  civilCases: number;
  highValueCases: number;
  riskLevel: RiskLevel;
  raw: Record<string, unknown> | null;
};

export type SerasaResult = {
  provider: 'serasa';
  status: ProviderVerificationStatus;
  reason: string;
  score: number | null;
  riskLevel: RiskLevel;
  restrictions: number | null;
  raw: Record<string, unknown> | null;
};
