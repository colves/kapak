import { KAPAK_MODELLERI } from './data/models.js';
import { katalogHtmliniOlustur } from './katalog.js';
import { ustBariKur } from './ustBar.js?v=20261023-1';

document.addEventListener('DOMContentLoaded', () => {
    ustBariKur();
    const kap = document.getElementById('katalog-izgara');
    // İlk HTML'deki kartları yeniden çizmek odak kaybına ve gereksiz işe yol açar.
    if (kap && !kap.querySelector('.katalog-kart')) kap.innerHTML = katalogHtmliniOlustur();
    const sayi = document.getElementById('katalog-sayi');
    if (sayi) sayi.textContent = `${KAPAK_MODELLERI.length} model`;
});
