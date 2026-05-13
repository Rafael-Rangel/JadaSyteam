'use client';

export type RequestAttachmentItem = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

export default function RequestAttachmentsView({
  attachments,
}: {
  attachments: RequestAttachmentItem[] | null | undefined;
}) {
  if (!attachments || !Array.isArray(attachments) || attachments.length === 0) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-neutral-900">Anexos</h3>
      <ul className="space-y-4">
        {attachments.map((a, i) => (
          <li key={`${a.name}-${i}`} className="text-sm">
            {a.mimeType.startsWith('image/') ? (
              <div>
                <a
                  href={a.dataUrl}
                  download={a.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <img
                    src={a.dataUrl}
                    alt={a.name}
                    className="max-h-56 max-w-full rounded-md border border-neutral-200 object-contain"
                  />
                </a>
                <p className="mt-1">
                  <a
                    href={a.dataUrl}
                    download={a.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary-600 underline"
                  >
                    {a.name}
                  </a>
                </p>
              </div>
            ) : (
              <a
                href={a.dataUrl}
                download={a.name}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-600 underline"
              >
                {a.name} (abrir PDF)
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
