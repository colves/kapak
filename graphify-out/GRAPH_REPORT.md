# Graph Report - Kapak  (2026-09-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 278 nodes · 521 edges · 14 communities
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cd0f2030`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ui.js
- Task 6: 3D Görüntüleyici
- viewer.js
- colors.js
- Şahinkaya Kapak Konfigüratörü Projesi
- kenarOlcekleme.test.js
- Kaydırmalı Renk-Döngülü Ana Sayfa — Tasarım
- Şahinkaya Ahşap Logo
- package.json
- renkler.js
- modeller.js
- 4. Uygulama planı
- models.test.js
- Galeri fotoğrafları

## God Nodes (most connected - your core abstractions)
1. `arayuzuBaslat()` - 20 edges
2. `guncellemeyiUygula()` - 12 edges
3. `isikPaneliniKur()` - 11 edges
4. `idIleModelBul()` - 10 edges
5. `durumuSorguyaKodla()` - 10 edges
6. `modelGaleriKartiOlustur()` - 9 edges
7. `Task 6: 3D Görüntüleyici` - 9 edges
8. `urliDurumaEsitle()` - 8 edges
9. `whatsappBaglantisiniGuncelle()` - 8 edges
10. `ornekKapagiKur()` - 8 edges

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

## Communities (14 total, 0 thin omitted)

### Community 0 - "ui.js"
Cohesion: 0.10
Nodes (47): idIleRenkBul(), idIleModelBul(), idIleYuzeyBul(), varsayilanYuzey(), YUZEYLER, aralikEtiketiniGuncelle(), arayuzuBaslat(), ayarOzetiniGuncelle() (+39 more)

### Community 1 - "Task 6: 3D Görüntüleyici"
Cohesion: 0.08
Nodes (15): §8 Mobil Uyumluluk, donguyuBaslat() — On-Demand Render Döngüsü, kapakGrubuOlustur(), KAPAK_MODELLERI, RENK_KATALOGU, Self-Review Notları, Task 10: Mobil Doğrulama ve Responsive İnce Ayar, Task 2: Renk Verisi (+7 more)

### Community 2 - "viewer.js"
Cohesion: 0.11
Nodes (29): baslat(), hexMetni(), ornekKapagiKur(), idIleOrtamBul(), ORTAM_SECENEKLERI, varsayilanOrtami(), malzemeUygula(), renkVerisindenMalzemeOlustur() (+21 more)

### Community 3 - "colors.js"
Cohesion: 0.13
Nodes (17): doluTonAileleri(), LAKE_TUMU, laketonuUret(), RAL_HANE_AILESI, RENK_KATALOGU, SERI_ETIKETLERI, TEMEL_TONLAR, aileToplami (+9 more)

### Community 4 - "Şahinkaya Kapak Konfigüratörü Projesi"
Cohesion: 0.07
Nodes (41): §10 Açık Kalan / Ertelenen Konular, §1 Amaç, §9 Doğrulama Planı, §6 İki Tema, §4 Kapak Geometrisi, §2 Kapsam, manifold.wasm (CSG kütüphanesi, bilinçli olarak kullanılmadı), §3 Mimari (+33 more)

### Community 5 - "kenarOlcekleme.test.js"
Cohesion: 0.21
Nodes (13): glbKapakGrubuOlustur(), glbSablonunuYukle(), onbellek, yukleyici, bandiElleAyarla(), eksenEslemesiKur(), kenarBandiOlc(), bant (+5 more)

### Community 6 - "Kaydırmalı Renk-Döngülü Ana Sayfa — Tasarım"
Cohesion: 0.25
Nodes (7): Amaç, Kapsam Dışı, Kapsam Kararları (bu konuşmada onaylandı), Kaydırmalı Renk-Döngülü Ana Sayfa — Tasarım, Mimari, Test / Doğrulama, Önceki Denemeden Ders (2026-08-14, tamamen geri alınmıştı)

### Community 7 - "Şahinkaya Ahşap Logo"
Cohesion: 0.90
Nodes (5): AŞ Monogram Mark (House/Roof + S), Şahinkaya Ahşap Logo, Şahinkaya Mini Logo (Favicon), Furniture Door Configurator Website, Şahinkaya Ahşap

### Community 8 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, type

### Community 9 - "renkler.js"
Cohesion: 0.35
Nodes (9): ralSerileri(), aramayiKur(), bagilParlaklik(), hexMetni(), kartelaSayacinaDon(), kartelayiCiz(), konfiguratorAdresi(), kutuOlustur() (+1 more)

### Community 10 - "modeller.js"
Cohesion: 0.14
Nodes (21): ralSirasindakiRenkler(), GALERI_FOTOGRAFLARI, hexMetni(), kartOlustur(), katalogunuCiz(), konfiguratorAdresi(), modelinFotografi(), ORNEK_KODLAR (+13 more)

### Community 11 - "4. Uygulama planı"
Cohesion: 0.11
Nodes (17): 1. Araştırma — skill'ler ne dedi, 2. Dürüst tespit: mevcut tasarım tam olarak o desende, 3. Mevcut durum denetimi (doğrulanmış bulgular), 4. Uygulama planı, 5. Kasıtlı olarak YAPILMAYACAKLAR, 6. Karara ihtiyaç duyan tek konu, 7. Tahmini etki, Faz 1 — Token katmanı (temel, görsel değişiklik yok) (+9 more)

### Community 12 - "models.test.js"
Cohesion: 0.29
Nodes (6): KAPAK_MODELLERI, beklenenGorseller, hk012, hk051, m3970, urlSeti

### Community 13 - "Galeri fotoğrafları"
Cohesion: 0.50
Nodes (3): Fotoğraf önerisi, Galeri fotoğrafları, Nasıl eklenir

## Ambiguous Edges - Review These
- `İndir / Paylaş Butonu` → `§2 Kapsam`  [AMBIGUOUS]
  index.html · relation: conceptually_related_to
- `Tam Ekran Butonu` → `Task 1: Proje İskeleti`  [AMBIGUOUS]
  index.html · relation: conceptually_related_to

## Knowledge Gaps
- **67 isolated node(s):** `baslangicModel`, `durum`, `ZEMIN_SECENEKLERI`, `ORNEK_KODLAR`, `ANAHTARLAR` (+62 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 90 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `İndir / Paylaş Butonu` and `§2 Kapsam`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Tam Ekran Butonu` and `Task 1: Proje İskeleti`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `durumuSorguyaKodla()` connect `modeller.js` to `ui.js`, `renkler.js`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `glbKapakGrubuOlustur()` connect `kenarOlcekleme.test.js` to `viewer.js`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `Task 1: Proje İskeleti` connect `Şahinkaya Kapak Konfigüratörü Projesi` to `Task 6: 3D Görüntüleyici`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `arayuzuBaslat()` (e.g. with `main.js` and `dikeyKaydirmayiPlanla()`) actually correct?**
  _`arayuzuBaslat()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `baslangicModel`, `durum`, `ZEMIN_SECENEKLERI` to the rest of the system?**
  _67 weakly-connected nodes found - possible documentation gaps or missing edges._