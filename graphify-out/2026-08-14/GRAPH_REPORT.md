# Graph Report - Kapak  (2026-08-14)

## Corpus Check
- 46 files · ~61,905 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 285 nodes · 478 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 92% EXTRACTED · 7% INFERRED · 1% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9622f2e7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- viewer.js
- ui.js
- index.html (Konfigüratör Giriş Noktası)
- Refero Design Skill (SKILL.md) (.claude copy)
- colors.js
- Refero Design Skill (SKILL.md) (.agents copy)
- Copywriting Guide (.agents copy)
- js/doorGeometry.js
- Typography Guide (.agents copy)
- theme.js
- package.json
- dev-server.mjs
- Şahinkaya Ahşap Logo
- Mini Logo (Favicon/Navbar Brand Mark)
- Refero Design OpenAI Agent Interface (.agents copy)
- Sahinkaya_kapak (Önceki Deneme Klasörü)
- sinema-hesaplamalari.js

## God Nodes (most connected - your core abstractions)
1. `Refero Design Skill (SKILL.md) (.claude copy)` - 22 edges
2. `Refero Design Skill (SKILL.md) (.agents copy)` - 22 edges
3. `arayuzuBaslat()` - 21 edges
4. `index.html (Konfigüratör Giriş Noktası)` - 15 edges
5. `Task 1: Proje İskeleti` - 13 edges
6. `kapagiGuncelle()` - 11 edges
7. `Klasör Yapısı Bölümü` - 11 edges
8. `sahneyiBaslat()` - 10 edges
9. `Refero MCP Tools Reference (.claude copy)` - 10 edges
10. `Refero MCP Tools Reference (.agents copy)` - 10 edges

## Surprising Connections (you probably didn't know these)
- `renkVerisindenMalzemeOlustur()` --calls--> `Procedural Ahşap Doku Üretimi`  [EXTRACTED]
  js/materials.js → docs/superpowers/specs/2026-08-06-kapak-konfiguratoru-design.md
- `js/ui.js` --calls--> `KAPAK_MODELLERI`  [EXTRACTED]
  docs/superpowers/plans/2026-08-06-kapak-konfiguratoru.md → js/data/models.js
- `js/main.js` --calls--> `arayuzuBaslat()`  [EXTRACTED]
  docs/superpowers/plans/2026-08-06-kapak-konfiguratoru.md → js/ui.js
- `js/ui.js` --implements--> `arayuzuBaslat()`  [EXTRACTED]
  docs/superpowers/plans/2026-08-06-kapak-konfiguratoru.md → js/ui.js
- `js/doorGeometry.js` --implements--> `kapakGeometrisiTemizle()`  [EXTRACTED]
  docs/superpowers/plans/2026-08-06-kapak-konfiguratoru.md → js/doorGeometry.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Anti-AI-Slop Detection Pattern Group** — _agents_skills_refero_design_references_anti_ai_slop, _agents_skills_refero_design_references_anti_ai_slop_indigo_violet_tell, _agents_skills_refero_design_references_anti_ai_slop_cards_everywhere_tell, _agents_skills_refero_design_references_anti_ai_slop_dark_mode_default_tell [EXTRACTED 0.85]
- **Design Craft Reference Bundle Linked From SKILL.md** — _agents_skills_refero_design_skill, _agents_skills_refero_design_references_color, _agents_skills_refero_design_references_typography, _agents_skills_refero_design_references_motion, _agents_skills_refero_design_references_icons, _agents_skills_refero_design_references_craft_details [EXTRACTED 0.90]
- **Refero Three-Layer Research Methodology (Styles/Screens/Flows)** — _agents_skills_refero_design_skill, _agents_skills_refero_design_references_mcp_tools_refero_search_styles, _agents_skills_refero_design_references_mcp_tools_refero_search_screens, _agents_skills_refero_design_references_mcp_tools_refero_search_flows [EXTRACTED 0.90]
- **Doğrulanmış Renk Kaynakları (RAL + EGGER + colors.js)** — ext_ral_classic, ext_egger, js_data_colors_module, concept_gercek_renk_kaynaklari [EXTRACTED 1.00]
- **On-demand Render + Dispose + Doku Önbellek Performans Stratejisi** — concept_on_demand_rendering, concept_dispose_pattern, concept_procedural_ahsap_dokusu, js_viewer_module [EXTRACTED 1.00]
- **Kapak Güncelleme Veri Akışı (state -> geometri -> materyal -> render)** — js_ui_arayuzubaslat, js_viewer_kapagiguncelle, js_doorgeometry_kapakgrubuolustur, js_materials_renkverisindenmalzemeolustur [INFERRED 0.85]

