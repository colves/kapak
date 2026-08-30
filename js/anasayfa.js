// Ana sayfa: kaydırmalı "sinema" sahnesi değil, sayfa açılır açılmaz
// kullanılabilen GERÇEK, canlı bir 3B önizleme. Konfigüratörün kendi
// viewer.js'ini birebir kullanıyor — ayrı, test edilmemiş bir mini-sahne
// yazmak yerine zaten kanıtlanmış render/HDR/GLB mantığını tekrar kullanmak
// hem daha güvenilir hem daha az kod.
import { sahneyiBaslat, kapagiGuncelle, ortamiDegistir } from './viewer.js';
import { idIleRenkBul } from './data/colors.js';
import { idIleModelBul, KAPAK_MODELLERI } from './data/models.js';
import { varsayilanOrtami } from './data/ortamlar.js';
import { GALERI_FOTOGRAFLARI } from './data/galeri.js';
import { durumuSorguyaKodla } from './paylasim.js';

const HERO_MODEL_ID = 'hk-012-001';

// Hero sahnesi konfigüratörden çok daha geniş bir alan kaplıyor; oradaki
// varsayılan 1600'lük kamera uzaklığı kapağı bu çerçevede küçük bırakıyordu.
// 1250'de kapak (720mm) dikey görüş alanının ~%79'unu dolduruyor:
// görünen yükseklik = 2 · 1250 · tan(40°/2) ≈ 910mm.
const HERO_KAMERA_MESAFESI = 1250;

// Hızlı deneme için elle seçilmiş, birbirinden belirgin şekilde farklı 6 ton
// (açık/koyu, sıcak/soğuk karışık) — ziyaretçi tıkladığında farkı hemen görsün.
const HERO_RENK_SIRASI = [
    'lake-ral-9016', // Trafik Beyazı
    'lake-ral-7016', // Antrasit Gri
    'lake-ral-9005', // Jet Siyah
    'lake-ral-3004', // Bordo
    'lake-ral-6005', // Şişe Yeşili
    'lake-ral-5013'  // Kobalt Lacivert
];

// Ana sayfanın kendi canlı durumu. Ölçüler artık sabit değil: hero'daki 8-bit
// kaydırıcılar bunları değiştiriyor ve kapak anında güncelleniyor. Alan adları
// paylasim.js'in beklediği şekilde (modelId/renkId/genislik/...) — böylece
// "Konfigüratörü Aç" bağlantıları durumu ekstra dönüşüm olmadan taşıyabiliyor.
const heroVarsayilanModel = idIleModelBul(HERO_MODEL_ID);
const heroDurum = {
    modelId: HERO_MODEL_ID,
    renkId: HERO_RENK_SIRASI[0],
    genislik: heroVarsayilanModel.varsayilan.genislik,
    yukseklik: heroVarsayilanModel.varsayilan.yukseklik,
    kalinlik: heroVarsayilanModel.varsayilan.kalinlik
};

// Bu üç bağlantı ziyaretçinin o anki seçimini konfigüratöre taşır. Model
// kartlarının kendi ?m= bağlantıları var, onlara DOKUNULMUYOR — bu yüzden
// href'e göre değil, kimliğe göre seçiliyorlar.
const KONFIG_LINK_IDLERI = ['ustbar-konfigurator-link', 'hero-konfigurator-link', 'cta-konfigurator-link'];

function hexMetni(renk) {
    return `#${renk.hex.toString(16).padStart(6, '0')}`;
}

function heroKapagiGuncelle() {
    const model = idIleModelBul(heroDurum.modelId);
    const renk = idIleRenkBul(heroDurum.renkId);
    kapagiGuncelle(model.id, heroDurum.genislik, heroDurum.yukseklik,
        heroDurum.kalinlik, renk, model.gltfUrl, model.glbIcerikDonusu);
}

