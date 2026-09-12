import assert from 'node:assert/strict';
import {
    renkIdSindenRalKodu, ralKodundanRenkId, durumuSorguyaKodla,
    sorgudanDurumCoz, paylasimAdresiOlustur, paylasimMetniOlustur,
    paylasimDosyaAdiOlustur
} from './paylasim.js';

// ---- renk id <-> RAL kodu ----
assert.strictEqual(renkIdSindenRalKodu('lake-ral-9016'), '9016');
assert.strictEqual(renkIdSindenRalKodu('lake-ral-7016'), '7016');
assert.strictEqual(renkIdSindenRalKodu('hg-ral-9016'), null, 'Lake dışı önek kabul edilmemeli');
assert.strictEqual(renkIdSindenRalKodu('lake-ral-90'), null, '4 haneli olmayan kod reddedilmeli');
assert.strictEqual(renkIdSindenRalKodu(null), null);
assert.strictEqual(renkIdSindenRalKodu(undefined), null);

assert.strictEqual(ralKodundanRenkId('9016'), 'lake-ral-9016');
assert.strictEqual(ralKodundanRenkId('abcd'), null);
assert.strictEqual(ralKodundanRenkId(null), null);

// ---- kodlama ----
const ornekDurum = { modelId: 'hk-012-001', renkId: 'lake-ral-9016', genislik: 480, yukseklik: 717, kalinlik: 18, ortamId: 'white-studio-06' };
const sorgu = durumuSorguyaKodla(ornekDurum);
assert.ok(sorgu.startsWith('?'), 'Sorgu ? ile başlamalı');
assert.ok(sorgu.includes('m=M012'));
assert.ok(sorgu.includes('r=9016'));
assert.equal(sorgu, '?m=M012&r=9016');

assert.strictEqual(durumuSorguyaKodla({}), '', 'Boş durum boş sorgu vermeli');

// Ondalıklı ölçüler yuvarlanmalı (slider hep tam sayı verir ama link elle de kurulabilir)
assert.equal(durumuSorguyaKodla({ genislik: 480.6 }), '');

// ---- gidiş-dönüş (round trip) ----
const geriCozulen = sorgudanDurumCoz(sorgu);
const publicState = { modelId: ornekDurum.modelId, renkId: ornekDurum.renkId };
assert.deepStrictEqual(geriCozulen, publicState, 'Model ve renk korunmalı, teknik alanlar yeni linkte bulunmamalı');

// ? olmadan da çözebilmeli
assert.deepStrictEqual(sorgudanDurumCoz(sorgu.slice(1)), publicState);

// ---- doğrulama yüklemleri ----
const yalnizcaBilinenModel = { modelGecerliMi: (id) => id === 'hk-012-001' };
assert.strictEqual(sorgudanDurumCoz('?m=uydurma-model', yalnizcaBilinenModel).modelId, undefined,
    'Tanınmayan model atlanmalı');
assert.strictEqual(sorgudanDurumCoz('?m=hk-012-001', yalnizcaBilinenModel).modelId, 'hk-012-001');

const yalnizcaVarOlanRenk = { renkGecerliMi: (id) => id === 'lake-ral-9016' };
assert.strictEqual(sorgudanDurumCoz('?r=9016', yalnizcaVarOlanRenk).renkId, 'lake-ral-9016');
assert.strictEqual(sorgudanDurumCoz('?r=1234', yalnizcaVarOlanRenk).renkId, undefined,
    'Katalogda olmayan RAL kodu atlanmalı');

const yalnizcaVarOlanOrtam = { ortamGecerliMi: (id) => id === 'white-studio-06' };
assert.strictEqual(sorgudanDurumCoz('?o=white-studio-06', yalnizcaVarOlanOrtam).ortamId, 'white-studio-06');
assert.strictEqual(sorgudanDurumCoz('?o=olmayan-ortam', yalnizcaVarOlanOrtam).ortamId, undefined,
    "Katalogda olmayan ortam id'si atlanmalı");

// ---- bozuk / kötü niyetli girdi uygulamayı kırmamalı ----
assert.deepStrictEqual(sorgudanDurumCoz(''), {});
assert.deepStrictEqual(sorgudanDurumCoz(null), {});
assert.deepStrictEqual(sorgudanDurumCoz(undefined), {});
assert.deepStrictEqual(sorgudanDurumCoz('?g=abc'), {}, 'Sayı olmayan ölçü atlanmalı');
assert.deepStrictEqual(sorgudanDurumCoz('?g=-50'), {}, 'Negatif ölçü atlanmalı');
assert.deepStrictEqual(sorgudanDurumCoz('?g=0'), {}, 'Sıfır ölçü atlanmalı');
assert.deepStrictEqual(sorgudanDurumCoz('?g=99999'), {}, 'Akıl dışı büyük ölçü atlanmalı');
assert.deepStrictEqual(sorgudanDurumCoz('?bilinmeyen=1'), {}, 'Tanınmayan parametre yok sayılmalı');
// Kısmi link geçerli olmalı — sadece renk paylaşmak da işe yaramalı
assert.deepStrictEqual(sorgudanDurumCoz('?r=3004'), { renkId: 'lake-ral-3004' });

// ---- tam adres ----
assert.strictEqual(
    paylasimAdresiOlustur('https://ornek.com/configurator.html', { renkId: 'lake-ral-9005' }),
    'https://ornek.com/configurator.html?r=9005'
);
assert.strictEqual(paylasimAdresiOlustur('https://ornek.com/x.html', {}), 'https://ornek.com/x.html',
    'Boş durumda adres değişmeden kalmalı');

// ---- genel paylaşım paketi ----
const paylasimBilgisi = {
    modelAdi: 'HK_012_001 (3976)',
    modelKisaAdi: 'HK_012_001',
    renkAdi: 'İpek Grisi',
    renkKodu: 'RAL 7044',
    yuzeyAdi: 'Yarı Parlak',
    genislik: 450,
    yukseklik: 720,
    adres: 'https://ornek.com/configurator.html?m=hk-012-001&r=7044'
};
assert.strictEqual(
    paylasimMetniOlustur(paylasimBilgisi),
    'Şahinkaya Mobilya kapak konfigürasyonu\nModel: HK_012_001 (3976)\nRenk: İpek Grisi (RAL 7044)\nYüzey: Yarı Parlak\nÖlçü: 450 × 720 mm\nhttps://ornek.com/configurator.html?m=hk-012-001&r=7044'
);
assert.strictEqual(
    paylasimDosyaAdiOlustur(paylasimBilgisi),
    'sahinkaya-kapak-HK_012_001-RAL7044-450x720.png'
);

console.log('✔ paylasim.test.js: tüm kontroller geçti.');
