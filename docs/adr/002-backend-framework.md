# ADR-002: Backend Framework

## Status

Accepted

## Context

- Backend bir HTTP API olacak
- Modüler monoliti kendimiz kuracağız
- Loglama ve istek doğrulama yapacağız.
- Proje JavaScript (ESM) ile yazılıyor

## Options

| Seçenek | Artıları                                                                            | Eksileri                                                                        |
| ------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Express | En yaygın, minimal; modül yapısını kendin kurarsın → mimariyi öğrenmek için çok iyi | Express'te validasyon ve loglama hazır gelmiyor, ayrı kütüphane eklemek gerekir |
| Fastify | Express'e benzer, daha hızlı, şema tabanlı validasyon dahili                        | Express'e göre kaynak sayısı az                                                 |
| NestJS  | Modüler yapı hazır gelir                                                            | TypeScript ve decorator ağırlıklı                                               |

## Decision

- Dahili validasyon ve plugin sistemi için Fastify kullanılacaktır.
- Express'te validasyon ve loglama hazır gelmiyor, ayrı kütüphane eklemek gerektiği için express kullanılmayacaktır.
- Neden NestJS değil? Sistemi elle kurmak istiyoruz.

## Consequences

**Getirdikleri:**

- Fastify'ın dahili JSON Schema desteğine sahip olması
- Fastify'da `pino` dahili gelir
- Her modülün HTTP katmanı bir Fastify plugin'i olarak register edilir

**Götürdükleri / dikkat edilecekler:**

- Express'e göre kaynak sayısı az.
- Express middleware'leri Fastify'da doğrudan çalışmaz, onların yerine '@fastify/*' paketleri kullanılır
