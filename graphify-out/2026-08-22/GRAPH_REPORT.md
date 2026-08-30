# Graph Report - Kapak  (2026-08-22)

## Corpus Check
- 24 files · ~26,084 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 207 nodes · 353 edges · 12 communities
- Extraction: 89% EXTRACTED · 10% INFERRED · 1% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8c3c9d57`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ui.js
- Task 6: 3D Görüntüleyici
- viewer.js
- colors.js
- §4 Kapak Geometrisi
- anasayfa.js
- Kaydırmalı Renk-Döngülü Ana Sayfa — Tasarım
- Şahinkaya Ahşap Logo
- package.json
- dev-server.mjs
- Şahinkaya Kapak Konfigüratörü Projesi
- 4. Uygulama planı

## God Nodes (most connected - your core abstractions)
1. `arayuzuBaslat()` - 18 edges
2. `sinemaSahnesiniBaslat()` - 11 edges
3. `Task 6: 3D Görüntüleyici` - 9 edges
4. `renkIzgarasiniCiz()` - 8 edges
5. `renkModaliniAc()` - 8 edges
6. `4. Uygulama planı` - 8 edges
7. `Konfigüratör Arayüz Yenileme — Uygulama Planı` - 8 edges
8. `Şahinkaya Kapak Konfigüratörü Projesi` - 8 edges
9. `idIleRenkBul()` - 7 edges
10. `renderIste()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `İndir / Paylaş Butonu` --conceptually_related_to--> `§2 Kapsam`  [AMBIGUOUS]
  index.html → docs/superpowers/specs/2026-08-06-kapak-konfiguratoru-design.md
- `Tam Ekran Butonu` --conceptually_related_to--> `Task 1: Proje İskeleti`  [AMBIGUOUS]
  index.html → docs/superpowers/plans/2026-08-06-kapak-konfiguratoru.md
- `scripts/dev-server.mjs` --semantically_similar_to--> `Global Kısıtlar`  [INFERRED] [semantically similar]
  README.md → docs/superpowers/plans/2026-08-06-kapak-konfiguratoru.md
- `§7 Performans Stratejisi` --conceptually_related_to--> `Performans Notları`  [INFERRED]
  docs/superpowers/specs/2026-08-06-kapak-konfiguratoru-design.md → README.md
- `§8 Mobil Uyumluluk` --conceptually_related_to--> `Mobil Bottom Sheet Notu`  [INFERRED]
  docs/superpowers/specs/2026-08-06-kapak-konfiguratoru-design.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **İki Tema Sistemi (Atölye / Şahinkaya Klasik)** — design_iki_tema, plan_task7_tema, index_tema_degistir_btn [INFERRED 0.80]
- **Gerçek Renk Kaynağı İlkesi (RAL/EGGER/Ahşap)** — design_renk_verisi, readme_renk_kaynaklari, plan_global_constraints, plan_renk_katalogu [INFERRED 0.85]
- **On-Demand Render Deseni** — design_performans_stratejisi, readme_performans_notlari, plan_dongusunu_baslat, plan_render_iste [INFERRED 0.85]

## Communities (12 total, 0 thin omitted)

### Community 0 - "ui.js"
Cohesion: 0.14
Nodes (30): kategoriVerisiniAl(), ORTAM_SECENEKLERI, varsayilanOrtami(), altKategoriSekmeleriniKur(), ANA_KATEGORILER, anaKategoriKonfigBul(), anaKategoriSekmeleriniKur(), arayuzuBaslat() (+22 more)

### Community 1 - "Task 6: 3D Görüntüleyici"
Cohesion: 0.08
Nodes (15): §8 Mobil Uyumluluk, donguyuBaslat() — On-Demand Render Döngüsü, kapakGrubuOlustur(), KAPAK_MODELLERI, RENK_KATALOGU, Self-Review Notları, Task 10: Mobil Doğrulama ve Responsive İnce Ayar, Task 2: Renk Verisi (+7 more)

### Community 2 - "viewer.js"
Cohesion: 0.18
Nodes (18): citaliKapakGrubuOlustur(), duzKapakGeometrisiOlustur(), kapakGeometrisiTemizle(), kapakGrubuOlustur(), glbKapakGrubuOlustur(), glbSablonunuYukle(), onbellek, yukleyici (+10 more)

