import { KAPAK_MODELLERI } from './data/models.js';
import { GALERI_FOTOGRAFLARI } from './data/galeri.js';
import { ralSirasindakiRenkler } from './data/colors.js';
import { durumuSorguyaKodla } from './paylasim.js';

const kacir = (deger) => String(deger).replace(/[&<>"']/g, (karakter) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[karakter]);

function konfiguratorAdresi(modelId, renkKodu) {
    return `/konfigurator/${durumuSorguyaKodla({
        modelId, renkId: renkKodu ? `lake-ral-${renkKodu}` : undefined
    })}`;
}

// Tarayıcıdaki yedek çizim ve yayın öncesi HTML üretimi aynı şablonu kullanır.
export function katalogHtmliniOlustur() {
    const renkler = ralSirasindakiRenkler();
    return KAPAK_MODELLERI.map((model) => {
        const foto = GALERI_FOTOGRAFLARI.find((f) => f.modelId === model.id);
        const dosya = model.gorselUrl || foto?.dosya;
        const ad = model.kisaIsim || model.isim;
        const adres = konfiguratorAdresi(model.id, foto?.renkKodu);
        const kodlar = [...new Set([foto?.renkKodu, '9016', '7044', '7016'].filter(Boolean))].slice(0, 3);
        const noktalar = kodlar.map((kod) => {
            const renk = renkler.find((r) => r.kod === `RAL ${kod}`);
            if (!renk) return '';
            const hex = `#${renk.hex.toString(16).padStart(6, '0')}`;
            return `<a class="katalog-nokta" href="${kacir(konfiguratorAdresi(model.id, kod))}" style="background:${hex}" title="${kacir(`${ad} · ${renk.isim} (${renk.kod})`)}" aria-label="${kacir(`${ad} modelini ${renk.isim}, ${renk.kod} renginde aç`)}"></a>`;
        }).join('');
        return `<article class="katalog-kart">
    <a class="katalog-gorsel" href="${kacir(adres)}" aria-label="${kacir(`${ad} — konfigüratörde aç`)}">${dosya ? `<img src="${kacir(dosya)}" alt="${kacir(`${ad} lake dolap kapağı modeli`)}" width="1000" height="1400" loading="lazy" decoding="async">` : ''}</a>
    <div class="katalog-alt">
        <div class="katalog-bas"><h2><a href="${kacir(adres)}">${kacir(ad)}</a></h2><span class="katalog-olcu">${model.varsayilan.genislik} × ${model.varsayilan.yukseklik} mm</span></div>
        <p class="katalog-aciklama">${model.varsayilan.kalinlik} mm lake kapak · ${renkler.length} RAL rengi</p>
        <div class="katalog-noktalar">${noktalar}<a class="katalog-tumu" href="${kacir(adres)}">Tüm renkler →</a></div>
    </div>
</article>`;
    }).join('\n');
}
