// Renk kartelası sayfası.
//
// RAL Classic'in 216 rengi kartelada eksiksiz görünür. Yalnızca Şahinkaya'nın
// ürettiği tonlar konfigüratöre bağlanır; diğerleri kartela referansıdır.
import { idIleRenkBul } from './data/colors.js';
import { ralClassicSerileri } from './data/ralClassic.js';
import { durumuSorguyaKodla } from './paylasim.js';
import { ustBariKur } from './ustBar.js';

const hexMetni = (renk) => `#${renk.hex.toString(16).padStart(6, '0')}`;

/* ---------------- Okunur metin rengi ----------------
   Kutunun üzerindeki kod, kutunun rengine göre siyah ya da beyaz yazılıyor.
   Sabit bir parlaklık EŞİĞİ kullanılmıyor: eşik göz kararı seçildiğinde
   yanlış tarafa düşebiliyor. Bunun yerine iki seçeneğin WCAG kontrast oranı
   hesaplanıp büyük olan seçiliyor. */
function bagilParlaklik(hex) {
    const s = (k) => {
        const d = ((hex >> k) & 255) / 255;
        return d <= 0.03928 ? d / 12.92 : Math.pow((d + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * s(16) + 0.7152 * s(8) + 0.0722 * s(0);
}

function okunurMetinRengi(hex) {
    const L = bagilParlaklik(hex);
    const oran = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    return oran(L, 0) >= oran(L, 1) ? '#151515' : '#FFFFFF';
}

function konfiguratorAdresi(renk) {
    return `/konfigurator/${durumuSorguyaKodla({ renkId: renk.id })}`;
}

/* ---------------- Kartela ---------------- */

function kutuOlustur(renk) {
    const kod = renk.kod.slice(4);
    const uretimRengi = idIleRenkBul(`lake-ral-${kod}`);
    const kart = document.createElement(uretimRengi ? 'a' : 'article');
    kart.className = 'ton' + (uretimRengi ? '' : ' kartela-referansi');
    if (uretimRengi) kart.href = konfiguratorAdresi(uretimRengi);
    kart.style.background = hexMetni(renk);
    kart.style.color = okunurMetinRengi(renk.hex);
    kart.dataset.ara = `${renk.kod} ${renk.isim}`.toLocaleLowerCase('tr');
    kart.setAttribute('aria-label', `${renk.kod} ${renk.isim} — ${uretimRengi ? 'konfigüratörde aç' : 'kartela referansı, üretim listesinde değil'}`);

    const kodEl = document.createElement('span');
    kodEl.className = 'ton-kod';
    kodEl.textContent = renk.kod;

    const isim = document.createElement('span');
    isim.className = 'ton-isim';
    isim.textContent = renk.isim;

    kart.append(kodEl, isim);
    if (!uretimRengi) {
        const durum = document.createElement('span');
        durum.className = 'ton-durum';
        durum.textContent = 'Kartela referansı';
        kart.appendChild(durum);
    }
    return kart;
}

function kartelayiCiz() {
    const kap = document.getElementById('kartela');
    const yanMenu = document.getElementById('seri-menu');
    if (!kap || !yanMenu) return;

    const seriler = ralClassicSerileri();
    kap.innerHTML = '';
    yanMenu.innerHTML = '';

    seriler.forEach((grup) => {
        const kimlik = `seri-${grup.seri}`;

        // Soldaki liste: her seri kendi renginden bir işaret taşıyor, sayı da
        // yanında — müşteri hangi ailede kaç ton olduğunu tıklamadan görüyor.
        const bag = document.createElement('a');
        bag.className = 'seri-bag';
        bag.href = `/renkler/#${kimlik}`;
        bag.dataset.seri = grup.seri;
        const nokta = document.createElement('span');
        nokta.className = 'seri-nokta';
        nokta.style.background = hexMetni(grup.renkler[Math.floor(grup.renkler.length / 2)]);
        const ad = document.createElement('span');
        ad.className = 'seri-bag-ad';
        ad.textContent = grup.etiket;
        const sayi = document.createElement('span');
        sayi.className = 'seri-bag-sayi';
        sayi.textContent = grup.renkler.length;
        bag.append(nokta, ad, sayi);
        yanMenu.appendChild(bag);

        // Sağdaki bölüm
        const bolum = document.createElement('section');
        bolum.className = 'seri-bolum';
        bolum.id = kimlik;

        const bas = document.createElement('div');
        bas.className = 'seri-bolum-bas';
        const h2 = document.createElement('h2');
        h2.innerHTML = `RAL ${grup.seri} <span>${grup.etiket}</span>`;
        const adet = document.createElement('span');
        adet.className = 'seri-bolum-adet';
        adet.textContent = `${grup.renkler.length} ton`;
        bas.append(h2, adet);

        const izgara = document.createElement('div');
        izgara.className = 'ton-izgara';
        grup.renkler.forEach((renk) => izgara.appendChild(kutuOlustur(renk)));

        bolum.append(bas, izgara);
        kap.appendChild(bolum);
    });

    const toplam = seriler.reduce((n, g) => n + g.renkler.length, 0);
    const sayac = document.getElementById('toplam-ton');
    if (sayac) sayac.textContent = `${toplam} ton · ${seriler.length} seri`;
}

/* ---------------- Arama ----------------
   Hem koda ("7016") hem isme ("antrasit") yazılabiliyor. Kartelasından kodu
   bilen müşteri 77 kutunun arasında gözle tarasın istemiyoruz. */
function aramayiKur() {
    const girdi = document.getElementById('renk-ara');
    const bos = document.getElementById('sonuc-yok');
    if (!girdi) return;

    const uygula = () => {
        const s = girdi.value.trim().toLocaleLowerCase('tr');
        let bulunan = 0;

        document.querySelectorAll('.seri-bolum').forEach((bolum) => {
            let bolumdeVar = 0;
            bolum.querySelectorAll('.ton').forEach((t) => {
                const uyuyor = !s || t.dataset.ara.includes(s);
                t.hidden = !uyuyor;
                if (uyuyor) bolumdeVar++;
            });
            // Tek bir tonu bile kalmayan seri başlığı ekranda durmasın.
            bolum.hidden = bolumdeVar === 0;
            bulunan += bolumdeVar;
        });

        if (bos) {
            bos.hidden = bulunan > 0;
            bos.textContent = `"${girdi.value.trim()}" ile eşleşen ton yok.`;
        }
        const sayac = document.getElementById('toplam-ton');
        if (sayac && s) sayac.textContent = `${bulunan} ton bulundu`;
        else if (sayac) kartelaSayacinaDon();
    };

    girdi.addEventListener('input', uygula);
    // Esc aramayı temizlesin — kutuyu elle silmek gerekmesin.
    girdi.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && girdi.value) {
            girdi.value = '';
            uygula();
        }
    });
}

