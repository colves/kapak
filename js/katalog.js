import { ustBariKur } from './ustBar.js';

const TOPLAM_SAYFA = 20;
const SURE = 920;
const kitap = document.getElementById('kitap');
const sol = document.getElementById('kitap-sol');
const sag = document.getElementById('kitap-sag');
const solGorsel = document.getElementById('sol-sayfa-gorsel');
const sagGorsel = document.getElementById('sag-sayfa-gorsel');
const cevirenYaprak = document.getElementById('ceviren-yaprak');
const yaprakOn = document.getElementById('yaprak-on-gorsel');
const yaprakArka = document.getElementById('yaprak-arka-gorsel');
const durum = document.getElementById('kitap-durum');
const ipucu = document.getElementById('kitap-ipucu');
const geri = document.getElementById('geri');
const ileri = document.getElementById('ileri');
const mobilKatalog = document.getElementById('mobil-katalog');
const yuklemeEkrani = document.getElementById('katalog-yukleme-ekrani');

const sayfaOnbellegi = new Map();
let yaprak = 0;
let cevriliyor = false;

function sayfaYolu(sayfa) {
    return `assets/katalog/sayfa-${String(sayfa).padStart(2, '0')}.jpg`;
}

function gorselAta(gorsel, sayfa) {
    gorsel.src = sayfaOnbellegi.get(sayfa)?.src || sayfaYolu(sayfa);
    gorsel.alt = `Katalog sayfası ${sayfa}`;
}

function gorselYukle(sayfa) {
    return new Promise((resolve) => {
        const gorsel = new Image();
        gorsel.decoding = 'async';
        gorsel.onload = () => {
            if (typeof gorsel.decode === 'function') {
                gorsel.decode().catch(() => {}).finally(resolve);
            } else {
                resolve();
            }
        };
        gorsel.onerror = resolve;
        gorsel.src = sayfaYolu(sayfa);
        sayfaOnbellegi.set(sayfa, gorsel);
    });
}

function mobilSayfalariKur() {
    const belge = document.createDocumentFragment();

    for (let sayfa = 1; sayfa <= TOPLAM_SAYFA; sayfa += 1) {
        const kart = document.createElement('article');
        const gorsel = document.createElement('img');
        kart.className = 'mobil-sayfa';
        gorsel.src = sayfaOnbellegi.get(sayfa)?.src || sayfaYolu(sayfa);
        gorsel.alt = `Lake kapak kataloğu, sayfa ${sayfa}`;
        kart.append(gorsel);
        belge.append(kart);
    }

    mobilKatalog.replaceChildren(belge);
}

function guncelle() {
    const solSayfa = yaprak * 2 + 1;
    const sagSayfa = solSayfa + 1;

    gorselAta(solGorsel, solSayfa);
    gorselAta(sagGorsel, sagSayfa);
    durum.textContent = `${String(solSayfa).padStart(2, '0')} - ${String(sagSayfa).padStart(2, '0')} / ${TOPLAM_SAYFA}`;
    geri.disabled = yaprak === 0;
    ileri.disabled = yaprak === (TOPLAM_SAYFA / 2) - 1;
    ipucu.textContent = ileri.disabled ? 'Kataloğun son sayfalarındasınız' : 'Sağ yaprağa tıklayarak devam edin';
}

function cevir(yon) {
    const sonraki = yaprak + yon;
    if (cevriliyor || sonraki < 0 || sonraki >= TOPLAM_SAYFA / 2) return;

    const solSayfa = yaprak * 2 + 1;
    const sagSayfa = solSayfa + 1;
    const sonrakiSol = sonraki * 2 + 1;
    const oncekiSag = sonrakiSol + 1;

    cevriliyor = true;
    cevirenYaprak.classList.add(yon > 0 ? 'ileri' : 'geri');
    gorselAta(yaprakOn, yon > 0 ? sagSayfa : solSayfa);
    // Arka yüz ters çizilir; yaprak döndüğünde içerik ekrana doğru okunur kalır.
    gorselAta(yaprakArka, yon > 0 ? sonrakiSol : oncekiSag);

    window.setTimeout(() => {
        yaprak = sonraki;
        guncelle();
    }, SURE / 2);

    window.setTimeout(() => {
        cevirenYaprak.classList.remove('ileri', 'geri');
        cevriliyor = false;
    }, SURE);
}

async function kataloguBaslat() {
    const yuklemeler = Array.from({ length: TOPLAM_SAYFA }, (_, index) => gorselYukle(index + 1));
    await Promise.all(yuklemeler);
    mobilSayfalariKur();
    guncelle();
    document.body.classList.replace('katalog-yukleniyor', 'katalog-yuklendi');
    yuklemeEkrani.setAttribute('aria-hidden', 'true');
}

sol.addEventListener('click', () => cevir(-1));
sag.addEventListener('click', () => cevir(1));
geri.addEventListener('click', () => cevir(-1));
ileri.addEventListener('click', () => cevir(1));
kitap.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        cevir(-1);
    }

    if (event.key === 'ArrowRight') {
        event.preventDefault();
        cevir(1);
    }
});

ustBariKur();
kataloguBaslat();
