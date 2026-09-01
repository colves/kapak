// Stüdyo HDR ortam ışığı (Poly Haven, CC0 — ticari kullanımda atıf
// gerektirmez, https://polyhaven.com/license). Kapağın üzerine gerçekçi,
// fotoğraflanmış bir stüdyo ışığı/yansıması düşürür.
//
// Kullanıcı 10 açık/parlak stüdyo ortamını karşılaştırdı ve "Klasik Stüdyo"yu
// (Poly Haven: photo_studio_01) varsayılan seçti. Karşılaştırma için ikinci
// bir seçenek olarak bir süre "Studio Small 09" bulunuyordu; sonradan
// kaldırıldı — geriye tek seçenek olarak Klasik Stüdyo kaldı.
//
// ÇÖZÜNÜRLÜK: 1k (1024×512, 1.6 MB). Önce 2k (6.1 MB) kullanılıyordu ve
// konfigüratör sayfasının yaklaşık 8 MB'lık toplam ağırlığının TEK BAŞINA
// dörtte üçünü bu dosya oluşturuyordu — mobil veriyle en çok bekleten şey oydu.
//
// Kaliteden ödün değil: bu HDR ortam ışığı (IBL) olarak kullanılıyor, three.js
// onu PMREM'e çevirirken malzemenin pürüzlülüğüne göre zaten bulanıklaştırıyor.
// Kapak malzemesi roughness 0.35 (yarı mat lake) olduğu için yansımalar
// yumuşak; 1k ile 2k arasındaki fark bu yüzeyde görünmüyor. (Parlak/düşük
// roughness bir malzemeye geçilirse yeniden değerlendirilmeli.)
export const ORTAM_SECENEKLERI = [
    {
        id: 'photo-studio-01',
        isim: 'Klasik Stüdyo',
        aciklama: 'Serin floresan stüdyo aydınlatması, yumuşak beyaz — en klasik/tanıdık stüdyo hissi.',
        dosya: 'assets/hdr/photo_studio_01_1k.hdr',
        varsayilan: true
    }
];

export function varsayilanOrtami() {
    return ORTAM_SECENEKLERI.find(o => o.varsayilan) || ORTAM_SECENEKLERI[0];
}

export function idIleOrtamBul(id) {
    return ORTAM_SECENEKLERI.find(o => o.id === id) || null;
}
