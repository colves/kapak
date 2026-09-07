import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { KAPAK_MODELLERI, idIleModelBul } from './models.js';

assert.strictEqual(KAPAK_MODELLERI.length, 3, 'Üç kapak modeli bekleniyor (3976, 4021, 3970)');

const hk012 = idIleModelBul('hk-012-001');
const hk051 = idIleModelBul('hk-051-002');
const m3970 = idIleModelBul('kapak-3970');
assert.ok(hk012, "'hk-012-001' modeli bulunamadı");
assert.ok(hk051, "'hk-051-002' modeli bulunamadı");
assert.ok(m3970, "'kapak-3970' modeli bulunamadı");
assert.strictEqual(hk012.isim, 'HK_012_001 (3976)');
assert.strictEqual(hk051.isim, 'HK_051_002 (4021)');
assert.strictEqual(m3970.isim, 'Kapak Modeli (3970)');
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
    ['hk-012-001', 'assets/model-fotograflari/3976.webp'],
    ['hk-051-002', 'assets/model-fotograflari/4021.webp'],
    ['kapak-3970', 'assets/model-fotograflari/3970.webp']
]);

for (const model of KAPAK_MODELLERI) {
    assert.strictEqual(model.gorselUrl, beklenenGorseller.get(model.id), `${model.id}: yanlış model fotoğrafı eşlemesi`);
    assert.ok(existsSync(new URL(`../../${model.gorselUrl}`, import.meta.url)), `${model.id}: model fotoğrafı dosyası bulunamadı`);
}

// Her modelin gltfUrl'i benzersiz olmalı (birbirine karışmamalı).
const urlSeti = new Set(KAPAK_MODELLERI.map(m => m.gltfUrl));
assert.strictEqual(urlSeti.size, KAPAK_MODELLERI.length, 'Tüm modeller farklı glb dosyalarına işaret etmeli');

for (const model of KAPAK_MODELLERI) {
    assert.ok(model.limitler.genislik.min < model.limitler.genislik.max, `${model.id}: genislik limitleri geçersiz`);
    assert.ok(model.limitler.yukseklik.min < model.limitler.yukseklik.max, `${model.id}: yukseklik limitleri geçersiz`);
    assert.ok(model.varsayilan.genislik >= model.limitler.genislik.min && model.varsayilan.genislik <= model.limitler.genislik.max, `${model.id}: varsayılan genişlik limit dışı`);
}

console.log('✔ models.test.js: tüm kontroller geçti.');
