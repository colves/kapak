import { ustBariKur } from './ustBar.js';

const TOPLAM_SAYFA = 20;
const kitap = document.getElementById('kitap');
const sol = document.getElementById('kitap-sol');
const sag = document.getElementById('kitap-sag');
const solGorsel = document.getElementById('sol-sayfa-gorsel');
const sagGorsel = document.getElementById('sag-sayfa-gorsel');
const durum = document.getElementById('kitap-durum');
const ipucu = document.getElementById('kitap-ipucu');
const geri = document.getElementById('geri');
const ileri = document.getElementById('ileri');

let yaprak = 0;
let cevriliyor = false;

function sayfaYolu(sayfa) {
    return `assets/katalog/sayfa-${String(sayfa).padStart(2, '0')}.jpg`;
}

function guncelle() {
    const solSayfa = yaprak * 2 + 1;
    const sagSayfa = solSayfa + 1;
    const mobil = window.matchMedia('(max-width: 720px)').matches;

    solGorsel.src = sayfaYolu(solSayfa);
    solGorsel.alt = `Katalog sayfası ${solSayfa}`;
    sagGorsel.src = sayfaYolu(mobil ? solSayfa : sagSayfa);
    sagGorsel.alt = `Katalog sayfası ${mobil ? solSayfa : sagSayfa}`;
    durum.textContent = `${String(solSayfa).padStart(2, '0')} - ${String(sagSayfa).padStart(2, '0')} / ${TOPLAM_SAYFA}`;
    geri.disabled = yaprak === 0;
    ileri.disabled = yaprak === (TOPLAM_SAYFA / 2) - 1;
    ipucu.textContent = ileri.disabled
        ? 'Kataloğun son sayfalarındasınız'
        : 'Sağ yaprağa tıklayarak devam edin';
}

function cevir(yon) {
    const sonraki = yaprak + yon;
    if (cevriliyor || sonraki < 0 || sonraki >= TOPLAM_SAYFA / 2) return;

    cevriliyor = true;
    kitap.classList.add(yon > 0 ? 'cevir-ileri' : 'cevir-geri');

    window.setTimeout(() => {
        yaprak = sonraki;
        guncelle();
        kitap.classList.remove('cevir-ileri', 'cevir-geri');
        cevriliyor = false;
    }, 580);
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
ustBariKur();
