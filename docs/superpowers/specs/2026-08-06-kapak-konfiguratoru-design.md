# Şahinkaya Kapak Konfigüratörü — Tasarım Belgesi

**Tarih:** 2026-08-06
**Durum:** Onaylandı (brainstorming aşaması) — uygulama planına geçiliyor.

## 1. Amaç

Şahinkaya Mobilya için, müşterilerin özel tasarım mutfak/dolap kapaklarını **3 boyutlu olarak, gerçek zamanlı model / ölçü / renk değişimiyle** masaüstü ve mobil tarayıcıda inceleyebildiği bağımsız bir web sayfası (konfigüratör) oluşturmak. Referans alınan deneyim: silante.com.tr konfigüratörü. Renkler rastgele hex değerleri değil, gerçek boya/kaplama endüstrisi standartlarına (RAL Classic, gerçek ahşap dekor isimleri) dayanmalı.

Bu proje mevcut `Sahinkaya` (canlı site, sahinkayamobilya.com) ve `Sahinkaya_kapak` (başka bir yapay zekâ tarafından başlatılmış önceki deneme) klasörlerinden **bağımsız**, `Kapak` klasöründe sıfırdan inşa edilir. Mevcut sitenin `kapaklar.html` sayfasına dokunulmaz.

## 2. Kapsam

**Dahil:**
- Tek sayfalık, framework'süz (vanilla JS/CSS, derleme adımı yok) statik konfigüratör.
- Three.js ile gerçek zamanlı 3D kapak görüntüleme (masaüstü + mobil, dokunmatik destekli).
- 2 kapak modeli: Düz Kapak, Çıtalı/Kasetli Kapak (bkz. §4).
- 4 yüzey kategorisi, gerçek kod/isimlerle: Lake, Membran (Parlak/Soft/Ahşap Desenli alt kategorileriyle), Akrilik, Masif Ahşap (bkz. §5).
- Ölçü ayarı: genişlik, yükseklik, kalınlık (model bazlı sınırlar).
- İki değiştirilebilir tema: "Atölye" (özgün tasarım) ve "Şahinkaya Klasik" (canlı sitenin teması) — bkz. §6.
- Mobil uyumlu, dokunmatik responsive arayüz.
- Performans: sürekli render döngüsü yok, düşük poligon sayısı, cihaz piksel oranı sınırlı, throttle edilmiş girişler (bkz. §7).

**Kapsam dışı (bu aşamada):**
- WhatsApp / teklif alma entegrasyonu — kullanıcı isteğiyle **sonraya** ertelendi.
- Firebase / admin panel entegrasyonu — kullanıcı "sabit kod (JS dosyası)" tercih etti.
- Ana site (`Sahinkaya`) veya `kapaklar.html` üzerinde değişiklik.
- Gerçek satın alma / sepet akışı.

## 3. Mimari

```
Kapak/
  index.html
  css/
    base.css              # Layout, bileşen stilleri (tema-bağımsız)
    theme-atolye.css       # "Atölye" tema token'ları (:root[data-theme="atolye"])
    theme-sahinkaya.css    # "Şahinkaya Klasik" tema token'ları
  js/
    data/
      colors.js            # 4 kategori, gerçek kod/isim/hex/finish verisi
      models.js             # Model tanımları (ölçü limitleri, geometri parametreleri)
    doorGeometry.js         # Model -> THREE.BufferGeometry üretimi (saf fonksiyonlar)
    materials.js            # Renk verisinden THREE.Material + procedural doku üretimi
    viewer.js                # Sahne/kamera/ışık/on-demand render/OrbitControls
    theme.js                 # Tema geçişi + localStorage
    ui.js                     # DOM <-> state bağlama (sliderlar, model/renk seçimi, responsive panel)
    main.js                   # Giriş noktası, modülleri birbirine bağlar
  docs/superpowers/specs/   # Bu belge
```

