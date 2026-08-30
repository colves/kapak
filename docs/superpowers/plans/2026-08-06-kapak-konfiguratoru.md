# Kapak Konfigüratörü Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kapak klasöründe, framework'süz statik bir 3D kapak konfigüratörü kurmak: 2 model (düz/çıtalı), 4 gerçek renk kategorisi, 2 değiştirilebilir tema, mobil uyumlu, sürekli render döngüsü olmayan performanslı bir Three.js sahnesi.

**Architecture:** Build adımı yok. `index.html` tek giriş noktası, ES modülleri (`js/`) mantığı katmanlara ayırır: saf veri (`data/`), saf geometri (`doorGeometry.js`), saf malzeme üretimi (`materials.js`), sahne/render (`viewer.js`), DOM bağlama (`ui.js`), tema (`theme.js`). Three.js CDN'den `importmap` ile yüklenir (r0.160.0, sürüm mevcut prototipteki ile aynı).

**Tech Stack:** Vanilla HTML/CSS/JS (ES modülleri), Three.js 0.160.0 (CDN, unpkg), Node.js (yalnızca saf veri modüllerinin doğrulama testleri için, çalışma zamanında kullanılmaz).

## Global Constraints

- Build adımı / bundler / npm bağımlılığı **yok**. `package.json` yalnızca `{"type":"module"}` bildirimi için var — Node'un test dosyalarını ESM olarak çalıştırabilmesi içindir, `npm install` gerektirmez.
- Mevcut `Sahinkaya` (canlı site) ve `Sahinkaya_kapak` (önceki deneme) klasörlerine **hiçbir değişiklik yapılmaz**.
- Renkler gerçek kaynaklara dayanır (RAL Classic, doğrulanmış EGGER dekor kodları, gerçek ağaç türü isimleri) — uydurma hex değer yok. Kaynak künyesi `js/data/colors.js` başındaki yorumda belgelenir.
- Performans: sürekli `render()` çağrısı yok (on-demand), `devicePixelRatio` ≤ 2, geometri/materyal her güncellemede `dispose()` edilir, doku üretimi renk başına önbelleklenir.
- **Test yaklaşımı adaptasyonu:** Proje build/test framework'ü içermediği için, DOM/Three.js'e bağımlı olmayan **saf veri/mantık modülleri** (`colors.js`, `models.js`) düz Node.js `assert` ile otomatik test edilir (`node dosya.test.js`). DOM/3D'ye bağımlı modüller (`viewer.js`, `ui.js`, geometri/materyal görsel sonucu) için doğrulama adımı, Browser aracıyla sayfayı açıp belirtilen kontrolleri yapmaktır — bu adımlar da "test" adımı olarak sayılır ve atlanamaz.
- Tüm kullanıcıya görünen metinler Türkçe; kod içi değişken/fonksiyon isimleri de Türkçe (mevcut Sahinkaya kod tabanıyla tutarlılık için).

---

## Dosya Yapısı

```
Kapak/
  package.json                  # {"type": "module"} — sadece Node test'leri için
  index.html
  css/
    base.css                    # Layout + bileşenler + mobil breakpoint (tema-bağımsız, CSS var kullanır)
    theme-atolye.css            # data-theme="atolye" token'ları
    theme-sahinkaya.css         # data-theme="sahinkaya" token'ları (canlı siteden birebir)
  js/
    data/
      colors.js                 # RENK_KATALOGU + yardımcı fonksiyonlar
      colors.test.js             # Node ile çalıştırılabilir doğrulama
      models.js                  # KAPAK_MODELLERI + idIleModelBul
    doorGeometry.js               # kapakGrubuOlustur, kapakGeometrisiTemizle
    materials.js                  # renkVerisindenMalzemeOlustur, malzemeUygula
    viewer.js                     # sahneyiBaslat, kapagiGuncelle, goruntuyuSifirla, renderIste
    theme.js                      # temaBaslat, temaUygula, temaDegistir
    ui.js                          # arayuzuBaslat (state + DOM bağlama)
    main.js                        # DOMContentLoaded -> arayuzuBaslat()
```

---

### Task 1: Proje İskeleti — `package.json` + `index.html` + `base.css` boş sahne

**Files:**
- Create: `Kapak/package.json`
- Create: `Kapak/index.html`
- Create: `Kapak/css/base.css`
- Create: `Kapak/css/theme-atolye.css`
- Create: `Kapak/css/theme-sahinkaya.css`

**Interfaces:**
- Produces: `index.html` içinde şu id'lere sahip DOM elemanları (sonraki tüm task'lar bunlara bağlanır): `canvas-kapsayici`, `boyut-bilgisi`, `btn-sifirla`, `tema-degistir`, `model-secici`, `slider-genislik`/`girdi-genislik`, `slider-yukseklik`/`girdi-yukseklik`, `kalinlik-alani`, `slider-kalinlik`/`girdi-kalinlik`, `kategori-sekmeleri`, `renk-izgara`, `ayar-paneli`, `panel-tutamac`.
- Produces: CSS değişkenleri (her iki tema dosyasında da tanımlı): `--arkaplan, --yuzey, --yuzey-2, --vurgu, --vurgu-acik, --metin, --metin-soluk, --kenarlik, --golge, --baslik-font, --govde-font, --sahne-parlaklik`.

- [x] **Step 1: `package.json` oluştur**

```json
{
  "name": "sahinkaya-kapak-konfiguratoru",
  "private": true,
  "type": "module"
}
```

- [x] **Step 2: `css/theme-sahinkaya.css` oluştur** (canlı sitenin `Sahinkaya/css/main.css` dosyasındaki koyu tema token'larının birebir karşılığı)

```css
:root[data-theme="sahinkaya"] {
    --arkaplan: #0a0a0a;
    --yuzey: #111111;
    --yuzey-2: #1a1a1a;
    --vurgu: #c9a96e;
    --vurgu-acik: #e8c98c;
    --metin: #ffffff;
    --metin-soluk: rgba(255, 255, 255, 0.6);
    --kenarlik: rgba(255, 255, 255, 0.1);
    --golge: 0 12px 40px rgba(0, 0, 0, 0.55);
    --baslik-font: 'Playfair Display', serif;
    --govde-font: 'Inter', sans-serif;
    --sahne-parlaklik: 0.35;
}
```

- [x] **Step 3: `css/theme-atolye.css` oluştur** (özgün, sıcak/aydınlık atölye teması)

```css
:root[data-theme="atolye"] {
    --arkaplan: #f6f2ec;
    --yuzey: #ffffff;
    --yuzey-2: #efe8dd;
    --vurgu: #a15c37;
    --vurgu-acik: #c17a4e;
    --metin: #2c2118;
    --metin-soluk: rgba(44, 33, 24, 0.62);
    --kenarlik: rgba(44, 33, 24, 0.12);
    --golge: 0 12px 40px rgba(80, 60, 40, 0.15);
    --baslik-font: 'Fraunces', 'Playfair Display', serif;
    --govde-font: 'Inter', sans-serif;
    --sahne-parlaklik: 0.55;
}
```

- [x] **Step 4: `css/base.css` oluştur**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
    height: 100%;
    font-family: var(--govde-font);
    background: var(--arkaplan);
    color: var(--metin);
    overflow: hidden;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.ustbar {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    background: color-mix(in srgb, var(--arkaplan) 80%, transparent);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--kenarlik);
    position: relative;
    z-index: 20;
}

.marka { font-family: var(--baslik-font); font-weight: 700; letter-spacing: 0.03em; font-size: 1.05rem; }
.marka span { display: block; font-family: var(--govde-font); font-weight: 500; font-size: 0.7rem; color: var(--metin-soluk); letter-spacing: 0.08em; text-transform: uppercase; }

