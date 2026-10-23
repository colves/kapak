import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { KAPAK_MODELLERI } from '../js/data/models.js';
import { sorgudanDurumCoz } from '../js/paylasim.js';
import { whatsappAdresiOlustur, GENEL_WHATSAPP_MESAJI } from '../js/iletisimBaglantilari.js';
import { katalogHtmliniOlustur } from '../js/katalog.js';

test('WhatsApp quote includes current selection and a usable configuration link', () => {
    const secim = {
        modelAdi: 'M012', renkAdi: 'İpek Grisi', renkKodu: 'RAL 7044',
        yuzeyAdi: 'Yarı Parlak', genislik: 450, yukseklik: 720,
        adres: 'https://sahinkayamobilya.com/konfigurator/?m=M012&r=7044&f=yari-parlak'
    };
    const url = new URL(whatsappAdresiOlustur(secim));
    assert.equal(url.origin + url.pathname, 'https://wa.me/905336639714');
    const mesaj = url.searchParams.get('text');
    for (const text of ['M012', 'İpek Grisi (RAL 7044)', 'Yarı Parlak', '450 × 720 mm', secim.adres]) {
        assert.ok(mesaj.includes(text), `Missing quote detail: ${text}`);
    }
    assert.ok(!new URL(whatsappAdresiOlustur({ ...secim, modelAdi: 'gardrop 1', genislik: 1200, yukseklik: 2200 })).searchParams.get('text').includes('450 × 720'));
    assert.equal(new URL(whatsappAdresiOlustur()).searchParams.get('text'), GENEL_WHATSAPP_MESAJI);
});

test('Initial catalog HTML contains every real model and preserves model/color selections', () => {
    const html = fs.readFileSync(new URL('../modeller/index.html', import.meta.url), 'utf8');
    const cards = html.match(/<!-- katalog:baslangic -->\n([\s\S]*?)\n<!-- katalog:bitis -->/)?.[1];
    assert.equal(cards, katalogHtmliniOlustur(), 'Regenerate initial HTML with npm run build');
    assert.equal((cards.match(/class="katalog-kart"/g) || []).length, KAPAK_MODELLERI.length);
    const links = [...cards.matchAll(/class="katalog-gorsel" href="([^"]+)"/g)].map((m) => new URL(m[1].replaceAll('&amp;', '&'), 'https://sahinkayamobilya.com'));
    assert.deepEqual(links.map((u) => sorgudanDurumCoz(u.search).modelId), KAPAK_MODELLERI.map((m) => m.id));
    for (const image of cards.matchAll(/<img\b[^>]*>/g)) assert.match(image[0], /alt="[^"]+lake dolap kapağı modeli"/);
});
