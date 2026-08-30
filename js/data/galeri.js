// Ana sayfadaki 3B parallaks galerinin fotoğrafları.
//
// ---- FOTOĞRAF EKLEMEK İÇİN ----
// 1. Fotoğrafı `assets/galeri/` klasörüne koyun (ör. mutfak-01.jpg).
// 2. Aşağıdaki listede bir satırın `dosya` alanına yolunu yazın:
//        { dosya: 'assets/galeri/mutfak-01.jpg', baslik: 'Lake mutfak' },
// 3. `baslik` isteğe bağlıdır — ekran okuyucular için alt metin olarak kullanılır.
//
// `dosya: null` bırakılan satırlar galeriye GİRMEZ; onların yerini markanın
// kendi RAL Lake paletinden üretilen kapak görselleri tutar (bkz.
// js/parallaks.js kapakGorseliUret). Yani fotoğraf yokken de galeri dolu ve
// markaya ait görünür; gerçek fotoğraf eklendikçe üretilenlerin yerini alır.
//
// Galeri 16 karta ihtiyaç duyar (4 sütun × 4, sonra her sütun kendi içinde
// katlanır) — listeye 16'dan az gerçek fotoğraf girilirse kalanı üretilenler
// tamamlar, fazlası kullanılmaz.
//
// Fotoğraf önerisi: dikeye yakın veya kare (kartlar 4:3'ten uzun), uzun kenarı
// ~1200px, JPG. Kartlar `object-fit: cover` kullandığı için farklı oranlar da
// bozulmadan kırpılır.
export const GALERI_FOTOGRAFLARI = [
    { dosya: null },
    { dosya: null },
    { dosya: null },
    { dosya: null },
    { dosya: null },
    { dosya: null }
];