## Communities (17 total, 2 thin omitted)

### Community 0 - "viewer.js"
Cohesion: 0.09
Nodes (38): Geometri/Materyal Dispose Deseni, On-demand Render Döngüsü, OrbitControls (three/addons), PMREMGenerator, RoomEnvironment (three/addons), Işık Dock Paneli (dock-isik), Işık/HDR Seçenek Listesi (isik-listesi), citaliKapakGrubuOlustur() (+30 more)

### Community 1 - "ui.js"
Cohesion: 0.10
Nodes (39): kategoriVerisiniAl(), idIleModelBul(), KAPAK_MODELLERI, js/data/models.js, hk012, hk051, m3970, urlSeti (+31 more)

### Community 2 - "index.html (Konfigüratör Giriş Noktası)"
Cohesion: 0.07
Nodes (39): Sidebar Ayar Paneli Yaklaşımı (Task 1 taslağı), Build Adımı Yok / Framework'süz Mimari, Dock Panel Mimarisi (Güncel index.html), css/base.css, css/theme-atolye.css, css/theme-sahinkaya.css, Three.js Kütüphanesi (r0.160.0), Alt Kategori Sekmeleri (alt-kategori-sekmeleri) (+31 more)

### Community 3 - "Refero Design Skill (SKILL.md) (.claude copy)"
Cohesion: 0.10
Nodes (32): Color Guide (.agents copy), 60/30/10 Color Distribution Rule (.agents copy), OKLCH Color Space (.agents copy), Anti-AI-Slop Guide (.claude copy), Calm Editorial Serif Tell (.claude copy), Cards Everywhere Tell (.claude copy), Dark Mode by Default Tell (.claude copy), Indigo/Violet AI Tell (.claude copy) (+24 more)

### Community 4 - "colors.js"
Cohesion: 0.08
Nodes (25): Gerçek Renk Kaynaklarına Dayanma İlkesi, Procedural Ahşap Doku Üretimi, EGGER Dekor Kodları, RAL Classic Standardı, idIleRenkBul(), kodlardanTonlariAl(), LAKE_ACIK_POPULER_KODLAR, LAKE_ACIK_TUMU (+17 more)

### Community 5 - "Refero Design Skill (SKILL.md) (.agents copy)"
Cohesion: 0.14
Nodes (26): Anti-AI-Slop Guide (.agents copy), Calm Editorial Serif Tell (.agents copy), Cards Everywhere Tell (.agents copy), Dark Mode by Default Tell (.agents copy), Indigo/Violet AI Tell (.agents copy), Reference Averaging Tell (.agents copy), Token Role Drift Tell (.agents copy), Example Workflow: SaaS Pricing Page (.agents copy) (+18 more)

### Community 6 - "Copywriting Guide (.agents copy)"
Cohesion: 0.14
Nodes (16): Copywriting Guide (.agents copy), Clarity > Respect > Character Order (.agents copy), Sticky Line Test (.agents copy), Craft Details Guide (.agents copy), Focus-Visible Rule (.agents copy), Motion & Micro-interactions Guide (.agents copy), Motion Pyramid (.agents copy), Reduced Motion Rule (.agents copy) (+8 more)