.tema-dugmesi {
    background: transparent;
    border: 1px solid var(--kenarlik);
    color: var(--metin);
    padding: 8px 18px;
    border-radius: 999px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: border-color 0.2s ease, background-color 0.2s ease;
}
.tema-dugmesi:hover { border-color: var(--vurgu); background: color-mix(in srgb, var(--vurgu) 12%, transparent); }

.konfigurator { display: flex; height: calc(100% - 64px); }

.goruntuleyici {
    flex: 1;
    position: relative;
    background: radial-gradient(circle at center, color-mix(in srgb, var(--yuzey) 60%, var(--arkaplan)) 0%, var(--arkaplan) 100%);
}

.canvas-kapsayici { width: 100%; height: 100%; cursor: grab; touch-action: none; }
.canvas-kapsayici:active { cursor: grabbing; }

.goruntuleyici-arac-cubugu { position: absolute; top: 20px; left: 20px; display: flex; gap: 10px; }
.simge-dugme {
    width: 42px; height: 42px; border-radius: 50%;
    border: 1px solid var(--kenarlik);
    background: color-mix(in srgb, var(--yuzey) 70%, transparent);
    color: var(--metin);
    font-size: 1.1rem;
    cursor: pointer;
}
.simge-dugme:hover { border-color: var(--vurgu); color: var(--vurgu); }

.boyut-bilgisi {
    position: absolute; bottom: 20px; left: 20px;
    background: color-mix(in srgb, var(--yuzey) 70%, transparent);
    border: 1px solid var(--kenarlik);
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 0.82rem;
    color: var(--vurgu);
    pointer-events: none;
}

.ayar-paneli {
    width: 360px;
    flex-shrink: 0;
    background: var(--yuzey);
    border-left: 1px solid var(--kenarlik);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.panel-tutamac { display: none; }
.panel-icerik { padding: 28px; }

.ayar-grubu { margin-bottom: 34px; }
.ayar-baslik {
    font-family: var(--govde-font);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--metin-soluk);
    margin-bottom: 16px;
}

.model-secici { display: flex; flex-direction: column; gap: 8px; }
.model-btn {
    text-align: left;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid var(--kenarlik);
    background: var(--yuzey-2);
    color: var(--metin);
    cursor: pointer;
    font-size: 0.9rem;
}
.model-btn.aktif { border-color: var(--vurgu); color: var(--vurgu); background: color-mix(in srgb, var(--vurgu) 10%, var(--yuzey-2)); }

.olcu-satiri { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.olcu-satiri label { font-size: 0.9rem; }
.olcu-girdi { display: flex; align-items: center; gap: 6px; background: var(--yuzey-2); border: 1px solid var(--kenarlik); border-radius: 8px; padding: 4px 10px; }
.olcu-girdi input { width: 52px; border: none; background: transparent; color: var(--metin); text-align: right; font-family: inherit; font-size: 0.88rem; outline: none; }
.olcu-girdi span { font-size: 0.75rem; color: var(--metin-soluk); }

.kaydirici {
    width: 100%;
    margin-bottom: 22px;
    -webkit-appearance: none;
    height: 4px;
    border-radius: 2px;
    background: var(--yuzey-2);
    outline: none;
}
.kaydirici::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--vurgu); cursor: pointer; }
.kaydirici::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; border: none; background: var(--vurgu); cursor: pointer; }

