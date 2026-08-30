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
// Görseller js/data/galeri.js'ten geliyor: `dosya` alanı dolu kayıtlar gerçek
// fotoğraf, boş olanların yerine kapak görseli üretiliyor (aşağıya bkz.).
// Fotoğraf eklendikçe galeri kendiliğinden gerçek fotoğrafları kullanır.
import { GALERI_FOTOGRAFLARI } from './data/galeri.js';
import { tumRenkleriDuzListeOlarakAl } from './data/colors.js';

// Bileşendeki 14 görsele yakın bir sayı; sütun başına 4 kart, katlanınca 8.
const KART_SAYISI = 16;

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
        .map((f) => ({ src: f.dosya, alt: f.baslik || 'Galeri fotoğrafı' }));

    if (gercekler.length >= KART_SAYISI) return gercekler.slice(0, KART_SAYISI);

    const renkler = tumRenkleriDuzListeOlarakAl();
    const liste = gercekler.slice();
    // 7'şer atlayarak seçiliyor: paletin ardışık tonları birbirine çok yakın,
    // yan yana gelen kartlar tek renk bir duvar gibi görünmesin.
    for (let i = 0; liste.length < KART_SAYISI; i++) {
        const renk = renkler[(i * 7) % renkler.length];
        liste.push({ src: kapakGorseliUret(renk), alt: `${renk.isim} · ${renk.kod} kapak örneği` });
    }
    return liste;
}

function kartOlustur(gorsel) {
    const kart = document.createElement('div');
    kart.className = 'pu-kart';
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

    // i % 4 ile dört sütuna dağıt, sonra her sütunu kendi içinde katla.
    const sutunlar = [[], [], [], []];
    liste.forEach((g, i) => sutunlar[i % 4].push(g));

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
// framer-motion useTransform'un varsayılanı gibi: aralık dışında KIRPILIR.
const aralik = (p, bas, son) => kis((p - bas) / (son - bas), 0, 1);

function donusumleriYaz(p) {
    const kok = document.documentElement.style;
    // Panonun açılması: ilerlemenin ilk %15'i
    const a = aralik(p, 0, 0.15);
    kok.setProperty('--pu-pano-g', `${karistir(90, 100, a).toFixed(2)}vw`);
    kok.setProperty('--pu-pano-y', `${karistir(80, 100, a).toFixed(2)}vh`);
    kok.setProperty('--pu-pano-r', `${karistir(48, 0, a).toFixed(1)}px`);
    kok.setProperty('--pu-pano-k', `${karistir(4, 0, a).toFixed(2)}px`);

    // Matrisin düzleşmesi ve sütun kayması: kalan %85
    const b = aralik(p, 0.15, 1);
    kok.setProperty('--pu-rx', `${karistir(25, 4, b).toFixed(2)}deg`);
    kok.setProperty('--pu-ry', `${karistir(-45, -8, b).toFixed(2)}deg`);
    kok.setProperty('--pu-rz', `${karistir(15, 2, b).toFixed(2)}deg`);
    kok.setProperty('--pu-tz', `${karistir(-800, 0, b).toFixed(1)}px`);
    kok.setProperty('--pu-y1', `${karistir(0, -40, b).toFixed(2)}%`);
    kok.setProperty('--pu-y2', `${karistir(-40, 10, b).toFixed(2)}%`);
    kok.setProperty('--pu-y3', `${karistir(0, -40, b).toFixed(2)}%`);
    kok.setProperty('--pu-y4', `${karistir(-30, 20, b).toFixed(2)}%`);
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
