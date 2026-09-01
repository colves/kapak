// Ana sayfa etkileşimleri ve veriden üretilen bölümler.
//
// Ton aileleri ve vitrindeki 3B kapak SAYFAYA ELLE YAZILMIYOR; projenin kendi
// veri dosyalarından okunuyor (models.js, colors.js). Böylece konfigüratöre
// yeni bir model veya renk eklendiğinde ana sayfa kendiliğinden güncelleniyor.
//
// Model kartları artık burada değil: kendi sayfasına taşındı (js/modeller.js).
import { KAPAK_MODELLERI } from './data/models.js';
import { doluTonAileleri, tonAilesindekiRenkler } from './data/colors.js';
import { ustBariKur } from './ustBar.js';
// 3B önizleme konfigüratörün görüntüleyicisini kullanıyor: ayrı bir sahne
// kodu yazmak yerine aynı modülü çağırmak, kapağın iki sayfada da birebir
// aynı görünmesini garanti ediyor (aynı geometri, aynı malzeme, aynı kenar
// korumalı ölçekleme). viewer.js tekil bir sahne tutuyor — ana sayfada tek
// bir 3B alan olduğu için bu bir sorun değil.
import { sahneyiBaslat, kapagiGuncelle, ortamiDegistir } from './viewer.js';
import { varsayilanOrtami } from './data/ortamlar.js';

/* ---------------- Yardımcılar ---------------- */

const hexMetni = (renk) => `#${renk.hex.toString(16).padStart(6, '0')}`;

// Bir zemin rengi üzerinde siyah mı beyaz mı okunur?
// Sabit bir parlaklık EŞİĞİ kullanılmıyor: eşik göz kararı seçildiğinde
// yanlış tarafa düşebiliyor (ölçüldü — 0.42 eşiği #a5a8a8 üzerinde beyazı
// seçiyordu, oranı 2.40:1, WCAG'in istediği 4.5:1'in çok altında; siyah
// olsaydı 8.77:1 olacaktı). Onun yerine iki seçeneğin WCAG kontrast oranı
// da hesaplanıp YÜKSEK olan seçiliyor — bu tanım gereği doğru.
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

// Bir modele ait gerçek fotoğraf (varsa) — galeri.js'teki eşlemeden.

// Konfigüratör bağlantısı. renkKodu verilirse o renk de seçili açılır.

/* ---------------- Renkler & Yüzeyler ---------------- */

function tonlariKur() {
    const kap = document.getElementById('ton-izgara');
    if (!kap) return;

    // "Tümü" bir aile değil, süzgeç seçeneği — dışarıda bırakılıyor.
    const mevcut = doluTonAileleri().filter((a) => a.anahtar !== 'tumu');

    // Listenin İLK dördü alınmıyor: colors.js'te sıralama beyaz/gri/siyah/
    // kahve ile başlıyor, dördü de nötr — "77 RAL rengi" vaadini anlatmayan
    // gri bir duvar çıkıyordu. Renk aralığını gösteren bir seçim tercih
    // ediliyor; istenen aile yoksa kalanlardan tamamlanıyor, yani colors.js
    // değişse de bölüm boş kalmıyor.
    const tercih = ['mavi', 'kahve', 'yesil', 'gri'];
    const aileler = [
        ...tercih.map((k) => mevcut.find((a) => a.anahtar === k)).filter(Boolean),
        ...mevcut.filter((a) => !tercih.includes(a.anahtar))
    ].slice(0, 4);

    aileler.forEach((aile, i) => {
        const renkler = tonAilesindekiRenkler(aile.anahtar);
        if (renkler.length === 0) return;
        // Ailenin ortasındaki ton temsilci: en açık/en koyu uçlar aileyi
        // yanıltıcı temsil ediyordu.
        const temsilci = renkler[Math.floor(renkler.length / 2)];
        const zemin = hexMetni(temsilci);

        const kutu = document.createElement('div');
        kutu.className = 'malzeme';
        kutu.style.setProperty('--ton-zemin', zemin);
        kutu.style.setProperty('--ton-metin', okunurMetinRengi(temsilci.hex));
        const s = document.createElement('span');
        s.textContent = `0${i + 1} / ${aile.etiket}${aile.seri ? ` · RAL ${aile.seri}` : ''} · ${renkler.length} ton`;
        kutu.appendChild(s);
        kap.appendChild(kutu);
    });
}

/* ---------------- Konfigüratör tanıtımı: örnek kapak ---------------- */

