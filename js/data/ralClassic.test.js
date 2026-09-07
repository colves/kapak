import assert from 'node:assert/strict';
import { RAL_CLASSIC_KARTELA, ralClassicSerileri } from './ralClassic.js';

assert.strictEqual(RAL_CLASSIC_KARTELA.length, 216, 'Kartela tüm 216 RAL Classic rengini içermeli');

const kodlar = RAL_CLASSIC_KARTELA.map((renk) => renk.kod);
assert.strictEqual(new Set(kodlar).size, 216, 'Kartelada yinelenen RAL kodu olmamalı');
assert.deepStrictEqual(
    kodlar.map((kod) => Number(kod.slice(4))),
    [...kodlar.map((kod) => Number(kod.slice(4)))].sort((a, b) => a - b),
    'Tam kartela RAL koduna göre artan saklanmalı'
);

const seriler = ralClassicSerileri();
assert.deepStrictEqual(
    seriler.map((seri) => seri.seri),
    ['9000', '8000', '7000', '6000', '5000', '4000', '3000', '2000', '1000'],
    'Kartela seri başlıkları büyükten küçüğe gösterilmeli'
);
for (const seri of seriler) {
    const seriKodlari = seri.renkler.map((renk) => Number(renk.kod.slice(4)));
    assert.deepStrictEqual(seriKodlari, [...seriKodlari].sort((a, b) => a - b), `RAL ${seri.seri} iç sırası artan olmalı`);
}

console.log(`✔ ralClassic.test.js: ${RAL_CLASSIC_KARTELA.length} RAL Classic rengi ve seri sırası doğrulandı.`);
