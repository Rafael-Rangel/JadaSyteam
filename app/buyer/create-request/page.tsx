'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';
import PageHeader from '@/components/ui/PageHeader';
import { Package, MapPin, Calendar, Upload, X, FileText } from 'lucide-react';

const ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf,.pdf,.jpg,.jpeg,.png';
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 6;

function fileKey(f: File) {
  return `${f.name}-${f.size}-${f.lastModified}`;
}

async function fileToAttachment(f: File): Promise<{ name: string; mimeType: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== 'string') {
        reject(new Error('Leitura inválida'));
        return;
      }
      resolve({
        name: f.name,
        mimeType: f.type || 'application/octet-stream',
        dataUrl,
      });
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(f);
  });
}

export default function CreateRequestPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: 'pcs',
    category: '',
    deliveryDate: '',
    address: '',
    city: '',
    state: '',
    isPublic: true,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'Construção',
    'Elétrica',
    'Hidráulica',
    'Ferramentas',
    'Materiais',
    'Outros',
  ];

  const units = ['pcs', 'kg', 'm', 'm²', 'm³', 'un'];

  const addFiles = useCallback((list: FileList | File[] | null) => {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    const next: File[] = [...files];
    const err: string[] = [];
    for (const f of incoming) {
      if (next.length >= MAX_FILES) {
        err.push(`No máximo ${MAX_FILES} arquivos.`);
        break;
      }
      if (f.size > MAX_BYTES) {
        err.push(`"${f.name}" excede 10MB.`);
        continue;
      }
      const allowed =
        /pdf$/i.test(f.name) ||
        /jpe?g$/i.test(f.name) ||
        /png$/i.test(f.name) ||
        /webp$/i.test(f.name) ||
        /^image\/(jpeg|png|webp)$/.test(f.type) ||
        f.type === 'application/pdf';
      if (!allowed) {
        err.push(`"${f.name}" não é PDF nem imagem (JPG, PNG, WEBP).`);
        continue;
      }
      if (next.some((x) => fileKey(x) === fileKey(f))) continue;
      next.push(f);
    }
    setFiles(next);
    if (err.length) setErrors((e) => ({ ...e, attachments: err.join(' ') }));
    else setErrors((e) => {
      const n = { ...e };
      delete n.attachments;
      return n;
    });
  }, [files]);

  const removeFile = (key: string) => {
    setFiles((prev) => prev.filter((f) => fileKey(f) !== key));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.quantity) newErrors.quantity = 'Quantidade é obrigatória';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Prazo de entrega é obrigatório';
    if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state.trim()) newErrors.state = 'Estado é obrigatório';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      let attachments: { name: string; mimeType: string; dataUrl: string }[] | undefined;
      if (files.length > 0) {
        attachments = await Promise.all(files.map((f) => fileToAttachment(f)));
      }

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          quantity: formData.quantity,
          unit: formData.unit,
          category: formData.category,
          deliveryDate: formData.deliveryDate,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          isPublic: formData.isPublic,
          ...(attachments ? { attachments } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ title: data.error || 'Erro ao criar requisição.' });
        setIsLoading(false);
        return;
      }
      router.push('/buyer/requests');
      router.refresh();
    } catch {
      setErrors({ title: 'Erro ao criar requisição. Tente novamente.' });
    }
    setIsLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Nova requisição"
        description="Preencha os dados da sua necessidade para receber propostas."
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPT}
            className="sr-only"
            aria-label="Selecionar anexos"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />

          <Input
            label="Título da requisição"
            placeholder="Ex: 600 parafusos M6"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={errors.title}
            icon={<Package className="h-5 w-5" />}
            required
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Descrição <span className="text-danger-500">*</span>
            </label>
            <textarea
              className="input min-h-[120px] resize-none"
              placeholder="Descreva detalhadamente sua necessidade..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-danger-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Quantidade"
              type="number"
              placeholder="600"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              error={errors.quantity}
              required
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Unidade <span className="text-danger-500">*</span>
              </label>
              <select
                className="input"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Categoria <span className="text-danger-500">*</span>
            </label>
            <select
              className="input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-danger-600">{errors.category}</p>}
          </div>

          <Input
            label="Prazo de entrega desejado"
            type="date"
            value={formData.deliveryDate}
            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
            error={errors.deliveryDate}
            icon={<Calendar className="h-5 w-5" />}
            required
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Endereço de entrega <span className="text-danger-500">*</span>
            </label>
            <Input
              placeholder="Rua, número, bairro"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              error={errors.address}
              icon={<MapPin className="h-5 w-5" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Cidade"
              placeholder="São Paulo"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              error={errors.city}
              required
            />

            <Input
              label="Estado"
              placeholder="SP"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              error={errors.state}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Anexos (opcional)</label>
            <div
              role="button"
              tabIndex={0}
              onClick={openFilePicker}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.preventDefault();
                  openFilePicker();
                }
              }}
              onDragOver={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
              }}
              onDrop={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                addFiles(ev.dataTransfer.files);
              }}
              className="cursor-pointer touch-manipulation rounded-lg border-2 border-dashed border-neutral-200 p-6 text-center transition hover:border-primary-300 hover:bg-primary-50/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <Upload className="mx-auto mb-2 h-8 w-8 text-neutral-400" aria-hidden />
              <p className="mb-2 text-sm text-neutral-700">
                Toque para escolher arquivos ou arraste até aqui
              </p>
              <p className="text-xs text-neutral-500">PDF, JPG, PNG ou WEBP — até 10MB por arquivo</p>
            </div>
            {errors.attachments && (
              <p className="mt-2 text-sm text-danger-600">{errors.attachments}</p>
            )}
            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((f) => (
                  <li
                    key={fileKey(f)}
                    className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-neutral-800">
                      <FileText className="h-4 w-4 shrink-0 text-neutral-500" />
                      <span className="truncate">{f.name}</span>
                      <span className="shrink-0 text-neutral-500">({(f.size / 1024).toFixed(0)} KB)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(fileKey(f))}
                      className="shrink-0 rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-danger-600"
                      aria-label={`Remover ${f.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isPublic" className="text-sm text-neutral-700">
              Tornar requisição pública (visível para todos os vendedores)
            </label>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              Publicar requisição
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