function ornekKapagiKur() {
    const kap = document.getElementById('renk-secenekleri');
    const sahneKabi = document.getElementById('ornek-kapak');
    const yukleniyor = document.getElementById('kapak-yukleniyor');
    if (!kap || !sahneKabi) return;

    // Paletle uyumlu, birbirinden belirgin farklı üç gerçek RAL tonu.
    const tumRenkler = tonAilesindekiRenkler('tumu');
    // Yesil bir ton, ardindan konfiguratorun varsayilani Ipek Grisi ve en
    // koyu ucta Antrasit: acik/orta/koyu bir ilerleme. Ucu de gercek
    // katalog rengi (kodlar colors.js'ten dogrulaniyor).
    const secimler = ['6011', '7044', '7016']
        .map((kod) => tumRenkler.find((r) => r.kod === `RAL ${kod}`))
        .filter(Boolean);

    // Vitrinde konfigüratörün ilk modeli duruyor; models.js'e yeni bir model
    // eklenip başa alınırsa ana sayfa da kendiliğinden onu gösterir.
    const model = KAPAK_MODELLERI[0];
    if (secimler.length === 0 || !model) return;

    let secili = secimler[0];
    let sahneHazir = false;

    const kapagiCiz = () => {
        if (!sahneHazir) return;
        Promise.resolve(kapagiGuncelle(
            model.varsayilan.genislik,
            model.varsayilan.yukseklik,
            secili,
            model.gltfUrl,
            model.glbIcerikDonusu,
            model.kenarPayi
        ))
            .then(() => { if (yukleniyor) yukleniyor.hidden = true; })
            .catch((hata) => {
                console.error('Ana sayfa 3B önizlemesi yüklenemedi:', hata);
                // Sessiz boş bir kutu bırakma: ziyaretçi neden bir şey
                // görmediğini bilsin, konfigüratöre gitmesi engellenmesin.
                if (yukleniyor) yukleniyor.textContent = 'Önizleme yüklenemedi — konfigüratörde görüntüleyebilirsiniz.';
            });
    };

    const uygula = (renk, btn) => {
        secili = renk;
        kap.querySelectorAll('.renk-secenek').forEach((b) => {
            const aktif = b === btn;
            b.classList.toggle('aktif', aktif);
            b.setAttribute('aria-pressed', String(aktif));
        });
        kapagiCiz();
    };

    secimler.forEach((renk, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'renk-secenek';
        btn.style.background = hexMetni(renk);
        btn.setAttribute('aria-label', `${renk.isim}, ${renk.kod}`);
        btn.title = `${renk.isim} · ${renk.kod}`;
        btn.addEventListener('click', () => uygula(renk, btn));
        kap.appendChild(btn);
        if (i === 0) uygula(renk, btn);
    });

    // Sahne, bölüm ekrana YAKLAŞINCA kuruluyor. Ana sayfaya giren herkes
    // aşağı inmiyor; WebGL bağlamını ve .glb dosyasını sayfa açılışında
    // yüklemek ilk görüntülemeyi gereksiz yere ağırlaştırırdı.
    const baslat = () => {
        if (sahneHazir) return;
        sahneHazir = true;
        // 1500 mm: dikey FOV 40° olduğu için kameranın gördüğü yükseklik
        // 2·d·tan(20°) = 0.728·d. 1500'de bu ~1092 mm eder, 720 mm'lik kapak
        // çerçevenin ~%66'sını doldurur — kabın eni ne olursa olsun (kamera
        // dikeyden çerçeveliyor) her ekran genişliğinde aynı duruyor.
        sahneyiBaslat('ornek-kapak', { kameraMesafesi: 1500 });
        kapagiCiz();
        // Konfiguratorle AYNI studyo isigi (Klasik Studyo HDR) — kapak iki
        // sayfada da ayni isikta gorunsun. Sayfa acilisinda indirilmiyor:
        // bu blok zaten yalnizca bolum gorunume girdiginde calisiyor.
        // Yuklenemezse sahne procedural ortamla surer, bos kalmaz.
        const ortam = varsayilanOrtami();
        if (ortam) {
            Promise.resolve(ortamiDegistir(ortam.dosya))
                .catch((h) => console.warn('Studyo isigi yuklenemedi, procedural ortam suruyor:', h));
        }
    };

    if (typeof IntersectionObserver === 'function') {
        const gozlemci = new IntersectionObserver((girisler) => {
            if (girisler.some((g) => g.isIntersecting)) {
                gozlemci.disconnect();
                baslat();
            }
        }, { rootMargin: '300px' });
        gozlemci.observe(sahneKabi);
    } else {
        baslat();
    }
}

/* ---------------- Başlangıç ---------------- */

function baslat() {
    ustBariKur();
    tonlariKur();
    ornekKapagiKur();
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', baslat);
}