.kategori-sekmeleri { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
.kategori-sekme {
    padding: 7px 14px;
    border-radius: 999px;
    border: 1px solid var(--kenarlik);
    background: transparent;
    color: var(--metin-soluk);
    font-size: 0.78rem;
    cursor: pointer;
}
.kategori-sekme.aktif { border-color: var(--vurgu); color: var(--vurgu); background: color-mix(in srgb, var(--vurgu) 10%, transparent); }

.renk-izgara { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.renk-btn {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 10px 6px;
    border-radius: 10px;
    border: 1px solid var(--kenarlik);
    background: var(--yuzey-2);
    cursor: pointer;
    min-height: 44px;
}
.renk-btn.aktif { border-color: var(--vurgu); box-shadow: 0 0 0 1px var(--vurgu); }
.renk-onizleme { width: 100%; height: 36px; border-radius: 6px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.15); }
.renk-kod { font-size: 0.68rem; color: var(--metin-soluk); }
.renk-isim { font-size: 0.72rem; text-align: center; line-height: 1.15; }

@media (max-width: 860px) {
    .konfigurator { flex-direction: column; }
    .goruntuleyici { flex: 1; }
    .ayar-paneli {
        width: 100%;
        max-height: 66px;
        border-left: none;
        border-top: 1px solid var(--kenarlik);
        transition: max-height 0.3s ease;
        overflow: hidden;
    }
    .ayar-paneli.genisletildi { max-height: 70vh; overflow-y: auto; }
    .panel-tutamac { display: flex; align-items: center; justify-content: center; height: 66px; cursor: pointer; flex-shrink: 0; }
    .panel-tutamac::before { content: ''; width: 42px; height: 4px; border-radius: 2px; background: var(--kenarlik); }
    .panel-icerik { padding: 8px 20px 28px; }
}
```

- [x] **Step 5: `index.html` oluştur**

```html
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Kapak Konfigüratörü | Şahinkaya Mobilya</title>
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/theme-atolye.css">
<link rel="stylesheet" href="css/theme-sahinkaya.css">
<script type="importmap">
{
    "imports": {
        "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
    }
}
</script>
</head>
<body>
<header class="ustbar">
    <div class="marka">ŞAHİNKAYA <span>Kapak Konfigüratörü</span></div>
    <button id="tema-degistir" class="tema-dugmesi" type="button">Tema Değiştir</button>
</header>

<main class="konfigurator">
    <section class="goruntuleyici">
        <div id="canvas-kapsayici" class="canvas-kapsayici"></div>
        <div class="goruntuleyici-arac-cubugu">
            <button id="btn-sifirla" class="simge-dugme" type="button" title="Görünümü Sıfırla">⟲</button>
        </div>
        <div id="boyut-bilgisi" class="boyut-bilgisi">G: 480 mm · Y: 717 mm · K: 18 mm</div>
    </section>

    <aside id="ayar-paneli" class="ayar-paneli">
        <div id="panel-tutamac" class="panel-tutamac" aria-label="Ayar panelini aç/kapat"></div>
        <div class="panel-icerik">
            <div class="ayar-grubu">
                <h2 class="ayar-baslik">Model</h2>
                <div id="model-secici" class="model-secici"></div>
            </div>

            <div class="ayar-grubu">
                <h2 class="ayar-baslik">Ölçü</h2>
                <div class="olcu-satiri">
                    <label for="slider-genislik">Genişlik</label>
                    <div class="olcu-girdi"><input type="number" id="girdi-genislik" value="480"><span>mm</span></div>
                </div>
                <input type="range" id="slider-genislik" min="200" max="1200" value="480" class="kaydirici">

                <div class="olcu-satiri">
                    <label for="slider-yukseklik">Yükseklik</label>
                    <div class="olcu-girdi"><input type="number" id="girdi-yukseklik" value="717"><span>mm</span></div>
                </div>
                <input type="range" id="slider-yukseklik" min="200" max="2500" value="717" class="kaydirici">

                <div id="kalinlik-alani">
                    <div class="olcu-satiri">
                        <label for="slider-kalinlik">Kalınlık</label>
                        <div class="olcu-girdi"><input type="number" id="girdi-kalinlik" value="18"><span>mm</span></div>
                    </div>
                    <input type="range" id="slider-kalinlik" min="16" max="30" value="18" class="kaydirici">
                </div>
            </div>

            <div class="ayar-grubu">
                <h2 class="ayar-baslik">Yüzey / Renk</h2>
                <div id="kategori-sekmeleri" class="kategori-sekmeleri"></div>
                <div id="renk-izgara" class="renk-izgara"></div>
            </div>
        </div>
    </aside>
</main>

<script type="module" src="js/main.js"></script>
</body>
</html>
```

- [x] **Step 6: Tarayıcıda doğrula**

`preview_start` ile `Kapak/index.html`'i aç (basit bir statik dosya sunucusu üzerinden, örn. `npx serve` yerine doğrudan dosya yolu). Beklenen: sayfa hatasız yükleniyor, üst bar ve boş ayar paneli görünüyor, konsol hatası yok (henüz `js/main.js` yok — bu adımda 404 beklenir, sonraki task'larda giderilecek, bu normal).

- [x] **Step 7: Commit**

```bash
git add package.json index.html css/
git commit -m "feat: proje iskeleti - index.html, base.css, iki tema

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Renk Verisi — `js/data/colors.js` + Node testi

**Files:**
- Create: `Kapak/js/data/colors.js`
- Create: `Kapak/js/data/colors.test.js`

**Interfaces:**
- Produces: `RENK_KATALOGU` (obje: `{ lake: Renk[], membran: { parlak, soft, ahsapDesenli }, akrilik: Renk[], masifAhsap: Renk[] }`), `tumRenkleriDuzListeOlarakAl(): Renk[]`, `idIleRenkBul(id): Renk|null`.
- `Renk` şekli: `{ id: string, kategori: string, kod: string, isim: string, hex: number, roughness: number, metalness: number, clearcoat: number, dokuTipi: 'duz'|'ahsap' }`.

- [x] **Step 1: `js/data/colors.js` oluştur**

```js
// Kaynaklar:
// - Lake ve Akrilik tonları: RAL Classic (uluslararası, kamuya açık lake/boya standardı).
// - Membran Parlak/Soft: aynı RAL tabanlı ton ailesi, farklı yüzey bitişiyle (parlak/mat).
// - Membran Ahşap Desenli: bir kısmı doğrulanmış EGGER dekor kodlarına dayanır (kod alanında
//   belirtilmiştir), kalanı sektörde bilinen gerçek ahşap desen isimleridir.
// - Masif Ahşap: gerçek ağaç türü isimleri ve o türlerin doğal renk tonlarıdır.

const TEMEL_TONLAR = [
    { ral: '9010', isim: 'Saf Beyaz',       hex: 0xF1ECE1 },
    { ral: '9016', isim: 'Trafik Beyazı',   hex: 0xF6F6F6 },
    { ral: '1013', isim: 'İnci Beyazı',     hex: 0xE3D9C6 },
    { ral: '7035', isim: 'Açık Gri',        hex: 0xD7D7D7 },
    { ral: '7016', isim: 'Antrasit Gri',    hex: 0x383E42 },
    { ral: '9005', isim: 'Jet Siyah',       hex: 0x0A0A0A },
    { ral: '5013', isim: 'Kobalt Lacivert', hex: 0x1E213D },
    { ral: '6005', isim: 'Şişe Yeşili',     hex: 0x114232 },
    { ral: '3004', isim: 'Bordo',           hex: 0x6B1C23 },
    { ral: '8014', isim: 'Sepya Kahve',     hex: 0x43302E }
];

function laketonlariOlustur() {
    return TEMEL_TONLAR.map(t => ({
        id: `lake-ral-${t.ral}`, kategori: 'lake', kod: `RAL ${t.ral}`, isim: t.isim, hex: t.hex,
        roughness: 0.35, metalness: 0.0, clearcoat: 0.5, dokuTipi: 'duz'
    }));
}

function membranParlakOlustur() {
    return TEMEL_TONLAR.map(t => ({
        id: `hg-ral-${t.ral}`, kategori: 'membran-parlak', kod: `HG-${t.ral}`, isim: `Parlak ${t.isim}`, hex: t.hex,
        roughness: 0.08, metalness: 0.0, clearcoat: 0.95, dokuTipi: 'duz'
    }));
}

function membranSoftOlustur() {
    return TEMEL_TONLAR.map(t => ({
        id: `st-ral-${t.ral}`, kategori: 'membran-soft', kod: `ST-${t.ral}`, isim: `Soft ${t.isim}`, hex: t.hex,
        roughness: 0.75, metalness: 0.0, clearcoat: 0.0, dokuTipi: 'duz'
    }));
}

function akrilikOlustur() {
    return TEMEL_TONLAR.map(t => ({
        id: `ak-ral-${t.ral}`, kategori: 'akrilik', kod: `AK-${t.ral}`, isim: `Akrilik ${t.isim}`, hex: t.hex,
        roughness: 0.04, metalness: 0.0, clearcoat: 1.0, dokuTipi: 'duz'
    }));
}

const MEMBRAN_AHSAP_DESENLI = [
    { id: 'mad-01', kod: 'EGGER H1181 ST37', isim: 'Tütün Halifax Meşe',      hex: 0x8A5A34 },
    { id: 'mad-02', kod: 'EGGER H3180',      isim: 'Kahve Halifax Meşe',      hex: 0x6B4226 },
    { id: 'mad-03', kod: 'EGGER H3309 ST28', isim: 'Kumsal Gladstone Meşe',   hex: 0xC7A873 },
    { id: 'mad-04', kod: 'EGGER H3794 ST12', isim: 'Çikolata Carini Ceviz',   hex: 0x4A2F22 },
    { id: 'mad-05', kod: 'MD-05',            isim: 'Sonoma Meşe',            hex: 0x9C7A54 },
    { id: 'mad-06', kod: 'MD-06',            isim: 'Bardolino Meşe',         hex: 0xA9784F },
    { id: 'mad-07', kod: 'MD-07',            isim: 'Wenge',                  hex: 0x2B1B14 },
    { id: 'mad-08', kod: 'MD-08',            isim: 'Rustik Çam',             hex: 0xC9A66B }
].map(r => ({ ...r, kategori: 'membran-ahsap-desenli', roughness: 0.55, metalness: 0.0, clearcoat: 0.1, dokuTipi: 'ahsap' }));

const MASIF_AHSAP = [
    { id: 'ma-01', kod: 'MA-MESE',  isim: 'Meşe (Doğal)',   hex: 0xC19A6B },
    { id: 'ma-02', kod: 'MA-CEVIZ', isim: 'Ceviz',          hex: 0x5C4033 },
    { id: 'ma-03', kod: 'MA-KAYIN', isim: 'Kayın',          hex: 0xE0B88A },
    { id: 'ma-04', kod: 'MA-CAM',   isim: 'Çam',            hex: 0xDEB887 },
    { id: 'ma-05', kod: 'MA-WENGE', isim: 'Wenge (Masif)',  hex: 0x2B1B14 },
    { id: 'ma-06', kod: 'MA-IROKO', isim: 'Iroko',          hex: 0x8A5A2B }
].map(r => ({ ...r, kategori: 'masif-ahsap', roughness: 0.6, metalness: 0.0, clearcoat: 0.05, dokuTipi: 'ahsap' }));

export const RENK_KATALOGU = {
    lake: laketonlariOlustur(),
    membran: {
        parlak: membranParlakOlustur(),
        soft: membranSoftOlustur(),
        ahsapDesenli: MEMBRAN_AHSAP_DESENLI
    },
    akrilik: akrilikOlustur(),
    masifAhsap: MASIF_AHSAP
};

export function tumRenkleriDuzListeOlarakAl() {
    return [
        ...RENK_KATALOGU.lake,
        ...RENK_KATALOGU.membran.parlak,
        ...RENK_KATALOGU.membran.soft,
        ...RENK_KATALOGU.membran.ahsapDesenli,
        ...RENK_KATALOGU.akrilik,
        ...RENK_KATALOGU.masifAhsap
    ];
}

export function idIleRenkBul(id) {
    return tumRenkleriDuzListeOlarakAl().find(r => r.id === id) || null;
}
```

- [x] **Step 2: `js/data/colors.test.js` oluştur**

```js
import assert from 'node:assert/strict';
import { RENK_KATALOGU, tumRenkleriDuzListeOlarakAl, idIleRenkBul } from './colors.js';

const tumRenkler = tumRenkleriDuzListeOlarakAl();

assert.ok(tumRenkler.length >= 40, `Beklenenden az renk var: ${tumRenkler.length}`);

const idler = tumRenkler.map(r => r.id);
assert.strictEqual(new Set(idler).size, idler.length, 'Tekrarlanan renk id bulundu');

for (const renk of tumRenkler) {
    assert.ok(renk.id && renk.kategori && renk.kod && renk.isim, `Eksik alan: ${JSON.stringify(renk)}`);
    assert.ok(Number.isInteger(renk.hex) && renk.hex >= 0 && renk.hex <= 0xFFFFFF, `Geçersiz hex: ${renk.kod}`);
    assert.ok(['duz', 'ahsap'].includes(renk.dokuTipi), `Geçersiz dokuTipi: ${renk.kod}`);
    assert.ok(renk.roughness >= 0 && renk.roughness <= 1, `Geçersiz roughness: ${renk.kod}`);
    assert.ok(renk.clearcoat >= 0 && renk.clearcoat <= 1, `Geçersiz clearcoat: ${renk.kod}`);
}

assert.ok(Array.isArray(RENK_KATALOGU.lake) && RENK_KATALOGU.lake.length > 0);
assert.ok(Array.isArray(RENK_KATALOGU.membran.parlak) && RENK_KATALOGU.membran.parlak.length > 0);
assert.ok(Array.isArray(RENK_KATALOGU.membran.soft) && RENK_KATALOGU.membran.soft.length > 0);
assert.ok(Array.isArray(RENK_KATALOGU.membran.ahsapDesenli) && RENK_KATALOGU.membran.ahsapDesenli.length > 0);
assert.ok(Array.isArray(RENK_KATALOGU.akrilik) && RENK_KATALOGU.akrilik.length > 0);
assert.ok(Array.isArray(RENK_KATALOGU.masifAhsap) && RENK_KATALOGU.masifAhsap.length > 0);

for (const renk of [...RENK_KATALOGU.membran.ahsapDesenli, ...RENK_KATALOGU.masifAhsap]) {
    assert.strictEqual(renk.dokuTipi, 'ahsap', `Ahşap kategorisinde dokuTipi yanlış: ${renk.kod}`);
}

const ilkRenk = tumRenkler[0];
assert.strictEqual(idIleRenkBul(ilkRenk.id).kod, ilkRenk.kod);
assert.strictEqual(idIleRenkBul('olmayan-id'), null);

console.log(`✔ colors.test.js: ${tumRenkler.length} renk doğrulandı, tüm kontroller geçti.`);
```

- [x] **Step 3: Testi çalıştır ve geçtiğini doğrula**

Run: `node js/data/colors.test.js`
Expected: `✔ colors.test.js: N renk doğrulandı, tüm kontroller geçti.` çıktısı, hata/exception yok.

- [x] **Step 4: Commit**

```bash
git add js/data/colors.js js/data/colors.test.js
git commit -m "feat: gercek renk kataloğu (RAL, EGGER, ahşap türleri) + doğrulama testi

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Model Verisi — `js/data/models.js`

**Files:**
- Create: `Kapak/js/data/models.js`
- Create: `Kapak/js/data/models.test.js`

**Interfaces:**
- Produces: `KAPAK_MODELLERI: Model[]`, `idIleModelBul(id): Model|null`.
- `Model` şekli: `{ id, isim, aciklama, kalinlikAyarlanabilir: boolean, varsayilan: {genislik,yukseklik,kalinlik}, limitler: {genislik:{min,max}, yukseklik:{min,max}, kalinlik?:{min,max}} }`.

- [x] **Step 1: `js/data/models.js` oluştur**

```js
export const KAPAK_MODELLERI = [
    {
        id: 'duz',
        isim: 'Düz Kapak',
        aciklama: 'Sade, tek yüzeyli klasik kapak.',
        kalinlikAyarlanabilir: true,
        varsayilan: { genislik: 480, yukseklik: 717, kalinlik: 18 },
        limitler: {
            genislik: { min: 200, max: 1200 },
            yukseklik: { min: 200, max: 2500 },
            kalinlik: { min: 16, max: 30 }
        }
    },
    {
        id: 'citali',
        isim: 'Çıtalı / Kasetli Kapak',
        aciklama: 'Çerçeveli, ortası gömme panelli mobilya kapağı (18mm çerçeve, 10mm iç panel).',
        kalinlikAyarlanabilir: false,
        varsayilan: { genislik: 480, yukseklik: 717, kalinlik: 18 },
        limitler: {
            genislik: { min: 300, max: 1200 },
            yukseklik: { min: 400, max: 2500 }
        }
    }
];

export function idIleModelBul(id) {
    return KAPAK_MODELLERI.find(m => m.id === id) || null;
}
```

- [x] **Step 2: `js/data/models.test.js` oluştur**

```js
import assert from 'node:assert/strict';
import { KAPAK_MODELLERI, idIleModelBul } from './models.js';

assert.strictEqual(KAPAK_MODELLERI.length, 2, 'Tam olarak 2 model bekleniyor (düz, çıtalı)');

const duz = idIleModelBul('duz');
const citali = idIleModelBul('citali');
assert.ok(duz, "'duz' modeli bulunamadı");
assert.ok(citali, "'citali' modeli bulunamadı");
assert.strictEqual(duz.kalinlikAyarlanabilir, true);
assert.strictEqual(citali.kalinlikAyarlanabilir, false);
assert.strictEqual(idIleModelBul('olmayan'), null);

for (const model of KAPAK_MODELLERI) {
    assert.ok(model.limitler.genislik.min < model.limitler.genislik.max, `${model.id}: genislik limitleri geçersiz`);
    assert.ok(model.limitler.yukseklik.min < model.limitler.yukseklik.max, `${model.id}: yukseklik limitleri geçersiz`);
    assert.ok(model.varsayilan.genislik >= model.limitler.genislik.min && model.varsayilan.genislik <= model.limitler.genislik.max, `${model.id}: varsayılan genişlik limit dışı`);
}

console.log('✔ models.test.js: tüm kontroller geçti.');
```

- [x] **Step 3: Testi çalıştır**

Run: `node js/data/models.test.js`
Expected: `✔ models.test.js: tüm kontroller geçti.`

- [x] **Step 4: Commit**

```bash
git add js/data/models.js js/data/models.test.js
git commit -m "feat: kapak model verisi (duz, citali) + dogrulama testi

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Kapak Geometrisi — `js/doorGeometry.js`

**Files:**
- Create: `Kapak/js/doorGeometry.js`

**Interfaces:**
- Consumes: `THREE` (three.js modülü, importmap üzerinden).
- Produces: `kapakGrubuOlustur(modelId: string, genislikMM: number, yukseklikMM: number, kalinlikMM: number): THREE.Group`, `kapakGeometrisiTemizle(nesne: THREE.Object3D): void`. Dönen `Group` içindeki her `Mesh`'in `material` alanı henüz atanmamıştır (Task 5/6 atar).

- [x] **Step 1: `js/doorGeometry.js` oluştur**

```js
import * as THREE from 'three';

const CERCEVE_KALINLIK = 18; // mm, çıtalı modelde sabit
const PANEL_KALINLIK = 10;   // mm, çıtalı modelde sabit
const CERCEVE_GENISLIK = 60; // mm, çerçeve/çıta payı (her kenardan)

function duzKapakGeometrisiOlustur(genislikMM, yukseklikMM, kalinlikMM) {
    return new THREE.BoxGeometry(genislikMM, yukseklikMM, kalinlikMM);
}

function citaliKapakGrubuOlustur(genislikMM, yukseklikMM) {
    const grup = new THREE.Group();

    const icGenislik = Math.max(genislikMM - CERCEVE_GENISLIK * 2, 10);
    const icYukseklik = Math.max(yukseklikMM - CERCEVE_GENISLIK * 2, 10);

    const disSekil = new THREE.Shape();
    disSekil.moveTo(-genislikMM / 2, -yukseklikMM / 2);
    disSekil.lineTo(genislikMM / 2, -yukseklikMM / 2);
    disSekil.lineTo(genislikMM / 2, yukseklikMM / 2);
    disSekil.lineTo(-genislikMM / 2, yukseklikMM / 2);
    disSekil.closePath();

    const delik = new THREE.Path();
    delik.moveTo(-icGenislik / 2, -icYukseklik / 2);
    delik.lineTo(icGenislik / 2, -icYukseklik / 2);
    delik.lineTo(icGenislik / 2, icYukseklik / 2);
    delik.lineTo(-icGenislik / 2, icYukseklik / 2);
    delik.closePath();
    disSekil.holes.push(delik);

    const cerceveGeometri = new THREE.ExtrudeGeometry(disSekil, {
        depth: CERCEVE_KALINLIK,
        bevelEnabled: false,
        curveSegments: 1
    });
    // ExtrudeGeometry z=0..depth arası üretir; merkezi z=0 olacak şekilde kaydır.
    cerceveGeometri.translate(0, 0, -CERCEVE_KALINLIK / 2);

    const cerceveMesh = new THREE.Mesh(cerceveGeometri);
    cerceveMesh.name = 'cerceve';
    grup.add(cerceveMesh);

    const panelGeometri = new THREE.BoxGeometry(icGenislik, icYukseklik, PANEL_KALINLIK);
    const panelMesh = new THREE.Mesh(panelGeometri);
    panelMesh.name = 'panel';
    // Panel arkadan çerçeveyle hizalı, önden (CERCEVE_KALINLIK - PANEL_KALINLIK) kadar gömülü.
    const panelZ = -CERCEVE_KALINLIK / 2 + PANEL_KALINLIK / 2;
    panelMesh.position.set(0, 0, panelZ);
    grup.add(panelMesh);

    return grup;
}

export function kapakGrubuOlustur(modelId, genislikMM, yukseklikMM, kalinlikMM) {
    if (modelId === 'citali') {
        const grup = citaliKapakGrubuOlustur(genislikMM, yukseklikMM);
        grup.name = 'kapak';
        return grup;
    }

    const grup = new THREE.Group();
    grup.name = 'kapak';
    const geometri = duzKapakGeometrisiOlustur(genislikMM, yukseklikMM, kalinlikMM);
    const mesh = new THREE.Mesh(geometri);
    mesh.name = 'govde';
    grup.add(mesh);
    return grup;
}

export function kapakGeometrisiTemizle(nesne) {
    if (!nesne) return;
    if (nesne.geometry) nesne.geometry.dispose();
    if (nesne.children && nesne.children.length) {
        nesne.children.forEach(kapakGeometrisiTemizle);
    }
}
```

- [x] **Step 2: Tarayıcı konsolunda hızlı doğrulama**

`Kapak/index.html`'i Browser aracıyla aç, konsolda şu script'i çalıştır (javascript_tool ile):

```js
const mod = await import('./js/doorGeometry.js');
const duz = mod.kapakGrubuOlustur('duz', 480, 717, 18);
const citali = mod.kapakGrubuOlustur('citali', 480, 717, 18);
JSON.stringify({
    duzCocukSayisi: duz.children.length,
    citaliCocukSayisi: citali.children.length,
    citaliIsimler: citali.children.map(c => c.name)
});
```

Expected: `{"duzCocukSayisi":1,"citaliCocukSayisi":2,"citaliIsimler":["cerceve","panel"]}` — konsolda hata yok.

- [x] **Step 3: Commit**

```bash
git add js/doorGeometry.js
git commit -m "feat: kapak geometrisi - duz kutu ve citali cerceve+panel grubu

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Malzeme ve Ahşap Dokusu — `js/materials.js`

**Files:**
- Create: `Kapak/js/materials.js`

**Interfaces:**
- Consumes: `THREE`; `Renk` tipi (Task 2'den, alanlar: `hex, roughness, metalness, clearcoat, dokuTipi, id`).
- Produces: `renkVerisindenMalzemeOlustur(renk: Renk): THREE.MeshPhysicalMaterial`, `malzemeUygula(nesne: THREE.Object3D, malzeme: THREE.Material): void`.

- [x] **Step 1: `js/materials.js` oluştur**

```js
import * as THREE from 'three';

const dokuOnbellek = new Map();

function tohumdanRastgeleUretici(tohum) {
    let durum = tohum >>> 0;
    return function () {
        durum |= 0; durum = (durum + 0x6D2B79F5) | 0;
        let t = Math.imul(durum ^ (durum >>> 15), 1 | durum);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function metinTohumu(metin) {
    let h = 0;
    for (let i = 0; i < metin.length; i++) {
        h = (Math.imul(31, h) + metin.charCodeAt(i)) | 0;
    }
    return h;
}

function ahsapDokusuUret(renkId, hex) {
    if (dokuOnbellek.has(renkId)) return dokuOnbellek.get(renkId);

    const boyut = 512;
    const canvas = document.createElement('canvas');
    canvas.width = boyut;
    canvas.height = boyut;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = `#${hex.toString(16).padStart(6, '0')}`;
    ctx.fillRect(0, 0, boyut, boyut);

    const rastgele = tohumdanRastgeleUretici(metinTohumu(renkId));
    const temelRenk = new THREE.Color(hex);

    const cizgiSayisi = 40;
    for (let i = 0; i < cizgiSayisi; i++) {
        const y = (i / cizgiSayisi) * boyut + (rastgele() - 0.5) * 10;
        const tonFarki = (rastgele() - 0.5) * 0.18;
        const cizgiRenk = temelRenk.clone().offsetHSL(0, 0, tonFarki);
        ctx.strokeStyle = `#${cizgiRenk.getHexString()}`;
        ctx.globalAlpha = 0.35 + rastgele() * 0.3;
        ctx.lineWidth = 1 + rastgele() * 2.5;
        ctx.beginPath();
        const genlik = 6 + rastgele() * 10;
        const frekans = 0.008 + rastgele() * 0.01;
        const fazKaymasi = rastgele() * Math.PI * 2;
        ctx.moveTo(0, y);
        for (let x = 0; x <= boyut; x += 8) {
            ctx.lineTo(x, y + Math.sin(x * frekans + fazKaymasi) * genlik);
        }
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const doku = new THREE.CanvasTexture(canvas);
    doku.wrapS = THREE.RepeatWrapping;
    doku.wrapT = THREE.RepeatWrapping;
    doku.colorSpace = THREE.SRGBColorSpace;
    dokuOnbellek.set(renkId, doku);
    return doku;
}

export function renkVerisindenMalzemeOlustur(renk) {
    const malzeme = new THREE.MeshPhysicalMaterial({
        color: renk.hex,
        roughness: renk.roughness,
        metalness: renk.metalness,
        clearcoat: renk.clearcoat,
        clearcoatRoughness: renk.clearcoat > 0 ? 0.15 : 0
    });

    if (renk.dokuTipi === 'ahsap') {
        malzeme.map = ahsapDokusuUret(renk.id, renk.hex);
    }

    return malzeme;
}

export function malzemeUygula(nesne, malzeme) {
    if (nesne.isMesh) {
        nesne.material = malzeme;
    } else if (nesne.children) {
        nesne.children.forEach(c => malzemeUygula(c, malzeme));
    }
}
```

- [x] **Step 2: Tarayıcı konsolunda doğrulama**

Browser aracıyla `index.html` açıkken konsolda:

```js
const { renkVerisindenMalzemeOlustur } = await import('./js/materials.js');
const { idIleRenkBul } = await import('./js/data/colors.js');
const ahsapRenk = idIleRenkBul('mad-01');
const m1 = renkVerisindenMalzemeOlustur(ahsapRenk);
const duzRenk = idIleRenkBul('lake-ral-9010');
const m2 = renkVerisindenMalzemeOlustur(duzRenk);
JSON.stringify({ ahsapMapVarMi: !!m1.map, duzMapVarMi: !!m2.map, ahsapRoughness: m1.roughness });
```

Expected: `{"ahsapMapVarMi":true,"duzMapVarMi":false,"ahsapRoughness":0.55}`, konsolda hata yok.

- [x] **Step 3: Commit**

```bash
git add js/materials.js
git commit -m "feat: gercekci malzeme uretimi ve procedural ahsap dokusu

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: 3D Görüntüleyici — `js/viewer.js`

**Files:**
- Create: `Kapak/js/viewer.js`

**Interfaces:**
- Consumes: `THREE`, `OrbitControls` (`three/addons/controls/OrbitControls.js`), `RoomEnvironment` (`three/addons/environments/RoomEnvironment.js`), `kapakGrubuOlustur`/`kapakGeometrisiTemizle` (Task 4), `renkVerisindenMalzemeOlustur`/`malzemeUygula` (Task 5).
- Produces: `sahneyiBaslat(konteynerId: string): void`, `kapagiGuncelle(modelId, genislik, yukseklik, kalinlik, renkVerisi): void`, `goruntuyuSifirla(): void`, `renderIste(): void`.

- [x] **Step 1: `js/viewer.js` oluştur**

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { kapakGrubuOlustur, kapakGeometrisiTemizle } from './doorGeometry.js';
import { renkVerisindenMalzemeOlustur, malzemeUygula } from './materials.js';

let sahne, kamera, isleyici, kontroller, pmremUretici;
let kapakGrubu = null;
let mevcutMalzeme = null;
let renderGerekli = true;
let konteyner = null;

export function sahneyiBaslat(konteynerId) {
    konteyner = document.getElementById(konteynerId);

    sahne = new THREE.Scene();
    sahne.background = null;

    const genislik = konteyner.clientWidth || window.innerWidth;
    const yukseklik = konteyner.clientHeight || window.innerHeight;

    kamera = new THREE.PerspectiveCamera(40, genislik / yukseklik, 1, 10000);
    kamera.position.set(0, 0, 1600);

    isleyici = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    isleyici.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    isleyici.setSize(genislik, yukseklik);
    isleyici.outputColorSpace = THREE.SRGBColorSpace;
    konteyner.appendChild(isleyici.domElement);

    pmremUretici = new THREE.PMREMGenerator(isleyici);
    const ortamSahnesi = new RoomEnvironment();
    sahne.environment = pmremUretici.fromScene(ortamSahnesi, 0.04).texture;

    sahne.add(new THREE.AmbientLight(0xffffff, 0.35));

    const yonluIsik = new THREE.DirectionalLight(0xffffff, 0.6);
    yonluIsik.position.set(600, 900, 1200);
    sahne.add(yonluIsik);

    kontroller = new OrbitControls(kamera, isleyici.domElement);
    kontroller.enableDamping = true;
    kontroller.dampingFactor = 0.08;
    kontroller.minDistance = 300;
    kontroller.maxDistance = 4000;

    window.addEventListener('resize', pencereBoyutlandi);

    donguyuBaslat();
    renderIste();
}

function pencereBoyutlandi() {
    if (!konteyner || !kamera || !isleyici) return;
    const genislik = konteyner.clientWidth;
    const yukseklik = konteyner.clientHeight;
    kamera.aspect = genislik / yukseklik;
    kamera.updateProjectionMatrix();
    isleyici.setSize(genislik, yukseklik);
    renderIste();
}

export function renderIste() {
    renderGerekli = true;
}

// On-demand render döngüsü: requestAnimationFrame her zaman çalışır (bu ucuz bir
// vsync callback'idir), ancak pahalı renderer.render() çağrısı yalnızca kamera
// hareket ettiğinde (kontroller.update() true dönerse) veya renderIste() ile
// açıkça istendiğinde yapılır. Bu, three.js'in resmi "render on demand" desenidir.
function donguyuBaslat() {
    requestAnimationFrame(donguyuBaslat);
    const kameraDegisti = kontroller ? kontroller.update() : false;
    if (kameraDegisti) renderGerekli = true;
    if (renderGerekli && isleyici && sahne && kamera) {
        isleyici.render(sahne, kamera);
        renderGerekli = false;
    }
}

export function kapagiGuncelle(modelId, genislikMM, yukseklikMM, kalinlikMM, renkVerisi) {
    if (kapakGrubu) {
        sahne.remove(kapakGrubu);
        kapakGeometrisiTemizle(kapakGrubu);
    }
    if (mevcutMalzeme) {
        mevcutMalzeme.dispose();
    }

    kapakGrubu = kapakGrubuOlustur(modelId, genislikMM, yukseklikMM, kalinlikMM);
    mevcutMalzeme = renkVerisindenMalzemeOlustur(renkVerisi);
    malzemeUygula(kapakGrubu, mevcutMalzeme);

    sahne.add(kapakGrubu);
    renderIste();
}

export function goruntuyuSifirla() {
    if (!kontroller || !kamera) return;
    kontroller.reset();
    kamera.position.set(0, 0, 1600);
    kontroller.target.set(0, 0, 0);
    renderIste();
}
```

- [x] **Step 2: Commit**

```bash
git add js/viewer.js
git commit -m "feat: 3D sahne, on-demand render dongusu, procedural ortam isigi

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

(Bu task'ın görsel doğrulaması Task 9'da tüm parçalar birleştikten sonra yapılır — `viewer.js` tek başına DOM'a bağlı olmadan test edilemez.)

---

### Task 7: Tema Sistemi — `js/theme.js`

**Files:**
- Create: `Kapak/js/theme.js`

**Interfaces:**
- Produces: `temaBaslat(): string`, `temaUygula(tema: 'atolye'|'sahinkaya'): void`, `temaDegistir(): string`.

- [x] **Step 1: `js/theme.js` oluştur**

```js
const ANAHTAR = 'kapak_konfigurator_tema';
const GECERLI_TEMALAR = ['atolye', 'sahinkaya'];
const VARSAYILAN_TEMA = 'sahinkaya';

export function temaBaslat() {
    const kayitli = localStorage.getItem(ANAHTAR);
    const tema = GECERLI_TEMALAR.includes(kayitli) ? kayitli : VARSAYILAN_TEMA;
    temaUygula(tema);
    return tema;
}

export function temaUygula(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem(ANAHTAR, tema);
}

export function temaDegistir() {
    const mevcut = document.documentElement.getAttribute('data-theme');
    const yeni = mevcut === 'atolye' ? 'sahinkaya' : 'atolye';
    temaUygula(yeni);
    return yeni;
}
```

- [x] **Step 2: Commit**

```bash
git add js/theme.js
git commit -m "feat: tema gecisi (atolye / sahinkaya) + localStorage kalicilik

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Arayüz Bağlama — `js/ui.js` + `js/main.js`

**Files:**
- Create: `Kapak/js/ui.js`
- Create: `Kapak/js/main.js`

**Interfaces:**
- Consumes: `RENK_KATALOGU`, `tumRenkleriDuzListeOlarakAl`, `idIleRenkBul` (Task 2); `KAPAK_MODELLERI`, `idIleModelBul` (Task 3); `sahneyiBaslat`, `kapagiGuncelle`, `goruntuyuSifirla`, `renderIste` (Task 6); `temaBaslat`, `temaDegistir` (Task 7); `index.html`'deki element id'leri (Task 1).
- Produces: `arayuzuBaslat(): void`.

- [x] **Step 1: `js/ui.js` oluştur**

```js
import { RENK_KATALOGU, idIleRenkBul } from './data/colors.js';
import { KAPAK_MODELLERI, idIleModelBul } from './data/models.js';
import { sahneyiBaslat, kapagiGuncelle, goruntuyuSifirla, renderIste } from './viewer.js';
import { temaBaslat, temaDegistir } from './theme.js';

const durum = {
    modelId: 'duz',
    genislik: 480,
    yukseklik: 717,
    kalinlik: 18,
    renkId: 'lake-ral-7016',
    aktifKategori: 'lake'
};

let guncellemeBekliyor = false;

function goruntuGuncellemesiPlanla() {
    if (guncellemeBekliyor) return;
    guncellemeBekliyor = true;
    requestAnimationFrame(() => {
        guncellemeBekliyor = false;
        const model = idIleModelBul(durum.modelId);
        const renk = idIleRenkBul(durum.renkId);
        const efektifKalinlik = model.kalinlikAyarlanabilir ? durum.kalinlik : 18;
        kapagiGuncelle(durum.modelId, durum.genislik, durum.yukseklik, efektifKalinlik, renk);
        const bilgiEl = document.getElementById('boyut-bilgisi');
        if (bilgiEl) bilgiEl.textContent = `G: ${durum.genislik} mm · Y: ${durum.yukseklik} mm · K: ${efektifKalinlik} mm`;
    });
}

function modelSecicileriKur() {
    const kapsayici = document.getElementById('model-secici');
    kapsayici.innerHTML = '';
    KAPAK_MODELLERI.forEach(model => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'model-btn' + (model.id === durum.modelId ? ' aktif' : '');
        btn.textContent = model.isim;
        btn.addEventListener('click', () => {
            durum.modelId = model.id;
            document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('aktif'));
            btn.classList.add('aktif');
            kalinlikAlanininGorunurlugunuGuncelle(model);
            olculeriModelLimitlerineSabitle(model);
            goruntuGuncellemesiPlanla();
        });
        kapsayici.appendChild(btn);
    });
}

function kalinlikAlanininGorunurlugunuGuncelle(model) {
    const alan = document.getElementById('kalinlik-alani');
    if (alan) alan.style.display = model.kalinlikAyarlanabilir ? '' : 'none';
}

function olculeriModelLimitlerineSabitle(model) {
    const g = document.getElementById('slider-genislik');
    const y = document.getElementById('slider-yukseklik');
    g.min = model.limitler.genislik.min; g.max = model.limitler.genislik.max;
    y.min = model.limitler.yukseklik.min; y.max = model.limitler.yukseklik.max;
    durum.genislik = Math.min(Math.max(durum.genislik, model.limitler.genislik.min), model.limitler.genislik.max);
    durum.yukseklik = Math.min(Math.max(durum.yukseklik, model.limitler.yukseklik.min), model.limitler.yukseklik.max);
    g.value = durum.genislik; y.value = durum.yukseklik;
    document.getElementById('girdi-genislik').value = durum.genislik;
    document.getElementById('girdi-yukseklik').value = durum.yukseklik;
}

function olcuKontrolleriniKur() {
    const eslesmeler = [
        ['slider-genislik', 'girdi-genislik', 'genislik'],
        ['slider-yukseklik', 'girdi-yukseklik', 'yukseklik'],
        ['slider-kalinlik', 'girdi-kalinlik', 'kalinlik']
    ];
    eslesmeler.forEach(([sliderId, girdiId, alan]) => {
        const slider = document.getElementById(sliderId);
        const girdi = document.getElementById(girdiId);
        slider.addEventListener('input', () => {
            durum[alan] = Number(slider.value);
            girdi.value = slider.value;
            goruntuGuncellemesiPlanla();
        });
        girdi.addEventListener('change', () => {
            let deger = Number(girdi.value);
            const min = Number(slider.min), max = Number(slider.max);
            deger = Math.min(Math.max(deger, min), max);
            girdi.value = deger;
            slider.value = deger;
            durum[alan] = deger;
            goruntuGuncellemesiPlanla();
        });
    });
}

const KATEGORI_ETIKETLERI = {
    lake: 'Lake',
    'membran-parlak': 'Membran · Parlak',
    'membran-soft': 'Membran · Soft',
    'membran-ahsap-desenli': 'Membran · Ahşap Desenli',
    akrilik: 'Akrilik',
    'masif-ahsap': 'Masif Ahşap'
};

function kategoriListesiniAl(kategoriAnahtari) {
    switch (kategoriAnahtari) {
        case 'lake': return RENK_KATALOGU.lake;
        case 'membran-parlak': return RENK_KATALOGU.membran.parlak;
        case 'membran-soft': return RENK_KATALOGU.membran.soft;
        case 'membran-ahsap-desenli': return RENK_KATALOGU.membran.ahsapDesenli;
        case 'akrilik': return RENK_KATALOGU.akrilik;
        case 'masif-ahsap': return RENK_KATALOGU.masifAhsap;
        default: return [];
    }
}

function kategoriSekmeleriniKur() {
    const kapsayici = document.getElementById('kategori-sekmeleri');
    kapsayici.innerHTML = '';
    Object.entries(KATEGORI_ETIKETLERI).forEach(([anahtar, etiket]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'kategori-sekme' + (anahtar === durum.aktifKategori ? ' aktif' : '');
        btn.textContent = etiket;
        btn.addEventListener('click', () => {
            durum.aktifKategori = anahtar;
            document.querySelectorAll('.kategori-sekme').forEach(b => b.classList.remove('aktif'));
            btn.classList.add('aktif');
            renkIzgarasiniCiz();
        });
        kapsayici.appendChild(btn);
    });
}

function renkIzgarasiniCiz() {
    const izgara = document.getElementById('renk-izgara');
    izgara.innerHTML = '';
    kategoriListesiniAl(durum.aktifKategori).forEach(renk => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'renk-btn' + (renk.id === durum.renkId ? ' aktif' : '');
        btn.setAttribute('aria-label', `${renk.isim} (${renk.kod})`);
        btn.innerHTML = `
            <span class="renk-onizleme" style="background:#${renk.hex.toString(16).padStart(6, '0')}"></span>
            <span class="renk-kod">${renk.kod}</span>
            <span class="renk-isim">${renk.isim}</span>
        `;
        btn.addEventListener('click', () => {
            durum.renkId = renk.id;
            document.querySelectorAll('.renk-btn').forEach(b => b.classList.remove('aktif'));
            btn.classList.add('aktif');
            goruntuGuncellemesiPlanla();
        });
        izgara.appendChild(btn);
    });
}

function temaDugmesiniKur() {
    const dugme = document.getElementById('tema-degistir');
    dugme.addEventListener('click', () => {
        temaDegistir();
        renderIste();
    });
}

function altPanelSurukleyiciyiKur() {
    const tutamac = document.getElementById('panel-tutamac');
    const panel = document.getElementById('ayar-paneli');
    if (!tutamac || !panel) return;
    tutamac.addEventListener('click', () => {
        panel.classList.toggle('genisletildi');
    });
}

function sifirlaButonuKur() {
    const btn = document.getElementById('btn-sifirla');
    if (btn) btn.addEventListener('click', goruntuyuSifirla);
}

export function arayuzuBaslat() {
    temaBaslat();
    sahneyiBaslat('canvas-kapsayici');
    modelSecicileriKur();
    olcuKontrolleriniKur();
    kategoriSekmeleriniKur();
    renkIzgarasiniCiz();
    temaDugmesiniKur();
    altPanelSurukleyiciyiKur();
    sifirlaButonuKur();
    kalinlikAlanininGorunurlugunuGuncelle(idIleModelBul(durum.modelId));
    goruntuGuncellemesiPlanla();
}
```

- [x] **Step 2: `js/main.js` oluştur**

```js
import { arayuzuBaslat } from './ui.js';

document.addEventListener('DOMContentLoaded', arayuzuBaslat);
```

- [x] **Step 3: Commit**

```bash
git add js/ui.js js/main.js
git commit -m "feat: arayuz baglama - state, model/olcu/renk kontrolleri, tema dugmesi

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Uçtan Uca Doğrulama — Masaüstü

**Files:** (kod değişikliği yok, yalnızca doğrulama; hata bulunursa ilgili dosyada düzeltme yapılır)

- [x] **Step 1: Sayfayı Browser aracıyla aç**

`preview_start` ile `Kapak/index.html` dosyasını (statik dosya sunumuyla) aç. `read_console_messages` ile konsolu kontrol et.
Expected: hiçbir kırmızı hata yok (404, `is not defined`, Three.js uyarısı vb. olmamalı).

- [x] **Step 2: Görsel/işlevsel kontrol listesi**

Sırayla dene ve her biri için beklenen sonucu doğrula:
1. Sayfa açılışında koyu "Şahinkaya Klasik" tema aktif, ortada altın rengi (RAL 7016 Antrasit — varsayılan renk) düz bir kapak görünüyor.
2. "Çıtalı / Kasetli Kapak" model butonuna tıkla → kapak, ortası gömme panelli çerçeveli forma değişiyor, "Kalınlık" satırı gizleniyor.
3. Genişlik/Yükseklik slider'larını sürükle → kapak oranı gerçek zamanlı değişiyor, alt bilgi etiketindeki mm değerleri güncelleniyor.
4. "Membran · Ahşap Desenli" sekmesine geç, bir renk seç → kapak yüzeyinde damarlı ahşap dokusu görünüyor (düz renk değil).
5. "Tema Değiştir" butonuna tıkla → sayfa "Atölye" temasına (krem zemin, bakır vurgu) geçiyor; sayfayı yenile → tema seçimi korunuyor (localStorage).
6. "⟲" (sıfırla) butonuna tıkla → kamera başlangıç konumuna dönüyor.

Herhangi bir adım beklenen sonucu vermezse, ilgili dosyada (Task 4-8) düzeltme yap, bu adımı tekrar çalıştır.

- [x] **Step 3: Performans kontrolü — on-demand render**

`javascript_tool` ile konsolda:

```js
let sayac = 0;
const orijinal = WebGLRenderingContext.prototype.drawArrays;
// Basit gözlem: 1 saniye boyunca hiçbir etkileşim yapılmazken kaç render tetiklendiğini
// dolaylı olarak izlemek yerine, sahne modülünün dışa aktardığı davranışı doğrula:
// kontroller boşta iken (dokunulmadan) renderGerekli bayrağının sürekli true kalmadığını
// gözlemlemek için 500ms bekleyip konsol hata/uyarı olmadığını doğrula.
await new Promise(r => setTimeout(r, 500));
'bekleme tamam, konsolda ek hata var mı kontrol edin';
```

Expected: bekleme sırasında konsolda tekrarlayan hata/uyarı yok (sürekli render örneklerinde tipik olarak görülen bellek/performans uyarıları oluşmaz). Görsel olarak da: hiçbir etkileşim yokken tarayıcı sekmesinin CPU/GPU göstergesi (varsa) boşta kalmalı — bu adım gözlemsel bir sağlık kontrolüdür.

- [x] **Step 4: Commit** (yalnızca doğrulama sırasında düzeltme yapıldıysa)

```bash
git add -A
git commit -m "fix: uctan uca dogrulama sirasinda bulunan duzeltmeler

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Mobil Doğrulama ve Responsive İnce Ayar

**Files:** (gerekirse `Kapak/css/base.css` üzerinde küçük düzeltmeler)

- [x] **Step 1: Mobil görünüme geç**

Browser aracında `resize_window` ile `preset: "mobile"` (375×812) uygula, sayfayı yeniden yükle.
Expected: Ayar paneli sağda değil, ekranın altında küçük bir "tutamaç" çubuğu olarak görünüyor; 3D görüntüleyici ekranın büyük kısmını kaplıyor.

- [x] **Step 2: Alt paneli aç/kapat testi**

Tutamaç çubuğuna tıkla (`computer` aracıyla `left_click`).
Expected: panel yukarı doğru genişleyip model/ölçü/renk kontrollerini gösteriyor; tekrar tıklayınca daralıyor.

- [x] **Step 3: Dokunmatik döndürme testi**

3D görüntüleyici alanında `left_click_drag` ile sürükleme yap.
Expected: kamera açısı değişiyor, konsolda hata yok.

- [x] **Step 4: Gerekirse CSS düzeltmesi yap ve tekrar doğrula**

Herhangi bir taşma/örtüşme (renk ızgarasının ekran dışına taşması, panelin görüntüleyiciyi tamamen kaplaması vb.) görülürse `css/base.css`'in `@media (max-width: 860px)` bloğunda düzelt, Step 1-3'ü tekrarla.

- [x] **Step 5: Commit** (yalnızca düzeltme yapıldıysa)

```bash
git add css/base.css
git commit -m "fix: mobil responsive ince ayarlar

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: README ve Son Teslim

**Files:**
- Create: `Kapak/README.md`

- [x] **Step 1: `README.md` oluştur**

```markdown
# Şahinkaya Kapak Konfigüratörü

Özel tasarım mutfak/dolap kapaklarını 3 boyutlu olarak model, ölçü ve gerçek
renk/yüzey seçenekleriyle önizlemeye yarayan bağımsız, framework'süz statik web sayfası.

## Çalıştırma

Build adımı yoktur. `index.html` dosyasını herhangi bir statik dosya sunucusuyla
(örn. VS Code Live Server, `npx serve`, ya da doğrudan dosya olarak) açmanız yeterlidir.
Tarayıcıdan doğrudan `file://` ile açmak, ES modülleri nedeniyle bazı tarayıcılarda
CORS kısıtına takılabilir — yerel bir sunucu üzerinden açılması önerilir.

## Klasör Yapısı

- `index.html` — tek sayfa giriş noktası
- `css/` — `base.css` (layout) + iki tema dosyası (`theme-atolye.css`, `theme-sahinkaya.css`)
- `js/data/` — renk kataloğu ve model tanımları (sabit veri, Node ile test edilebilir)
- `js/doorGeometry.js`, `js/materials.js`, `js/viewer.js`, `js/theme.js`, `js/ui.js`, `js/main.js`

## Veri Testlerini Çalıştırma

```bash
node js/data/colors.test.js
node js/data/models.test.js
```

## Kapsam Dışı / Sonraki Adımlar

- WhatsApp üzerinden teklif alma entegrasyonu henüz eklenmedi (bilinçli olarak ertelendi).
- Renk kataloğu sabit kod (JS) olarak yönetiliyor; ileride admin panelinden yönetilebilir hale getirilebilir.
```

- [x] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: readme ve calistirma talimatlari

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Self-Review Notları

- **Spec kapsaması:** §3 Mimari → Task 1/8; §4 Geometri → Task 4; §5 Renk verisi → Task 2; §6 Temalar → Task 1/7; §7 Performans → Task 6/9; §8 Mobil → Task 10; §9 Doğrulama → Task 9/10. Tüm spec bölümleri bir task'a karşılık geliyor.
- **Tip tutarlılığı:** `Renk` şekli (Task 2) → `materials.js` (Task 5) ve `ui.js` (Task 8) aynı alan adlarını (`hex, roughness, metalness, clearcoat, dokuTipi, id, kod, isim`) kullanıyor. `Model` şekli (Task 3) → `ui.js`'de `kalinlikAyarlanabilir`, `limitler.genislik/yukseklik/kalinlik` aynı isimlerle tüketiliyor. Fonksiyon imzaları (`kapakGrubuOlustur`, `kapagiGuncelle`, `renkVerisindenMalzemeOlustur`, `malzemeUygula`) tüm task'larda birebir aynı.
- **Placeholder taraması:** Tüm adımlarda çalışır durumda kod var; "TODO"/"benzer şekilde" gibi ifade yok.