- Build adımı yok; Three.js CDN üzerinden `importmap` ile yüklenir (mevcut prototipte kullanılan yöntemle aynı, CORS sorunsuz).
- Durum (state) tek bir basit obje (`{ model, width, height, thickness, colorId, theme }`) `ui.js` içinde tutulur; her değişiklikte `doorGeometry` + `materials` yeniden çağrılır, `viewer.requestRender()` ile tek seferlik render tetiklenir.
- Modüller birbirinden bağımsız test edilebilir: `doorGeometry.js` ve `materials.js` DOM'a bağımlı değildir, saf girdi/çıktı fonksiyonlarıdır.

## 4. Kapak Geometrisi

**Model 1 — Düz Kapak:**
`THREE.BoxGeometry(genişlik, yükseklik, kalınlık)`. Kalınlık kullanıcı tarafından ayarlanabilir (varsayılan 18mm, 16–30mm aralığı).

**Model 2 — Çıtalı/Kasetli Kapak:**
Gerçek mobilya üretimindeki "çerçeveli, gömme panelli" kapak mantığı, tek parça gibi görünen iki geometriden oluşur:
1. **Çerçeve:** `THREE.Shape` ile dış dikdörtgen + ortasında dikdörtgen delik tanımlanır, `THREE.ExtrudeGeometry` ile 18mm derinliğinde extrude edilir.
2. **İç panel:** Çerçevenin deliğine tam oturan, `THREE.BoxGeometry(iç genişlik, iç yükseklik, 10mm)`, ön yüzden içeri gömülü (8mm geride) konumlandırılır, arka yüzü çerçeveyle hizalıdır.

