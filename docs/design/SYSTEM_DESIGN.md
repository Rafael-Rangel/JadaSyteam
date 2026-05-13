# JADA — System Design (Light)

> Linguagem visual da plataforma: **light, sóbria, densa porém respirada**.
> Inspiração: **Stripe / Notion / Linear (modo claro)**.
> Tipografia **Inter**, neutros em **slate**, acento em **azul**, com pegada profissional e tecnológica.

Este documento é a fonte da verdade para tokens visuais, regras de layout, anatomia de componentes e regras de gráficos. Toda nova tela deve consultar este guia antes de improvisar estilos.

---

## 1. Princípios

1. **Hierarquia tipográfica forte** — uma página deve “ler-se” em 3 segundos.
2. **Espaçamento em grid de 8 px** — nada entra fora dessa grade (4 px só para detalhes finos).
3. **Densidade controlada** — preferimos densidade moderada com respiro, não muros de texto.
4. **Cor com semântica** — verde só para sucesso, vermelho só para risco/erro, etc.
5. **Estados sempre presentes** — loading, vazio, erro e desabilitado fazem parte do design.
6. **Acessibilidade primeiro** — contraste mínimo AA (4.5:1) e foco visível em tudo.
7. **Consistência > criatividade** — preferir um padrão repetido a uma inovação localizada.

---

## 2. Paleta de cores (tokens semânticos)

A paleta é exposta no `tailwind.config.ts` em escalas 50–900 e usada via classes Tailwind (`bg-primary-600`, `text-neutral-700`, etc.).

### 2.1 Tokens semânticos

| Token       | Uso                                                           |
| ----------- | ------------------------------------------------------------- |
| `primary`   | CTAs principais, links, foco, gráficos primários              |
| `accent`    | Destaques visuais, badges informativos, segunda série de chart |
| `neutral`   | Backgrounds, bordas, texto                                    |
| `success`   | Confirmação, aprovado, ATIVA                                  |
| `warning`   | Atenção, pendente, em análise                                 |
| `danger`    | Erro, rejeitado, alto risco                                   |
| `info`      | Mensagens neutras de sistema                                  |

### 2.2 Escalas

**Primary (azul Stripe-ish)**

| Step | Hex       | Uso típico                              |
| ---- | --------- | --------------------------------------- |
| 50   | `#eff6ff` | fundos sutis (`bg-primary-50`)          |
| 100  | `#dbeafe` | badges info, hover de itens nav         |
| 200  | `#bfdbfe` | bordas suaves                           |
| 300  | `#93c5fd` | linha de gráfico secundária             |
| 400  | `#60a5fa` | hover de ícone                          |
| 500  | `#3b82f6` | ícones em destaque                      |
| 600  | `#2563eb` | **botão primário** (default)            |
| 700  | `#1d4ed8` | botão primário hover                    |
| 800  | `#1e40af` | botão primário active                   |
| 900  | `#1e3a8a` | títulos sobre fundos primary muito leve |

**Accent (violeta sóbrio)**

| Step | Hex       |
| ---- | --------- |
| 50   | `#f5f3ff` |
| 100  | `#ede9fe` |
| 500  | `#8b5cf6` |
| 600  | `#7c3aed` |
| 700  | `#6d28d9` |

**Neutral (slate)**

| Step | Hex       | Uso típico                                  |
| ---- | --------- | ------------------------------------------- |
| 50   | `#f8fafc` | background da página (`bg-neutral-50`)      |
| 100  | `#f1f5f9` | hover de linha de tabela                    |
| 200  | `#e2e8f0` | bordas, divisores                           |
| 300  | `#cbd5e1` | bordas em estado disabled                   |
| 400  | `#94a3b8` | texto auxiliar/placeholder                  |
| 500  | `#64748b` | texto secundário                            |
| 600  | `#475569` | texto de corpo                              |
| 700  | `#334155` | texto forte                                 |
| 800  | `#1e293b` | títulos                                     |
| 900  | `#0f172a` | display, contraste máximo                   |

**Success / Warning / Danger / Info** seguem a mesma escala (50–900) com hex Tailwind padrão (`emerald` para success, `amber` para warning, `red` para danger, `sky` para info).

