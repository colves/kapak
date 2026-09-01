// Kaynak: RAL Classic (uluslararası, kamuya açık lake/boya standardı — kod ve
// isimler gerçek, hex değerleri yaygın yayınlanan RAL kartelalarının ekran
// yaklaşıklıklarıdır; laboratuvar ölçümü/spektrofotometre ile doğrulanmış birebir
// eşdeğer DEĞİLDİR — bu konudaki ayrım için configurator sohbetindeki açıklamaya bakın).
//
// TEMEL_TONLAR: Lake'in beslendiği tek RAL havuzu (Membran kategorisi kaldırıldı).
// Her tonun `grup` alanı ("acik"/"koyu") yalnızca 9xxx ailesini beyaz/siyah diye
// ikiye ayırmakta ve metadata olarak kullanılır; paletin gezinme ekseni artık
// aşağıdaki TON_AILELERI (RAL'in kendi numara grupları).

const TEMEL_TONLAR = [
    // ---- Açık tonlar ----
    { ral: '9010', isim: 'Saf Beyaz',        hex: 0xF1ECE1, grup: 'acik' },
    { ral: '9016', isim: 'Trafik Beyazı',    hex: 0xF6F6F6, grup: 'acik' },
    { ral: '1013', isim: 'İnci Beyazı',      hex: 0xE3D9C6, grup: 'acik' },
    { ral: '1014', isim: 'İvuar',            hex: 0xE3D9B4, grup: 'acik' },
    { ral: '1015', isim: 'Fildişi',          hex: 0xE6D2B5, grup: 'acik' },
    { ral: '9001', isim: 'Krem Beyaz',       hex: 0xE9E0CB, grup: 'acik' },
    { ral: '9002', isim: 'Gri Beyaz',        hex: 0xE7EBDA, grup: 'acik' },
    { ral: '9003', isim: 'Sinyal Beyazı',    hex: 0xECECE7, grup: 'acik' },
    { ral: '9006', isim: 'Beyaz Alüminyum',  hex: 0xA5A8A8, grup: 'acik' },
    { ral: '9018', isim: 'Papirüs Beyazı',   hex: 0xCFD3CD, grup: 'acik' },
    { ral: '7001', isim: 'Gümüş Gri',        hex: 0x8F999F, grup: 'acik' },
    { ral: '7035', isim: 'Açık Gri',         hex: 0xD7D7D7, grup: 'acik' },
    { ral: '7044', isim: 'İpek Grisi',       hex: 0xCBC6BC, grup: 'acik' },
    { ral: '7047', isim: 'Telgri',           hex: 0xD0D0D0, grup: 'acik' },
    { ral: '7040', isim: 'Pencere Grisi',    hex: 0x9DA3A6, grup: 'acik' },
    { ral: '7038', isim: 'Taş Grisi',        hex: 0xB4B8B0, grup: 'acik' },
    { ral: '7032', isim: 'Çakıl Grisi',      hex: 0xB8B799, grup: 'acik' },
    { ral: '1002', isim: 'Kum Sarısı',       hex: 0xD2AA6D, grup: 'acik' },
    { ral: '1023', isim: 'Trafik Sarısı',    hex: 0xF7B500, grup: 'acik' },
    { ral: '1018', isim: 'Çinko Sarısı',     hex: 0xF2CD37, grup: 'acik' },
    { ral: '1034', isim: 'Pastel Sarı',      hex: 0xE7C65C, grup: 'acik' },
    { ral: '1003', isim: 'Sinyal Sarısı',    hex: 0xE2B007, grup: 'acik' },
    { ral: '1001', isim: 'Bej',              hex: 0xAD9051, grup: 'acik' },
    { ral: '1011', isim: 'Kahverengi Bej',   hex: 0xAF8A54, grup: 'acik' },
    { ral: '3012', isim: 'Bej Kırmızı',      hex: 0xC6846D, grup: 'acik' },
    { ral: '3022', isim: 'Somon Pembe',      hex: 0xD4776A, grup: 'acik' },
    { ral: '6021', isim: 'Solgun Yeşil',     hex: 0x89AC76, grup: 'acik' },
    { ral: '6019', isim: 'Beyaz Yeşil',      hex: 0xB2C3AA, grup: 'acik' },
    { ral: '6027', isim: 'Açık Yeşil',       hex: 0x84C3BE, grup: 'acik' },
    { ral: '6018', isim: 'Sarı Yeşil',       hex: 0x57A639, grup: 'acik' },
    { ral: '5024', isim: 'Pastel Mavi',      hex: 0x7FA8C9, grup: 'acik' },
    { ral: '5015', isim: 'Gök Mavisi',       hex: 0x2271B3, grup: 'acik' },
    { ral: '5012', isim: 'Mavi',             hex: 0x3E82B0, grup: 'acik' },
    { ral: '5014', isim: 'Güvercin Mavisi',  hex: 0x6C7EA0, grup: 'acik' },
    { ral: '4003', isim: 'Leylak Moru',      hex: 0xCB7089, grup: 'acik' },
    { ral: '3015', isim: 'Açık Pembe',       hex: 0xD8A0A6, grup: 'acik' },
    { ral: '8025', isim: 'Solgun Kahve',     hex: 0x755C48, grup: 'acik' },
    { ral: '6011', isim: 'Reseda Yeşili',    hex: 0x68825B, grup: 'acik' },
    { ral: '6013', isim: 'Kamış Yeşili',     hex: 0x797C5A, grup: 'acik' },
    { ral: '7002', isim: 'Zeytin Grisi',     hex: 0x817F68, grup: 'acik' },

    // ---- Koyu tonlar ----
    { ral: '9005', isim: 'Jet Siyah',        hex: 0x0A0A0A, grup: 'koyu' },
    { ral: '9004', isim: 'Sinyal Siyahı',    hex: 0x2B2B2C, grup: 'koyu' },
    { ral: '9011', isim: 'Grafit Siyahı',    hex: 0x1C1E21, grup: 'koyu' },
    { ral: '8022', isim: 'Kara Kahve',       hex: 0x231A1D, grup: 'koyu' },
    { ral: '7016', isim: 'Antrasit Gri',     hex: 0x383E42, grup: 'koyu' },
    { ral: '7021', isim: 'Kara Gri',         hex: 0x23282A, grup: 'koyu' },
    { ral: '7024', isim: 'Grafit Grisi',     hex: 0x474A51, grup: 'koyu' },
    { ral: '7011', isim: 'Demir Grisi',      hex: 0x43494D, grup: 'koyu' },
    { ral: '7013', isim: 'Fare Grisi',       hex: 0x43423C, grup: 'koyu' },
    { ral: '7015', isim: 'Arduvaz Grisi',    hex: 0x434750, grup: 'koyu' },
    { ral: '7043', isim: 'Trafik Grisi B',   hex: 0x4E5451, grup: 'koyu' },
    { ral: '5013', isim: 'Kobalt Lacivert',  hex: 0x1E213D, grup: 'koyu' },
    { ral: '5010', isim: 'Cevher Mavisi',    hex: 0x0E294B, grup: 'koyu' },
    { ral: '5008', isim: 'Gri Mavi',         hex: 0x26374B, grup: 'koyu' },
    { ral: '5020', isim: 'Okyanus Mavisi',   hex: 0x0B4151, grup: 'koyu' },
    { ral: '5017', isim: 'Trafik Mavisi',    hex: 0x063971, grup: 'koyu' },
    { ral: '5002', isim: 'Ultramarin Mavisi',hex: 0x20214F, grup: 'koyu' },
    { ral: '5011', isim: 'Çelik Mavisi',     hex: 0x1E2530, grup: 'koyu' },
    { ral: '5000', isim: 'Menekşe Mavisi',   hex: 0x1E3746, grup: 'koyu' },
    { ral: '4007', isim: 'Koyu Mor',         hex: 0x4A2545, grup: 'koyu' },
    { ral: '3004', isim: 'Bordo',            hex: 0x6B1C23, grup: 'koyu' },
    { ral: '3005', isim: 'Şarap Kırmızısı',  hex: 0x591C29, grup: 'koyu' },
    { ral: '3009', isim: 'Oksit Kırmızısı',  hex: 0x6D342D, grup: 'koyu' },
    { ral: '3011', isim: 'Kahverengi Kırmızı', hex: 0x5E2028, grup: 'koyu' },
    { ral: '3007', isim: 'Kara Kırmızı',     hex: 0x3E2022, grup: 'koyu' },
    { ral: '6005', isim: 'Şişe Yeşili',      hex: 0x114232, grup: 'koyu' },
    { ral: '6009', isim: 'Köknar Yeşili',    hex: 0x27352A, grup: 'koyu' },
    { ral: '6012', isim: 'Kara Yeşil',       hex: 0x32423C, grup: 'koyu' },
    { ral: '6004', isim: 'Mavi Yeşil',       hex: 0x0E4243, grup: 'koyu' },
    { ral: '6015', isim: 'Siyah Zeytin',     hex: 0x36392C, grup: 'koyu' },
    { ral: '6006', isim: 'Gri Zeytin',       hex: 0x3B3C36, grup: 'koyu' },
    { ral: '8014', isim: 'Sepya Kahve',      hex: 0x43302E, grup: 'koyu' },
    { ral: '8017', isim: 'Çikolata Kahve',   hex: 0x45322E, grup: 'koyu' },
    { ral: '8019', isim: 'Gri Kahve',        hex: 0x39312C, grup: 'koyu' },
    { ral: '8016', isim: 'Maun Kahve',       hex: 0x3E2B23, grup: 'koyu' },
    { ral: '8011', isim: 'Fındık Kahve',     hex: 0x5A3A29, grup: 'koyu' },
    { ral: '6003', isim: 'Zeytin Yeşili',    hex: 0x4B573E, grup: 'koyu' }
];

