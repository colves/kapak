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

let yaprak = 0;
let cevriliyor = false;

function sayfaYolu(sayfa) {
    return `assets/katalog/sayfa-${String(sayfa).padStart(2, '0')}.jpg`;
}

function gorselAta(gorsel, sayfa) {
    gorsel.src = sayfaYolu(sayfa);
    gorsel.alt = `Katalog sayfası ${sayfa}`;
}

function tumSayfalariYukle() {
    for (let sayfa = 1; sayfa <= TOPLAM_SAYFA; sayfa += 1) {
        const gorsel = new Image();
        gorsel.src = sayfaYolu(sayfa);
    }
}

function guncelle() {
    const solSayfa = yaprak * 2 + 1;
    const sagSayfa = solSayfa + 1;
    const mobil = window.matchMedia('(max-width: 720px)').matches;

    gorselAta(solGorsel, solSayfa);
    gorselAta(sagGorsel, mobil ? solSayfa : sagSayfa);
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
    const mobil = window.matchMedia('(max-width: 720px)').matches;

    cevriliyor = true;
    cevirenYaprak.classList.add(yon > 0 ? 'ileri' : 'geri');
    gorselAta(yaprakOn, mobil ? solSayfa : (yon > 0 ? sagSayfa : solSayfa));
    gorselAta(yaprakArka, mobil ? sonrakiSol : (yon > 0 ? sonrakiSol : oncekiSag));

    window.setTimeout(() => {
        yaprak = sonraki;
        guncelle();
    }, SURE / 2);

    window.setTimeout(() => {
        cevirenYaprak.classList.remove('ileri', 'geri');
        cevriliyor = false;
    }, SURE);
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
window.addEventListener('resize', guncelle);

guncelle();
tumSayfalariYukle();
ustBariKur();
