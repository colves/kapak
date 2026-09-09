import fs from 'node:fs';
import { KAPAK_MODELLERI } from '../js/data/models.js';
import { paylasimAdresiOlustur } from '../js/paylasim.js';

// QR kimliği katalog sırasından değil, kalıcı model id alanından gelir.
// Basılmış QR'lar için bu kimlikler yeniden adlandırılmamalı/başka modele verilmemeli.
const rows = KAPAK_MODELLERI.map(model => ({
    model: model.isim,
    id: model.id,
    url: paylasimAdresiOlustur('https://sahinkayamobilya.com/konfigurator/', {
        modelId: model.id, renkId: 'lake-ral-7044', yuzeyId: 'yari-parlak',
        dokuAktif: true, dokuYogunlugu: 10
    })
}));
fs.writeFileSync('docs/kapak-linkleri.json', JSON.stringify(rows, null, 2) + '\n');
fs.writeFileSync('docs/kapak-linkleri.csv', '\uFEFFModel,Kimlik,Bağlantı\n' + rows.map(row =>
    [row.model, row.id, row.url].map(value => `"${value.replaceAll('"', '""')}"`).join(',')
).join('\n') + '\n');
console.log(`${rows.length} kalıcı kapak bağlantısı hazır.`);