// RAL kodları küçükten büyüğe sıralı gösterilsin diye kullanılan karşılaştırıcı.
function ralKarsilastir(a, b) {
    return parseInt(a.ral, 10) - parseInt(b.ral, 10);
}
TEMEL_TONLAR.sort(ralKarsilastir);

// ---------------------------------------------------------------------------
// Ton aileleri — RAL Classic'in KENDİ resmî numara gruplaması. Uydurulmuş bir
// sınıflandırma değil: RAL sisteminde ilk hane ton ailesini belirtir (1xxx sarı,
// 3xxx kırmızı, 7xxx gri…). Tek istisna 9xxx: standartta "beyaz ve siyah" tek
// grup, ama kapak seçiminde bu ikisi taban tabana zıt olduğu için tonun kendi
// `grup` alanına (acik/koyu) göre ikiye ayırıyoruz.
// ---------------------------------------------------------------------------
const RAL_HANE_AILESI = {
    '1': 'sari', '2': 'turuncu', '3': 'kirmizi', '4': 'mor',
    '5': 'mavi', '6': 'yesil', '7': 'gri', '8': 'kahve'
};

function tonAilesiBelirle(t) {
    const hane = t.ral[0];
    if (hane === '9') return t.grup === 'acik' ? 'beyaz' : 'siyah';
    return RAL_HANE_AILESI[hane] || 'diger';
}

