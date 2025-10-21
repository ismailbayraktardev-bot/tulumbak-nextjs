# Admin Components (shadcn/ui) — Tulumbak

> Amaç: **dashboard-01** bloğu üzerine inşa edilecek, Tulumbak’a özgü **yeniden kullanılabilir** admin bileşenlerini ve kullanım kurallarını tanımlamak. Bu rehber; kurulum, dosya yapısı, tasarım token eşlemeleri, tablo/form/modals, realtime toast’lar, zone/branch widget’ları ve QA kontrol listesini içerir.

---

## 1) Kurulum (Özet)
```bash
# UI kütüphanesi
npx shadcn@latest init

# dashboard-01 app shell
npx shadcn@latest add dashboard-01

# çekirdek bileşenler
npx shadcn@latest add button input textarea select checkbox radio \
  dialog dropdown-menu sheet tabs accordion badge separator \
  table pagination tooltip toast avatar scroll-area \
  form label sonner skeleton slider toggle-group command

# tablo ve chart paketleri
pnpm add @tanstack/react-table @tanstack/react-virtual recharts

# form ve doğrulama
pnpm add react-hook-form zod @hookform/resolvers
```

**Tailwind token eşleme:** `primary:#FCA311`, `background:#FFF9F3`, `foreground:#1E293B`, `muted:#F1F5F9`, `destructive:#DC2626`, radius `lg:12|xl:16|2xl:20`, gölge `card:0 6px 20px rgba(0,0,0,0.05)`.

---

## 2) Dosya Yapısı (Öneri)
```
apps/admin-dashboard/
  app/(dashboard)/
    layout.tsx                # Sidebar+Topbar+Content (sticky & scroll)
    page.tsx                  # Analytics Overview
    products/page.tsx         # ürün listesi
    products/new/page.tsx     # ürün oluştur
    products/[id]/page.tsx    # ürün düzenle
    orders/page.tsx           # sipariş listesi (realtime)
    orders/[id]/page.tsx      # sipariş detay
    couriers/page.tsx         # kurye listesi
    zones/page.tsx            # şube & bölge yönetimi
    notifications/page.tsx    # şablonlar
    settings/page.tsx         # ayarlar
  components/
    app-shell/{sidebar,topbar,breadcrumbs}.tsx
    data-table/{data-table.tsx,columns.tsx,toolbar.tsx}
    forms/{form.tsx,field.tsx}
    modals/{assign-branch-dialog.tsx,assign-courier-dialog.tsx}
    analytics/{kpi-card.tsx,mini-chart.tsx}
    widgets/{branch-suggest.tsx,zone-map.tsx}
    upload/{file-drop.tsx}
  lib/{api.ts,utils.ts,status.ts,table-helpers.ts}
```

---

## 3) App Shell Kuralları
- **Grid:** `grid-cols-[240px_1fr] md:grid-cols-[280px_1fr]`
- **Sidebar:** `sticky top-0 h-screen border-r`
- **Topbar:** `sticky top-0 z-40 border-b bg-background/80 backdrop-blur`
- **Content scroll:** `flex-1 overflow-y-auto`, içeride `p-6 md:p-8`
- **Breadcrumbs:** başlığın üzerinde, sayfa içinde
- **Komut Paleti (⌘K):** `command` bileşeni; ürün/sipariş/şube quick jump

---

## 4) Durum Renkleri & Rozet Haritası
```ts
// lib/status.ts
export const ORDER_STATUS_COLOR: Record<string, string> = {
  pending: "bg-muted text-foreground/70",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-amber-100 text-amber-700",
  ready: "bg-amber-200 text-amber-800",
  on_delivery: "bg-sky-100 text-sky-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
};
```

Kullanım: `<Badge className={cn("rounded-full", ORDER_STATUS_COLOR[row.status])}>{row.status}</Badge>`

---

## 5) Data Table Sistemi
**Hedef:** TanStack Table ile server‑side sayfalama/filtre/sort; shadcn Table ile görsel.

### 5.1 DataTable Wrapper
- `columns` ve `data` props alır, toolbar ve bottom bar içerir.
- Alt barda sayfalama: `Pagination` (server param senkronu).