// Kaydırıcı sürüklenirken 'input' saniyede onlarca kez tetikleniyor; her
// tetiklemede GLB grubunu yeniden klonlamak gereksiz. Konfigüratördeki
// (ui.js goruntuGuncellemesiPlanla) desenle aynı: kare başına tek güncelleme,
// sekme arka plandaysa rAF hiç çalışmayabileceği için zamanlayıcı yedeği var.
let heroGuncellemeBekliyor = false;
function heroGuncellemesiPlanla() {
    if (heroGuncellemeBekliyor) return;
    heroGuncellemeBekliyor = true;
    let calisti = false;
    const calistir = () => {
        if (calisti) return;
        calisti = true;
        heroGuncellemeBekliyor = false;
        heroKapagiGuncelle();
    };
    requestAnimationFrame(calistir);
    setTimeout(calistir, 200);
}

function heroOlcuEtiketiniGuncelle() {
    const el = document.getElementById('hero-olcu-etiketi');
    if (el) el.textContent = `${heroDurum.genislik} × ${heroDurum.yukseklik} MM`;
}

function konfiguratorLinkleriniGuncelle() {
    const sorgu = durumuSorguyaKodla(heroDurum);
    KONFIG_LINK_IDLERI.forEach((id) => {
        const a = document.getElementById(id);
        if (a) a.href = `configurator.html${sorgu}`;
    });
}

// Hero ölçü kaydırıcıları (8-bit). Klasik ana sayfada bu elemanlar yok —
// input bulunamazsa sessizce çıkılıyor, iki sayfa da aynı dosyayı kullanabilsin.
function heroKaydiriciyiKur(inputId, degerId, alan) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const sarmal = input.closest('.pk-kaydirici');
    const degerEl = document.getElementById(degerId);

    // Dolgu genişliği ve tutamacın konumu tek bir --pk-oran değişkeninden
    // besleniyor (bkz. piksel.css) — JS iki ayrı stil yazmıyor.
    const gorunumuYaz = () => {
        const min = Number(input.min);
        const max = Number(input.max);
        const deger = Number(input.value);
        const oran = max > min ? ((deger - min) / (max - min)) * 100 : 0;
        if (sarmal) sarmal.style.setProperty('--pk-oran', `${oran}%`);
        if (degerEl) degerEl.textContent = `${deger} MM`;
    };

    input.addEventListener('input', () => {
        heroDurum[alan] = Number(input.value);
        gorunumuYaz();
        heroOlcuEtiketiniGuncelle();
        konfiguratorLinkleriniGuncelle();
        heroGuncellemesiPlanla();
    });

    // Açılış değeri modelin varsayılanı olsun (HTML'deki value ile durum
    // arasında ikinci bir doğruluk kaynağı oluşmasın).
    input.value = heroDurum[alan];
    gorunumuYaz();
}

function heroKaydiricilariniKur() {
    heroKaydiriciyiKur('hero-genislik', 'hero-genislik-deger', 'genislik');
    heroKaydiriciyiKur('hero-yukseklik', 'hero-yukseklik-deger', 'yukseklik');
    heroOlcuEtiketiniGuncelle();
    konfiguratorLinkleriniGuncelle();
}

async function heroSahnesiniBaslat() {
    const konteyner = document.getElementById('hero-canvas');
    if (!konteyner) return;
    sahneyiBaslat('hero-canvas', { kameraMesafesi: HERO_KAMERA_MESAFESI });
    heroKapagiGuncelle();
    // Sahne procedural ortamla anında görünür; gerçek HDR arka planda yüklenip
    // hazır olunca sorunsuzca devralır (bkz. viewer.js ortamiDegistir yorumu).
    ortamiDegistir(varsayilanOrtami().dosya);
}

function heroRenkleriniKur() {
    const kapsayici = document.getElementById('hero-renkler');
    if (!kapsayici) return;
    HERO_RENK_SIRASI.forEach((id) => {
        const renk = idIleRenkBul(id);
        if (!renk) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        const aktif = id === heroDurum.renkId;
        btn.className = 'hero-renk-btn' + (aktif ? ' aktif' : '');
        btn.style.setProperty('--renk', hexMetni(renk));
        btn.dataset.renkId = id;
        btn.setAttribute('aria-pressed', String(aktif));
        btn.setAttribute('aria-label', `${renk.isim}, ${renk.kod}`);
        btn.title = `${renk.isim} · ${renk.kod}`;
        btn.addEventListener('click', () => {
            if (heroDurum.renkId === id) return;
            heroDurum.renkId = id;
            konfiguratorLinkleriniGuncelle();
            heroGuncellemesiPlanla();
            kapsayici.querySelectorAll('.hero-renk-btn').forEach((b) => {
                const a = b === btn;
                b.classList.toggle('aktif', a);
                b.setAttribute('aria-pressed', String(a));
            });
        });
        kapsayici.appendChild(btn);
    });
}

