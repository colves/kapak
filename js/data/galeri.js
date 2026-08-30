// Ana sayfadaki 3B parallaks galerinin fotoğrafları.
//
// ---- FOTOĞRAF EKLEMEK İÇİN ----
// 1. Fotoğrafı `assets/galeri/` klasörüne koyun.
// 2. Aşağıya bir satır ekleyin:
//        { dosya: 'assets/galeri/mutfak-01.jpg', modelId: 'hk-012-001', baslik: '...' },
//
//   dosya   : zorunlu — galeriye girecek görselin yolu.
//   modelId : isteğe bağlı ama ÖNEMLİ — karta tıklayınca konfigüratör bu
//             model seçili olarak açılır (models.js'teki id ile birebir aynı
//             olmalı; parallaks.js geçersiz id'yi fark edip bağlantıyı
//             sessizce düşürür, bozuk link üretmez).
//   renkKodu: isteğe bağlı — 4 haneli RAL kodu. Verilirse konfigüratör bu
//             renkle açılır, yani ziyaretçi tıkladığı fotoğrafın birebir
//             aynısını görür.
//   baslik  : isteğe bağlı — ekran okuyucular için alt metin.
//
// Galeri 16 görsel kullanır (4 sütun × 4, sonra her sütun kendi içinde
// katlanır = 32 kart). Listede 16'dan AZ görsel varsa liste başa sarılarak
// tekrarlanır; hiç görsel yoksa markanın RAL Lake paletinden kapak
// görselleri üretilir (bkz. js/parallaks.js kapakGorseliUret).
//
// Aşağıdaki üç görsel konfigüratörün kendi "Görseli İndir" çıktısı; bu
// yüzden dosya adları model ve RAL kodunu zaten taşıyor.
export const GALERI_FOTOGRAFLARI = [
    {
        dosya: 'assets/galeri/sahinkaya-kapak-HK_012_001-RAL7044-450x720.png',
        modelId: 'hk-012-001',
        renkKodu: '7044',
        baslik: 'HK_012_001 — İpek Grisi, RAL 7044'
    },
    {
        dosya: 'assets/galeri/sahinkaya-kapak-HK_051_002-RAL7016-450x720.png',
        modelId: 'hk-051-002',
        renkKodu: '7016',
        baslik: 'HK_051_002 — Antrasit Gri, RAL 7016'
    },
    {
        dosya: 'assets/galeri/sahinkaya-kapak-Model3970-RAL6004-450x720.png',
        modelId: 'kapak-3970',
        renkKodu: '6004',
        baslik: 'Model 3970 — Mavi Yeşil, RAL 6004'
    }
];