```tsx
// components/data-table/data-table.tsx
export function DataTable<TData, TValue>({ columns, data }: Props<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="rounded-2xl border bg-card shadow-card">
      <Table>
        <TableHeader>{/* header */}</TableHeader>
        <TableBody>{/* rows */}</TableBody>
      </Table>
      <div className="flex items-center justify-between border-t p-4">
        <Pagination />
      </div>
    </div>
  );
}
```

### 5.2 Toolbar (Arama & Filtre)
- **Arama**: `q` (debounce 300ms).  
- **Filtre**: kategori, status, branch; `Select`, `DropdownMenu`.  
- **CSV Export** ve **Görünür Sütunlar** kontrolü.

### 5.3 Örnek — Products Columns
```tsx
// components/data-table/columns.tsx (Products)
export const productColumns: ColumnDef<Product>[] = [
  { accessorKey: "image", header: "", cell: ({ row }) => <Avatar src={row.original.image} /> },
  { accessorKey: "name", header: "Ad" },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "type", header: "Tip", cell: ({ getValue }) => getValue()==='variable' ? 'Varyantlı' : 'Basit' },
  { accessorKey: "price", header: "Fiyat", cell: ({ getValue }) => formatTL(getValue()) },
  { accessorKey: "stock", header: "Stok" },
  { accessorKey: "branch", header: "Şube" },
  { id: "actions", header: "", cell: ({ row }) => <RowActions id={row.original.id} /> },
];
```

### 5.4 Örnek — Orders Columns (Realtime)
```tsx
export const orderColumns: ColumnDef<Order>[] = [
  { accessorKey: "id", header: "No" },
  { accessorKey: "customer_name", header: "Müşteri" },
  { accessorKey: "branch_name", header: "Şube" },
  { accessorKey: "slot", header: "Zaman", cell: ({ row }) => formatSlot(row.original) },
  { accessorKey: "grand_total", header: "Tutar", cell: ({ getValue }) => formatTL(getValue()) },
  { accessorKey: "status", header: "Durum", cell: ({ row }) => (
      <Badge className={cn("rounded-full", ORDER_STATUS_COLOR[row.original.status])}>
        {TR_STATUS[row.original.status]}
      </Badge>
    )
  },
  { id: "assign", header: "Atama", cell: ({ row }) => <BranchSuggest order={row.original} /> },
];
```

**Not:** Realtime geldiğinde liste satırını kısa süre highlight edin (skeleton değil, subtle background pulse).

---

## 6) Form Sistemi (RHF + Zod)
- **`<Form />`** sarmalayıcı, **`<Field />`** (label+error), RHF ile entegre.
- **Validasyon:** Zod şemaları (ürün adı, SKU, fiyat, varyant attrs).
- **Eylem alanı:** Alt sticky bar: `Cancel` (ghost) + `Save` (primary).

```tsx
const schema = z.object({
  name: z.string().min(2),
  type: z.enum(["simple","variable"]),
  price: z.number().nonnegative().optional(),
  stock_mode: z.enum(["product","variant"]) ,
});
```

**Varyant Editörü:** `toggle-group` ile `weight/serving` seçim; `slider` (fiyat aralığı), `table` içinde varyant satırları (SKU, fiyat, stok, aktif).

---

## 7) Modals & Drawers
**Assign Branch Dialog** (`assign-branch-dialog.tsx`)
- Önerilen şube + diğer şubeler (mesafe etiketi).  
- `Ata` → success toast; `Değiştir` → dropdown.

**Assign Courier Dialog** (`assign-courier-dialog.tsx`)
- Uygun kuryeler listesi, arama; atama sonrası `order.status → on_delivery`.

**CSV Import Dialog** (SheetJS)
- Dosya yükle (CSV/XLSX), önizleme tablo, eşleştirme (column mapping), `İçe aktar` CTA.

---

## 8) Realtime & Toasts
- Kanal: `admin-orders` (order.created, order.updated).  
- Toast metinleri kısa: “#1248 yolda”, “#1250 hazırlandı”.  
- Topbar’da çan ikonu **Son 10 olay** listesi (Dropdown + ScrollArea).

