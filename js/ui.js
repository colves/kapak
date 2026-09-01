import { idIleRenkBul, ralSirasindakiRenkler } from './data/colors.js';
import { KAPAK_MODELLERI, idIleModelBul } from './data/models.js';
import { ORTAM_SECENEKLERI, varsayilanOrtami, idIleOrtamBul } from './data/ortamlar.js';
import { sahneyiBaslat, kapagiGuncelle, goruntuyuSifirla, ortamiDegistir, kareyiDikeyKaydir } from './viewer.js';
import { durumuSorguyaKodla, sorgudanDurumCoz, paylasimAdresiOlustur } from './paylasim.js';

// Başlangıç ölçüleri sabit sayı olarak DEĞİL, modelin kendi varsayılanından
// türetiliyor — tek kaynak models.js'teki varsayilan alanı. Önceden burada
// bağımsız bir 480×717 sabiti vardı ve models.js'in 450×720 varsayılanıyla
// hiç eşleşmiyordu (model değiştirince de düzelmiyordu — bkz. aşağıdaki
// olculeriVarsayilanaSifirla).
const BASLANGIC_MODEL_ID = 'hk-012-001';
const baslangicModel = idIleModelBul(BASLANGIC_MODEL_ID);

const durum = {
    modelId: BASLANGIC_MODEL_ID,
    genislik: baslangicModel.varsayilan.genislik,
    yukseklik: baslangicModel.varsayilan.yukseklik,
    kalinlik: baslangicModel.varsayilan.kalinlik,
    renkId: 'lake-ral-7044',
    ortamId: null
};

let guncellemeBekliyor = false;

/* ---------------- Sahneyi durumla eşitle ---------------- */

