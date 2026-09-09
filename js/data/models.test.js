import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { KAPAK_MODELLERI, idIleModelBul } from './models.js';

assert.strictEqual(KAPAK_MODELLERI.length, 74, '62 katalog ve 12 ek modelin tamamı bekleniyor');

const hk012 = idIleModelBul('hk-012-001');
const hk051 = idIleModelBul('hk-051-002');
const m3970 = idIleModelBul('kapak-3970');
assert.ok(hk012, "'hk-012-001' modeli bulunamadı");
assert.ok(hk051, "'hk-051-002' modeli bulunamadı");
assert.ok(m3970, "'kapak-3970' modeli bulunamadı");
assert.strictEqual(hk012.isim, 'M012');
assert.strictEqual(hk051.isim, 'M051');
assert.strictEqual(m3970.isim, 'M006');
assert.strictEqual(hk012.uretimKodu, 'HK_012_001');
assert.strictEqual(hk051.uretimKodu, 'HK_051_002');
assert.strictEqual(m3970.uretimKodu, 'HK_006_001');
assert.strictEqual(hk012.kalinlikAyarlanabilir, false);
assert.strictEqual(hk051.kalinlikAyarlanabilir, false);
assert.strictEqual(m3970.kalinlikAyarlanabilir, false);
assert.ok(hk012.gltfUrl, "'hk-012-001' için gltfUrl tanımlı olmalı");
assert.ok(hk051.gltfUrl, "'hk-051-002' için gltfUrl tanımlı olmalı");
assert.ok(m3970.gltfUrl, "'kapak-3970' için gltfUrl tanımlı olmalı");
assert.strictEqual(idIleModelBul('olmayan'), null);

// Model fotoğrafı eşleşmeleri dosya numarasına dayanır. Yanlış numara veya
// eksik web çıktısı, her iki model galerisinde de kırık/yanlış kapak gösterir.
const beklenenGorseller = new Map([
    ['hk-012-001', 'assets/model-fotograflari/HK_012_001.webp'],
    ['hk-051-002', 'assets/model-fotograflari/HK_051_002.webp'],
    ['kapak-3970', 'assets/model-fotograflari/HK_006_001.webp']
]);

for (const model of KAPAK_MODELLERI) {
    const beklenen = beklenenGorseller.get(model.id);
    if (beklenen) assert.strictEqual(model.gorselUrl, beklenen, `${model.id}: yanlış model fotoğrafı eşlemesi`);
    if (model.gorselUrl) assert.ok(existsSync(new URL(`../../${model.gorselUrl}`, import.meta.url)), `${model.id}: model fotoğrafı dosyası bulunamadı`);
    assert.ok(existsSync(new URL(`../../${model.gltfUrl}`, import.meta.url)), `${model.id}: GLB dosyası bulunamadı`);
}

const siraliModelKodlari = KAPAK_MODELLERI.map(model => model.isim);
const sonaTasinanlar = ['acili-kapak', 'alttan-kulplu', 'camli-1', 'camli-2', 'camli-3', 'camli-4', 'ek-kapak', 'gardrop-1', 'gardrop-2', 'gardrop-3', 'gardrop-4'];
assert.deepStrictEqual(KAPAK_MODELLERI.slice(-11).map(model => model.id), sonaTasinanlar,
    'İşaretlenmeyen 11 özel kapak listenin sonunda olmalı');
const onGrup = KAPAK_MODELLERI.slice(0, -11).map(model => model.isim);
assert.deepStrictEqual(onGrup, [...onGrup].sort((a, b) => a.localeCompare(b, 'tr', { numeric: true })),
    'M kodlu modeller kendi sıralamasını korumalı');
assert.strictEqual(new Set(siraliModelKodlari).size, KAPAK_MODELLERI.length, 'Model adları benzersiz olmalı');
const katalogKodlari = KAPAK_MODELLERI.filter(model => /^HK_/.test(model.uretimKodu)).map(model => model.isim);
assert.strictEqual(katalogKodlari.length, 62, 'Katalogdaki 62 model korunmalı');
assert.ok(katalogKodlari.every(kod => /^M\d{3}(?:-\d{2})?$/.test(kod)), 'Katalog modelleri M koduyla görünmeli');
assert.deepStrictEqual(
    siraliModelKodlari.filter(kod => kod.startsWith('M068')),
    ['M068-02', 'M068-04'],
    'M068 varyantları dosyadaki ikinci sütuna göre adlandırılmalı'
);

assert.deepStrictEqual(idIleModelBul('gardrop-2').varsayilan, { genislik: 1204, yukseklik: 2200, kalinlik: 20 });
assert.deepStrictEqual(idIleModelBul('gardrop-1').varsayilan, { genislik: 1200, yukseklik: 2200, kalinlik: 20 });
assert.strictEqual(idIleModelBul('alttan-kulplu').glbIcerikDonusu, Math.PI, 'Alttan kulplu modelin kulbu üstte olmalı');

// Her modelin gltfUrl'i benzersiz olmalı (birbirine karışmamalı).
const urlSeti = new Set(KAPAK_MODELLERI.map(m => m.gltfUrl));
assert.strictEqual(urlSeti.size, KAPAK_MODELLERI.length, 'Tüm modeller farklı glb dosyalarına işaret etmeli');

for (const model of KAPAK_MODELLERI) {
    assert.ok(model.limitler.genislik.min < model.limitler.genislik.max, `${model.id}: genislik limitleri geçersiz`);
    assert.ok(model.limitler.yukseklik.min < model.limitler.yukseklik.max, `${model.id}: yukseklik limitleri geçersiz`);
    assert.ok(model.varsayilan.genislik >= model.limitler.genislik.min && model.varsayilan.genislik <= model.limitler.genislik.max, `${model.id}: varsayılan genişlik limit dışı`);
}

console.log('✔ models.test.js: tüm kontroller geçti.');
