import { idIleRenkBul, ralSerileri } from './data/colors.js';
import { KAPAK_MODELLERI, idIleModelBul } from './data/models.js';
import { ORTAM_SECENEKLERI, varsayilanOrtami, idIleOrtamBul } from './data/ortamlar.js';
import { YUZEYLER, varsayilanYuzey, idIleYuzeyBul } from './data/yuzeyler.js';
import { sahneyiBaslat, kapagiGuncelle, goruntuyuSifirla, ortamiDegistir, kareyiDikeyKaydir } from './viewer.js';
import {
    durumuSorguyaKodla, sorgudanDurumCoz, paylasimAdresiOlustur,
    paylasimMetniOlustur, paylasimDosyaAdiOlustur
} from './paylasim.js?v=20260907-2';

// Başlangıç ölçüleri sabit sayı olarak DEĞİL, modelin kendi varsayılanından
// türetiliyor — tek kaynak models.js'teki varsayilan alanı. Önceden burada
// bağımsız bir 480×717 sabiti vardı ve models.js'in 450×720 varsayılanıyla
// hiç eşleşmiyordu (model değiştirince de düzelmiyordu — bkz. aşağıdaki
// olculeriVarsayilanaSifirla).
const BASLANGIC_MODEL_ID = 'hk-012-001';
const baslangicModel = idIleModelBul(BASLANGIC_MODEL_ID);
const OLCU_AYARI_AKTIF = false;

const durum = {
    modelId: BASLANGIC_MODEL_ID,
    genislik: baslangicModel.varsayilan.genislik,
    yukseklik: baslangicModel.varsayilan.yukseklik,
    kalinlik: baslangicModel.varsayilan.kalinlik,
    renkId: 'lake-ral-7044',
    // Yüzey bitişi renkten AYRI bir karar: aynı ton mat ve parlakta bambaşka
    // görünüyor.
    yuzeyId: varsayilanYuzey().id,
    // Corona'daki ince Noise bump dokusu karşılaştırma amacıyla isteğe bağlı.
    // Varsayılan kapalı: mevcut görünüm aynen korunur.
    dokuAktif: false,
    dokuYogunlugu: 35,
    ortamId: null,
    // Sahne zemini de paylaşılan durumun parçası: seçim yenilemede kaybolmasın
    // ve gönderilen link kapağı aynı zeminde açsın.
    zemin: '1'
};

let guncellemeBekliyor = false;

/* ---------------- Sahneyi durumla eşitle ---------------- */

function guncellemeyiUygula() {
    const model = idIleModelBul(durum.modelId);
    const renk = idIleRenkBul(durum.renkId);
    // Model dosyası yüklenemezse sahne boş kalır; kullanıcı nedenini
    // bilmediği bir boşluğa bakmasın diye durum kendisine bildiriliyor.
    const yuzey = idIleYuzeyBul(durum.yuzeyId) || varsayilanYuzey();
    Promise.resolve(kapagiGuncelle(durum.genislik, durum.yukseklik, renk, model.gltfUrl, model.glbIcerikDonusu, model.kenarPayi, yuzey, durum.kalinlik, model.glbEksenDuzeni, durum.dokuAktif, durum.dokuYogunlugu))
        .catch((hata) => {
            console.error('Model yüklenemedi:', model.gltfUrl, hata);
            bildir('Model yüklenemedi — bağlantınızı kontrol edip sayfayı yenileyin');
        });

    const olcuEl = document.getElementById('boyut-metni');
    if (olcuEl) olcuEl.textContent = `${durum.genislik} × ${durum.yukseklik} mm`;

    const modelEl = document.getElementById('secim-model');
    if (modelEl) modelEl.textContent = model.isim;

    const renkMetinEl = document.getElementById('secim-renk-metin');
    if (renkMetinEl) renkMetinEl.textContent = `${renk.isim} · ${renk.kod}`;

    const renkNoktaEl = document.getElementById('secim-renk-nokta');
    if (renkNoktaEl) renkNoktaEl.style.background = hexMetni(renk);

    // Ayar panelinin kendi özetleri — durum çubuğuyla AYNI kaynaktan, tek
    // yerden güncelleniyor, her durum değişikliğinde otomatik senkron kalır.
    ayarOzetiniGuncelle(renk, model);

    urliDurumaEsitle();
}

// Slider sürüklemesi gibi hızlı ardışık olayları tek bir kareye toplar.
function goruntuGuncellemesiPlanla() {
    if (guncellemeBekliyor) return;
    guncellemeBekliyor = true;
    let calisti = false;
    const calistir = () => {
        if (calisti) return;
        calisti = true;
        guncellemeBekliyor = false;
        guncellemeyiUygula();
    };
    requestAnimationFrame(calistir);
    // requestAnimationFrame sekme arka plandayken hiç tetiklenmeyebilir — bu
    // durumda guncellemeBekliyor sonsuza dek true kalıp TÜM değişiklikleri
    // kilitler. Güvenlik amaçlı yedek zamanlayıcı.
    setTimeout(calistir, 200);
}

function hexMetni(renk) {
    return `#${renk.hex.toString(16).padStart(6, '0')}`;
}

/* ---------------- Sahne zemini ----------------
   Kapağın arkasındaki yüzey. Eskiden bu yalnızca adres satırında ?zemin=N
   varken beliren GEÇİCİ bir karar aracıydı; artık sahne araç çubuğundaki
   kendi tuşundan açılan kalıcı bir ayar.

   NOT: bu bir RENK konfigüratörü. Zemin, üstündeki rengin ALGISINI değiştirir
   (eşzamanlı kontrast) — bu yüzden liste nötrden doyguna doğru sıralı ve 2
   numara bilinçli olarak nötr orta gri: fotoğraf ve boya sektöründe rengi
   yargılamak için kullanılan referans zemin budur. */

const ZEMIN_SECENEKLERI = [
    { no: '1', ad: 'Açık radyal', aciklama: 'Varsayılan — nötr, aydınlık', ornek: 'radial-gradient(circle at 40% 35%, #FFFFFF, #E9E8E4)' },
    { no: '2', ad: 'Nötr gri', aciklama: 'Renk karşılaştırması için dengeli fon', ornek: 'linear-gradient(145deg, #E4E2DE, #CFCFCA)' },
    { no: '3', ad: 'Beton stüdyo', aciklama: 'Mimari, sıcak gri görünüm', ornek: 'linear-gradient(145deg, #D7D0C6, #B7AEA3)' },
    { no: '4', ad: 'Koyu vitrin', aciklama: 'Koyu kapaklarda güçlü kontrast', ornek: 'radial-gradient(circle at 42% 34%, #66625C, #252321)' },
    { no: '5', ad: 'Meşe yüzey', aciklama: 'Mobilya sunumu için sıcak doku', ornek: 'repeating-linear-gradient(96deg, #D5B789 0 2px, #C9A978 2px 6px, #DFC69B 6px 10px)' },
    { no: '6', ad: 'Teknik ızgara', aciklama: 'Ölçü hissi veren milimetrik zemin', ornek: 'repeating-linear-gradient(0deg, #C3BFB6 0 1px, #F5F4F1 1px 8px)' },
    { no: '7', ad: 'Mavi sis', aciklama: 'Serin ve sakin ürün fonu', ornek: 'radial-gradient(circle at 40% 35%, #F4F7F7, #B8C5C6)' }
];

