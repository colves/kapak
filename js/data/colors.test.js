import assert from 'node:assert/strict';
import {
    RENK_KATALOGU, TON_AILELERI, tumRenkleriDuzListeOlarakAl, idIleRenkBul,
    tonAilesindekiRenkler, doluTonAileleri
} from './colors.js';

function renkGecerliMi(renk) {
    assert.ok(renk.id && renk.kategori && renk.kod && renk.isim, `Eksik alan: ${JSON.stringify(renk)}`);
    assert.ok(Number.isInteger(renk.hex) && renk.hex >= 0 && renk.hex <= 0xFFFFFF, `Geçersiz hex: ${renk.kod}`);
    assert.ok(['duz', 'ahsap'].includes(renk.dokuTipi), `Geçersiz dokuTipi: ${renk.kod}`);
    assert.ok(renk.roughness >= 0 && renk.roughness <= 1, `Geçersiz roughness: ${renk.kod}`);
    assert.ok(renk.clearcoat >= 0 && renk.clearcoat <= 1, `Geçersiz clearcoat: ${renk.kod}`);
    assert.ok(['acik', 'koyu'].includes(renk.grup), `Geçersiz grup: ${renk.kod}`);
    assert.ok(typeof renk.tonAilesi === 'string' && renk.tonAilesi.length > 0, `Ton ailesi eksik: ${renk.kod}`);
}

const tumRenkler = tumRenkleriDuzListeOlarakAl();
assert.ok(tumRenkler.length >= 70, `Beklenenden az renk var: ${tumRenkler.length}`);

const idler = tumRenkler.map(r => r.id);
assert.strictEqual(new Set(idler).size, idler.length, 'Tekrarlanan renk id bulundu');
tumRenkler.forEach(renkGecerliMi);

// Katalog artık tek eksenli: lake.tumu
assert.ok(Array.isArray(RENK_KATALOGU.lake.tumu), 'RENK_KATALOGU.lake.tumu dizi olmalı');
assert.strictEqual(RENK_KATALOGU.lake.tumu.length, tumRenkler.length);

// Kaldırılan kategoriler geri gelmemiş olmalı
assert.strictEqual(RENK_KATALOGU.membran, undefined, 'Membran kategorisi kaldırılmış olmalı');
assert.strictEqual(RENK_KATALOGU.akrilik, undefined, 'Akrilik kategorisi kaldırılmış olmalı');
assert.strictEqual(RENK_KATALOGU.masifAhsap, undefined, 'Masif Ahşap kategorisi kaldırılmış olmalı');
// Eski açık/koyu gezinme ekseni de kaldırıldı — yerini ton aileleri aldı
assert.strictEqual(RENK_KATALOGU.lake.acik, undefined, 'lake.acik ekseni kaldırılmış olmalı');
assert.strictEqual(RENK_KATALOGU.lake.koyu, undefined, 'lake.koyu ekseni kaldırılmış olmalı');

// 'tumu' tam listeyi döndürür; bilinmeyen aile boş döner
assert.strictEqual(tonAilesindekiRenkler('tumu').length, tumRenkler.length);
assert.strictEqual(tonAilesindekiRenkler().length, tumRenkler.length, 'Argümansız çağrı tam listeyi vermeli');
assert.deepStrictEqual(tonAilesindekiRenkler('olmayan-aile'), []);

// Her renk tam olarak bir aileye düşmeli — ailelerin toplamı tam listeye eşit
const gercekAileler = TON_AILELERI.filter(a => a.anahtar !== 'tumu');
const aileToplami = gercekAileler.reduce((n, a) => n + tonAilesindekiRenkler(a.anahtar).length, 0);
assert.strictEqual(aileToplami, tumRenkler.length,
    `Aile toplamı (${aileToplami}) tam liste (${tumRenkler.length}) ile eşleşmeli — sınıflandırılmayan renk var`);

// RAL numara grubu ile aile eşleşmesi doğru mu (RAL'in resmî gruplaması)
const HANE_BEKLENEN = { '1': 'sari', '3': 'kirmizi', '4': 'mor', '5': 'mavi', '6': 'yesil', '7': 'gri', '8': 'kahve' };
for (const renk of tumRenkler) {
    const hane = renk.kod.replace('RAL ', '')[0];
    if (hane === '9') {
        assert.ok(['beyaz', 'siyah'].includes(renk.tonAilesi), `9xxx beyaz/siyah olmalı: ${renk.kod}`);
        assert.strictEqual(renk.tonAilesi, renk.grup === 'acik' ? 'beyaz' : 'siyah', `9xxx ayrımı grup ile tutarsız: ${renk.kod}`);
    } else if (HANE_BEKLENEN[hane]) {
        assert.strictEqual(renk.tonAilesi, HANE_BEKLENEN[hane], `${renk.kod} yanlış aileye düştü: ${renk.tonAilesi}`);
    }
}

// doluTonAileleri boş aile döndürmemeli ve 'tumu' her zaman içinde olmalı
const dolu = doluTonAileleri();
assert.ok(dolu.some(a => a.anahtar === 'tumu'), "'tumu' her zaman listelenmeli");
for (const aile of dolu) {
    assert.ok(tonAilesindekiRenkler(aile.anahtar).length > 0, `Boş aile listelenmiş: ${aile.anahtar}`);
}

const ilkRenk = tumRenkler[0];
assert.strictEqual(idIleRenkBul(ilkRenk.id).kod, ilkRenk.kod);
assert.strictEqual(idIleRenkBul('olmayan-id'), null);

console.log(`✔ colors.test.js: ${tumRenkler.length} renk, ${dolu.length - 1} ton ailesi doğrulandı, tüm kontroller geçti.`);