function kartelaSayacinaDon() {
    const seriler = ralClassicSerileri();
    const toplam = seriler.reduce((n, g) => n + g.renkler.length, 0);
    const sayac = document.getElementById('toplam-ton');
    if (sayac) sayac.textContent = `${toplam} ton · ${seriler.length} seri`;
}

/* ---------------- Soldaki listede bulunulan seriyi işaretle ---------------- */
function seriTakibiniKur() {
    const bolumler = [...document.querySelectorAll('.seri-bolum')];
    if (!bolumler.length || typeof IntersectionObserver !== 'function') return;

    const isaretle = (seri) => {
        document.querySelectorAll('.seri-bag').forEach((b) => {
            b.classList.toggle('etkin', b.dataset.seri === seri);
        });
    };

    const gozlemci = new IntersectionObserver((girisler) => {
        // Ekranın üst kısmına en yakın görünür bölüm "bulunulan" sayılıyor.
        const gorunur = girisler.filter((g) => g.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (gorunur) isaretle(gorunur.target.id.replace('seri-', ''));
    }, { rootMargin: '-30% 0px -60% 0px' });

    bolumler.forEach((b) => gozlemci.observe(b));
}

document.addEventListener('DOMContentLoaded', () => {
    ustBariKur();
    kartelayiCiz();
    aramayiKur();
    seriTakibiniKur();
});
