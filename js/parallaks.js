// 3D Parallax Unfurling Gallery — ana sayfanın tamamı.
//
// 21st.dev bileşeninin (React + framer-motion) davranışı burada saf JS ile
// üretiliyor. Bileşenden birebir korunan üç şey:
//   1. Kaydırma ilerlemesi bir YAYDAN geçiriliyor (useSpring: stiffness 100,
//      damping 20, mass 0.5) — ham kaydırma değeri doğrudan kullanılsaydı
//      hareket sert ve kopuk olurdu.
//   2. Tüm dönüşüm aralıkları (useTransform giriş/çıkış aralıkları).
//   3. Görsellerin 4 sütuna i%4 ile dağıtılıp her sütunun kendi içinde
//      İKİYE katlanması (sütun kaydıkça alt/üst boşalmasın diye).
//
// Görseller js/data/galeri.js'ten geliyor. Liste 16 kartı doldurmaya yetmezse
// başa sarılarak tekrarlanır; liste tamamen boşsa markanın RAL Lake
// paletinden kapak görselleri üretilir. `modelId` verilmiş kartlar tıklanınca
// konfigüratörü o model (ve varsa o renk) seçili olarak açar.
import { GALERI_FOTOGRAFLARI } from './data/galeri.js';
import { tumRenkleriDuzListeOlarakAl, idIleRenkBul } from './data/colors.js';
import { idIleModelBul } from './data/models.js';
// Konfigüratör bağlantısının sorgu dizesi elle kurulmuyor: 'm'/'r' anahtarlarını
// bilen tek yer paylasim.js olsun (paylaşım linkiyle aynı biçim).
import { durumuSorguyaKodla } from './paylasim.js';

// Bileşendeki 14 görsele yakın bir sayı; sütun başına 4 kart, katlanınca 8.
const KART_SAYISI = 16;
const SUTUN_SAYISI = 4;

const azHareket = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- Yer tutucu kapak görselleri ----------------
   Dışarıdan (Unsplash vb.) görsel çekilmiyor: sayfa tamamen kendi kendine
   yeterli kalsın, ağ isteği ve telif sorunu olmasın diye yer tutucular
   markanın KENDİ RAL Lake paletinden, SVG olarak üretiliyor — rastgele stok
   fotoğraf yerine gerçekten kapak gibi görünüyorlar. */
