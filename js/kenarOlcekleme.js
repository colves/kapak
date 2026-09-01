// Kapak geometrisini bozmadan ölçülendirmenin matematiği.
//
// three.js'e hiç bağlı değil: buradaki her şey saf sayı işi, böylece
// kenarOlcekleme.test.js ile tarayıcı olmadan doğrulanabiliyor. Geometriye
// asıl uygulayan taraf glbYukleyici.js.

// --- Kenar korumalı ölçekleme (nine-patch) eşikleri -------------------------
//
// Bir kapak "geniş olsun" diye bütünüyle esnetilemez: gerçekte kasa/çerçeve
// profilinin genişliği sabittir (freze bıçağı aynıdır), büyüyen tek şey
// ortadaki düz ayna. Modeli topluca X'te ölçeklemek profili de eziyordu —
// dar kapakta çerçeve inceliyor, geniş kapakta şişiyordu.
//
// Çözüm: her eksende kapağı üç dilime ayır — sabit kalan iki kenar bandı ve
// esneyen bir orta. Kenar bantları öteleniyor (dönme/ölçek yok, yani profilin
// kesiti ve normalleri hiç bozulmuyor), aradaki düz ayna büyüyüp küçülüyor.
//
// Bant sınırı modele elle girilmiyor, geometriden ölçülüyor: çerçeveli bir
// kapakta profilin tepe noktaları kenarlarda kümelenir ve ortada tamamen boş,
// düz bir alan kalır. Merkezi içeren bu boşluğun sınırları bandın bittiği yeri
// verir. Ölçülen değerler: 3970 ve 3976 için ~92 mm (X ve Y), yani gerçek
// çerçeve genişliği.
//
// Yivli/desenli modellerde (ör. 4021) yiv tepe noktaları yüzeye yayıldığı için
// böyle bir boşluk yoktur (X'te ölçülen boşluk 0.1 mm) — o eksende dilimleme
// kendiliğinden devre dışı kalır ve eski düz ölçekleme kullanılır. Bu, ileride
// eklenecek modeller için de ayar gerektirmeden çalışan güvenli varsayılan.

// Düz orta alan, o eksendeki doğal ölçünün en az bu kadarı olmalı — daha küçük
// boşluklar profilin kendi içindeki aralıklar olabilir, çerçeve sınırı değil.
const EN_AZ_ORTA_ORANI = 0.10;

// İki kenar bandı toplamı hedef ölçünün bu oranını aşarsa orta ayna yok olur;
// o eksende dilimlemekten vazgeçilip düz ölçeklemeye dönülür. (Mevcut
// modellerin ölçü limitleriyle bu sınıra girilmiyor; aşırı dar bir kapak
// tanımlanırsa kapak bozuk görünmek yerine sadece orantılı küçülür.)
const EN_COK_KENAR_ORANI = 0.90;

// Merkezi içeren en geniş tepe-noktası boşluğunu bulur; bu boşluğun sınırları
// iki kenar bandının bittiği yerdir. Yeterince geniş bir boşluk yoksa null.
export function kenarBandiOlc(degerler, dogalBoy) {
    if (!degerler.length) return null;
    // 0.01 mm'ye yuvarlama: aynı yüzeye ait tepe noktaları arasındaki kayan
    // nokta gürültüsü sahte (çok küçük) boşluklar üretmesin.
    const sirali = [...new Set(degerler.map((v) => Math.round(v * 100) / 100))].sort((a, b) => a - b);
    for (let i = 0; i < sirali.length - 1; i++) {
        const alt = sirali[i];
        const ust = sirali[i + 1];
        if (alt <= 0 && ust >= 0) {
            if (ust - alt < dogalBoy * EN_AZ_ORTA_ORANI) return null;
            return { alt, ust };
        }
    }
    return null;
}

// Modelden gelen elle ayar, ölçülen bandın yerine geçer. Kapağın merkezi
// orijinde olduğu için band sınırları kenar payından hesaplanır.
export function bandiElleAyarla(bant, dogalBoy, altPay, ustPay) {
    if (altPay == null && ustPay == null) return bant;
    const yari = dogalBoy / 2;
    const a = altPay != null ? -yari + altPay : (bant ? bant.alt : -yari);
    const u = ustPay != null ? yari - ustPay : (bant ? bant.ust : yari);
    return u > a ? { alt: a, ust: u } : bant;
}

// Bu eksende kenar korumalı eşleme yapılabilir mi? Yapılabiliyorsa tepe
// noktalarını yeni ölçüye taşıyacak fonksiyonu, yapılamıyorsa null döndürür.
export function eksenEslemesiKur(bant, dogalBoy, hedefBoy) {
    if (!bant || !(dogalBoy > 0) || !(hedefBoy > 0)) return null;
    const yari = dogalBoy / 2;
    const kenarToplami = (bant.alt + yari) + (yari - bant.ust);
    if (kenarToplami > hedefBoy * EN_COK_KENAR_ORANI) return null;

    const kaydirma = (hedefBoy - dogalBoy) / 2;
    const ortaBoy = bant.ust - bant.alt;
    const ortaOlcek = ortaBoy > 0 ? (ortaBoy + 2 * kaydirma) / ortaBoy : 1;

    return (v) => {
        if (v <= bant.alt) return v - kaydirma;          // alt/sol bant: rijit öteleme
        if (v >= bant.ust) return v + kaydirma;          // üst/sağ bant: rijit öteleme
        // Çerçeveli modellerde bu aralık tamamen boştur (bant tanımı gereği);
        // yine de bir tepe noktası düşerse orantılı esnesin, kopmasın.
        return (v - bant.alt) * ortaOlcek + (bant.alt - kaydirma);
    };
}