const VARSAYILAN_ZEMIN = '1';

function zeminiUygula(no) {
    document.body.dataset.zemin = no;
    const secenek = ZEMIN_SECENEKLERI.find((z) => z.no === no);

    document.querySelectorAll('.zemin-dugme').forEach((b) => {
        const aktif = b.dataset.zemin === no;
        b.classList.toggle('aktif', aktif);
        b.setAttribute('aria-pressed', String(aktif));
    });

    const ad = document.getElementById('zemin-secici-ad');
    if (ad && secenek) ad.textContent = secenek.ad;

    // Adres satırı seçimi taşısın. Adres BAŞKA bir yerden değil, tek elden
    // (urliDurumaEsitle) yazılıyor — iki ayrı yazıcı olduğunda biri diğerinin
    // parametresini siliyordu.
    durum.zemin = no;
    urliDurumaEsitle();
}

/* ---------------- URL ile paylaşım ----------------
   Konfigürasyon adres çubuğunda yaşar: müşteri linki kopyalayıp satıcıya
   gönderebilir, sayfayı yenilese de seçimi kaybolmaz. */

// Paylaşılacak/adrese yazılacak durum. Varsayılan zemin dışarıda bırakılıyor:
// link gereksiz yere kirlenmesin. TEK kaynak — adres çubuğu, "Linki Kopyala"
// ve genel paylaşım paketi aynı adresi üretsin diye hepsi buradan geçiyor.
function paylasilacakDurum() {
    return { ...durum, zemin: durum.zemin === VARSAYILAN_ZEMIN ? undefined : durum.zemin };
}

function urliDurumaEsitle() {
    // Bir zamanlar zemin durumun parçası DEĞİLDİ ve bu fonksiyon adres
    // çubuğunu her güncellemede baştan yazdığı için ?zemin=N'i siliyordu —
    // ölçüldü: ?zemin=6 ile açılan sayfa daha ilk karede parametreyi
    // kaybediyordu, dolayısıyla ne yenileme ne de paylaşım zemin seçimini
    // taşıyordu.
    const sorgu = durumuSorguyaKodla(paylasilacakDurum());
    // replaceState: her slider hareketinde tarayıcı geçmişine yeni kayıt
    // eklenmesin, geri tuşu konfigüratörde tıkanmasın.
    window.history.replaceState(null, '', `${window.location.pathname}${sorgu}`);
}

function urldenDurumuYukle() {
    const cozulen = sorgudanDurumCoz(window.location.search, {
        modelGecerliMi: (id) => Boolean(idIleModelBul(id)),
        renkGecerliMi: (id) => Boolean(idIleRenkBul(id)),
        ortamGecerliMi: (id) => Boolean(idIleOrtamBul(id)),
        zeminGecerliMi: (no) => ZEMIN_SECENEKLERI.some((z) => z.no === no),
        yuzeyGecerliMi: (id) => Boolean(idIleYuzeyBul(id))
    });
    Object.assign(durum, cozulen);
    if (!OLCU_AYARI_AKTIF) {
        const model = idIleModelBul(durum.modelId) || baslangicModel;
        durum.genislik = model.varsayilan.genislik;
        durum.yukseklik = model.varsayilan.yukseklik;
        durum.kalinlik = model.varsayilan.kalinlik;
    }
}

function bildir(mesaj) {
    const el = document.getElementById('bildirim');
    if (!el) return;
    el.textContent = mesaj;
    el.classList.add('gorunur');
    clearTimeout(bildir._zamanlayici);
    bildir._zamanlayici = setTimeout(() => el.classList.remove('gorunur'), 2600);
}

function paylasButonunuKur() {
    const btn = document.getElementById('btn-paylas');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const adres = paylasimAdresiOlustur(
            `${window.location.origin}${window.location.pathname}`, paylasilacakDurum());
        try {
            await navigator.clipboard.writeText(adres);
            bildir('Konfigürasyon linki kopyalandı');
        } catch {
            // Pano izni yoksa/güvenli bağlam değilse: link zaten adres
            // çubuğunda duruyor, kullanıcıyı oraya yönlendir.
            bildir('Link adres çubuğunda — kopyalamak için oradan seçin');
        }
    });
}

/* ---------------- Model seçici (sahnenin üstünde, ayrı bölge) ----------------
   Yatay bir şerit YOK: modeller çoğaldıkça (kullanıcı talebi: "ilerde 10larca
   kapak eklenince orası çok gereksiz dolar") sabit boyutlu tek bir buton +
   aranabilir galeri modalı kullanılıyor. Buton her zaman aynı yeri kaplar,
   model sayısı 3 de olsa 300 de olsa. */

let modelGalerisiTetikleyicisi = null;

function modelSeciciMetniniGuncelle() {
    const model = idIleModelBul(durum.modelId);
    const el = document.getElementById('model-secici-ad');
    if (el) el.textContent = model.kisaIsim || model.isim;
    const sayi = document.getElementById('model-sayisi');
    if (sayi) sayi.textContent = `${KAPAK_MODELLERI.length} model`;
}

function modeliSec(model) {
    if (durum.modelId === model.id) {
        modelCekmecesiniKapat();
        return;
    }
    durum.modelId = model.id;
    const secilen = idIleModelBul(model.id);
    olculeriVarsayilanaSifirla(secilen);
    kalinlikAlanininGorunurlugunuGuncelle(secilen);
    olculeriModelLimitlerineSabitle(secilen);
    modelSeciciMetniniGuncelle();
    modelPaneliniCiz();
    modelCekmecesiniKapat();
    // Her model, önceki modelin kullanıcı tarafından çevrilmiş kamerasını
    // devralmasın; seçildiğinde doğrudan ön görünüm gelsin.
    goruntuyuSifirla();
    dikeyKaydirmayiPlanla();
    goruntuGuncellemesiPlanla();
}

function masaustuModelCekmecesiMi() {
    return window.matchMedia('(min-width: 761px)').matches;
}

function modelCekmecesiniAc() {
    const panel = document.getElementById('model-paneli');
    const tetikleyici = document.getElementById('model-secici');
    if (!panel || !tetikleyici) return;
    panel.classList.add('acik');
    panel.setAttribute('aria-hidden', 'false');
    tetikleyici.setAttribute('aria-expanded', 'true');
}