function guncellemeyiUygula() {
    const model = idIleModelBul(durum.modelId);
    const renk = idIleRenkBul(durum.renkId);
    // Model dosyası yüklenemezse sahne boş kalır; kullanıcı nedenini
    // bilmediği bir boşluğa bakmasın diye durum kendisine bildiriliyor.
    Promise.resolve(kapagiGuncelle(durum.genislik, durum.yukseklik, renk, model.gltfUrl, model.glbIcerikDonusu, model.kenarPayi))
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

/* ---------------- URL ile paylaşım ----------------
   Konfigürasyon adres çubuğunda yaşar: müşteri linki kopyalayıp satıcıya
   gönderebilir, sayfayı yenilese de seçimi kaybolmaz. */

function urliDurumaEsitle() {
    const sorgu = durumuSorguyaKodla(durum);
    // replaceState: her slider hareketinde tarayıcı geçmişine yeni kayıt
    // eklenmesin, geri tuşu konfigüratörde tıkanmasın.
    window.history.replaceState(null, '', `${window.location.pathname}${sorgu}`);
}

function urldenDurumuYukle() {
    const cozulen = sorgudanDurumCoz(window.location.search, {
        modelGecerliMi: (id) => Boolean(idIleModelBul(id)),
        renkGecerliMi: (id) => Boolean(idIleRenkBul(id)),
        ortamGecerliMi: (id) => Boolean(idIleOrtamBul(id))
    });
    Object.assign(durum, cozulen);

    // Linkten gelen renk hangi ailedeyse süzgeç de o aileyle açılsın —
    // müşteri paylaşılan rengi ızgarada seçili hâlde görsün.
    const renk = idIleRenkBul(durum.renkId);
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
            `${window.location.origin}${window.location.pathname}`, durum);
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

function modelSeciciMetniniGuncelle() {
    const model = idIleModelBul(durum.modelId);
    const el = document.getElementById('model-secici-ad');
    if (el) el.textContent = model.kisaIsim || model.isim;
}

function modelGaleriKartiOlustur(model) {
    const kart = document.createElement('button');
    kart.type = 'button';
    const secili = model.id === durum.modelId;
    kart.className = 'model-galeri-kart' + (secili ? ' aktif' : '');
    kart.setAttribute('aria-pressed', String(secili));
    kart.dataset.modelId = model.id;

    const gorselHtml = model.gorselUrl
        ? `<img src="${model.gorselUrl}" alt="${model.isim}" class="model-galeri-kart-gorsel">`
        : `<div class="model-galeri-kart-yer-tutucu" aria-hidden="true">
               <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                   <rect x="4" y="2" width="16" height="20" rx="1.5"></rect>
                   <rect x="7" y="5" width="10" height="14" rx="0.8"></rect>
               </svg>
           </div>`;

    kart.innerHTML = `${gorselHtml}<span class="model-galeri-kart-ad">${model.isim}</span>`;
    kart.addEventListener('click', () => {
        if (durum.modelId !== model.id) {
            durum.modelId = model.id;
            const m = idIleModelBul(model.id);
            olculeriVarsayilanaSifirla(m);
            kalinlikAlanininGorunurlugunuGuncelle(m);
            olculeriModelLimitlerineSabitle(m);
            modelSeciciMetniniGuncelle();
            goruntuGuncellemesiPlanla();
        }
        modelGalerisiniKapat();
    });
    return kart;
}

function modelGalerisiniCiz(arama) {
    const izgara = document.getElementById('model-galeri-izgara');
    izgara.innerHTML = '';
    const s = (arama || '').trim().toLocaleLowerCase('tr');
    const sonuclar = s
        ? KAPAK_MODELLERI.filter(m => m.isim.toLocaleLowerCase('tr').includes(s) || (m.kisaIsim || '').toLocaleLowerCase('tr').includes(s))
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

function modelGalerisiniAc() {
    document.getElementById('model-galerisi').classList.remove('gizli');
    modelGalerisiniCiz('');
    const arama = document.getElementById('model-galeri-arama');
    arama.value = '';
    arama.focus();
}

function modelGalerisiniKapat() {
    document.getElementById('model-galerisi').classList.add('gizli');
    document.getElementById('model-secici').focus();
}

function modelSeciciyiKur() {
    modelSeciciMetniniGuncelle();
    document.getElementById('model-secici').addEventListener('click', modelGalerisiniAc);
    document.getElementById('model-galeri-kapat').addEventListener('click', modelGalerisiniKapat);
    document.getElementById('model-galeri-arama').addEventListener('input', (e) => modelGalerisiniCiz(e.target.value));
    const katman = document.getElementById('model-galerisi');
    katman.addEventListener('click', (e) => { if (e.target === katman) modelGalerisiniKapat(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !katman.classList.contains('gizli')) modelGalerisiniKapat();
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

function renkIzgarasiniCiz() {
    const izgara = document.getElementById('renk-izgara');
    if (!izgara) return;
    const renkler = ralSirasindakiRenkler();
    izgara.innerHTML = '';
    renkler.forEach((renk, i) => {
        const btn = renkButonuOlustur(renk);
        // Kartlar kademeli belirsin diye (bkz. base.css .renk-btn animasyonu)
        // her karta kendi sırası yazılıyor.
        btn.style.setProperty('--i', i);
        izgara.appendChild(btn);
    });

    const sayiEl = document.getElementById('renk-sayisi');
    if (sayiEl) sayiEl.textContent = `${renkler.length} RAL tonu`;
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
        // HDR dosyası büyük (6,2 MB); zayıf bağlantıda kopması gerçekçi.
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

            if (navigator.canShare) {
                const dosya = new File([blob], dosyaAdi, { type: 'image/png' });
                if (navigator.canShare({ files: [dosya] })) {
                    try {
                        await navigator.share({ files: [dosya], title: 'Şahinkaya Kapak Konfigürasyonu' });
                        return;
                    } catch {
                        // Kullanıcı paylaşımı iptal etti veya desteklenmiyor — indirmeye düş.
                    }
                }
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = dosyaAdi;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }, 'image/png');
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
    const ustSinir = document.getElementById('model-secici');
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
    { no: '6', ad: 'Teknik ızgara', aciklama: 'Ölçü hissi veren milimetrik zemin', ornek: 'repeating-linear-gradient(0deg, #C3BFB6 0 1px, #F5F4F1 1px 8px)' }
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

    // Adres satırı seçimi taşısın: yenilenince kaybolmasın, paylaşılan linkte
    // de aynı zemin açılsın. Varsayılan zeminde parametre yazılmıyor —
    // paylaşılan link gereksiz yere kirlenmesin.
    const p = new URLSearchParams(window.location.search);
    if (no === VARSAYILAN_ZEMIN) p.delete('zemin'); else p.set('zemin', no);
    const sorgu = p.toString();
    window.history.replaceState(null, '', sorgu ? `${window.location.pathname}?${sorgu}` : window.location.pathname);
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

    // Adresten gelen zemin varsa onunla aç; geçersizse varsayılana düş.
    const istenen = new URLSearchParams(window.location.search).get('zemin');
    zeminiUygula(ZEMIN_SECENEKLERI.some((z) => z.no === istenen) ? istenen : VARSAYILAN_ZEMIN);
}

/* ---------------- Başlangıç ---------------- */

export function arayuzuBaslat() {
    // Paylaşılan link varsa önce onu uygula — sahne ve tüm kontroller doğrudan
    // o durumla kurulsun, açılıştan sonra ikinci bir güncellemeye gerek kalmasın.
    urldenDurumuYukle();

    sahneyiBaslat('canvas-kapsayici');

    modelSeciciyiKur();
    renkIzgarasiniCiz();
    olcuKontrolleriniKur();
    ayarPaneliniKur();
    isikPaneliniKur();
    sifirlaButonuKur();
    paylasButonunuKur();
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
