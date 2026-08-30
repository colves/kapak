// Stüdyo HDR ortam ışığı (Poly Haven, CC0 — ticari kullanımda atıf
// gerektirmez, https://polyhaven.com/license). Kapağın üzerine gerçekçi,
// fotoğraflanmış bir stüdyo ışığı/yansıması düşürür.
//
// Kullanıcı 10 açık/parlak stüdyo ortamını karşılaştırdı ve "Klasik Stüdyo"yu
// (Poly Haven: photo_studio_01) varsayılan seçti. Karşılaştırma için ikinci
// bir seçenek olarak bir süre "Studio Small 09" bulunuyordu; sonradan
// kaldırıldı — geriye tek seçenek olarak Klasik Stüdyo kaldı.
//
// ÇÖZÜNÜRLÜK: 2k (2048×1024, 6.1 MB) bilinçli tercih. 4k, 8k ve 16k sürümleri
// de var (25 / 96 / 372 MB) ama bu HDR ortam ışığı (IBL) olarak kullanılıyor:
// three.js onu PMREM'e çevirirken malzemenin pürüzlülüğüne göre
// bulanıklaştırıyor. Kapak malzemesi roughness 0.35 (yarı mat lake) olduğu
// için yansımalar zaten yumuşak — daha yüksek çözünürlük bu yüzeyde görünür
// fark yaratmaz, yalnızca indirme boyutunu katlar. Bu dosya HER ziyaretçide,
// hem ana sayfada hem konfigüratörde indirildiği için ağırlık doğrudan ilk
// açılış süresine yansıyor.
export const ORTAM_SECENEKLERI = [
    {
        id: 'photo-studio-01',
        isim: 'Klasik Stüdyo',
        aciklama: 'Serin floresan stüdyo aydınlatması, yumuşak beyaz — en klasik/tanıdık stüdyo hissi.',
        dosya: 'assets/hdr/photo_studio_01_2k.hdr',
        varsayilan: true
    }
];

export function varsayilanOrtami() {
    return ORTAM_SECENEKLERI.find(o => o.varsayilan) || ORTAM_SECENEKLERI[0];
}

export function idIleOrtamBul(id) {
    return ORTAM_SECENEKLERI.find(o => o.id === id) || null;
}