### Community 3 - "colors.js"
Cohesion: 0.16
Nodes (12): kodlardanTonlariAl(), LAKE_ACIK_POPULER_KODLAR, LAKE_ACIK_TUMU, LAKE_KOYU_POPULER_KODLAR, LAKE_KOYU_TUMU, ralKarsilastir(), RENK_KATALOGU, TEMEL_TONLAR (+4 more)

### Community 4 - "§4 Kapak Geometrisi"
Cohesion: 0.13
Nodes (22): §9 Doğrulama Planı, §6 İki Tema, §4 Kapak Geometrisi, §3 Mimari, §7 Performans Stratejisi, §5 Renk Verisi — Gerçek Kaynaklar, İndir / Paylaş Butonu, Tam Ekran Butonu (+14 more)

### Community 5 - "anasayfa.js"
Cohesion: 0.13
Nodes (23): anasayfayiBaslat(), azaltilmisHareketMi(), dusukGucluCihazMi(), sinemaSahnesiniBaslat(), idIleRenkBul(), idIleModelBul(), KAPAK_MODELLERI, hk012 (+15 more)

### Community 6 - "Kaydırmalı Renk-Döngülü Ana Sayfa — Tasarım"
Cohesion: 0.25
Nodes (7): Amaç, Kapsam Dışı, Kapsam Kararları (bu konuşmada onaylandı), Kaydırmalı Renk-Döngülü Ana Sayfa — Tasarım, Mimari, Test / Doğrulama, Önceki Denemeden Ders (2026-08-14, tamamen geri alınmıştı)

### Community 7 - "Şahinkaya Ahşap Logo"
Cohesion: 0.90
Nodes (5): AŞ Monogram Mark (House/Roof + S), Şahinkaya Ahşap Logo, Şahinkaya Mini Logo (Favicon), Furniture Door Configurator Website, Şahinkaya Ahşap

### Community 8 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, type

### Community 9 - "dev-server.mjs"
Cohesion: 0.50
Nodes (3): KOK, MIME, sunucu

### Community 10 - "Şahinkaya Kapak Konfigüratörü Projesi"
Cohesion: 0.15
Nodes (17): §10 Açık Kalan / Ertelenen Konular, §1 Amaç, §2 Kapsam, manifold.wasm (CSG kütüphanesi, bilinçli olarak kullanılmadı), Silante.com.tr (referans konfigüratör), Global Kısıtlar, Task 11: README ve Son Teslim, Task 1: Proje İskeleti (+9 more)

### Community 11 - "4. Uygulama planı"
Cohesion: 0.11
Nodes (17): 1. Araştırma — skill'ler ne dedi, 2. Dürüst tespit: mevcut tasarım tam olarak o desende, 3. Mevcut durum denetimi (doğrulanmış bulgular), 4. Uygulama planı, 5. Kasıtlı olarak YAPILMAYACAKLAR, 6. Karara ihtiyaç duyan tek konu, 7. Tahmini etki, Faz 1 — Token katmanı (temel, görsel değişiklik yok) (+9 more)

## Ambiguous Edges - Review These
- `İndir / Paylaş Butonu` → `§2 Kapsam`  [AMBIGUOUS]
  index.html · relation: conceptually_related_to
- `Tam Ekran Butonu` → `Task 1: Proje İskeleti`  [AMBIGUOUS]
  index.html · relation: conceptually_related_to

## Knowledge Gaps
- **49 isolated node(s):** `TEMEL_TONLAR`, `LAKE_ACIK_POPULER_KODLAR`, `LAKE_KOYU_POPULER_KODLAR`, `LAKE_ACIK_TUMU`, `LAKE_KOYU_TUMU` (+44 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `İndir / Paylaş Butonu` and `§2 Kapsam`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Tam Ekran Butonu` and `Task 1: Proje İskeleti`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Task 1: Proje İskeleti` connect `Şahinkaya Kapak Konfigüratörü Projesi` to `Task 6: 3D Görüntüleyici`, `§4 Kapak Geometrisi`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `Task 8: Arayüz Bağlama` connect `Task 6: 3D Görüntüleyici` to `Şahinkaya Kapak Konfigüratörü Projesi`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `TEMEL_TONLAR`, `LAKE_ACIK_POPULER_KODLAR`, `LAKE_KOYU_POPULER_KODLAR` to the rest of the system?**
  _49 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14015151515151514 - nodes in this community are weakly interconnected._
- **Should `Task 6: 3D Görüntüleyici` be split into smaller, more focused modules?**
  _Cohesion score 0.08045977011494253 - nodes in this community are weakly interconnected._