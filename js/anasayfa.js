// Ana sayfa etkileşimleri ve veriden üretilen bölümler.
//
// Ton aileleri ve vitrindeki 3B kapak SAYFAYA ELLE YAZILMIYOR; projenin kendi
// veri dosyalarından okunuyor (models.js, colors.js). Böylece konfigüratöre
// yeni bir model veya renk eklendiğinde ana sayfa kendiliğinden güncelleniyor.
//
// Model kartları artık burada değil: kendi sayfasına taşındı (js/modeller.js).
import { KAPAK_MODELLERI } from './data/models.js';
import { ralSirasindakiRenkler } from './data/colors.js';
import { ustBariKur } from './ustBar.js?v=20261023-2';
// 3B önizleme konfigüratörün görüntüleyicisini kullanıyor: ayrı bir sahne
// kodu yazmak yerine aynı modülü çağırmak, kapağın iki sayfada da birebir
// aynı görünmesini garanti ediyor (aynı geometri, aynı malzeme, aynı kenar
// korumalı ölçekleme). viewer.js tekil bir sahne tutuyor — ana sayfada tek
// bir 3B alan olduğu için bu bir sorun değil.
import { varsayilanOrtami } from './data/ortamlar.js';
import { varsayilanYuzey } from './data/yuzeyler.js';

/* ---------------- Yardımcılar ---------------- */

const hexMetni = (renk) => `#${renk.hex.toString(16).padStart(6, '0')}`;

/* ---------------- Konfigüratör tanıtımı: örnek kapak ---------------- */

function ornekKapagiKur() {
    const kap = document.getElementById('renk-secenekleri');
    const sahneKabi = document.getElementById('ornek-kapak');
    const yukleniyor = document.getElementById('kapak-yukleniyor');
    if (!kap || !sahneKabi) return;

    // Paletle uyumlu, birbirinden belirgin farklı üç gerçek RAL tonu.
    const tumRenkler = ralSirasindakiRenkler();
    // Yesil bir ton, ardindan konfiguratorun varsayilani Ipek Grisi ve en
    // koyu ucta Antrasit: acik/orta/koyu bir ilerleme. Ucu de gercek
    // katalog rengi (kodlar colors.js'ten dogrulaniyor).
    const secimler = ['6011', '7044', '7016']
        .map((kod) => tumRenkler.find((r) => r.kod === `RAL ${kod}`))
        .filter(Boolean);

    // Ana sayfadaki vitrinde M012 sabit: sayfanın görsel dilini bu klasik
    // model temsil ediyor; katalog sıralaması değişse de önizleme değişmez.
    const model = KAPAK_MODELLERI.find((aday) => aday.id === 'hk-012-001');
    if (secimler.length === 0 || !model) return;

    // Vitrin en sağdaki (en koyu) tonla açılıyor: kapağın profil derinliği
    // koyu bir lakede en iyi okunuyor.
    let secili = secimler[secimler.length - 1];
    let sahneHazir = false;
    let baslatiliyor = false;
    let goruntuleyici;

    const kapagiCiz = () => {
        if (!sahneHazir) return;
        Promise.resolve(goruntuleyici.kapagiGuncelle(
            model.varsayilan.genislik,
            model.varsayilan.yukseklik,
            secili,
            model.gltfUrl,
            model.glbIcerikDonusu,
            model.kenarPayi,
            varsayilanYuzey(),
            model.varsayilan.kalinlik,
            model.glbEksenDuzeni
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
        // Başlangıç durumu burada yazılıyor: uygula() yalnızca O ANDA var olan
        // düğmeleri güncelliyor, ilk çağrıda henüz oluşturulmamış düğmeler
        // aria-pressed'siz kalıyordu.
        btn.setAttribute('aria-pressed', 'false');
        btn.style.background = hexMetni(renk);
        btn.setAttribute('aria-label', `${renk.isim}, ${renk.kod}`);
        btn.title = `${renk.isim} · ${renk.kod}`;
        btn.addEventListener('click', () => uygula(renk, btn));
        kap.appendChild(btn);
        if (i === secimler.length - 1) uygula(renk, btn);
    });

    // Sahne, bölüm ekrana YAKLAŞINCA kuruluyor. Ana sayfaya giren herkes
    // aşağı inmiyor; WebGL bağlamını ve .glb dosyasını sayfa açılışında
    // yüklemek ilk görüntülemeyi gereksiz yere ağırlaştırırdı.
    const baslat = async () => {
        if (sahneHazir || baslatiliyor) return;
        baslatiliyor = true;
        try {
            // Three.js ilk açılıştaki menü ve iletişim bağlantılarını bekletmez.
            goruntuleyici = await import('./viewer.js');
            goruntuleyici.sahneyiBaslat('ornek-kapak', { kameraMesafesi: 1500, yakinlastirma: false });
            sahneHazir = true;
            kapagiCiz();
            const ortam = varsayilanOrtami();
            if (ortam) {
                Promise.resolve(goruntuleyici.ortamiDegistir(ortam.dosya))
                    .catch((h) => console.warn('Studyo isigi yuklenemedi, procedural ortam suruyor:', h));
            }
        } catch (hata) {
            console.error('Ana sayfa 3B alanı başlatılamadı:', hata);
            if (yukleniyor) yukleniyor.textContent = 'Önizleme yüklenemedi — konfigüratörde görüntüleyebilirsiniz.';
        } finally {
            baslatiliyor = false;
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
    ornekKapagiKur();
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', baslat);
}
