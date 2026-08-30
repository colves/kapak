// Stüdyo HDR ortam ışığı (Poly Haven, CC0 — ticari kullanımda atıf
// gerektirmez, https://polyhaven.com/license). Kapağın üzerine gerçekçi,
// fotoğraflanmış bir stüdyo ışığı/yansıması düşürür.
//
// Kullanıcı 10 açık/parlak stüdyo ortamını karşılaştırdı; "Klasik Stüdyo"
// (Poly Haven: photo_studio_01) bir süre varsayılandı, sonradan tamamen
// kaldırıldı — geriye tek seçenek olarak "Studio Small 09" kaldı.
//
// ÇÖZÜNÜRLÜK: 1k (1024×512, 1.5 MB) bilinçli tercih. 2k/4k/8k/16k sürümleri
// de var ama bu HDR ortam ışığı (IBL) olarak kullanılıyor: three.js onu
// PMREM'e çevirirken malzemenin pürüzlülüğüne göre bulanıklaştırıyor. Kapak
// malzemesi roughness 0.35 (yarı mat lake) olduğu için yansımalar zaten
// yumuşak — daha yüksek çözünürlük bu yüzeyde görünür fark yaratmaz, yalnızca
// indirme boyutunu katlar. Bu dosya HER ziyaretçide, hem ana sayfada hem
// konfigüratörde indirildiği için ağırlık doğrudan ilk açılış süresine
// yansıyor. (Parlak/düşük roughness bir malzemeye geçilirse yeniden
// değerlendirilmeli.)
export const ORTAM_SECENEKLERI = [
    {
        id: 'studio-small-09',
        isim: 'Studio Small 09',
        aciklama: 'Nötr, dengeli stüdyo ışığı — sıkı/odaklı bir aydınlatma.',
        dosya: 'assets/hdr/studio_small_09_1k.hdr',
        varsayilan: true
    }
];

export function varsayilanOrtami() {
    return ORTAM_SECENEKLERI.find(o => o.varsayilan) || ORTAM_SECENEKLERI[0];
}

export function idIleOrtamBul(id) {
    return ORTAM_SECENEKLERI.find(o => o.id === id) || null;
}