// Model kartları: doğrudan konfigüratöre o model seçiliyken açılan linkler —
// paylaşım linkiyle (js/paylasim.js) AYNI ?m= parametresini kullanır, yani
// ui.js'in urldenDurumuYukle()'si bunu ekstra kod gerekmeden zaten anlar.
function modelKartlariniKur() {
    const kapsayici = document.getElementById('model-serit-anasayfa');
    if (!kapsayici) return;
    KAPAK_MODELLERI.forEach((model) => {
        const a = document.createElement('a');
        a.href = `configurator.html?m=${encodeURIComponent(model.id)}`;
        a.className = 'model-kart-anasayfa';
        a.innerHTML = `
            <span class="model-kart-anasayfa-ikon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4" y="2" width="16" height="20" rx="1.5"></rect><rect x="7" y="5" width="10" height="14" rx="0.8"></rect></svg>
            </span>
            <span class="model-kart-anasayfa-ad">${model.kisaIsim || model.isim}</span>
            <span class="model-kart-anasayfa-olcu">${model.varsayilan.genislik} × ${model.varsayilan.yukseklik} mm</span>
        `;
        kapsayici.appendChild(a);
    });
}

/* ---------------- Galeri ----------------
   Kartlar js/data/galeri.js'ten üretiliyor. `dosya`sı olmayan kayıtlar
   TIKLANAMAZ yer tutucu (<div>), gerçek fotoğraflar büyüteci açan <button>.
   Kaydırma tarayıcının kendi yatay kaydırması + scroll-snap ile yapılıyor;
   buradaki JS yalnızca kartları çiziyor, okları scrollBy ile sürüyor ve
   okların etkin/pasif durumunu güncelliyor. */

// Büyüteç açılmadan önceki odak — kapanınca oraya geri dönülsün (klavyeyle
// gezen kullanıcı bastığı fotoğrafın yerini kaybetmesin).
let buyutecOncesiOdak = null;

function buyutecAc(foto, altMetni) {
    const katman = document.getElementById('galeri-buyutec');
    const gorsel = document.getElementById('galeri-buyutec-gorsel');
    const yazi = document.getElementById('galeri-buyutec-yazi');
    if (!katman || !gorsel) return;
    buyutecOncesiOdak = document.activeElement;
    gorsel.src = foto.dosya;
    gorsel.alt = altMetni;
    if (yazi) {
        yazi.textContent = foto.baslik || '';
        yazi.hidden = !foto.baslik;
    }
    katman.classList.remove('gizli');
    const kapat = document.getElementById('galeri-buyutec-kapat');
    if (kapat) kapat.focus();
}

function buyutecKapat() {
    const katman = document.getElementById('galeri-buyutec');
    if (!katman || katman.classList.contains('gizli')) return;
    katman.classList.add('gizli');
    // src boşaltılıyor: kapalı bir büyüteçte tam boy fotoğraf bellekte durmasın.
    const gorsel = document.getElementById('galeri-buyutec-gorsel');
    if (gorsel) gorsel.removeAttribute('src');
    if (buyutecOncesiOdak) buyutecOncesiOdak.focus();
    buyutecOncesiOdak = null;
}

