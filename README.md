# Şahinkaya Mobilya Web Sitesi

Şahinkaya Mobilya'nın kurumsal sitesi, tamamlanmış proje galerisi, RAL renk
kartelası, lake kapak model kataloğu ve 3B kapak konfigüratörü. Proje bağımlılıksız,
framework kullanmayan statik bir web sitesidir ve GitHub Pages üzerinden yayınlanır.

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

- `index.html` — ana sayfa
- `modeller/`, `renkler/`, `projeler/`, `iletisim/` — temiz URL kullanan içerik sayfaları
- `konfigurator/` — 3B lake kapak konfigüratörü
- `assets/models/` — üretim modellerinden dönüştürülen GLB kapaklar
- `assets/model-fotograflari/` — model katalog görselleri
- `assets/projeler/` — tamamlanmış uygulama fotoğrafları
- `css/` — ortak ve sayfaya özel stiller
- `js/data/` — model, RAL renk, yüzey ve ortam tanımları
- `js/viewer.js`, `js/glbYukleyici.js`, `js/materials.js` — 3B görüntüleme katmanı
- `scripts/` — yerel sunucu, bağlantı üretimi ve yayın öncesi testler
- `graphify-out/` — güncel kod bağımlılık haritası ve raporu

## Yayın Öncesi Kontrol

```bash
npm test
```

Bu komut model ve renk verilerini, kalıcı bağlantıları, SEO alanlarını, yerel
kaynakları, güvenlik kurallarını ve eski URL yönlendirmelerini birlikte doğrular.

## Notlar

- Renkler RAL Classic verisine dayanır. Kaynak künyesi `js/data/colors.js`
  başındaki yorumdadır.
- Performans: sürekli render döngüsü yoktur (yalnızca kamera hareketi/etkileşim
  render tetikler), `devicePixelRatio` üst sınırı 2, doku üretimi renk başına
  önbelleklenir, geometri/materyal her güncellemede `dispose()` edilir.
- Mobilde (≤860px) ayar paneli alttan açılan bir "bottom sheet"e dönüşür.
- `CNAME`, `robots.txt` ve `sitemap.xml` doğrudan yayın kökünde tutulur.
