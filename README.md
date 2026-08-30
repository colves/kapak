# Şahinkaya Kapak Konfigüratörü

Özel tasarım mutfak/dolap kapaklarını 3 boyutlu olarak model, ölçü ve gerçek
renk/yüzey seçenekleriyle önizlemeye yarayan bağımsız, framework'süz statik web sayfası.

## Çalıştırma

Build adımı yoktur. ES modülleri kullanıldığı için `file://` ile doğrudan açmak
CORS kısıtına takılır — yerel bir sunucu üzerinden açılması gerekir.

Depoda bağımlılıksız bir geliştirme sunucusu hazır:

```bash
node scripts/dev-server.mjs
```

Sonra tarayıcıda `http://localhost:5500` adresini açın. Alternatif olarak VS Code
"Live Server" eklentisi veya `npx serve` gibi başka bir statik sunucu da kullanılabilir.

## Klasör Yapısı

- `index.html` — tek sayfa giriş noktası
- `css/` — `base.css` (layout) + iki tema dosyası (`theme-atolye.css`, `theme-sahinkaya.css`)
- `js/data/` — renk kataloğu ve model tanımları (sabit veri, Node ile test edilebilir)
- `js/doorGeometry.js` — kapak geometrisi (düz kutu / çıtalı çerçeve+panel)
- `js/materials.js` — gerçekçi malzeme ve procedural ahşap dokusu üretimi
- `js/viewer.js` — Three.js sahnesi, kamera, ışık, on-demand render döngüsü
- `js/theme.js` — "Atölye" / "Şahinkaya Klasik" tema geçişi
- `js/ui.js`, `js/main.js` — arayüz bağlama ve giriş noktası
- `scripts/dev-server.mjs` — bağımlılıksız yerel önizleme sunucusu

## Veri Testlerini Çalıştırma

```bash
node js/data/colors.test.js
node js/data/models.test.js
```

## Notlar

- Renkler gerçek kaynaklara dayanır: RAL Classic (Lake/Membran/Akrilik tonları),
  doğrulanmış EGGER dekor kodları ve gerçek ağaç türü isimleri (Membran Ahşap
  Desenli/Masif Ahşap). Kaynak künyesi `js/data/colors.js` başındaki yorumdadır.
- Performans: sürekli render döngüsü yoktur (yalnızca kamera hareketi/etkileşim
  render tetikler), `devicePixelRatio` üst sınırı 2, doku üretimi renk başına
  önbelleklenir, geometri/materyal her güncellemede `dispose()` edilir.
- Mobilde (≤860px) ayar paneli alttan açılan bir "bottom sheet"e dönüşür.

## Kapsam Dışı / Sonraki Adımlar

- WhatsApp üzerinden teklif alma entegrasyonu henüz eklenmedi (bilinçli olarak ertelendi).
- Renk kataloğu sabit kod (JS) olarak yönetiliyor; ileride admin panelinden yönetilebilir hale getirilebilir.