### Community 7 - "js/doorGeometry.js"
Cohesion: 0.14
Nodes (14): CSG'siz Çerçeve+Panel Yaklaşımı, Mobil Bottom Sheet Deseni, manifold.wasm (Silante CSG kütüphanesi), Sahinkaya Canlı Site (sahinkayamobilya.com), silante.com.tr (Referans Konfigüratör), js/doorGeometry.js, Task 10: Mobil Doğrulama ve Responsive İnce Ayar, Task 4: Kapak Geometrisi (+6 more)

### Community 8 - "Typography Guide (.agents copy)"
Cohesion: 0.22
Nodes (10): Icons & Glyphs Guide (.agents copy), Icon Style Consistency Rule (One Language Per Product) (.agents copy), Typography Guide (.agents copy), One-Font Rule (.agents copy), Type Scale Ratios (.agents copy), Icons & Glyphs Guide (.claude copy), Icon Style Consistency Rule (One Language Per Product) (.claude copy), Typography Guide (.claude copy) (+2 more)

### Community 9 - "theme.js"
Cohesion: 0.33
Nodes (8): İki Tema Sistemi (Atölye / Şahinkaya Klasik), GECERLI_TEMALAR, js/theme.js, temaBaslat(), temaDegistir(), temaUygula(), Task 7: Tema Sistemi, §6 İki Tema

### Community 10 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, type

### Community 11 - "dev-server.mjs"
Cohesion: 0.50
Nodes (3): KOK, MIME, sunucu

### Community 12 - "Şahinkaya Ahşap Logo"
Cohesion: 0.67
Nodes (3): Şahinkaya Ahşap Logo, Şahinkaya Ahşap (Brand), Furniture Door Configurator Website

### Community 13 - "Mini Logo (Favicon/Navbar Brand Mark)"
Cohesion: 0.67
Nodes (3): Mini Logo (Favicon/Navbar Brand Mark), House-Roof + S Monogram Brand Mark, Navbar/Browser-Tab Icon Usage Pattern

### Community 17 - "sinema-hesaplamalari.js"
Cohesion: 0.67
Nodes (3): KAMERA_KEYFRAMELERI, kameraDurumuHesapla(), vektorLerp()

## Ambiguous Edges - Review These
- `Visual QA Severity Classification (P0-P3) (.agents copy)` → `Token Role Drift Tell (.agents copy)`  [AMBIGUOUS]
  .agents/skills/refero-design/references/anti-ai-slop.md · relation: conceptually_related_to
- `Visual QA Severity Classification (P0-P3) (.claude copy)` → `Token Role Drift Tell (.claude copy)`  [AMBIGUOUS]
  .claude/skills/refero-design/references/anti-ai-slop.md · relation: conceptually_related_to
- `Tüm Renkleri Gör Butonu (btn-tumunu-gor)` → `Renk Kütüphanesi Modalı (renk-modal)`  [AMBIGUOUS]
  index.html · relation: references

## Knowledge Gaps
- **67 isolated node(s):** `hk012`, `hk051`, `m3970`, `urlSeti`, `ANA_KATEGORILER` (+62 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Visual QA Severity Classification (P0-P3) (.agents copy)` and `Token Role Drift Tell (.agents copy)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Visual QA Severity Classification (P0-P3) (.claude copy)` and `Token Role Drift Tell (.claude copy)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Tüm Renkleri Gör Butonu (btn-tumunu-gor)` and `Renk Kütüphanesi Modalı (renk-modal)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `index.html (Konfigüratör Giriş Noktası)` connect `index.html (Konfigüratör Giriş Noktası)` to `viewer.js`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `Klasör Yapısı Bölümü` connect `index.html (Konfigüratör Giriş Noktası)` to `viewer.js`, `theme.js`, `colors.js`, `js/doorGeometry.js`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `js/main.js` connect `index.html (Konfigüratör Giriş Noktası)` to `ui.js`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `hk012`, `hk051`, `m3970` to the rest of the system?**
  _67 weakly-connected nodes found - possible documentation gaps or missing edges._