import { validateRequestAttachments } from '@/lib/requestAttachments';

/** JPEG 1x1 mínimo (data URL). */
const TINY_JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUTEhMWFhUXGBgYGBgYGBgYGBgYGBgYGBgYGBgYHSggGB0lHR8YITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0lICYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEIAQMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAAAf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKAAAP/Z';

describe('validateRequestAttachments', () => {
  it('retorna undefined para vazio ou null', () => {
    expect(validateRequestAttachments(undefined)).toBeUndefined();
    expect(validateRequestAttachments(null)).toBeUndefined();
    expect(validateRequestAttachments([])).toBeUndefined();
  });

  it('aceita JPEG data URL', () => {
    const r = validateRequestAttachments([{ name: 'foto.jpg', dataUrl: TINY_JPEG }]);
    expect(r).toHaveLength(1);
    expect(r![0].mimeType).toBe('image/jpeg');
  });

  it('rejeita tipo não permitido', () => {
    expect(() =>
      validateRequestAttachments([
        { name: 'a.gif', dataUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' },
      ])
    ).toThrow();
  });
});
