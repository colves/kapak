// Ana sayfa etkileşimleri ve veriden üretilen bölümler.
//
// Model listesi, renk paleti ve kapak fotoğrafları SAYFAYA ELLE YAZILMIYOR;
// projenin kendi veri dosyalarından okunuyor (models.js, colors.js,
// galeri.js). Böylece konfigüratöre yeni bir model veya renk eklendiğinde
// ana sayfa kendiliğinden güncelleniyor, iki yerde ayrı liste tutulmuyor.
import { KAPAK_MODELLERI } from './data/models.js';
import { doluTonAileleri, tonAilesindekiRenkler } from './data/colors.js';
import { GALERI_FOTOGRAFLARI } from './data/galeri.js';
// Konfigüratör bağlantılarının sorgu dizesi elle kurulmuyor: 'm'/'r'
// anahtarlarını bilen tek yer paylasim.js olsun (paylaşım linkiyle aynı biçim).
import { durumuSorguyaKodla } from './paylasim.js';

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
function modelinFotografi(modelId) {
    return GALERI_FOTOGRAFLARI.find((f) => f && f.dosya && f.modelId === modelId) || null;
}

// Konfigüratör bağlantısı. renkKodu verilirse o renk de seçili açılır.
function konfiguratorAdresi(modelId, renkKodu) {
    const sorgu = durumuSorguyaKodla({
        modelId,
        renkId: renkKodu ? `lake-ral-${renkKodu}` : undefined
    });
    return `configurator.html${sorgu}`;
}

/* ---------------- Üst bar ---------------- */

function basligiKur() {
    const ust = document.getElementById('ust');
    if (!ust) return;

    // Hero'nun üzerindeyken saydam, aşağı inince opak. Eşik 40px: barın
    // kendi yüksekliğinden küçük, yani kullanıcı daha ilk hareketde geçişi
    // görüyor, sonradan ani bir sıçrama olmuyor.
    const durumuYaz = () => ust.classList.toggle('kaydirildi', window.scrollY > 40);
    window.addEventListener('scroll', durumuYaz, { passive: true });
    durumuYaz();

    const dugme = document.getElementById('menu-dugmesi');
    const menu = document.getElementById('menu');
    if (!dugme || !menu) return;

    const menuyuAyarla = (ac) => {
        menu.classList.toggle('acik', ac);
        dugme.setAttribute('aria-expanded', String(ac));
    };
    dugme.addEventListener('click', () => menuyuAyarla(!menu.classList.contains('acik')));
    // Bir bağlantıya basılınca menü kapansın — aksi hâlde hedef bölümün
    // üstünü kapatıp duruyor.
    menu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') menuyuAyarla(false);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') menuyuAyarla(false);
    });
}

/* ---------------- Modeller ---------------- */

function modelleriKur() {
    const kap = document.getElementById('model-izgara');
    if (!kap) return;

    KAPAK_MODELLERI.forEach((model) => {
        const foto = modelinFotografi(model.id);
        const a = document.createElement('a');
        a.className = 'model-kart';
        a.href = konfiguratorAdresi(model.id, foto ? foto.renkKodu : null);
        a.setAttribute('aria-label', `${model.kisaIsim || model.isim} — konfigüratörde aç`);

        // Fotoğrafı olmayan model boş bir kutu olarak kalmasın: kartın kendi
        // zemini (çelik mavi) görünür, metin yine okunur.
        if (foto) {
            const img = document.createElement('img');
            img.className = 'model-kart-gorsel';
            img.src = foto.dosya;
            img.alt = '';
            img.loading = 'lazy';
            img.decoding = 'async';
            a.appendChild(img);
        }

        const metin = document.createElement('div');
        metin.className = 'model-kart-metin';
        const h3 = document.createElement('h3');
        h3.textContent = model.kisaIsim || model.isim;
        const p = document.createElement('p');
        p.textContent = `${model.varsayilan.genislik} × ${model.varsayilan.yukseklik} mm · ${model.varsayilan.kalinlik} mm`;
        metin.append(h3, p);
        a.appendChild(metin);

        kap.appendChild(a);
    });
}

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
    const kapak = document.getElementById('ornek-kapak');
    const kap = document.getElementById('renk-secenekleri');
    if (!kapak || !kap) return;

    // Paletle uyumlu, birbirinden belirgin farklı üç gerçek RAL tonu.
    const secimler = ['5011', '9016', '7016']
        .map((kod) => {
            const aile = tonAilesindekiRenkler('tumu');
            return aile.find((r) => r.kod === `RAL ${kod}`);
        })
        .filter(Boolean);

    if (secimler.length === 0) return;

    const uygula = (renk, btn) => {
        kapak.style.setProperty('--kapak-renk', hexMetni(renk));
        kap.querySelectorAll('.renk-secenek').forEach((b) => {
            const aktif = b === btn;
            b.classList.toggle('aktif', aktif);
            b.setAttribute('aria-pressed', String(aktif));
        });
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
}

/* ---------------- İlham ---------------- */

function ilhamiKur() {
    const kap = document.getElementById('ilham-izgara');
    if (!kap) return;

    const fotograflar = GALERI_FOTOGRAFLARI.filter((f) => f && f.dosya);
    fotograflar.forEach((foto) => {
        const a = document.createElement('a');
        a.className = 'ilham-kart';
        a.href = konfiguratorAdresi(foto.modelId, foto.renkKodu);
        a.setAttribute('aria-label', `${foto.baslik || 'Kapak'} — konfigüratörde aç`);

        const img = document.createElement('img');
        img.src = foto.dosya;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';

        const etiket = document.createElement('div');
        etiket.className = 'ilham-etiket';
        // baslik "MODEL — Renk, RAL xxxx" biçiminde; ikiye ayırıp
        // model adını kalın, rengi altına küçük yazıyoruz.
        const [ad, detay] = (foto.baslik || '').split('—').map((p) => p.trim());
        const b = document.createElement('b');
        b.textContent = ad || 'Kapak';
        const s = document.createElement('span');
        s.textContent = detay || '';
        etiket.append(b, s);

        a.append(img, etiket);
        kap.appendChild(a);
    });
}

/* ---------------- Başlangıç ---------------- */

function baslat() {
    basligiKur();
    modelleriKur();
    tonlariKur();
    ornekKapagiKur();
    ilhamiKur();
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', baslat);
}
