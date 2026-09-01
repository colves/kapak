// Kapak fotoğrafları ve her birinin hangi model/renk olduğu.
//
// Ana sayfa yeniden yazılıyor; bu dosya veri olarak DURUYOR çünkü buradaki
// fotoğraf–model–renk eşlemesi elle kurulmuş bilgi. Yeni ana sayfa bu listeyi
// olduğu gibi kullanabilir.
//
//   dosya   : zorunlu — görselin yolu.
//   modelId : models.js'teki id ile birebir aynı olmalı. Karta tıklanınca
//             konfigüratör bu model seçili açılabilsin diye.
//   renkKodu: 4 haneli RAL kodu. Konfigüratör bu renkle açılabilsin diye.
//   baslik  : ekran okuyucular için alt metin.
//
// Konfigüratöre bağlantı kurarken sorgu dizesini ELLE üretmeyin:
// paylasim.js'teki durumuSorguyaKodla({ modelId, renkId }) kullanın — 'm'/'r'
// anahtarlarını bilen tek yer orası olsun (paylaşım linkiyle aynı biçim).
//
// Aşağıdaki üç görsel konfigüratörün kendi "Görseli İndir" çıktısı; bu yüzden
// dosya adları model ve RAL kodunu zaten taşıyor. Üçü de kapağa kırpılmış
// (409x663, oran ~0.617) ve tamamen opak.
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
