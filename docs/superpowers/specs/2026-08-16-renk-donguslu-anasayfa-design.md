# Kaydırmalı Renk-Döngülü Ana Sayfa — Tasarım

## Amaç
Ziyaretçi siteye girdiğinde, tek bir gerçek kapak modeli (HK_012_001 / 3976) üzerinden "bir kapak, onlarca renk seçeneği" mesajını veren, kesintisiz kaydırma-güdümlü bir sahne izler. Sonunda "Kapağını Tasarla" CTA'sı ile konfigüratöre yönlendirir.

## Önceki Denemeden Ders (2026-08-14, tamamen geri alınmıştı)
- ❌ "Hero kapak" + "mutfak sahnesi" arasında perde/kesme geçişi — beğenilmedi, kaldırıldı.
- ❌ Kaydırdıkça beliren pazarlama başlıkları — kaldırılması istendi.
- ✅ Kamera başta kapağa o kadar yakın ki ekranda başka hiçbir şey görünmüyor — beğenildi, korunuyor.
- ✅ Düz JS+rAF kaydırma mekaniği (native CSS scroll-timeline değil) — sorunsuzdu, korunuyor.

## Kapsam Kararları (bu konuşmada onaylandı)
- **Sayfa yapısı:** `index.html` yeniden sinematik ana sayfa olur. Mevcut konfigüratör `configurator.html`'e taşınır (içerik değişmez).
- **İçerik odağı:** Tek kapak (HK_012_001), sadece **Lake** renk kategorisinden 6 ton sırayla döngüye girer: Saf Beyaz (RAL 9010) → Antrasit Gri (RAL 7016) → Bordo (RAL 3004) → Şişe Yeşili (RAL 6005) → Kobalt Lacivert (RAL 5013) → Jet Siyah (RAL 9005). Membran/ahşap desenli renkler kapsam dışı.
- **Sahne akışı (tek kesintisiz 3D sahne, sahne takası/perde YOK):**
  1. progress 0-0.30: kamera kapağa öyle yakın ki ekranda başka hiçbir şey yok (önceki denemeden korunan kısım).
  2. progress 0.30-0.45: kamera gecikmesiz geri çekilip sabit bir 3/4 ürün-fotoğrafı açısına yerleşir.
  3. progress 0.45-1.00: kamera tamamen sabit; kapağın malzemesi (renk) 6 Lake tonu arasında sırayla değişir. Her renk değişiminde kısa bir bilgi etiketi ("RAL 9005 · Jet Siyah") belirip kaybolur.
- **Kaydırma mekaniği:** Kilitli/scrub — düz JS ile (`scrollY` + rAF, güvenlik `setTimeout` yedeğiyle — önceki oturumda `ui.js`'te bulunup düzeltilen rAF-kilitlenme deseni burada da uygulanır). Native CSS `scroll-timeline` KULLANILMAZ.
- **Metin:** Sadece renk adı/kodu etiketi (kısa, bilgi amaçlı). Pazarlama başlığı YOK.
- **Mobil:** Aynı mimari, düşürülmüş kalite (az ışık, düşük piksel oranı) — mevcut `dusukGucluCihazMi()` deseni yeniden kullanılır.
- **Erişilebilirlik:** `prefers-reduced-motion` açıksa, sürekli kaydırma yerine kapağın sabit bir renkte (varsayılan: Antrasit Gri) durduğu statik tek-ekran hero gösterilir.

## Mimari
- `index.html` — sinematik ana sayfa iskeleti: 600vh sarmalayıcı `<section class="sinema">`, içinde `position: sticky` tam ekran canvas + renk etiketi overlay + kaydırma ipucu + CTA bölümü.
- `js/sinema-hesaplamalari.js` — SAF, THREE'den bağımsız fonksiyonlar (Node'da test edilebilir):
  - `kameraDurumuHesapla(progress)` — 3 keyframe (yakın → 3/4 açı → 3/4 açı sabit) arası enterpolasyon.
  - `renkIndeksiHesapla(progress)` — progress 0.45-1.00 aralığını 6 eşit dilime bölüp aktif renk indeksini ve o dilim içindeki etiket-opaklığını (giriş/çıkış fade) döndürür.
- `js/anasayfa.js` — sahne kurulumu: `glbKapakGrubuOlustur` ile tek kapak yükler, `renkVerisindenMalzemeOlustur` ile 6 Lake rengini önceden hazırlar (malzeme nesneleri), scroll progress'e göre `sinema-hesaplamalari.js`'teki fonksiyonları çağırıp kamera + `mesh.material` + etiket metnini günceller. `ui.js`'teki rAF-güvenlik-zamanlayıcı deseni aynen kullanılır.
- `css/anasayfa.css` — sinematik bölüm, renk etiketi, CTA stilleri (önceki denemeden büyük ölçüde yeniden kullanılabilir, perde/metin-başlık kuralları hariç).
- `configurator.html` — mevcut `index.html`'in birebir taşınmış hali.

## Test / Doğrulama
- `js/sinema-hesaplamalari.test.js`: `kameraDurumuHesapla` ve `renkIndeksiHesapla` için Node assert testleri (sınır değerler, dilim geçişleri).
- Tarayıcı önizlemesiyle: scroll simülasyonu, renk döngüsünün doğru sırada ve doğru progress aralıklarında tetiklendiği, reduced-motion fallback'i, konsol/network hatası olmadığı doğrulanır.

## Kapsam Dışı
- Mutfak sahnesi veya başka bir "context" ortamı (önceki denemede vardı, bu sefer yok).
- Membran/Ahşap Desenli renkler (sadece Lake).
- Birden fazla kapak modeli arasında geçiş.