function modelCekmecesiniKapat() {
    const panel = document.getElementById('model-paneli');
    const tetikleyici = document.getElementById('model-secici');
    if (!panel || !tetikleyici) return;
    panel.classList.remove('acik');
    panel.setAttribute('aria-hidden', 'true');
    tetikleyici.setAttribute('aria-expanded', 'false');
}

function modelGaleriKartiOlustur(model) {
    const kart = document.createElement('button');
    kart.type = 'button';
    const secili = model.id === durum.modelId;
    kart.className = 'model-galeri-kart' + (secili ? ' aktif' : '');
    kart.setAttribute('aria-pressed', String(secili));
    kart.dataset.modelId = model.id;

    const gorselHtml = model.gorselUrl
        ? `<span class="model-galeri-kart-gorsel-cerceve">
               <img src="${model.gorselUrl}" alt="${model.isim}" width="1000" height="1400" loading="lazy" decoding="async" class="model-galeri-kart-gorsel">
           </span>`
        : `<div class="model-galeri-kart-yer-tutucu" aria-hidden="true">
               <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                   <rect x="4" y="2" width="16" height="20" rx="1.5"></rect>
                   <rect x="7" y="5" width="10" height="14" rx="0.8"></rect>
               </svg>
           </div>`;

    kart.innerHTML = `${gorselHtml}<span class="model-galeri-kart-ad">${model.isim}</span>`;
    const gorsel = kart.querySelector('img');
    gorsel?.addEventListener('error', () => {
        gorsel.closest('.model-galeri-kart-gorsel-cerceve')?.classList.add('gorsel-yok');
        gorsel.remove();
    });
    kart.addEventListener('click', () => {
        modeliSec(model);
        modelGalerisiniKapat();
    });
    return kart;
}

function modelPaneliKartiOlustur(model) {
    const kart = document.createElement('button');
    const secili = model.id === durum.modelId;
    kart.type = 'button';
    kart.className = 'model-panel-kart' + (secili ? ' aktif' : '');
    kart.setAttribute('aria-pressed', String(secili));
    const gorselIcerigi = model.gorselUrl
        ? `<img src="${model.gorselUrl}" alt="${model.isim}" loading="lazy" decoding="async">`
        : `<span class="model-panel-kart-yer-tutucu" aria-hidden="true"></span>`;
    kart.innerHTML = `
        <span class="model-panel-kart-gorsel">
            ${gorselIcerigi}
        </span>
        <span class="model-panel-kart-ad">${model.kisaIsim || model.isim}</span>`;
    const gorsel = kart.querySelector('img');
    gorsel?.addEventListener('error', () => gorsel.remove());
    kart.addEventListener('click', () => modeliSec(model));
    return kart;
}

function modelPaneliniCiz() {
    const izgara = document.getElementById('model-panel-izgara');
    if (!izgara) return;
    izgara.replaceChildren(...KAPAK_MODELLERI.map(modelPaneliKartiOlustur));
}

function modelGalerisiniCiz(arama) {
    const izgara = document.getElementById('model-galeri-izgara');
    izgara.innerHTML = '';
    const s = (arama || '').trim().toLocaleLowerCase('tr');
    const sonuclar = s
        ? KAPAK_MODELLERI.filter(m =>
            m.isim.toLocaleLowerCase('tr').includes(s)
            || (m.kisaIsim || '').toLocaleLowerCase('tr').includes(s)
            || (m.uretimKodu || '').toLocaleLowerCase('tr').includes(s))
        : KAPAK_MODELLERI;

    if (sonuclar.length === 0) {
        const bos = document.createElement('p');
        bos.className = 'model-galeri-bos';
        bos.textContent = `"${arama}" ile eşleşen model yok.`;
        izgara.appendChild(bos);
        return;
    }
    sonuclar.forEach(model => izgara.appendChild(modelGaleriKartiOlustur(model)));
}

function modelGalerisiniAc(tetikleyici) {
    modelGalerisiTetikleyicisi = tetikleyici || document.activeElement;
    document.getElementById('model-galerisi').classList.remove('gizli');
    modelGalerisiniCiz('');
    const arama = document.getElementById('model-galeri-arama');
    arama.value = '';
    arama.focus();
}

function modelGalerisiniKapat() {
    document.getElementById('model-galerisi').classList.add('gizli');
    modelGalerisiTetikleyicisi?.focus();
}

function modelSeciciyiKur() {
    modelSeciciMetniniGuncelle();
    modelPaneliniCiz();
    const tetikleyici = document.getElementById('model-secici');
    tetikleyici?.addEventListener('click', () => {
        if (masaustuModelCekmecesiMi()) modelCekmecesiniAc();
        else modelGalerisiniAc(tetikleyici);
    });
    document.getElementById('model-panel-kapat')?.addEventListener('click', () => {
        modelCekmecesiniKapat();
        tetikleyici?.focus();
    });
    document.getElementById('model-galeri-kapat').addEventListener('click', modelGalerisiniKapat);
    document.getElementById('model-galeri-arama').addEventListener('input', (e) => modelGalerisiniCiz(e.target.value));
    const katman = document.getElementById('model-galerisi');
    katman.addEventListener('click', (e) => { if (e.target === katman) modelGalerisiniKapat(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !katman.classList.contains('gizli')) modelGalerisiniKapat();
        if (e.key === 'Escape') modelCekmecesiniKapat();
    });
}

/* ---------------- Renk ızgarası ----------------
   Ton ailesi süzgeci (Griler / Maviler / …) KALDIRILDI. RAL Classic
   numaralandırması zaten renk ailesine göre kümelenmiş (1xxx sarılar, 3xxx
   kırmızılar, 5xxx maviler, 6xxx yeşiller, 7xxx griler, 8xxx kahveler, 9xxx
   beyaz/siyah), yani doğrudan koda göre sıralı tek bir liste ayrıca
   gruplamaya gerek kalmadan gruplu okunuyor — ve kartelasından kod bilen
   müşteri aradığını süzgeçle uğraşmadan buluyor. */

function renkButonuOlustur(renk) {
    const btn = document.createElement('button');
    btn.type = 'button';
    const secili = renk.id === durum.renkId;
    btn.className = 'renk-btn' + (secili ? ' aktif' : '');
    btn.setAttribute('aria-label', `${renk.isim}, ${renk.kod}`);
    btn.setAttribute('aria-pressed', String(secili));
    btn.setAttribute('title', `${renk.isim} · ${renk.kod}`);
    btn.dataset.renkId = renk.id;
    btn.innerHTML = `
        <span class="renk-yuzey" style="background:${hexMetni(renk)}">
            <span class="renk-onay" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </span>
        </span>
        <span class="renk-kod">${renk.kod}</span>
    `;
    btn.addEventListener('click', () => renkSecildi(renk));
    return btn;
}

