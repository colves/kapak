# Konfigüratör Arayüz Yenileme — Uygulama Planı

**Durum:** Plan — henüz uygulanmadı.
**Kapsam:** `configurator.html`, `css/base.css`, tema dosyaları, `ui.js`'in DOM kuran kısımları.
**Kapsam DIŞI:** 3D görüntüleyici ve modelle ilgili her şey (`viewer.js`, `glbYukleyici.js`, `doorGeometry.js`, `materials.js`, `.glb`/`.hdr` varlıkları). Kapak sahnesinin kendisine, kameraya, ışığa, malzemeye dokunulmayacak.

---

## 1. Araştırma — skill'ler ne dedi

İki skill de çalıştırıldı. Şeffaflık için ne bulduğu **ve neyi bulamadığı** aşağıda.

### ui-ux-pro-max

| Sorgu | Sonuç |
|---|---|
| `--design-system "3d product configurator tool panel interface"` | Stil: **Minimalism & Swiss Style** ("Best For: professional tools"). Renk: warm grey + accent (`#78716C` / `#D97706`, not: *"Interior warm grey + gold accent"*). Tipografi önerisi e-ticaret etiketliydi (aşağıda gerekçesiyle reddedildi). |
| `--domain product "tool configurator editor workspace"` | **0 sonuç.** Veri setinde konfigüratör/araç ürün tipi yok — bu alanda skill'e dayanamıyorum, açıkça belirtiyorum. |
| `--domain ux "sidebar panel collapse workspace layout"` | Layout/**Fixed Positioning**: *"Don't stack multiple fixed elements carelessly"*. **Z-Index Management** (HIGH): *"Define z-index scale (10 20 30 50), don't use arbitrary values"*. **Viewport Units**: `100vh` yerine `dvh`. |
| `--domain ux "focus visible keyboard navigation"` | **Focus States** (HIGH): her etkileşimli kontrolde görünür focus halkası. **Keyboard Navigation** (HIGH). **Focus Not Obscured** (HIGH): sabit/kalıcı katmanlar focus'u örtmemeli. |
| `--domain icons "download fullscreen reset close chevron"` | Phosphor: `download-simple`, `arrows-out`, `x`, `caret-up/down`. |
| `--domain typography "professional tool precise technical"` | **Inter tek-aile precision sistemi** ("high-end utility, professional"): 600/-0.5 tracking başlıklar, 400 gövde, 500 uppercase +tracking etiketler. |

### refero-design

Canlı Refero MCP araştırması (gerçek ekran/stil örnekleri) **yapılamadı** — o özellik ücretli abonelik gerektiriyor ve bağlı değil. Yalnızca paketle gelen craft referansları okundu. Bulunan en önemli madde:

**`anti-ai-slop.md` — #4 Tell: "Calm editorial serif on autopilot"** — *"warm ivory/cream background, oversized high-contrast serif headline, muted olive/clay/terracotta accents... becomes AI slop when applied by default to dashboards or functional product UI without research."*

Ayrıca: **#5** emoji/obskür glif ikonlar, **#2** her şeyi kart yapmak, **#6** dekoratif sol renk şeridi, **#8** token rolü kayması (accent rengini amacı dışında kullanmak).

---

## 2. Dürüst tespit: mevcut tasarım tam olarak o desende

Bu rahatsız edici ama söylemem gerekiyor — `theme-atolye.css` şu an:

```
--arkaplan: #f2f1ee   → warm ivory
--vurgu:    #a15c37   → terracotta/clay
--baslik-font: 'Fraunces', 'Playfair Display', serif  → editorial serif
```

Yani rehberin "otopilot" olarak işaretlediği kombinasyonun birebir kendisi, üstelik **fonksiyonel bir ürün arayüzünde**.

**Ama tamamen haksız değil:** Bu palet uydurma değil, markanızın gerçek logosundan geliyor (turuncu + gri). Rehber de "serif ve toprak tonları yasak değil, otopilot uygulaması yasak" diyor ve `ui-ux-pro-max` bağımsız olarak "Interior warm grey + gold accent" önerdi. Yani **sıcak kimlik kalıyor** — değişen şey onun *nasıl* kullanıldığı:

> Marka sıcaklığı **yüzeylerde ve vurguda** yaşar; konfigüratörün tipografisi ve düzeni ise **Swiss/fonksiyonel** registere geçer. Editorial serif konfigüratör kabuğundan çıkar (zaten sadece tek bir modal başlığında kullanılıyor).

Yön adı: **"Precision Instrument"** — sıcak-nötr yüzeyler, tek aile Inter, katı ölçek, turuncu **yalnızca** seçim/aktif durum için (token rolü disiplini, #8 Tell).

---

## 3. Mevcut durum denetimi (doğrulanmış bulgular)

Hepsi kodda tek tek doğrulandı, tahmin yok:

| # | Bulgu | Kanıt | Önem |
|---|---|---|---|
| 1 | **Hiçbir CSS dosyasında tek bir focus stili yok** | 4 dosyada `grep -c focus` → hepsi `0` | **KRİTİK** |
| 2 | **HTML'de hiç aria attribute yok** | `grep aria-` → 0 sonuç. `⟲` ve `✕` sadece-ikon butonların erişilebilir adı yok | **KRİTİK** |
| 3 | Sağda 3 katlı çakışık şerit | `base.css:131-136`, `right: 0/48/96` + kardeş seçici itme matematiği | Yüksek |
| 4 | Sol altta 2 ayrı yüzen bilgi hapı | `base.css:81-107`, `bottom: 20px` ve `bottom: 60px` | Orta |
| 5 | Rastgele z-index | `5`, `15`, `20`, `100` (`base.css:90,124,24,281`) — ölçek yok | Yüksek |
| 6 | 8 farklı radius değeri | 5, 6, 8, 10, 12, 14, 999, 50% px | Orta |
| 7 | 12px altı metin | `.renk-kod` `0.68rem` ≈ **10.9px** (`base.css:334`) | Orta |
| 8 | Dokunma hedefi küçük | `.simge-dugme` 42×42 (min 44), slider thumb 10×22 | Orta |
| 9 | Mobil viewport | `height: 100%` + `calc(100% - 84px)`, `dvh` yok | Orta |
| 10 | Obskür Unicode ikonlar | `⭳` `⛶` `⟲` `✕` `›` — platformlar arası tutarsız render | Orta |
| 11 | Sihirli sayılar | `.marka-logo{margin-left:48px}`, araç çubuğu `left:64px` (şerit genişliğini elle telafi) | Düşük |

---

## 4. Uygulama planı

### Faz 1 — Token katmanı (temel, görsel değişiklik yok)
`base.css`'in başına gerçek bir ölçek sistemi:

- **Boşluk:** `--s-1:4px … --s-8:48px` (4pt ritmi) — 6/7/10/14/18/22/26px karışıklığı biter
- **Radius:** sadece 3 değer — `--r-sm:6px`, `--r-md:10px`, `--r-full:999px`
- **Z-index:** `--z-sahne:10`, `--z-dock:20`, `--z-ustbar:30`, `--z-modal:50` (skill'in birebir önerdiği ölçek)
- **Tip ölçeği:** 12/13/15/17/22px + ağırlık/tracking eşleri; 12px altı hiçbir metin kalmaz

*Doğrulama:* Görsel çıktı bu fazda neredeyse aynı kalmalı — sadece değerler değişkenlere taşınır.

### Faz 2 — Tipografi (Precision Instrument)
- Konfigüratör kabuğunda `Fraunces`/`Playfair` kullanımını kaldır → tek aile **Inter**
- Etiketler: Inter 500, `uppercase`, `+0.08em` tracking
- **Ölçü değerleri `font-variant-numeric: tabular-nums`** — şu an "480 mm" → "1200 mm" olurken kutu genişliği zıplıyor; skill'in `number-tabular` kuralı
- `Fraunces` ana sayfada kalabilir (orada editorial ton meşru)

### Faz 3 — İkonlar
`⭳ ⛶ ⟲ ✕ ›` yerine **inline Phosphor SVG** (`currentColor` ile, tek stroke ağırlığı).
Projede build adımı/npm yok → `import { DownloadSimple }` **kullanılamaz**, SVG path'leri doğrudan gömülecek.

| Yer | Şu an | Olacak |
|---|---|---|
| İndir/Paylaş | `⭳` | `download-simple` |
| Tam Ekran | `⛶` | `arrows-out` |
| Görünümü Sıfırla | `⟲` | `arrow-counter-clockwise` |
| Modal kapat | `✕` | `x` |
| Dock oku | `›` | `caret-down` / `caret-up` |
| Tema | (metin) | `sun` / `moon` + metin |

### Faz 4 — Sağ panel birleştirme *(en büyük yapısal kazanım)*
3 ayrı çakışık şerit → **tek sağ panel, başında 3 sekme** (Renk / Boyut / Işık).

- Skill'in "birden fazla sabit elemanı dikkatsizce üst üste koyma" uyarısını çözer
- `base.css:131-136`'daki kırılgan kardeş-seçici itme matematiği tamamen silinir
- Görüntüleyicinin sağ kenarı 96px yerine 48px'e düşer, kapak nefes alır
- Sol Model paneli olduğu gibi kalır (bağımsız, sorun çıkarmıyor)

### Faz 5 — Durum çubuğu birleştirme
Sol alttaki 2 yüzen hap → tek satır: `HK_012_001 · RAL 7016 Antrasit Gri · 480 × 717 mm`
Yüzen eleman sayısı azalır, `left:64px` sihirli sayısı token'a bağlanır.

### Faz 6 — Erişilebilirlik *(kritik açığın kapatılması)*
- Her etkileşimli kontrole `:focus-visible` halkası (2px `--vurgu` + 2px offset)
- Sadece-ikon butonlara `aria-label`
- Dock başlıklarına `aria-expanded`, seçili model/renk/ışığa `aria-pressed`
- `.simge-dugme` 42→44px, slider thumb hit alanı büyütme
- `height:100%` → `100dvh` / `calc(100dvh - var(--ustbar-h))`
- Klavyeyle baştan sona gezilebilirlik testi

### Faz 7 — Doğrulama
- Tarayıcıda 375 / 768 / 1024 / 1440px
- Her iki tema ayrı ayrı kontrast kontrolü (4.5:1)
- `prefers-reduced-motion` açıkken
- Klavye-only tur; focus hiçbir yerde panel altında kaybolmuyor
- Konsol/network hatası yok
- Mevcut Node testleri geçmeye devam ediyor

---

## 5. Kasıtlı olarak YAPILMAYACAKLAR

- **3D sahne, kamera, ışık, malzeme** — kapsam dışı, tek satır dokunulmayacak
- **Renk/model verisi** — `colors.js`, `models.js`, `ortamlar.js` aynı kalır
- **Yeni kart sarmalayıcılar** (#2 Tell) — kart yalnızca tıklanabilir öğelerde (model/renk butonları) kalır
- **Dekoratif sol renk şeridi** (#6 Tell)
- **Turuncu vurgunun dekoratif kullanımı** (#8 Tell) — sadece seçim/aktif/focus rolünde
- **Yeni bir renk paleti icat etmek** — marka logosundan gelen sıcak kimlik korunur

---

## 6. Karara ihtiyaç duyan tek konu

`anti-ai-slop.md` **#3 Tell**: *"Dark mode by default is an AI fingerprint. Unless the brief explicitly asks for dark — use light mode."*

Şu an `theme.js` varsayılanı **`sahinkaya` (koyu)**. Bu bilinçli bir marka tercihi mi, yoksa varsayılan **`atolye` (açık)** mı olmalı? İki tema da kalacak — soru sadece hangisiyle açılacağı. Bunu siz karar verin; plan her iki durumda da geçerli.

---

## 7. Tahmini etki

| Dosya | Değişim |
|---|---|
| `css/base.css` | Yoğun — token katmanı, panel birleştirme, focus, ölçek |
| `configurator.html` | Orta — SVG ikonlar, aria, sağ panel sekme yapısı, durum çubuğu |
| `js/ui.js` | Hafif-orta — sekme mantığı, aria state, ikon enjeksiyonu (3D mantığa dokunulmaz) |
| `css/theme-*.css` | Hafif — birkaç token eklemesi |
| `js/viewer.js` ve 3D dosyaları | **Sıfır** |
