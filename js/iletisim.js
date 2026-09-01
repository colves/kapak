// İletişim sayfası. Üst bar davranışını ortak modülden alıyor; kendi işi
// yalnızca haritaları gömmek.
import { ustBariKur } from './ustBar.js';

// Her konum TEK YERDE tanımlı: kartın "Google Haritalar'da Aç" düğmesinin
// href'i. Harita gömülüsü buradaki sorgudan türetiliyor — adres değişince
// HTML'de tek satır düzeltmek yetiyor, birbirini tutmayan iki konum kalmıyor.
//
// Düğmenin kendisi statik HTML'de tam adresiyle duruyor; yani bu dosya hiç
// çalışmasa bile müşteri haritaya gidebiliyor, sadece gömülü önizleme olmuyor.
//
// output=embed uçlu gömme, Google Haritalar'ın API anahtarı gerektirmeyen
// biçimi — siteye anahtar/kota bağımlılığı eklemiyor.
function haritalariKur() {
    document.querySelectorAll('.konum-kart').forEach((kart) => {
        const kutu = kart.querySelector('.harita');
        const baglanti = kart.querySelector('[data-harita-baglanti]');
        if (!kutu || !baglanti) return;

        let q;
        try {
            q = new URL(baglanti.href).searchParams.get('query');
        } catch {
            q = null;
        }
        if (!q) return; // Adres okunamadıysa yedek metin kalsın, boş iframe basma.

        const cerceve = document.createElement('iframe');
        cerceve.src = `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
        cerceve.loading = 'lazy';
        cerceve.referrerPolicy = 'no-referrer-when-downgrade';
        cerceve.title = `${q} — harita`;
        cerceve.setAttribute('allowfullscreen', '');
        cerceve.addEventListener('load', () => {
            const yedek = kutu.querySelector('.harita-yedek');
            if (yedek) yedek.remove();
        });
        kutu.appendChild(cerceve);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    ustBariKur();
    haritalariKur();
});