function renkSecildi(renk) {
    durum.renkId = renk.id;
    document.querySelectorAll('.renk-btn').forEach(b => {
        const aktif = b.dataset.renkId === renk.id;
        b.classList.toggle('aktif', aktif);
        b.setAttribute('aria-pressed', String(aktif));
    });
    goruntuGuncellemesiPlanla();
}

function renkSeriBolumuOlustur(grup, acikMi) {
    const bolum = document.createElement('section');
    bolum.className = 'renk-seri' + (acikMi ? ' acik' : '');

    const basSatiri = document.createElement('button');
    basSatiri.type = 'button';
    basSatiri.className = 'renk-seri-bas';
    basSatiri.setAttribute('aria-expanded', String(acikMi));
    basSatiri.innerHTML = `
        <span class="renk-seri-kod">RAL ${grup.seri}</span>
        <span class="renk-seri-ad">${grup.etiket}</span>
        <span class="renk-seri-sayi">${grup.renkler.length}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
    `;

    const izgara = document.createElement('div');
    izgara.className = 'renk-izgara';
    izgara.setAttribute('role', 'group');
    izgara.setAttribute('aria-label', `RAL ${grup.seri} — ${grup.etiket}`);
    grup.renkler.forEach((renk, i) => {
        const btn = renkButonuOlustur(renk);
        // Kartlar kademeli belirsin diye (bkz. base.css .renk-btn animasyonu).
        btn.style.setProperty('--i', i);
        izgara.appendChild(btn);
    });

    basSatiri.addEventListener('click', () => {
        const acik = bolum.classList.toggle('acik');
        basSatiri.setAttribute('aria-expanded', String(acik));
    });

    bolum.append(basSatiri, izgara);
    return bolum;
}

function renkListesiniCiz() {
    const kap = document.getElementById('renk-listesi');
    if (!kap) return;
    kap.innerHTML = '';

    const seriler = ralSerileri();
    let toplam = 0;
    seriler.forEach((grup) => {
        toplam += grup.renkler.length;
        // Yalnızca SEÇİLİ rengin serisi açık gelir: müşteri hangi tonda
        // olduğunu görür ama panel 77 kutu boyunca uzamaz, ölçü bölümü de
        // hemen üstte kalır.
        const acik = grup.renkler.some((r) => r.id === durum.renkId);
        kap.appendChild(renkSeriBolumuOlustur(grup, acik));
    });

    const sayiEl = document.getElementById('renk-sayisi');
    if (sayiEl) sayiEl.textContent = `${toplam} RAL tonu, ${seriler.length} seri`;
}

/* ---------------- Yüzey (parlaklık) ----------------
   Aynı RAL tonu mat bir yüzeyde düz ve açık, parlak bir yüzeyde derin ve koyu
   okunuyor; ikisi arasındaki fark renk seçiminden bağımsız bir karar. Üç
   seçenek de tek bakışta görünüyor — müşteri bunu bir kez seçip geçiyor. */

function yuzeySecildi(yuzey) {
    if (durum.yuzeyId === yuzey.id) return;
    durum.yuzeyId = yuzey.id;
    document.querySelectorAll('.yuzey-btn').forEach((b) => {
        const aktif = b.dataset.yuzeyId === yuzey.id;
        b.classList.toggle('aktif', aktif);
        b.setAttribute('aria-pressed', String(aktif));
    });
    const ad = document.getElementById('yuzey-secili-ad');
    if (ad) ad.textContent = yuzey.isim;
    goruntuGuncellemesiPlanla();
}

function yuzeySeciciyiKur() {
    const kap = document.getElementById('yuzey-secenekleri');
    if (!kap) return;
    kap.innerHTML = '';
    YUZEYLER.forEach((yuzey) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const aktif = yuzey.id === durum.yuzeyId;
        btn.className = 'yuzey-btn' + (aktif ? ' aktif' : '');
        btn.dataset.yuzeyId = yuzey.id;
        btn.setAttribute('aria-pressed', String(aktif));
        btn.title = yuzey.aciklama;
        btn.innerHTML = `
            <span class="yuzey-btn-ad">${yuzey.isim}</span>
            <span class="yuzey-btn-aciklama">${yuzey.aciklama}</span>
        `;
        btn.addEventListener('click', () => yuzeySecildi(yuzey));
        kap.appendChild(btn);
    });
    const ad = document.getElementById('yuzey-secili-ad');
    const secili = idIleYuzeyBul(durum.yuzeyId) || varsayilanYuzey();
    if (ad) ad.textContent = secili.isim;
}

/* ---------------- Ölçü kontrolleri ---------------- */

function kalinlikAlanininGorunurlugunuGuncelle(model) {
    const alan = document.getElementById('kalinlik-alani');
    if (alan) alan.style.display = model.kalinlikAyarlanabilir ? '' : 'none';
}

// Kaydırıcının dolu kısmını marka renginde göstermek için yüzdeyi CSS'e taşır.
function kaydiriciDolgusunuGuncelle(slider) {
    const min = Number(slider.min), max = Number(slider.max), deger = Number(slider.value);
    const oran = max > min ? ((deger - min) / (max - min)) * 100 : 0;
    slider.style.setProperty('--dolgu', `${oran}%`);
}

