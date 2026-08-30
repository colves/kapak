// Ana sayfa: kaydırmalı "sinema" sahnesi değil, sayfa açılır açılmaz
// kullanılabilen GERÇEK, canlı bir 3B önizleme. Konfigüratörün kendi
// viewer.js'ini birebir kullanıyor — ayrı, test edilmemiş bir mini-sahne
// yazmak yerine zaten kanıtlanmış render/HDR/GLB mantığını tekrar kullanmak
// hem daha güvenilir hem daha az kod.
import { sahneyiBaslat, kapagiGuncelle, ortamiDegistir } from './viewer.js';
import { idIleRenkBul } from './data/colors.js';
import { idIleModelBul, KAPAK_MODELLERI } from './data/models.js';
import { varsayilanOrtami } from './data/ortamlar.js';

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

let heroRenkId = HERO_RENK_SIRASI[0];

function hexMetni(renk) {
    return `#${renk.hex.toString(16).padStart(6, '0')}`;
}

function heroKapagiGuncelle(renk) {
    const model = idIleModelBul(HERO_MODEL_ID);
    kapagiGuncelle(model.id, model.varsayilan.genislik, model.varsayilan.yukseklik,
        model.varsayilan.kalinlik, renk, model.gltfUrl, model.glbIcerikDonusu);
}

async function heroSahnesiniBaslat() {
    const konteyner = document.getElementById('hero-canvas');
    if (!konteyner) return;
    sahneyiBaslat('hero-canvas', { kameraMesafesi: HERO_KAMERA_MESAFESI });
    heroKapagiGuncelle(idIleRenkBul(heroRenkId));
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
        const aktif = id === heroRenkId;
        btn.className = 'hero-renk-btn' + (aktif ? ' aktif' : '');
        btn.style.setProperty('--renk', hexMetni(renk));
        btn.dataset.renkId = id;
        btn.setAttribute('aria-pressed', String(aktif));
        btn.setAttribute('aria-label', `${renk.isim}, ${renk.kod}`);
        btn.title = `${renk.isim} · ${renk.kod}`;
        btn.addEventListener('click', () => {
            if (heroRenkId === id) return;
            heroRenkId = id;
            heroKapagiGuncelle(renk);
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
    heroRenkleriniKur();
    modelKartlariniKur();
    kaydirmaBelirmesiniKur();
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', anasayfayiBaslat);
}
