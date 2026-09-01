// Modeller kataloğu.
//
// Kartlar SAYFAYA ELLE YAZILMIYOR: models.js'ten üretiliyor, fotoğraflar
// galeri.js'ten eşleniyor. Konfigüratöre yeni bir model eklendiğinde katalog
// kendiliğinden büyüyor, iki yerde ayrı liste tutulmuyor.
import { KAPAK_MODELLERI } from './data/models.js';
import { GALERI_FOTOGRAFLARI } from './data/galeri.js';
import { ralSirasindakiRenkler } from './data/colors.js';
// Konfigüratör bağlantılarının sorgu dizesi elle kurulmuyor: 'm'/'r'
// anahtarlarını bilen tek yer paylasim.js olsun (paylaşım linkiyle aynı biçim).
import { durumuSorguyaKodla } from './paylasim.js';
import { ustBariKur } from './ustBar.js';

const hexMetni = (renk) => `#${renk.hex.toString(16).padStart(6, '0')}`;

function modelinFotografi(modelId) {
    return GALERI_FOTOGRAFLARI.find((f) => f && f.dosya && f.modelId === modelId) || null;
}

function konfiguratorAdresi(modelId, renkKodu) {
    const sorgu = durumuSorguyaKodla({
        modelId,
        renkId: renkKodu ? `lake-ral-${renkKodu}` : undefined
    });
    return `configurator.html${sorgu}`;
}

// Kartın altındaki renk noktaları. İlk sırada modelin kendi fotoğrafındaki
// renk duruyor (karta bakarken gördüğü ton), ardından açık ve koyu birer
// örnek — "bu model 77 renkte var" bilgisini tek bakışta veriyorlar.
// Her nokta konfigüratörü O RENKLE açan gerçek bir bağlantı.
const ORNEK_KODLAR = ['9016', '7044', '7016'];

function ornekRenkler(fotoKodu) {
    const tum = ralSirasindakiRenkler();
    const bul = (kod) => tum.find((r) => r.kod === `RAL ${kod}`);
    const secim = [];
    const ekle = (renk) => {
        if (renk && !secim.some((r) => r.kod === renk.kod)) secim.push(renk);
    };
    ekle(bul(fotoKodu));
    ORNEK_KODLAR.forEach((k) => ekle(bul(k)));
    return secim.slice(0, 3);
}

function kartOlustur(model) {
    const foto = modelinFotografi(model.id);
    const ad = model.kisaIsim || model.isim;

    const kart = document.createElement('article');
    kart.className = 'katalog-kart';

    const gorselBaglanti = document.createElement('a');
    gorselBaglanti.className = 'katalog-gorsel';
    gorselBaglanti.href = konfiguratorAdresi(model.id, foto ? foto.renkKodu : null);
    gorselBaglanti.setAttribute('aria-label', `${ad} — konfigüratörde aç`);

    // Fotoğrafı olmayan model boş bir kutu olarak kalmasın: kartın kendi
    // zemini görünür kalır, metin yine okunur.
    if (foto) {
        const img = document.createElement('img');
        img.src = foto.dosya;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        gorselBaglanti.appendChild(img);
    }
    kart.appendChild(gorselBaglanti);

    const alt = document.createElement('div');
    alt.className = 'katalog-alt';

    const basSatiri = document.createElement('div');
    basSatiri.className = 'katalog-bas';
    const h2 = document.createElement('h2');
    const adBaglanti = document.createElement('a');
    adBaglanti.href = gorselBaglanti.href;
    adBaglanti.textContent = ad;
    h2.appendChild(adBaglanti);
    const olcu = document.createElement('span');
    olcu.className = 'katalog-olcu';
    olcu.textContent = `${model.varsayilan.genislik} × ${model.varsayilan.yukseklik} mm`;
    basSatiri.append(h2, olcu);

    const aciklama = document.createElement('p');
    aciklama.className = 'katalog-aciklama';
    aciklama.textContent = `${model.varsayilan.kalinlik} mm lake kapak · 77 RAL rengi`;

    const noktalar = document.createElement('div');
    noktalar.className = 'katalog-noktalar';
    ornekRenkler(foto ? foto.renkKodu : null).forEach((renk) => {
        const a = document.createElement('a');
        a.className = 'katalog-nokta';
        a.href = konfiguratorAdresi(model.id, renk.kod.slice(4));
        a.style.background = hexMetni(renk);
        a.title = `${ad} · ${renk.isim} (${renk.kod})`;
        a.setAttribute('aria-label', `${ad} modelini ${renk.isim}, ${renk.kod} renginde aç`);
        noktalar.appendChild(a);
    });

    const tumu = document.createElement('a');
    tumu.className = 'katalog-tumu';
    tumu.href = gorselBaglanti.href;
    tumu.textContent = 'Tüm renkler →';
    noktalar.appendChild(tumu);

    alt.append(basSatiri, aciklama, noktalar);
    kart.appendChild(alt);
    return kart;
}

function katalogunuCiz() {
    const kap = document.getElementById('katalog-izgara');
    if (!kap) return;
    kap.innerHTML = '';
    KAPAK_MODELLERI.forEach((model) => kap.appendChild(kartOlustur(model)));

    const sayi = document.getElementById('katalog-sayi');
    if (sayi) sayi.textContent = `${KAPAK_MODELLERI.length} model`;
}

document.addEventListener('DOMContentLoaded', () => {
    ustBariKur();
    katalogunuCiz();
});