```tsx
import { useToast } from "@/components/ui/use-toast";
// on event: toast({ title: `#${id} ${label}`, description: timeago(now) })
```

---

## 9) Zone & Branch Widget’ları
**BranchSuggest** (`widgets/branch-suggest.tsx`)
- Sipariş adresi → `POST /admin/zones/lookup`  
- UI: “Önerilen: Ulukent (2.1 km)” [Ata] [Değiştir…]

**ZoneMap** (`widgets/zone-map.tsx`)
- v1: statik görüntü+işaretleyici; v2: harita kütüphanesi (MapLibre/Leaflet).  
- Bölge çizimi v2’de (polygon editörü) planlanır; MVP’de form JSON.

---

## 10) Upload Bileşeni
- `file-drop.tsx` — drag&drop; kabul: `.jpg,.jpeg,.png,.webp`, max 5MB.  
- Grid önizleme; her görsel için alt metin alanı.  
- Sunucu tarafında WebP dönüşümü.

---

## 11) A11y Kuralları
- Focus trap (Dialog/Sheet), `aria-label`/`aria-describedby`.  
- Tablo başlıklarında `aria-sort`.  
- İkonlu butonlarda `sr-only` metin.  
- Hata iletileri input ile ilişkilendirilsin (`id`/`aria-errormessage`).

---

## 12) Performans
- Dinamik import (Dialog içeriği, CSV import gibi nadir akışlar).  
- Sanallaştırma: `@tanstack/react-virtual` (10k+ satır).  
- `next/image` & memoization; tablo satırlarındaki hücreleri `memo`.

---

## 13) QA Kontrol Listesi
- [ ] App shell sticky/scroll davranışları doğru  
- [ ] Products list: arama/filtre/sort + CSV export/import  
- [ ] Orders list: realtime + toast + status badge  
- [ ] BranchSuggest widget çalışıyor  
- [ ] Assign Courier dialog akışı  
- [ ] Forms: RHF+Zod validasyonları  
- [ ] Upload: WebP + alt metin  
- [ ] A11y: klavye & focus, aria-sort  
- [ ] Lighthouse (admin) route değişimi < 300ms

---

## 14) Kodlama Standartları
- Bileşen isimleri `PascalCase`, dosyalar `kebab-case`.  
- UI durumları: `loading | empty | error | ready` net şablon.  
- TR metinleri `i18n`’e hazırlıklı; metin sabitlerini `lib/copy.ts`.

---

## 15) Örnek Parçalar (Kısa)
**KPI Card**
```tsx
export function KpiCard({ label, value, delta }: { label: string; value: string; delta?: string }){
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="text-sm text-foreground/70">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      {delta && <div className="mt-1 text-xs text-green-600">{delta}</div>}
    </div>
  );
}
```

**BranchSuggest (psödo)**
```tsx
export function BranchSuggest({ order }: { order: Order }){
  const [suggestion, setSuggestion] = useState<OrderBranchSuggestion | null>(null);
  useEffect(() => { fetchSuggest(order); }, [order.id]);
  if(!suggestion) return <Skeleton className="h-8 w-40" />;
  return (
    <div className="flex items-center gap-2">
      <Badge className="rounded-full">Önerilen: {suggestion.branch_name} ({suggestion.km} km)</Badge>
      <Button size="sm" onClick={assign}>Ata</Button>
      <DropdownMenu>/* diğer şubeler */</DropdownMenu>
    </div>
  );
}
```

---

## 16) Kabul Kriterleri (MVP)
- **dashboard-01** üzerine kurulu app shell; tüm modül sayfaları açılıyor.  
- Data Table sistemi ile **Products** ve **Orders** listeleri tamam.  
- Form sistemiyle ürün (basit/varyant) CRUD ekranları çalışır.  
- Assign Branch & Assign Courier dialog’ları fonksiyonel.  
- Realtime toast’lar tetikleniyor.  
- QA ve A11y checklist’i geçiyor.