function aralikEtiketiniGuncelle(id, slider) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<span>${slider.min}</span><span>${slider.max}</span>`;
}

// Model değiştirilirken (galeriden yeni bir kapak seçilirken) çağrılır:
// önceki modeldeki ölçüyü yeni modelin sınırına KIRPMAK yerine, yeni modelin
// KENDİ varsayılanına döner — "her kapağı açtığında otomatik 450×720 default
// olsun" isteği. Sayfa ilk açılışında (URL'den paylaşılan bir ölçü gelmiş
// olabilir) bu ÇAĞRILMAZ; durum zaten yukarıda ilk modelin varsayılanıyla
// kuruluyor ve urldenDurumuYukle onu gerekirse ezer.
function olculeriVarsayilanaSifirla(model) {
    durum.genislik = model.varsayilan.genislik;
    durum.yukseklik = model.varsayilan.yukseklik;
    durum.kalinlik = model.varsayilan.kalinlik;
}

function olculeriModelLimitlerineSabitle(model) {
    const g = document.getElementById('slider-genislik');
    const y = document.getElementById('slider-yukseklik');
    g.min = model.limitler.genislik.min; g.max = model.limitler.genislik.max;
    y.min = model.limitler.yukseklik.min; y.max = model.limitler.yukseklik.max;
    durum.genislik = Math.min(Math.max(durum.genislik, model.limitler.genislik.min), model.limitler.genislik.max);
    durum.yukseklik = Math.min(Math.max(durum.yukseklik, model.limitler.yukseklik.min), model.limitler.yukseklik.max);
    g.value = durum.genislik; y.value = durum.yukseklik;
    document.getElementById('girdi-genislik').value = durum.genislik;
    document.getElementById('girdi-yukseklik').value = durum.yukseklik;
    kaydiriciDolgusunuGuncelle(g);
    kaydiriciDolgusunuGuncelle(y);
    aralikEtiketiniGuncelle('genislik-aralik', g);
    aralikEtiketiniGuncelle('yukseklik-aralik', y);

    if (model.kalinlikAyarlanabilir && model.limitler.kalinlik) {
        const k = document.getElementById('slider-kalinlik');
        k.min = model.limitler.kalinlik.min; k.max = model.limitler.kalinlik.max;
        durum.kalinlik = Math.min(Math.max(durum.kalinlik, model.limitler.kalinlik.min), model.limitler.kalinlik.max);
        k.value = durum.kalinlik;
        document.getElementById('girdi-kalinlik').value = durum.kalinlik;
        kaydiriciDolgusunuGuncelle(k);
    } else {
        // Kalınlık bu modelde ayarlanamıyor. Durum yine de modelin kendi
        // değerine ÇEKİLMELİ: aksi hâlde adresten gelen uydurma bir kalınlık
        // (ör. ?k=999) hiçbir yerde kırpılmadan durumda kalıyor ve
        // urliDurumaEsitle onu adrese geri yazıyordu — ekranda 18 mm, 3B'de
        // 18 mm görünürken PAYLAŞILAN LİNK 999 mm diyordu (ölçüldü).
        // Müşterinin satıcıya gönderdiği link yanlış ölçü taşıyamaz.
        durum.kalinlik = model.varsayilan.kalinlik;
        const girdi = document.getElementById('girdi-kalinlik');
        if (girdi) girdi.value = durum.kalinlik;
    }
}

function olcuKontrolleriniKur() {
    const eslesmeler = [
        ['slider-genislik', 'girdi-genislik', 'genislik'],
        ['slider-yukseklik', 'girdi-yukseklik', 'yukseklik'],
        ['slider-kalinlik', 'girdi-kalinlik', 'kalinlik']
    ];
    eslesmeler.forEach(([sliderId, girdiId, alan]) => {
        const slider = document.getElementById(sliderId);
        const girdi = document.getElementById(girdiId);
        if (!OLCU_AYARI_AKTIF) {
            slider.disabled = true;
            girdi.disabled = true;
            slider.setAttribute('aria-disabled', 'true');
            girdi.setAttribute('aria-disabled', 'true');
            kaydiriciDolgusunuGuncelle(slider);
            return;
        }
        slider.addEventListener('input', () => {
            durum[alan] = Number(slider.value);
            girdi.value = slider.value;
            kaydiriciDolgusunuGuncelle(slider);
            goruntuGuncellemesiPlanla();
        });
        girdi.addEventListener('change', () => {
            let deger = Number(girdi.value);
            const min = Number(slider.min), max = Number(slider.max);
            if (!Number.isFinite(deger)) deger = durum[alan];
            deger = Math.min(Math.max(deger, min), max);
            girdi.value = deger;
            slider.value = deger;
            durum[alan] = deger;
            kaydiriciDolgusunuGuncelle(slider);
            goruntuGuncellemesiPlanla();
        });
        kaydiriciDolgusunuGuncelle(slider);
    });
}

function lakeDokuSeciciyiKur() {
    const yogunluk = document.getElementById('doku-yogunluk');
    const yogunlukDegeri = document.getElementById('doku-yogunluk-deger');
    const yogunlukKontrolu = document.getElementById('lake-doku-yogunluk-kontrolu');
    const yogunluguGuncelle = () => {
        if (yogunluk) {
            yogunluk.value = String(durum.dokuYogunlugu);
            yogunluk.disabled = !durum.dokuAktif;
        }
        if (yogunlukDegeri) yogunlukDegeri.textContent = `${durum.dokuYogunlugu}%`;
        if (yogunlukKontrolu) yogunlukKontrolu.classList.toggle('pasif', !durum.dokuAktif);
    };

    document.querySelectorAll('.lake-doku-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const aktif = btn.dataset.doku === 'dokulu';
            if (durum.dokuAktif === aktif) return;
            durum.dokuAktif = aktif;
            document.querySelectorAll('.lake-doku-btn').forEach((secenek) => {
                const secili = secenek.dataset.doku === (aktif ? 'dokulu' : 'duz');
                secenek.classList.toggle('aktif', secili);
                secenek.setAttribute('aria-pressed', String(secili));
            });
            yogunluguGuncelle();
            goruntuGuncellemesiPlanla();
        });
    });
    if (yogunluk) {
        yogunluk.addEventListener('input', () => {
            durum.dokuYogunlugu = Number(yogunluk.value);
            if (yogunlukDegeri) yogunlukDegeri.textContent = `${durum.dokuYogunlugu}%`;
            goruntuGuncellemesiPlanla();
        });
    }
    yogunluguGuncelle();
}

function olculeriSifirlamaButonunuKur() {
    const btn = document.getElementById('btn-olculeri-sifirla');
    if (!btn) return;
    if (!OLCU_AYARI_AKTIF) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
        return;
    }
    btn.addEventListener('click', () => {
        const model = idIleModelBul(durum.modelId);
        olculeriVarsayilanaSifirla(model);
        olculeriModelLimitlerineSabitle(model);
        goruntuGuncellemesiPlanla();
        bildir(`Ölçüler ${durum.genislik} × ${durum.yukseklik} mm olarak sıfırlandı`);
    });
}

/* ---------------- Ayar paneli (sağ, kalıcı) ----------------
   Renk ve ölçü eskiden sahne araç çubuğundaki iki ayrı açılır panelde
   duruyordu. İkisi de karşılaştırarak verilen kararlar — kapak değişirken
   listenin ekranda kalması gerekiyor — bu yüzden sahnenin yanında sürekli
   açık bir panele taşındılar. Mobilde sağda yer yok: panel aşağıya iniyor ve
   bu tutamaktan açılıp kapanıyor, kapalıyken bile seçili renk/ölçü okunuyor. */

function ayarPaneliniKur() {
    const panel = document.getElementById('ayar-paneli');
    const tutamak = document.getElementById('ayar-tutamak');
    if (!panel || !tutamak) return;

    tutamak.addEventListener('click', () => {
        const acik = panel.classList.toggle('acik');
        tutamak.setAttribute('aria-expanded', String(acik));
    });
}

// Tutamaktaki özet, panel kapalıyken tek bilgi kaynağı olduğu için her
// güncellemede yeniden yazılıyor.
function ayarOzetiniGuncelle(renk, model) {
    const metin = document.getElementById('ayar-tutamak-metin');
    if (metin) metin.textContent = `${renk.kod} · ${durum.genislik}×${durum.yukseklik} mm`;
    const nokta = document.getElementById('ayar-tutamak-nokta');
    if (nokta) nokta.style.background = hexMetni(renk);
    const secili = document.getElementById('renk-secili-ad');
    if (secili) secili.textContent = renk.kod;
}

/* ---------------- Işık (stüdyo HDR) ----------------
   Sahne araç çubuğundaki kendi tuşundan açılan bir panel. Eskiden ayar rayının
   EN ALTINDAYDI ve 77 rengin + 3 kaydırıcının arkasında kaldığı için pratikte
   bulunamıyordu (ölçüldü: panelin görünür alanı 1000px'te biterken Işık
   940px'te başlıyordu). Modal değil açılır panel: sahne görünür kalmalı ki
   10 ortam canlı karşılaştırılabilsin. Seçim URL'e de yazılır (paylasim.js
   'o' parametresi). */

function isikSeciciMetniniGuncelle() {
    const ortam = idIleOrtamBul(durum.ortamId);
    const el = document.getElementById('isik-secici-ad');
    if (el && ortam) el.textContent = ortam.isim;
}

function isikSatiriDurumunuGuncelle(satir, durumMetni) {
    const el = satir.querySelector('.isik-durum');
    if (!el) return;
    if (durumMetni === 'yukleniyor') {
        el.innerHTML = '<span class="isik-donen" aria-hidden="true"></span>';
    } else if (durumMetni === 'aktif') {
        el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
    } else {
        el.innerHTML = '';
    }
}

function isikSecildi(ortam, satir) {
    if (durum.ortamId === ortam.id) return;
    isikSatiriDurumunuGuncelle(satir, 'yukleniyor');
    ortamiDegistir(ortam.dosya).catch((hata) => {
        // HDR dosyası (1,6 MB) zayıf bağlantıda kopabilir.
        // Sahne yine de görünür kalır (açılıştaki procedural ışık devrede),
        // bu yüzden hata ölümcül değil — ama sessiz de kalmamalı.
        console.error('Stüdyo ışığı yüklenemedi:', ortam.dosya, hata);
        bildir('Stüdyo ışığı yüklenemedi — mevcut ışık korunuyor');
        isikSatiriDurumunuGuncelle(satir, '');
        return null;
    }).then((sonuc) => {
        if (sonuc === null) return;
        durum.ortamId = ortam.id;
        document.querySelectorAll('.isik-satir').forEach(s => {
            const aktif = s === satir;
            s.classList.toggle('aktif', aktif);
            s.setAttribute('aria-pressed', String(aktif));
            isikSatiriDurumunuGuncelle(s, aktif ? 'aktif' : '');
        });
        isikSeciciMetniniGuncelle();
        urliDurumaEsitle();
    });
}

function isikSatiriOlustur(ortam) {
    const satir = document.createElement('button');
    satir.type = 'button';
    const aktif = ortam.id === durum.ortamId;
    satir.className = 'isik-satir' + (aktif ? ' aktif' : '');
    satir.setAttribute('aria-pressed', String(aktif));
    satir.dataset.ortamId = ortam.id;
    satir.innerHTML = `
        <span class="isik-metin">
            <span class="isik-ad">${ortam.isim}</span>
            <span class="isik-aciklama">${ortam.aciklama}</span>
        </span>
        <span class="isik-durum"></span>
    `;
    isikSatiriDurumunuGuncelle(satir, aktif ? 'aktif' : '');
    satir.addEventListener('click', () => isikSecildi(ortam, satir));
    return satir;
}

// Renk/Boyut/Işık artık üç BAĞIMSIZ tuş+panel — ama aynı anda ikisi açık
// kalırsa (biri açıkken diğerine tıklanınca) sahne dağınık görünür. Biri
// açılırken ötekiler kendiliğinden kapansın diye ortak bir liste üzerinden
// birbirlerini kapatıyorlar. Tuşun kendi tıklaması stopPropagation ile
// document'e ULAŞMADIĞI için "dışına tıklayınca kapan" mekanizması burada
// işe yaramaz — açılış anında AÇIKÇA çağrılması gerekiyor.
function digerSeciciPanelleriniKapat(haricBtnId) {
    // Renk ve boyut artık kalıcı panelde; burada yalnızca sahne araç
    // çubuğundaki açılır paneller var — ikisi aynı anda açık kalmasın.
    [['btn-isik', 'isik-panel'], ['btn-zemin', 'zemin-panel']].forEach(([bId, pId]) => {
        if (bId === haricBtnId) return;
        const b = document.getElementById(bId), p = document.getElementById(pId);
        if (!b || !p || p.classList.contains('gizli')) return;
        p.classList.add('gizli');
        b.classList.remove('acik');
        b.setAttribute('aria-expanded', 'false');
    });
}

function isikPaneliniAcKapa(ac) {
    const panel = document.getElementById('isik-panel');
    const btn = document.getElementById('btn-isik');
    if (!panel || !btn) return;
    const acilacak = ac === undefined ? panel.classList.contains('gizli') : ac;
    if (acilacak) digerSeciciPanelleriniKapat('btn-isik');
    panel.classList.toggle('gizli', !acilacak);
    btn.classList.toggle('acik', acilacak);
    btn.setAttribute('aria-expanded', String(acilacak));
}

// Sahne yalnızca bir kez açılır: ya HDR yerleştiğinde ya da zaman aşımında.
// Zaman aşımı şart — yavaş bir bağlantıda ya da HDR hiç gelmezse müşteri boş
// bir kutuya bakmasın; o durumda procedural ışıkla açılıyor.
let sahneAcildi = false;
function sahneyiAcigaCikar() {
    if (sahneAcildi) return;
    sahneAcildi = true;
    document.body.classList.add('sahne-hazir');
}

function isikPaneliniKur() {
    // Tek ortam kaldığında seçici anlamsız: tek seçenekli bir açılır liste
    // sadece görsel gürültü. Kod SİLİNMİYOR — ortamlar.js'e yeniden HDR
    // eklendiği anda tuş kendiliğinden geri gelir. Işık yine de yükleniyor,
    // yalnızca seçim arayüzü gizli.
    if (ORTAM_SECENEKLERI.length === 0) { sahneyiAcigaCikar(); return; }
    const tekOrtam = ORTAM_SECENEKLERI.length <= 1;
    const sarmal = document.querySelector('.isik-sarmal');
    if (tekOrtam && sarmal) sarmal.style.display = 'none';

    const liste = document.getElementById('isik-listesi');
    if (!tekOrtam && liste) {
        liste.innerHTML = '';
        ORTAM_SECENEKLERI.forEach(ortam => liste.appendChild(isikSatiriOlustur(ortam)));
    }

    const btn = document.getElementById('btn-isik');
    const panel = document.getElementById('isik-panel');
    if (!tekOrtam && btn && panel) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            isikPaneliniAcKapa();
        });
        // Panelin İÇİNE tıklamak onu kapatmamalı (ortam seçmek panelde kalır,
        // müşteri sırayla deneyip karşılaştırabilsin).
        panel.addEventListener('click', (e) => e.stopPropagation());
        document.addEventListener('click', () => isikPaneliniAcKapa(false));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !panel.classList.contains('gizli')) {
                isikPaneliniAcKapa(false);
                btn.focus();
            }
        });
    }

    // Açılışta: URL'den geçerli bir ortam geldiyse onu, yoksa varsayılanı yükle.
    const hedef = (durum.ortamId && idIleOrtamBul(durum.ortamId)) || varsayilanOrtami();
    const satir = liste ? liste.querySelector(`[data-ortam-id="${hedef.id}"]`) : null;
    if (satir) isikSatiriDurumunuGuncelle(satir, 'yukleniyor');
    // 2.5 sn: bu süreyi aşan bir HDR beklemesinde sahneyi açmak, doğru renkte
    // ama geç görünmekten iyidir.
    setTimeout(sahneyiAcigaCikar, 2500);
    ortamiDegistir(hedef.dosya).finally(sahneyiAcigaCikar).catch((hata) => {
        console.error('Stüdyo ışığı yüklenemedi:', hedef.dosya, hata);
        if (satir) isikSatiriDurumunuGuncelle(satir, '');
        return null;
    }).then((sonuc) => {
        if (sonuc === null) return;
        durum.ortamId = hedef.id;
        if (satir) {
            satir.classList.add('aktif');
            satir.setAttribute('aria-pressed', 'true');
            isikSatiriDurumunuGuncelle(satir, 'aktif');
        }
        isikSeciciMetniniGuncelle();
        urliDurumaEsitle();
    });
}

function sifirlaButonuKur() {
    const btn = document.getElementById('btn-sifirla');
    if (btn) btn.addEventListener('click', goruntuyuSifirla);
}

function indirButonunuKur() {
    const btn = document.getElementById('btn-indir');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const canvas = document.querySelector('#canvas-kapsayici canvas');
        if (!canvas) return;
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const renk = idIleRenkBul(durum.renkId);
            const model = idIleModelBul(durum.modelId);
            const modelAdi = (model ? model.kisaIsim : durum.modelId).replace(/\s+/g, '');
            const dosyaAdi = `sahinkaya-kapak-${modelAdi}-${renk.kod.replace(/\s+/g, '')}-${durum.genislik}x${durum.yukseklik}.png`;

            // DOĞRUDAN İNDİRME. Burada bir zamanlar navigator.share yolu vardı:
            // Windows masaüstünde o, dosyayı indirmek yerine işletim
            // sisteminin "Paylaş" penceresini açıyordu ve kullanıcı dosyayı
            // bilgisayarına alamıyordu. Düğmenin üzerinde "Görseli İndir"
            // yazıyor — yaptığı iş de tam olarak bu olmalı.
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = dosyaAdi;
            document.body.appendChild(a);
            a.click();
            a.remove();
            // Hemen serbest bırakmak bazı tarayıcılarda indirme daha
            // başlamadan bağlantıyı geçersiz kılıyor; bir sonraki tura bırak.
            setTimeout(() => URL.revokeObjectURL(url), 0);
        }, 'image/png');
    });
}

function paylasimBilgisiniOlustur() {
    const model = idIleModelBul(durum.modelId);
    const renk = idIleRenkBul(durum.renkId);
    const adres = paylasimAdresiOlustur(
        `${window.location.origin}${window.location.pathname}`, paylasilacakDurum());
    return {
        modelAdi: model.isim,
        modelKisaAdi: model.kisaIsim || model.id,
        renkAdi: renk.isim,
        renkKodu: renk.kod,
        yuzeyAdi: (idIleYuzeyBul(durum.yuzeyId) || varsayilanYuzey()).isim,
        genislik: durum.genislik,
        yukseklik: durum.yukseklik,
        adres
    };
}

function canvasBlobuOlustur(canvas) {
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

async function paylasimPaketiniPanoyaKopyala(blob, metin) {
    if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        try {
            await navigator.clipboard.write([new ClipboardItem({
                'image/png': blob,
                'text/plain': new Blob([metin], { type: 'text/plain' })
            })]);
        } catch {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        }
        return 'gorsel';
    }
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(metin);
        return 'metin';
    }
    return null;
}

function genelPaylasButonunuKur() {
    const btn = document.getElementById('btn-genel-paylas');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const canvas = document.querySelector('#canvas-kapsayici canvas');
        if (!canvas) { bildir('Paylaşılacak görsel henüz hazır değil'); return; }

        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
        try {
            const bilgi = paylasimBilgisiniOlustur();
            const metin = paylasimMetniOlustur(bilgi);
            const blob = await canvasBlobuOlustur(canvas);
            if (!blob) throw new Error('Görsel oluşturulamadı');

            const dosya = typeof File === 'undefined' ? null : new File(
                [blob], paylasimDosyaAdiOlustur(bilgi), { type: 'image/png' });
            const dosyaPaylasilabilir = dosya && navigator.share &&
                (!navigator.canShare || navigator.canShare({ files: [dosya] }));

            if (dosyaPaylasilabilir) {
                await navigator.share({
                    title: 'Şahinkaya Ahşap kapak konfigürasyonu',
                    text: metin,
                    files: [dosya]
                });
                return;
            }

            const kopyalanan = await paylasimPaketiniPanoyaKopyala(blob, metin);
            if (kopyalanan === 'gorsel') bildir('Görsel ve konfigürasyon bilgileri kopyalandı');
            else if (kopyalanan === 'metin') bildir('Konfigürasyon bilgileri ve bağlantı kopyalandı');
            else bildir('Paylaşım bu tarayıcıda desteklenmiyor');
        } catch (hata) {
            if (hata?.name !== 'AbortError') {
                try {
                    const bilgi = paylasimBilgisiniOlustur();
                    await navigator.clipboard.writeText(paylasimMetniOlustur(bilgi));
                    bildir('Paylaşım açılamadı; bilgiler ve bağlantı kopyalandı');
                } catch {
                    bildir('Paylaşım açılamadı — tekrar deneyin');
                }
            }
        } finally {
            btn.disabled = false;
            btn.removeAttribute('aria-busy');
        }
    });
}

function tamEkranButonuKur() {
    const btn = document.getElementById('btn-tam-ekran');
    if (!btn) return;
    btn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen();
        }
    });
}

/* ---------------- Kapağın dikey çerçevelemesi ----------------
   Sahnenin üstünde (Model tuşu) ve altında (Renk/Boyut/Işık/Sıfırla + durum
   çubuğu) yüzen UI, iki taraftan FARKLI kalınlıkta boşluk kaplıyor — kapak
   canvas'ın tam ortasında kalırsa ekranda simetrik durmuyor (ölçüldü: alt
   küme üstteki tek düğmeden belirgin daha kalın, özellikle dar ekranda araç
   satırı iki satıra kırılınca). Kapağın kendisi değil, kameranın baktığı
   nokta kaydırılıyor (bkz. viewer.js kareyiDikeyKaydir) — bu yüzden gereken
   piksel miktarı burada, gerçek DOM ölçülerinden hesaplanıyor. */
// Ölçüm yapılamadığında kaç kez yeniden denendiği. Sınırsız denemek,
// eleman gerçekten hiç gelmezse sonsuz zamanlayıcı zinciri kurardı.
let dikeyKaydirmaDeneme = 0;
const DIKEY_KAYDIRMA_AZAMI_DENEME = 20;

function dikeyKaydirmayiUygula() {
    const canvas = document.querySelector('#canvas-kapsayici canvas');
    // Masaüstünde model rayı sahnenin solunda olduğu için dikey alanı
    // daraltmaz. Mobilde görünür olan üstteki kompakt seçici hesaba katılır.
    if (!window.matchMedia('(max-width: 760px)').matches) {
        // Sol model rayı sahne yüksekliğini kaplamaz. Masaüstünde merkezden
        // kaydırma, kapağı gereksiz biçimde alt kenara itiyordu.
        kareyiDikeyKaydir(0);
        return;
    }

    const mobilModelSecici = document.getElementById('model-secici');
    const ustSinir = window.matchMedia('(max-width: 760px)').matches && mobilModelSecici
        ? mobilModelSecici
        : canvas;
    const altSinir = document.querySelector('.sahne-araclari');
    const c = canvas ? canvas.getBoundingClientRect() : null;

    // Canvas ilk yüklemede kısa süre 0x0 kalabiliyor (bkz. viewer.js
    // ResizeObserver notu). Önceden burada sessizce VAZGEÇİLİYORDU: yavaş
    // bir yüklemede dikey ortalama hiç uygulanmıyor, ancak kullanıcı pencereyi
    // yeniden boyutlandırırsa düzeliyordu. Artık ölçüm hazır olana kadar
    // yeniden deneniyor.
    if (!canvas || !ustSinir || !altSinir || !c.height) {
        if (dikeyKaydirmaDeneme++ < DIKEY_KAYDIRMA_AZAMI_DENEME) dikeyKaydirmayiPlanla();
        return;
    }

    dikeyKaydirmaDeneme = 0;
    const canvasMerkezi = (c.top + c.bottom) / 2;
    const kullanilabilirMerkez = (ustSinir.getBoundingClientRect().bottom + altSinir.getBoundingClientRect().top) / 2;
    kareyiDikeyKaydir(canvasMerkezi - kullanilabilirMerkez);
}

let dikeyKaydirmaZamanlayici = null;
function dikeyKaydirmayiPlanla() {
    clearTimeout(dikeyKaydirmaZamanlayici);
    // requestAnimationFrame değil setTimeout: CSS geçişleri (rayın/panelin
    // açılıp kapanması) bittikten sonra son, DOĞRU boyutları ölçmesi gerekiyor.
    dikeyKaydirmaZamanlayici = setTimeout(dikeyKaydirmayiUygula, 150);
}

function zeminSeciciyiKur() {
    const izgara = document.getElementById('zemin-izgara');
    const btn = document.getElementById('btn-zemin');
    const panel = document.getElementById('zemin-panel');
    if (!izgara || !btn || !panel) return;

    izgara.innerHTML = '';
    ZEMIN_SECENEKLERI.forEach((z) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'zemin-dugme';
        b.dataset.zemin = z.no;
        b.title = z.aciklama;
        b.setAttribute('aria-label', `${z.ad} — ${z.aciklama}`);
        const ornek = document.createElement('span');
        ornek.className = 'zemin-ornek';
        ornek.style.background = z.ornek;
        const ad = document.createElement('span');
        ad.className = 'zemin-ad';
        ad.textContent = z.ad;
        b.append(ornek, ad);
        // Panel açık kalsın: müşteri zeminleri sırayla deneyip karşılaştırsın.
        b.addEventListener('click', () => zeminiUygula(z.no));
        izgara.appendChild(b);
    });

    const acKapa = (ac) => {
        const acilacak = ac === undefined ? panel.classList.contains('gizli') : ac;
        if (acilacak) digerSeciciPanelleriniKapat('btn-zemin');
        panel.classList.toggle('gizli', !acilacak);
        btn.classList.toggle('acik', acilacak);
        btn.setAttribute('aria-expanded', String(acilacak));
    };
    btn.addEventListener('click', (e) => { e.stopPropagation(); acKapa(); });
    panel.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', () => acKapa(false));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !panel.classList.contains('gizli')) { acKapa(false); btn.focus(); }
    });

    // Durum zaten adresten çözülmüş olabilir (bkz. urldenDurumuYukle).
    zeminiUygula(ZEMIN_SECENEKLERI.some((z) => z.no === durum.zemin) ? durum.zemin : VARSAYILAN_ZEMIN);
}

/* ---------------- Başlangıç ---------------- */

export function arayuzuBaslat() {
    // Paylaşılan link varsa önce onu uygula — sahne ve tüm kontroller doğrudan
    // o durumla kurulsun, açılıştan sonra ikinci bir güncellemeye gerek kalmasın.
    urldenDurumuYukle();

    sahneyiBaslat('canvas-kapsayici');

    modelSeciciyiKur();
    renkListesiniCiz();
    yuzeySeciciyiKur();
    lakeDokuSeciciyiKur();
    olcuKontrolleriniKur();
    olculeriSifirlamaButonunuKur();
    ayarPaneliniKur();
    isikPaneliniKur();
    sifirlaButonuKur();
    paylasButonunuKur();
    genelPaylasButonunuKur();
    indirButonunuKur();
    tamEkranButonuKur();
    zeminSeciciyiKur();

    const model = idIleModelBul(durum.modelId);
    kalinlikAlanininGorunurlugunuGuncelle(model);
    olculeriModelLimitlerineSabitle(model);
    guncellemeyiUygula();

    // İlk ölçüm bir kare sonraya bırakılıyor — sahne az önce kuruldu, canvas
    // henüz gerçek boyutuna oturmamış olabilir (bkz. viewer.js'teki
    // ResizeObserver notu: konteyner ilk yüklemede kısa süre 0x0 kalabiliyor).
    requestAnimationFrame(dikeyKaydirmayiPlanla);
    window.addEventListener('resize', dikeyKaydirmayiPlanla);
}