function kapakGorseliUret(renk) {
    const hex = `#${renk.hex.toString(16).padStart(6, '0')}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">`
        + `<defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1">`
        + `<stop offset="0" stop-color="#ffffff" stop-opacity="0.26"/>`
        + `<stop offset="0.45" stop-color="#ffffff" stop-opacity="0"/>`
        + `<stop offset="1" stop-color="#000000" stop-opacity="0.16"/>`
        + `</linearGradient></defs>`
        + `<rect width="300" height="400" fill="${hex}"/>`
        + `<rect x="24" y="24" width="252" height="352" fill="none" stroke="#000000" stroke-opacity="0.18" stroke-width="3"/>`
        + `<rect x="40" y="40" width="220" height="320" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.16" stroke-width="2"/>`
        + `<rect width="300" height="400" fill="url(#p)"/>`
        + `</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function gorselListesiOlustur() {
    const gercekler = GALERI_FOTOGRAFLARI
        .filter((f) => f && f.dosya)
        .map((f) => ({
            src: f.dosya,
            alt: f.baslik || 'Kapak görseli',
            modelId: f.modelId || null,
            renkKodu: f.renkKodu || null
        }));

    // Hiç fotoğraf girilmemişse: markanın kendi RAL Lake paletinden kapak
    // görselleri üretilir. 7'şer atlanıyor çünkü paletin ardışık tonları
    // birbirine çok yakın; yan yana kartlar tek renk bir duvar gibi durmasın.
    if (gercekler.length === 0) {
        const renkler = tumRenkleriDuzListeOlarakAl();
        const uretilen = [];
        for (let i = 0; i < KART_SAYISI; i++) {
            const renk = renkler[(i * 7) % renkler.length];
            uretilen.push({
                src: kapakGorseliUret(renk),
                alt: `${renk.isim} · ${renk.kod} kapak örneği`,
                modelId: null,
                renkKodu: null
            });
        }
        return uretilen;
    }

    // Fotoğraf sayısı 16'dan azsa liste başa sarılarak tekrarlanır — böylece
    // tek bir fotoğrafla bile galeri dolu görünür.
    //
    // İndise sütun numarası ekleniyor. Sebebi: dağıtım sütun-öncelikli
    // (bkz. matrisiKur), yani bir sütunun kartları listede ardışık geliyor —
    // bu zaten sütun İÇİNDE tekrarı engelliyor. Ek kaydırma sütunlar ARASINDA
    // da diziyi kaydırıyor; yoksa dört sütun da aynı sırayla başlıyor ve
    // (parallaks 1. ve 3. sütunu başlangıçta aynı hizada tuttuğu için)
    // yan yana aynı desen görünüyordu.
    const sutunBasinaKart = Math.ceil(KART_SAYISI / SUTUN_SAYISI);
    const liste = [];
    for (let i = 0; i < KART_SAYISI; i++) {
        const sutun = Math.floor(i / sutunBasinaKart);
        liste.push(gercekler[(i + sutun) % gercekler.length]);
    }
    return liste;
}

function kartOlustur(gorsel) {
    // Modeli bilinen fotoğraf TIKLANABİLİR olur: konfigüratör o model (ve
    // varsa o renk) seçili hâlde açılır. Model id'si models.js'te yoksa kart
    // düz bir kutu olarak kalır — bozuk bağlantı üretmektense bağlantısız.
    const model = gorsel.modelId ? idIleModelBul(gorsel.modelId) : null;
    const renk = gorsel.renkKodu ? idIleRenkBul(`lake-ral-${gorsel.renkKodu}`) : null;

    const kart = document.createElement(model ? 'a' : 'div');
    kart.className = 'pu-kart';

    if (model) {
        const sorgu = durumuSorguyaKodla({
            modelId: model.id,
            renkId: renk ? renk.id : undefined
        });
        kart.href = `configurator.html${sorgu}`;
        kart.setAttribute('aria-label', `${gorsel.alt} — konfigüratörde aç`);
    }

    const img = document.createElement('img');
    img.src = gorsel.src;
    img.alt = gorsel.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    kart.appendChild(img);
    return kart;
}

function matrisiKur() {
    const matris = document.getElementById('pu-matris');
    if (!matris) return;
    const liste = gorselListesiOlustur();

    // Dağıtım SÜTUN-ÖNCELİKLİ: ilk 4 kart 1. sütuna, sonraki 4 kart 2. sütuna...
    // Satır-öncelikli (i % SUTUN_SAYISI) dağıtım BOZUKTU: liste de `i % n` ile
    // döndüğü için iki modulo hizalanabiliyor ve her sütun tek bir fotoğraftan
    // oluşuyordu (4 fotoğrafla ölçüldü: 1. sütunun sekiz kartı da aynıydı).
    // Sütun-öncelikli dağıtımda bir sütunun kartları listede ARDIŞIK gelir,
    // yani fotoğraf sayısı ne olursa olsun (1 hariç, ki orada zaten seçenek
    // yok) sütun içinde tekrar oluşmaz.
    const sutunBasinaKart = Math.ceil(KART_SAYISI / SUTUN_SAYISI);
    const sutunlar = Array.from({ length: SUTUN_SAYISI }, () => []);
    liste.forEach((g, i) => sutunlar[Math.floor(i / sutunBasinaKart)].push(g));

    matris.innerHTML = '';
    sutunlar.forEach((sutunGorselleri) => {
        const sutun = document.createElement('div');
        sutun.className = 'pu-sutun';
        // Katlama: kopya önce alınıyor, aksi hâlde push(...) döngüyü besler.
        const katlanmis = sutunGorselleri.concat(sutunGorselleri);
        katlanmis.forEach((g) => sutun.appendChild(kartOlustur(g)));
        matris.appendChild(sutun);
    });
}

/* ---------------- Kaydırma → ilerleme → yay → dönüşüm ---------------- */

const kis = (d, alt, ust) => Math.min(Math.max(d, alt), ust);
const karistir = (a, b, t) => a + (b - a) * t;

function donusumleriYaz(p) {
    const kok = document.documentElement.style;
    // Kutu kaldirildigi icin ayri bir "acilma" evresi yok: matris ve sutunlar
    // kaydirmanin TAMAMINA (0 -> 1) yayiliyor, boylece ilk %15 bos gecmiyor.
    // Yay hedefi hafifce asabilir; kirpilmazsa aci/derinlik sinirlarin disina
    // tasar (ornegin rotateY -30'un otesine gider) ve sicrama gorunur.
    const t = kis(p, 0, 1);
    kok.setProperty('--pu-tx', `${karistir(-16.5, -1.5, t).toFixed(2)}vw`);
    kok.setProperty('--pu-rx', `${karistir(20, 4, t).toFixed(2)}deg`);
    kok.setProperty('--pu-ry', `${karistir(-30, -8, t).toFixed(2)}deg`);
    kok.setProperty('--pu-rz', `${karistir(10, 2, t).toFixed(2)}deg`);
    kok.setProperty('--pu-tz', `${karistir(-500, 0, t).toFixed(1)}px`);
    kok.setProperty('--pu-y1', `${karistir(0, -40, t).toFixed(2)}%`);
    kok.setProperty('--pu-y2', `${karistir(-40, 10, t).toFixed(2)}%`);
    kok.setProperty('--pu-y3', `${karistir(0, -40, t).toFixed(2)}%`);
    kok.setProperty('--pu-y4', `${karistir(-30, 20, t).toFixed(2)}%`);
}

function hamIlerleme(sahne) {
    // Yapışkan sahne ekranda kaldığı sürece kaydırılan mesafe:
    // toplam yükseklik - bir ekran (framer'daki "start start" -> "end end").
    const kaydirilabilir = sahne.offsetHeight - window.innerHeight;
    if (kaydirilabilir <= 0) return 0;
    return kis(-sahne.getBoundingClientRect().top / kaydirilabilir, 0, 1);
}

// framer-motion useSpring karşılığı: stiffness 100, damping 20, mass 0.5.
const YAY_K = 100;
const YAY_C = 20;
const YAY_M = 0.5;

function animasyonuKur(sahne) {
    let konum = hamIlerleme(sahne);
    let hiz = 0;
    let hedef = konum;
    let sonZaman = 0;
    let calisiyor = false;

    donusumleriYaz(konum);

    const adim = (zaman) => {
        // İlk karede geçen süre bilinmiyor; sekme arka plandan dönerken de
        // dev bir dt gelebilir — sıçramayı önlemek için tavan konuyor.
        const dt = sonZaman ? Math.min((zaman - sonZaman) / 1000, 1 / 30) : 1 / 60;
        sonZaman = zaman;

        const ivme = (-YAY_K * (konum - hedef) - YAY_C * hiz) / YAY_M;
        hiz += ivme * dt;
        konum += hiz * dt;
        donusumleriYaz(konum);

        // Yay oturduğunda döngü durur: sürekli çalışan bir rAF pil yakar.
        if (Math.abs(konum - hedef) > 0.0002 || Math.abs(hiz) > 0.0002) {
            requestAnimationFrame(adim);
        } else {
            konum = hedef;
            hiz = 0;
            donusumleriYaz(konum);
            calisiyor = false;
            sonZaman = 0;
        }
    };

    const uyandir = () => {
        hedef = hamIlerleme(sahne);
        if (calisiyor) return;
        calisiyor = true;
        sonZaman = 0;
        requestAnimationFrame(adim);
    };

    window.addEventListener('scroll', uyandir, { passive: true });
    window.addEventListener('resize', uyandir);
    uyandir();
}

function baslat() {
    matrisiKur();
    const sahne = document.getElementById('pu-sahne');
    if (!sahne) return;

    if (azHareket) {
        // Hareket azaltma: yay/parallaks yok, matris doğrudan son (düz)
        // hâlinde duruyor. CSS de sahneyi tek ekrana indiriyor.
        donusumleriYaz(1);
        return;
    }
    animasyonuKur(sahne);
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', baslat);
}