// Kapak seçiminde en çok istenen aileler önde — alfabetik/numerik değil,
// kullanım sıklığına göre elle sıralandı. `seri`: RAL'in o aile için kullandığı
// resmî numara ondalığı (ör. "1000" = RAL'in tüm sarı tonları 10xx koduyla
// başlar) — müşteri katalogdan biliyorsa hangi bloğa baktığını hemen tanısın
// diye ayar bölümünün alt başlığında gösteriliyor. 'tumu' hepsini kapsadığı
// için tek bir seriye indirgenemez, seri değeri yok.
export const TON_AILELERI = [
    { anahtar: 'tumu', etiket: 'Tümü' },
    { anahtar: 'beyaz', etiket: 'Beyazlar', seri: '9000' },
    { anahtar: 'gri', etiket: 'Griler', seri: '7000' },
    { anahtar: 'siyah', etiket: 'Siyahlar', seri: '9000' },
    { anahtar: 'kahve', etiket: 'Kahveler', seri: '8000' },
    { anahtar: 'yesil', etiket: 'Yeşiller', seri: '6000' },
    { anahtar: 'mavi', etiket: 'Maviler', seri: '5000' },
    { anahtar: 'kirmizi', etiket: 'Kırmızılar', seri: '3000' },
    { anahtar: 'sari', etiket: 'Sarılar', seri: '1000' },
    { anahtar: 'mor', etiket: 'Morlar', seri: '4000' },
    { anahtar: 'turuncu', etiket: 'Turuncular', seri: '2000' }
];

