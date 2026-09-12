import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { KAPAK_MODELLERI, idIleModelBul } from '../js/data/models.js';
import { sorgudanDurumCoz, durumuSorguyaKodla } from '../js/paylasim.js';

test('Every QR link resolves to its unique model and intended finish', () => {
    const rows = JSON.parse(fs.readFileSync('docs/kapak-linkleri.json', 'utf8'));
    assert.equal(rows.length, KAPAK_MODELLERI.length);
    assert.equal(new Set(rows.map(row => row.url)).size, rows.length);
    assert.equal(new Set(rows.map(row => row.id)).size, rows.length);
    for (const row of rows) {
        const url = new URL(row.url);
        assert.equal(url.origin + url.pathname, 'https://sahinkayamobilya.com/konfigurator/');
        const state = sorgudanDurumCoz(url.search, { modelGecerliMi: id => !!idIleModelBul(id) });
        assert.equal(state.modelId, row.id);
        const model = idIleModelBul(row.id);
        assert.equal(url.searchParams.get('m'), /^M\d/.test(model.isim) ? model.isim : model.id);
        assert.ok(!/hk-|photo-studio|[?&](g|y|k|o)=/i.test(row.url));
        assert.equal(sorgudanDurumCoz(`?m=${row.id}`).modelId, row.id, 'Eski QR kimliği çalışmalı');
        assert.equal(idIleModelBul(state.modelId).isim, row.model);
        assert.ok(fs.existsSync(idIleModelBul(state.modelId).gltfUrl));
        assert.equal(state.renkId, 'lake-ral-7044');
        assert.equal(state.yuzeyId, 'yari-parlak');
        assert.equal(state.dokuAktif, true);
        assert.equal(state.dokuYogunlugu, 10);
    }
});
test('Public model aliases are case insensitive and M068 variants stay distinct', () => {
    assert.equal(sorgudanDurumCoz('?m=m012&r=5011').modelId, 'hk-012-001');
    const a = sorgudanDurumCoz('?m=M068-02').modelId;
    const b = sorgudanDurumCoz('?m=M068-04').modelId;
    assert.notEqual(a, b);
    assert.equal(idIleModelBul(a).isim, 'M068-02');
    assert.equal(idIleModelBul(b).isim, 'M068-04');
});
test('Texture sharing preserves off/zero and rejects invalid input', () => {
    const state = { dokuAktif: false, dokuYogunlugu: 0 };
    assert.deepEqual(sorgudanDurumCoz(durumuSorguyaKodla(state)), state);
    assert.deepEqual(sorgudanDurumCoz('?d=bad&dy=999'), {});
    assert.deepEqual(sorgudanDurumCoz('?dy='), {});
});
