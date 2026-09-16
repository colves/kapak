# Graph Report - Kapak  (2026-09-16)

## Corpus Check
- 40 files · ~251,189 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 332 nodes · 608 edges · 19 communities (14 shown, 4 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `447e0e02`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ui.js
- Task 6: 3D Görüntüleyici
- viewer.js
- colors.js
- Şahinkaya Kapak Konfigüratörü Projesi
- glbYukleyici.js
- Kaydırmalı Renk-Döngülü Ana Sayfa — Tasarım
- Şahinkaya Ahşap Logo
- package.json
- renkler.js
- models.js
- 4. Uygulama planı
- Galeri fotoğrafları
- modeller.js
- seo.test.mjs
- AGENTS.md
- export-model-qr.py
- site-safety.test.mjs

## God Nodes (most connected - your core abstractions)
1. `arayuzuBaslat()` - 21 edges
2. `idIleModelBul()` - 14 edges
3. `modeliSec()` - 13 edges
4. `guncellemeyiUygula()` - 12 edges
5. `isikPaneliniKur()` - 11 edges
6. `durumuSorguyaKodla()` - 10 edges
7. `modelSeciciyiKur()` - 10 edges
8. `ornekKapagiKur()` - 9 edges
9. `idIleRenkBul()` - 9 edges
10. `Task 6: 3D Görüntüleyici` - 9 edges

## Surprising Connections (you probably didn't know these)
- `İndir / Paylaş Butonu` --conceptually_related_to--> `§2 Kapsam`  [AMBIGUOUS]
  index.html → docs/superpowers/specs/2026-08-06-kapak-konfiguratoru-design.md
- `Tam Ekran Butonu` --conceptually_related_to--> `Task 1: Proje İskeleti`  [AMBIGUOUS]
  index.html → docs/superpowers/plans/2026-08-06-kapak-konfiguratoru.md
- `§8 Mobil Uyumluluk` --conceptually_related_to--> `Mobil Bottom Sheet Notu`  [INFERRED]
  docs/superpowers/specs/2026-08-06-kapak-konfiguratoru-design.md → README.md
- `Boyut Dock Paneli` --references--> `§4 Kapak Geometrisi`  [INFERRED]
  index.html → docs/superpowers/specs/2026-08-06-kapak-konfiguratoru-design.md
- `Model Dock Paneli` --references--> `§4 Kapak Geometrisi`  [INFERRED]
  index.html → docs/superpowers/specs/2026-08-06-kapak-konfiguratoru-design.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **İki Tema Sistemi (Atölye / Şahinkaya Klasik)** — design_iki_tema, plan_task7_tema, index_tema_degistir_btn [INFERRED 0.80]
- **Gerçek Renk Kaynağı İlkesi (RAL/EGGER/Ahşap)** — design_renk_verisi, readme_renk_kaynaklari, plan_global_constraints, plan_renk_katalogu [INFERRED 0.85]
- **On-Demand Render Deseni** — design_performans_stratejisi, readme_performans_notlari, plan_dongusunu_baslat, plan_render_iste [INFERRED 0.85]

## Communities (19 total, 4 thin omitted)

### Community 0 - "ui.js"
Cohesion: 0.09
Nodes (59): idIleRenkBul(), idIleModelBul(), idIleOrtamBul(), idIleYuzeyBul(), aralikEtiketiniGuncelle(), arayuzuBaslat(), ayarOzetiniGuncelle(), ayarPaneliniKur() (+51 more)

### Community 1 - "Task 6: 3D Görüntüleyici"
Cohesion: 0.08
Nodes (15): §8 Mobil Uyumluluk, donguyuBaslat() — On-Demand Render Döngüsü, kapakGrubuOlustur(), KAPAK_MODELLERI, RENK_KATALOGU, Self-Review Notları, Task 10: Mobil Doğrulama ve Responsive İnce Ayar, Task 2: Renk Verisi (+7 more)

### Community 2 - "viewer.js"
Cohesion: 0.14
Nodes (25): baslat(), hexMetni(), ornekKapagiKur(), ORTAM_SECENEKLERI, varsayilanOrtami(), varsayilanYuzey(), YUZEYLER, camMalzemesiOlustur() (+17 more)

### Community 3 - "colors.js"
Cohesion: 0.12
Nodes (20): doluTonAileleri(), LAKE_TUMU, laketonuUret(), RAL_HANE_AILESI, ralSerileri(), ralSirasindakiRenkler(), RENK_KATALOGU, SERI_ETIKETLERI (+12 more)

### Community 4 - "Şahinkaya Kapak Konfigüratörü Projesi"
Cohesion: 0.07
Nodes (41): §10 Açık Kalan / Ertelenen Konular, §1 Amaç, §9 Doğrulama Planı, §6 İki Tema, §4 Kapak Geometrisi, §2 Kapsam, manifold.wasm (CSG kütüphanesi, bilinçli olarak kullanılmadı), §3 Mimari (+33 more)

### Community 5 - "glbYukleyici.js"
Cohesion: 0.19
Nodes (15): aynalanmisYuzleriDuzelt(), glbKapakGrubuOlustur(), glbSablonunuYukle(), onbellek, onYuzUvleriniOlustur(), yukleyici, bandiElleAyarla(), eksenEslemesiKur() (+7 more)

### Community 6 - "Kaydırmalı Renk-Döngülü Ana Sayfa — Tasarım"
Cohesion: 0.25
Nodes (7): Amaç, Kapsam Dışı, Kapsam Kararları (bu konuşmada onaylandı), Kaydırmalı Renk-Döngülü Ana Sayfa — Tasarım, Mimari, Test / Doğrulama, Önceki Denemeden Ders (2026-08-14, tamamen geri alınmıştı)

### Community 7 - "Şahinkaya Ahşap Logo"
Cohesion: 0.90
Nodes (5): AŞ Monogram Mark (House/Roof + S), Şahinkaya Ahşap Logo, Şahinkaya Mini Logo (Favicon), Furniture Door Configurator Website, Şahinkaya Ahşap

### Community 8 - "package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, check, start, test, type

### Community 9 - "renkler.js"
Cohesion: 0.21
Nodes (13): RAL_CLASSIC_KARTELA, RAL_CLASSIC_SERI_ETIKETLERI, ralClassicSerileri(), kodlar, seriler, aramayiKur(), bagilParlaklik(), hexMetni() (+5 more)

### Community 10 - "models.js"
Cohesion: 0.08
Nodes (33): GENEL_LIMITLER, GENEL_VARSAYILAN, KAPAK_MODELLERI, kapakModeli(), LISTE_SONU_MODELLERI, mKodunuBul(), beklenenGorseller, hk012 (+25 more)

### Community 11 - "4. Uygulama planı"
Cohesion: 0.11
Nodes (17): 1. Araştırma — skill'ler ne dedi, 2. Dürüst tespit: mevcut tasarım tam olarak o desende, 3. Mevcut durum denetimi (doğrulanmış bulgular), 4. Uygulama planı, 5. Kasıtlı olarak YAPILMAYACAKLAR, 6. Karara ihtiyaç duyan tek konu, 7. Tahmini etki, Faz 1 — Token katmanı (temel, görsel değişiklik yok) (+9 more)

### Community 13 - "Galeri fotoğrafları"
Cohesion: 0.50
Nodes (3): Fotoğraf önerisi, Galeri fotoğrafları, Nasıl eklenir

### Community 14 - "modeller.js"
Cohesion: 0.21
Nodes (10): GALERI_FOTOGRAFLARI, hexMetni(), kartOlustur(), katalogunuCiz(), konfiguratorAdresi(), modelinFotografi(), ORNEK_KODLAR, ornekRenkler() (+2 more)

## Ambiguous Edges - Review These
- `İndir / Paylaş Butonu` → `§2 Kapsam`  [AMBIGUOUS]
  index.html · relation: conceptually_related_to
- `Tam Ekran Butonu` → `Task 1: Proje İskeleti`  [AMBIGUOUS]
  index.html · relation: conceptually_related_to

## Knowledge Gaps
- **87 isolated node(s):** `TEMEL_TONLAR`, `RAL_HANE_AILESI`, `LAKE_TUMU`, `SERI_ETIKETLERI`, `tumRenkler` (+82 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 119 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `İndir / Paylaş Butonu` and `§2 Kapsam`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Tam Ekran Butonu` and `Task 1: Proje İskeleti`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `idIleModelBul()` connect `ui.js` to `models.js`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `KAPAK_MODELLERI` connect `models.js` to `ui.js`, `viewer.js`, `modeller.js`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `idIleRenkBul()` connect `ui.js` to `renkler.js`, `colors.js`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `arayuzuBaslat()` (e.g. with `main.js` and `dikeyKaydirmayiPlanla()`) actually correct?**
  _`arayuzuBaslat()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TEMEL_TONLAR`, `RAL_HANE_AILESI`, `LAKE_TUMU` to the rest of the system?**
  _87 weakly-connected nodes found - possible documentation gaps or missing edges._