### 2.3 Estados de cor

| Estado     | Regra                                                                |
| ---------- | -------------------------------------------------------------------- |
| `hover`    | Sobe 1 step na escala (ex.: `primary-600 -> primary-700`).           |
| `active`   | Sobe 2 steps (ex.: `primary-600 -> primary-800`).                    |
| `focus`    | `outline: 2px solid; outline-offset: 2px;` na cor do componente.     |
| `disabled` | `opacity-50` + `cursor-not-allowed`. Nunca alterar a cor base.       |
| `selected` | Fundo `primary-50` + texto `primary-700` + borda esquerda `primary-600` em itens de nav. |

---

## 3. Tipografia

### 3.1 Família

- **Sans:** `Inter` (via `next/font/google`), exposta como variável CSS `--font-sans`.
- Fallback: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
- Fontes mono (códigos/IDs): `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.

### 3.2 Escala (mobile-first)

| Token     | Tamanho / Line-height | Peso default | Uso                            |
| --------- | --------------------- | ------------ | ------------------------------ |
| `display` | 30 / 36               | 600          | título de página de destaque   |
| `h1`      | 24 / 32               | 600          | título de página padrão        |
| `h2`      | 20 / 28               | 600          | título de seção                |
| `h3`      | 18 / 24               | 600          | título de card / subseção      |
| `body`    | 14 / 20               | 400          | texto padrão                   |
| `small`   | 12 / 16               | 500          | labels, captions, meta info    |
| `mono`    | 12 / 16               | 500          | IDs, CNPJ, números técnicos    |

### 3.3 Pesos

- 400 — corpo
- 500 — labels, captions
- 600 — títulos, números de KPI
- 700 — apenas em casos extremos (badge muito pequeno, tag de “popular”)

### 3.4 Tracking

- Default `0`.
- Títulos `display`/`h1` com `tracking-tight` (`-0.01em`).
- All-caps (raramente): `tracking-wider` (`+0.04em`).

---

## 4. Espaçamento

Grade de **8 px** (com 4 px para detalhes finos).

| Token | px  | Uso                                                  |
| ----- | --- | ---------------------------------------------------- |
| `0.5` | 2   | linhas finas                                         |
| `1`   | 4   | gap entre ícone e texto pequeno                      |
| `2`   | 8   | gap padrão entre itens próximos                      |
| `3`   | 12  | padding interno de campos pequenos                   |
| `4`   | 16  | padding padrão de cards/inputs                       |
| `5`   | 20  | espaço entre blocos relacionados                     |
| `6`   | 24  | padding interno de cards grandes                     |
| `8`   | 32  | espaço entre seções dentro da página                 |
| `10`  | 40  | espaço entre seções principais                       |
| `12`  | 48  | margem superior de uma área grande                   |
| `16`  | 64  | hero / áreas vazias intencionais                     |

**Regras**

- Entre **título e subtítulo**: 4 px (`mt-1`).
- Entre **subtítulo e bloco de conteúdo**: 24 px (`mt-6`).
- Entre **dois cards lado a lado**: 16 px (`gap-4`) no mobile, 24 px (`gap-6`) no desktop.
- Entre **seções** de uma mesma página: 32 px (`space-y-8`).

---

## 5. Radius

| Token  | px  | Uso                                  |
| ------ | --- | ------------------------------------ |
| `xs`   | 4   | tags pequenas                        |
| `sm`   | 6   | inputs e botões pequenos             |
| `md`   | 8   | botões/inputs padrão                 |
| `lg`   | 12  | cards padrão                         |
| `xl`   | 16  | cards grandes / modais               |
| `2xl`  | 24  | hero / containers especiais          |
| `full` | ∞   | avatares, badges pílula, indicadores |

---

## 6. Sombras

Sombras **leves**, nunca puffy. Servem para indicar elevação, não para impressionar.

| Token      | Definição                                                        | Uso              |
| ---------- | ---------------------------------------------------------------- | ---------------- |
| `shadow-xs` | `0 1px 2px 0 rgb(15 23 42 / 0.04)`                              | cards padrão     |
| `shadow-sm` | `0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)` | cards hover, dropdowns |
| `shadow-md` | `0 4px 6px -1px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06)` | popovers, modais leves |
| `shadow-lg` | `0 10px 15px -3px rgb(15 23 42 / 0.10), 0 4px 6px -4px rgb(15 23 42 / 0.08)` | modal central |

---

## 7. Layout

- **Container central** (conteúdo principal): `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- **Sidebar admin**: 240 px desktop, drawer no mobile.
- **Topbar**: 56 px de altura, sticky.
- **Grid**: 12 colunas, `gap-6` desktop / `gap-4` mobile.
- **Breakpoints** (Tailwind padrão):
  - `sm` ≥ 640
  - `md` ≥ 768
  - `lg` ≥ 1024
  - `xl` ≥ 1280
  - `2xl` ≥ 1536