İkisi aynı malzemeyi (rengi) paylaşır, tek `THREE.Group` içinde birleştirilir — kullanıcıya tek parça kapak gibi görünür. Bu yaklaşım CSG/boolean kütüphanesi gerektirmez (Silante'nin kullandığı `manifold.wasm` gibi ağır bir bağımlılık yok), birkaç yüz üçgenle çözülür → performans garantisiyle doğrudan uyumlu.

**Ölçü ayarlarının modele göre kapsamı:** Her iki modelde de genişlik ve yükseklik serbestçe ayarlanabilir. Kalınlık ayarı yalnızca Model 1'de (Düz Kapak, 16–30mm) kullanıcıya açıktır; Model 2'de gerçekçi kesit oranını bozmamak için çerçeve/panel kalınlığı sabit (18mm/10mm) tutulur ve ayar panelinde gösterilmez.

Model değişince önceki geometri/materyal `dispose()` edilir (bellek sızıntısı önlenir — mevcut prototipte de bu desen var, korunuyor).

## 5. Renk Verisi — Gerçek Kaynaklar

Renkler `js/data/colors.js` içinde, 4 kategori altında, gerçek/doğrulanmış kaynaklara dayanarak tanımlanır:

| Kategori | Kaynak | Örnek |
|---|---|---|
| **Lake** | RAL Classic (uluslararası lake/boya standardı, halka açık) | RAL 9010 Saf Beyaz, RAL 9005 Jet Siyah, RAL 7016 Antrasit |
| **Membran – Parlak (HG)** | Aynı gerçekçi ton ailesi + yüksek parlaklık (düşük roughness, clearcoat) | HG-9010 Parlak Beyaz |
| **Membran – Soft (Mat)** | Aynı ton ailesi + mat/soft-touch (yüksek roughness) | ST-7016 Mat Antrasit |
| **Membran – Ahşap Desenli** ve **Masif Ahşap** | Gerçek, tanınmış ahşap dekor isimleri (Halifax Meşe, Bardolino Meşe, Sonoma Meşe, Carini Ceviz, Wenge vb.) + gerçek ahşap tonu hex yaklaşıklıkları | Bardolino Meşe |

Her renk kaydı: `{ id, kategori, kod, isim, hex, roughness, metalness, clearcoat, dokuTipi }`.

**Ahşap dokusu gerçekçiliği:** Düz renk yerine, `materials.js` içinde bir `<canvas>` üzerinde **procedural** (kod ile üretilen) ahşap damar deseni çizilip ilgili tona boyanır, `THREE.CanvasTexture` olarak uygulanır. Doku 512×512 çözünürlükte, renk başına **bir kez** üretilip önbelleğe alınır (her render'da yeniden üretilmez) — hem gerçekçi görünüm hem sıfır ekstra performans maliyeti. Telifli doku fotoğrafı indirilmez/kullanılmaz.

## 6. İki Tema

Tema seçimi `<html data-theme="atolye|sahinkaya">` ile kontrol edilir, `theme.js` tarafından `localStorage`'a yazılır ve sayfa açılışında geri okunur. Üst barda bir geçiş anahtarı bulunur.

- **Atölye (özgün tasarım):** Sıcak/aydınlık atölye hissi. Zemin `#f6f2ec`, metin/vurgu koyu ceviz `#3b2a1f`, ikincil vurgu bakır/toprak tonu, serif başlık + sade sans-serif gövde.
- **Şahinkaya Klasik:** `Sahinkaya/css/main.css`'den birebir alınan token'lar — zemin `#0a0a0a`, altın vurgu `#c9a96e`, Playfair Display + Inter — canlı siteyle tutarlı.

3D sahnenin arkaplan gradyanı ve stüdyo ışığı da temaya göre hafif ayarlanır (kapak rengiyle zemin arasında kontrast her zaman korunur).

## 7. Performans Stratejisi ("optimizasyon sorunu istemiyorum")

- **On-demand rendering:** Sürekli `requestAnimationFrame` döngüsü yerine, sadece kullanıcı etkileşimi (kaydırma, sürükleme, kontrol değişimi) sırasında render tetiklenir; boşta hiçbir GPU/pil tüketimi olmaz.
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` — yüksek DPI telefonlarda gereksiz aşırı çözünürlük yok.
- Slider girişleri `requestAnimationFrame` ile throttle edilir; sürükleme sırasında saniyede onlarca geometri yeniden oluşturma engellenir.
- Geometriler düşük poligonlu (her iki model de birkaç yüz üçgen); doku 512×512 ve önbellekli.
- Stüdyo ortam ışığı için HDR dosyası indirmek yerine Three.js'in **procedural** `RoomEnvironment` + `PMREMGenerator` kullanılır — gerçekçi yansıma, sıfır ekstra dosya ağırlığı.
- Model/geometri/materyal değişiminde eski kaynaklar her zaman `dispose()` edilir.

## 8. Mobil Uyumluluk

- ~860px altında ayar paneli sağ sidebar yerine alttan açılan bir "bottom sheet"e dönüşür (sürükle-tut ile aç/kapa), 3D görüntüleyici ekranın büyük kısmını kaplar.
- `OrbitControls` varsayılan dokunmatik desteğiyle parmakla döndürme/pinch-zoom çalışır.
- Dokunma hedefleri (renk kutuları, model/tema butonları) en az 44px.

## 9. Doğrulama Planı

- Masaüstü ve mobil (responsive emülasyon) tarayıcıda: model değişimi, ölçü sliderları, her 4 kategoriden renk seçimi, tema geçişi manuel olarak test edilecek.
- Konsol hatası olmadığından emin olunacak.
- Basit performans kontrolü: boşta CPU/GPU kullanımının render döngüsü çalışmadığında sıfıra yakın olduğu doğrulanacak (on-demand rendering).

## 10. Açık Kalan / Ertelenen Konular

- WhatsApp teklif entegrasyonu — kullanıcı isteğiyle sonraki bir aşamaya bırakıldı.
- Renk kataloğunun tam/nihai listesi (kaç adet ton, hangi spesifik RAL/dekor kodları) uygulama planı sırasında somutlaştırılacak; bu belge yaklaşımı ve kaynakları tanımlar.
