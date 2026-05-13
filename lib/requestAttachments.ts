/**
 * Valida anexos enviados na criação de requisição (data URLs base64).
 * Tipos permitidos: PDF, JPEG, PNG, WEBP. Limites para proteger o banco e o payload.
 */

export const REQUEST_ATTACHMENT_MAX_FILES = 6;
/** Tamanho máximo da string data URL por arquivo (~4,5 MiB de payload). */
export const REQUEST_ATTACHMENT_MAX_DATA_URL_CHARS = 4_800_000;

export type RequestAttachmentStored = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

const DATA_URL_RE =
  /^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,([A-Za-z0-9+/=\s]+)$/;

function safeFileName(name: string): string {
  return name.replace(/[/\\]/g, '_').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 180) || 'anexo';
}

export function validateRequestAttachments(raw: unknown): RequestAttachmentStored[] | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!Array.isArray(raw)) {
    throw new Error('Formato de anexos inválido.');
  }
  if (raw.length > REQUEST_ATTACHMENT_MAX_FILES) {
    throw new Error(`No máximo ${REQUEST_ATTACHMENT_MAX_FILES} anexos por requisição.`);
  }

  const out: RequestAttachmentStored[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      throw new Error('Anexo inválido.');
    }
    const rec = item as Record<string, unknown>;
    const name = typeof rec.name === 'string' ? safeFileName(rec.name) : '';
    const dataUrl = typeof rec.dataUrl === 'string' ? rec.dataUrl.replace(/\s/g, '') : '';
    if (!name) throw new Error('Nome do anexo é obrigatório.');
    const m = dataUrl.match(DATA_URL_RE);
    if (!m) {
      throw new Error('Cada anexo deve ser PDF, JPG, PNG ou WEBP em base64 (data URL).');
    }
    const mimeType = m[1];
    const payload = m[2];
    if (dataUrl.length > REQUEST_ATTACHMENT_MAX_DATA_URL_CHARS) {
      throw new Error('Um ou mais arquivos excedem o tamanho máximo permitido.');
    }
    if (payload.length < 8) {
      throw new Error('Conteúdo de anexo inválido.');
    }
    out.push({ name, mimeType, dataUrl });
  }

  return out.length ? out : undefined;
}