---

## 8. Componentes

### 8.1 Button

- Variantes: `primary | secondary | success | danger | outline | ghost | subtle`
- Tamanhos: `xs | sm | md | lg`
- Altura padrão: 40 px (`md`).
- Slots de ícone (`leftIcon`, `rightIcon`).
- `loading` mantém o label e exibe spinner à esquerda.
- Foco visível: `outline 2px primary-500`.

**Do**

- Use `primary` para a ação principal de uma área.
- Use `outline`/`ghost` para ações secundárias.
- Em modais, ação primária à direita; secundárias à esquerda.

**Don't**

- Não use 2 botões `primary` lado a lado.
- Não use cor `danger` como CTA principal — só para ações destrutivas.

### 8.2 Input

- Altura padrão: 40 px.
- `label` 12 px medium acima.
- `helperText` 12 px regular abaixo.
- `error`: borda `danger-500`, ring `danger-500/30`, texto de erro 12 px `danger-600`.
- Slot `icon` (esquerda), `rightIcon` (direita), `prefix/suffix` textuais.

### 8.3 Card

- Estrutura: `bg-white border border-neutral-200 rounded-xl shadow-xs`.
- Variantes (`tone`): `default | subtle | elevated`.
- `padding`: `sm` 16, `md` 24 (default), `lg` 32.

### 8.4 Modal

- Larguras: `sm=420 / md=560 / lg=720 / xl=960`.
- `header` sticky com título + botão fechar.
- `footer` opcional sticky com ações.
- Backdrop `bg-neutral-900/50 backdrop-blur-sm`.
- Conteúdo com `overflow-y-auto` quando exceder a viewport.

### 8.5 Badge

- Pílula 20 px de altura.
- Variantes: `success | warning | danger | info | neutral | accent` (+ `outline`).
- Usar `text-xs font-medium` e `px-2.5 py-0.5`.
- Nunca usar mais de 1 badge de status por linha.

### 8.6 Tabs

- Underline 2 px na cor `primary-600` no item ativo.
- Texto `text-sm font-medium`.
- Espaçamento entre tabs: 24 px.
- Foco visível com `outline 2px primary-500`.

### 8.7 Tabela (DataTable)

- Header sticky (`sticky top-0 bg-neutral-50/80 backdrop-blur`).
- Texto do header: `text-xs font-medium uppercase tracking-wider text-neutral-500`.
- Padding por célula: `py-3 px-4`.
- Linhas com hover `bg-neutral-50`.
- Zebra opcional (`odd:bg-neutral-50/50`) — preferir para listas longas.
- Coluna de ações **alinhada à direita** e em formato de menu (`MoreHorizontal`) quando houver mais de 2 ações.
- `EmptyState` interno quando não há dados.

### 8.8 Sidebar (admin)

- Largura 240 px desktop.
- Item: 40 px de altura, ícone 18 px à esquerda, label `text-sm font-medium`.
- Estado ativo: `bg-primary-50 text-primary-700`, com barra esquerda 2 px `primary-600`.
- Hover: `bg-neutral-100 text-neutral-900`.
- Logo + nome no topo, separador 1 px abaixo.

### 8.9 PageHeader

- `h1` 24 px / 600 + `p` 14 px / 400 `text-neutral-500`.
- Ações alinhadas à direita.
- Margem inferior 24 px.

