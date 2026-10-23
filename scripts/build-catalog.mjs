import fs from 'node:fs';
import { KAPAK_MODELLERI } from '../js/data/models.js';
import { katalogHtmliniOlustur } from '../js/katalog.js';

const dosya = new URL('../modeller/index.html', import.meta.url);
const kaynak = fs.readFileSync(dosya, 'utf8');
const blok = /<!-- katalog:baslangic -->[\s\S]*?<!-- katalog:bitis -->/;
if (!blok.test(kaynak)) throw new Error('Katalog üretim alanı bulunamadı');
const sonuc = kaynak.replace(blok, `<!-- katalog:baslangic -->\n${katalogHtmliniOlustur()}\n<!-- katalog:bitis -->`)
    .replace(/(<span id="katalog-sayi">)[^<]*(<\/span>)/, `$1${KAPAK_MODELLERI.length} model$2`);
if (process.argv.includes('--check')) {
    if (sonuc !== kaynak) throw new Error('Model kataloğu güncel değil: npm run build çalıştırın');
} else {
    fs.writeFileSync(dosya, sonuc);
    console.log(`${KAPAK_MODELLERI.length} model ilk HTML'ye işlendi.`);
}