function laketonuUret(t) {
    return {
        id: `lake-ral-${t.ral}`, kategori: 'lake', kod: `RAL ${t.ral}`, isim: t.isim, hex: t.hex,
        grup: t.grup, tonAilesi: tonAilesiBelirle(t),
        roughness: 0.35, metalness: 0.0, clearcoat: 0.5
    };
}

const LAKE_TUMU = TEMEL_TONLAR.map(laketonuUret);

export const RENK_KATALOGU = {
    lake: { tumu: LAKE_TUMU }
};

export function tumRenkleriDuzListeOlarakAl() {
    return LAKE_TUMU;
}

export function idIleRenkBul(id) {
    return LAKE_TUMU.find(r => r.id === id) || null;
}

// Renk paletinin tek gezinme ekseni: ton ailesi. 'tumu' hepsini döndürür.
// Her iki durumda da sıra RAL koduna göredir; RAL numaralandırması zaten
// aileye göre kümelendiği için "Tümü" görünümü de doğal olarak gruplu okunur.
export function tonAilesindekiRenkler(aileAnahtari) {
    if (!aileAnahtari || aileAnahtari === 'tumu') return LAKE_TUMU;
    return LAKE_TUMU.filter(r => r.tonAilesi === aileAnahtari);
}

// Konfigüratörün renk listesi: ton ailesi süzgeci OLMADAN, doğrudan RAL
// numarasına göre sıralı. Süzgeç kaldırıldı çünkü RAL Classic numaralandırması
// zaten renk ailesine göre kümelenmiş — 1xxx sarılar, 3xxx kırmızılar, 5xxx
// maviler, 6xxx yeşiller, 7xxx griler, 8xxx kahveler, 9xxx beyaz/siyah — yani
// sıralı düz liste ayrıca gruplamaya gerek kalmadan gruplu okunuyor ve
// kartelasından kod bilen müşteri aradığını doğrudan bulabiliyor.
//
// LAKE_TUMU'nun kendi sırası elle yazılmış (önce açık, sonra koyu tonlar), o
// yüzden burada açıkça sıralanıyor; kaynak dizinin sırası bozulmasın diye
// kopya üzerinde.
export function ralSirasindakiRenkler() {
    return [...LAKE_TUMU].sort((a, b) => Number(a.kod.slice(4)) - Number(b.kod.slice(4)));
}

// RAL Classic'in kendi seri adları. Numaranın ilk hanesi seriyi verir; bu
// tablo yalnızca o serinin insan tarafından okunan karşılığını tutuyor.
const SERI_ETIKETLERI = {
    '1000': 'Sarı ve bej tonları',
    '2000': 'Turuncular',
    '3000': 'Kırmızılar',
    '4000': 'Morlar',
    '5000': 'Maviler',
    '6000': 'Yeşiller',
    '7000': 'Griler',
    '8000': 'Kahveler',
    '9000': 'Beyaz ve siyahlar'
};

// Renkleri RAL serisine göre gruplar. Konfigüratörde katlanabilir bölümler
// olarak gösteriliyor: 77 rengin tamamı tek bir uzun liste hâlinde açıkken
// panelin altındaki ölçü bölümüne inmek çok uzun sürüyordu.
export function ralSerileri() {
    const gruplar = new Map();
    for (const renk of ralSirasindakiRenkler()) {
        const seri = `${renk.kod.slice(4, 5)}000`;
        if (!gruplar.has(seri)) {
            gruplar.set(seri, { seri, etiket: SERI_ETIKETLERI[seri] || `RAL ${seri}`, renkler: [] });
        }
        gruplar.get(seri).renkler.push(renk);
    }
    return [...gruplar.values()];
}

// Kataloğun gerçekten renk içeren aileleri — boş filtre düğmesi çizilmesin diye.
export function doluTonAileleri() {
    return TON_AILELERI.filter(a => tonAilesindekiRenkler(a.anahtar).length > 0);
}