### 8.10 KPIStat

- Card com `padding md`.
- Label 12 px medium uppercase neutral-500.
- Valor 28 px / 600 neutral-900.
- Delta opcional 12 px com seta (`+/-` cor `success-600` / `danger-600`).
- Trend mini (sparkline) opcional à direita.

### 8.11 EmptyState

- Ícone 24 px neutral-400 dentro de círculo `bg-neutral-100` 48 px.
- Título 16 px / 600 neutral-800.
- Descrição 14 px / 400 neutral-500.
- CTA `outline` opcional.

### 8.12 Skeleton

- `bg-neutral-200/70` + animação `pulse`.
- Sempre **respeitar a altura final** do conteúdo para evitar “pulo” de layout.

### 8.13 Toast

- Largura máxima 360 px, canto superior direito.
- Variantes: `success | warning | danger | info`.
- Auto-dismiss em 4s; ações persistem até clique.

---

## 9. Tabelas — regras complementares

- Truncar texto longo (`truncate`) e revelar via `title=`/tooltip.
- IDs/CNPJ em fonte mono.
- Datas formatadas em `pt-BR` curtas (`dd/MM/yyyy` + `HH:mm` quando relevante).
- Valores monetários alinhados à direita.
- Quando houver `>20 linhas`, prever paginação ou scroll com header sticky.

---

## 10. Regras de gráficos (Recharts)

- Biblioteca padrão: **Recharts**.
- Tipografia dos eixos: `text-xs text-neutral-500`.
- Grid: somente linhas horizontais sutis, `stroke=neutral-200`.
- Sem `fill` em gradiente pesado; preferir cor sólida com `opacity-90`.
- Paleta categórica (em ordem):
  1. `primary-600` `#2563eb`
  2. `accent-600` `#7c3aed`
  3. `success-600` `#16a34a`
  4. `warning-600` `#d97706`
  5. `danger-600` `#dc2626`
  6. `neutral-500` `#64748b`
- Máximo de **6 séries** por gráfico.
- Sem 3D, sem rotação, sem efeitos.
- Sempre mostrar **legenda** quando houver mais de uma série.
- Em pizza/donut com até 2 fatias, **não** usar legenda — rotular dentro.
- Tooltip: card branco `shadow-md rounded-md p-3`, título 12 px medium, valores 12 px regular.
- Estados: `Skeleton` durante load, `EmptyState` quando série vazia.

---

## 11. Acessibilidade

- Contraste mínimo **4.5:1** para texto.
- Foco visível obrigatório (`outline: 2px primary-500; outline-offset: 2px`).
- Área tátil mínima **40 px**.
- Sempre rotular inputs com `<label>`.
- Modais com `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apontando para o título.
- Ícones puramente decorativos com `aria-hidden`; ícones com função têm `aria-label`.

---

## 12. Voz e tom (PT-BR)

- Frases curtas, voz ativa.
- Botões em ação direta: "Aprovar", "Reverificar", "Salvar plano".
- Mensagens de erro **acionáveis**: dizem o que houve **e** o próximo passo.
- Datas: "verificado em 02/05/2026 às 14:32".
- Números: separador de milhar com `Intl.NumberFormat('pt-BR')`.

---

## 13. Convenções de implementação

- Tokens vivem em `tailwind.config.ts` e em `app/globals.css` (camada `@layer components`).
- Componentes base ficam em `components/` (legado) e `components/ui/` (novos do DS).
- Componentes de gráfico ficam em `components/charts/`.
- Páginas admin **não** usam o `Header` global — usam o `app/admin/layout.tsx` com `Sidebar` + topbar dedicada.
- **Nunca** usar classes utilitárias de cor "crua" inconsistentes (ex.: `bg-blue-500`); preferir tokens (`bg-primary-600`).

---

## 14. Roadmap de evolução

Próximas iterações fora do escopo atual:

1. Dark mode (tokens já preparados, ativação posterior).
2. Aplicar o DS em `buyer/`, `seller/` e telas públicas.
3. Storybook ou MDX viewer para documentar componentes.
4. Tokens de movimento (durations, easings) padronizados.
