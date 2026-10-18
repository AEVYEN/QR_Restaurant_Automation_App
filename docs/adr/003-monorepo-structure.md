# ADR-003: Monorepo structure

## Status

Accepted

## Context

My Menu üç ayrı uygulamadan oluşacak: backend (`api`), web arayüzü (`web`) ve ileride mobil uygulama (`mobile`, Faz 13).

Bu uygulamalar aynı kuralları ve tanımları paylaşmak zorunda:

- Sipariş durumları (`OrderStatus`: `PENDING`, `CONFIRMED`...)
- Validasyon kuralları (ör. bir kalemde maksimum adet)
- API client (web ve mobil aynı backend'e aynı şekilde istek atar)

Bu kod her uygulamaya ayrı ayrı kopyalanırsa, bir değişiklikte tüm kopyaları güncellemek gerekir ve unutulan kopya hataya yol açar. Kodun **tek bir yerde** durması ve tüm uygulamalar tarafından kullanılması gerekiyor.

## Options

| Seçenek             | Artıları                                                     | Eksileri                                                                                                   |
| ------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Ayrı repolar**    | Her uygulama bağımsız                                        | Ortak kodu paylaşmak için npm'e paket yayınlamak gerekir; değişiklikler repolar arasında senkron tutulmalı |
| **pnpm workspaces** | Hızlı, disk tasarruflu                                       | Ekstra araç kurulumu; symlink yapısı Expo / React Native (Metro) ile zaman zaman sorun çıkarabiliyor       |
| **npm workspaces**  | Node.js ile birlikte gelir, ekstra araç yok; Expo ile uyumlu | pnpm'e göre biraz daha yavaş (bu proje ölçeğinde fark hissedilmez)                                         |

## Decision

**npm workspaces** ile tek repo (monorepo) kullanılacak.

Klasör yapısı:

```
my-menu/
├── apps/
│   ├── api/        # @my-menu/api    — Backend (Fastify, modular monolith)
│   ├── web/        # @my-menu/web    — React + Vite
│   └── mobile/     # @my-menu/mobile — React Native (Faz 13)
├── packages/
│   └── shared/     # @my-menu/shared — Ortak sabitler, validasyon, API client
└── package.json    # Kök: workspace tanımı
```

Kök `package.json` ayarları:

| Alan         | Değer                      | Neden?                                                                                                                       |
| ------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `private`    | `true`                     | Kök proje bir paket değil, bir çatı. Yanlışlıkla `npm publish` ile yayınlanması engellenir.                                  |
| `workspaces` | `["apps/*", "packages/*"]` | Bu klasörlerin altındaki her proje bir workspace olur. Yeni uygulama eklendiğinde (ör. `apps/mobile`) ayrıca tanım gerekmez. |
| `type`       | `"module"`                 | Tüm proje ES Modules (`import` / `export`) kullanır. React, Vite ve React Native ile aynı yazım.                             |
| `main`       | _(yok)_                    | Kök proje import edilmeyeceği için giriş noktası yok.                                                                        |

Paket isimleri `@my-menu/` ön ekiyle verilir (ör. `@my-menu/shared`).

## Consequences

**Getirdikleri:**

- Ortak kod `import { OrderStatus } from '@my-menu/shared'` şeklinde tüm uygulamalarda kullanılır; tek yerden değiştirilir.
- Kökte tek bir `npm install` tüm uygulamaların bağımlılıklarını kurar.
- Ortak bağımlılıklar (ör. Prettier, ESLint) kökteki `node_modules` içinde bir kez bulunur.
- Tek repo olduğu için bir özellik (ör. yeni sipariş durumu) backend + web + shared değişiklikleriyle **tek commit**'te yapılabilir.

**Götürdükleri / dikkat edilecekler:**

- ESM kullanıldığı için import'larda dosya uzantısı zorunludur: `'./order.service.js'` (uzantısız `'./order.service'` çalışmaz).
- `packages/shared` içine sadece **platformdan bağımsız** kod girmeli. Tarayıcıya (DOM), Node.js'e veya React Native'e özel kod buraya konmamalı; aksi halde bir uygulamada çalışıp diğerinde bozulur.
- Bağımlılık kurarken hangi workspace'e kurulduğuna dikkat edilmeli: `npm install <paket> -w @my-menu/api`.