function buyuteciKur() {
    const katman = document.getElementById('galeri-buyutec');
    if (!katman) return;
    const kapat = document.getElementById('galeri-buyutec-kapat');
    if (kapat) kapat.addEventListener('click', buyutecKapat);
    // Yalnızca karartılmış zemine tıklamak kapatır; fotoğrafın üstü kapatmaz.
    katman.addEventListener('click', (e) => { if (e.target === katman) buyutecKapat(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') buyutecKapat();
    });
}

function galeriKartiOlustur(foto, sira) {
    if (!foto || !foto.dosya) {
        const yer = document.createElement('div');
        yer.className = 'galeri-kart';
        yer.innerHTML = `
            <div class="galeri-yer-tutucu">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.1-2h8.4l1.1 2h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z"/><circle cx="12" cy="13" r="3.4"/></svg>
                <span>Fotoğraf eklenecek</span>
            </div>
        `;
        return yer;
    }

    const altMetni = foto.baslik || `Galeri fotoğrafı ${sira}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'galeri-kart';
    btn.setAttribute('aria-label', `${altMetni} — büyüt`);
    btn.innerHTML = `
        <img class="galeri-kart-gorsel" src="${foto.dosya}" alt="${altMetni}" loading="lazy" decoding="async">
        ${foto.baslik ? `<span class="galeri-kart-yazi">${foto.baslik}</span>` : ''}
    `;
    btn.addEventListener('click', () => buyutecAc(foto, altMetni));
    return btn;
}

function galeriyiKur() {
    const serit = document.getElementById('galeri-serit');
    if (!serit) return;
    GALERI_FOTOGRAFLARI.forEach((foto, i) => serit.appendChild(galeriKartiOlustur(foto, i + 1)));
    buyuteciKur();

    const oklar = document.getElementById('galeri-oklar');
    const geri = document.getElementById('galeri-geri');
    const ileri = document.getElementById('galeri-ileri');
    if (!oklar || !geri || !ileri) return;

    // Bir tıklamada tam olarak bir kart kayılsın: kartın ölçülen genişliği +
    // şeridin gerçek boşluğu. Sabit bir px değeri yazılmıyor çünkü kart
    // genişliği clamp() ile ekran boyutuna göre değişiyor.
    const adim = () => {
        const kart = serit.querySelector('.galeri-kart');
        if (!kart) return serit.clientWidth;
        const bosluk = parseFloat(getComputedStyle(serit).columnGap) || 0;
        return kart.getBoundingClientRect().width + bosluk;
    };

    const durumuGuncelle = () => {
        // Kartlar zaten sığıyorsa ok göstermek yanıltıcı olur — tamamen gizle.
        const tasiyor = serit.scrollWidth - serit.clientWidth > 1;
        oklar.hidden = !tasiyor;
        if (!tasiyor) return;
        const enSag = serit.scrollWidth - serit.clientWidth;
        geri.disabled = serit.scrollLeft <= 1;
        ileri.disabled = serit.scrollLeft >= enSag - 1;
    };

    geri.addEventListener('click', () => serit.scrollBy({ left: -adim(), behavior: 'smooth' }));
    ileri.addEventListener('click', () => serit.scrollBy({ left: adim(), behavior: 'smooth' }));
    serit.addEventListener('scroll', durumuGuncelle, { passive: true });
    window.addEventListener('resize', durumuGuncelle);
    durumuGuncelle();
}

// Bölümler ekrana girerken hafif bir belirme — prefers-reduced-motion zaten
// base.css'teki global kuralla geçiş süresini sıfırlıyor, burada ek kontrol gerekmez.
function kaydirmaBelirmesiniKur() {
    const elemanlar = document.querySelectorAll('.reveal');
    if (elemanlar.length === 0) return;
    if (!('IntersectionObserver' in window)) {
        elemanlar.forEach((e) => e.classList.add('gorundu'));
        return;
    }
    const gozlemci = new IntersectionObserver((girisler) => {
        girisler.forEach((giris) => {
            if (giris.isIntersecting) {
                giris.target.classList.add('gorundu');
                gozlemci.unobserve(giris.target);
            }
        });
    }, { threshold: 0.15 });
    elemanlar.forEach((e) => gozlemci.observe(e));
}

function anasayfayiBaslat() {
    document.documentElement.classList.add('anasayfa-sayfa');
    heroSahnesiniBaslat().catch((hata) => console.error('Hero sahnesi başlatılamadı:', hata));
    heroKaydiricilariniKur();
    heroRenkleriniKur();
    modelKartlariniKur();
    galeriyiKur();
    kaydirmaBelirmesiniKur();
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', anasayfayiBaslat);
}
