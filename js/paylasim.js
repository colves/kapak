// Konfigürasyonun URL'e kodlanması / URL'den çözülmesi.
//
// Referans desen (Porsche "Porsche Code", TruStile proje kaydı): müşterinin
// oluşturduğu konfigürasyon sayfa kapanınca kaybolmamalı — linki kendine veya
// satıcıya gönderebilmeli. Burada sunucu/kısa kod yok; tüm durum sorgu
// parametrelerinde taşınıyor, yani link statik barındırmada da çalışır.
//
// Bu dosya bilerek THREE/DOM bağımsızdır — Node'da doğrudan test edilebilir.

// Kısa ve okunabilir anahtarlar: link elle bakıldığında da anlaşılsın.
//   m = model, r = RAL kodu, g = genişlik, y = yükseklik, k = kalınlık,
//   o = ortam (HDR ışık), z = sahne zemini, f = yüzey bitişi (finish)
const ANAHTARLAR = { model: 'm', ral: 'r', genislik: 'g', yukseklik: 'y', kalinlik: 'k', ortam: 'o', zemin: 'z', yuzey: 'f' };

// 'lake-ral-9016' -> '9016'
export function renkIdSindenRalKodu(renkId) {
    if (typeof renkId !== 'string') return null;
    const eslesme = renkId.match(/^lake-ral-(\d{4})$/);
    return eslesme ? eslesme[1] : null;
}

// '9016' -> 'lake-ral-9016'
export function ralKodundanRenkId(ral) {
    return /^\d{4}$/.test(String(ral)) ? `lake-ral-${ral}` : null;
}

// Durumu paylaşılabilir sorgu dizesine çevirir ('?m=...&r=...' biçiminde).
export function durumuSorguyaKodla(durum) {
    const p = new URLSearchParams();
    if (durum.modelId) p.set(ANAHTARLAR.model, durum.modelId);
    const ral = renkIdSindenRalKodu(durum.renkId);
    if (ral) p.set(ANAHTARLAR.ral, ral);
    if (Number.isFinite(durum.genislik)) p.set(ANAHTARLAR.genislik, String(Math.round(durum.genislik)));
    if (Number.isFinite(durum.yukseklik)) p.set(ANAHTARLAR.yukseklik, String(Math.round(durum.yukseklik)));
    if (Number.isFinite(durum.kalinlik)) p.set(ANAHTARLAR.kalinlik, String(Math.round(durum.kalinlik)));
    if (durum.ortamId) p.set(ANAHTARLAR.ortam, durum.ortamId);
    if (durum.zemin) p.set(ANAHTARLAR.zemin, String(durum.zemin));
    if (durum.yuzeyId) p.set(ANAHTARLAR.yuzey, durum.yuzeyId);
    const dize = p.toString();
    return dize ? `?${dize}` : '';
}

// Sorgu dizesinden GEÇERLİ alanları çözer. Doğrulama çağıranın verdiği iki
// yüklemle yapılır (modelGecerliMi / renkGecerliMi) — böylece bu modül veri
// katmanına bağımlı kalmaz. Tanınmayan/bozuk değerler sessizce atlanır:
// elle kurcalanmış bir link uygulamayı kırmak yerine varsayılana düşmeli.
export function sorgudanDurumCoz(sorgu, { modelGecerliMi, renkGecerliMi, ortamGecerliMi, zeminGecerliMi, yuzeyGecerliMi } = {}) {
    const sonuc = {};
    if (typeof sorgu !== 'string' || sorgu.length === 0) return sonuc;

    const p = new URLSearchParams(sorgu.startsWith('?') ? sorgu.slice(1) : sorgu);

    const model = p.get(ANAHTARLAR.model);
    if (model && (!modelGecerliMi || modelGecerliMi(model))) sonuc.modelId = model;

    const renkId = ralKodundanRenkId(p.get(ANAHTARLAR.ral));
    if (renkId && (!renkGecerliMi || renkGecerliMi(renkId))) sonuc.renkId = renkId;

    const ortamId = p.get(ANAHTARLAR.ortam);
    if (ortamId && (!ortamGecerliMi || ortamGecerliMi(ortamId))) sonuc.ortamId = ortamId;

    const zemin = p.get(ANAHTARLAR.zemin);
    if (zemin && (!zeminGecerliMi || zeminGecerliMi(zemin))) sonuc.zemin = zemin;

    const yuzeyId = p.get(ANAHTARLAR.yuzey);
    if (yuzeyId && (!yuzeyGecerliMi || yuzeyGecerliMi(yuzeyId))) sonuc.yuzeyId = yuzeyId;

    for (const alan of ['genislik', 'yukseklik', 'kalinlik']) {
        const ham = p.get(ANAHTARLAR[alan]);
        if (ham === null) continue;
        const sayi = Number(ham);
        // Ölçüler ayrıca modelin kendi limitlerine göre kırpılır (ui.js) — burada
        // yalnızca "sayı mı ve akla yatkın mı" kontrolü yapılır.
        if (Number.isFinite(sayi) && sayi > 0 && sayi <= 5000) sonuc[alan] = Math.round(sayi);
    }

    return sonuc;
}

// Tam paylaşılabilir adres. `temelAdres` genelde location.origin + pathname.
export function paylasimAdresiOlustur(temelAdres, durum) {
    return `${temelAdres}${durumuSorguyaKodla(durum)}`;
}
