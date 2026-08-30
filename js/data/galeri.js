// Ana sayfa galerisi.
//
// ---- FOTOĞRAF EKLEMEK İÇİN ----
// 1. Fotoğrafı `assets/galeri/` klasörüne koyun (ör. mutfak-01.jpg).
// 2. Aşağıdaki listede bir satırın `dosya` alanına yolunu yazın:
//        { dosya: 'assets/galeri/mutfak-01.jpg', baslik: 'Lake mutfak' },
// 3. `baslik` isteğe bağlıdır — yazılmazsa fotoğrafın altında yazı çıkmaz.
//
// `dosya: null` bırakılan satırlar sayfada YER TUTUCU çerçeve olarak çizilir:
// böylece fotoğraflar gelmeden de bölümün düzeni görünür ve bozulmaz. Liste
// uzayıp kısaldıkça galeri kendini ayarlar (şerit taşmıyorsa oklar
// kendiliğinden gizlenir — bkz. anasayfa.js galeriyiKur).
//
// Fotoğraf önerisi: yatay (yaklaşık 4:3), uzun kenarı ~1600px, JPG. Kartlar
// `object-fit: cover` kullandığı için farklı oranlar da bozulmadan kırpılır.
export const GALERI_FOTOGRAFLARI = [
    { dosya: null },
    { dosya: null },
    { dosya: null },
    { dosya: null },
    { dosya: null },
    { dosya: null }
];
