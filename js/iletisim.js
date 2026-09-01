// İletişim sayfası. Üst bar davranışını ortak modülden alıyor; kendi işi
// yalnızca haritaları kurmak.
import { ustBariKur } from './ustBar.js';

// Harita gömülüsü ve "Google Haritalar'da Aç" bağlantısı, kartın üzerindeki
// TEK bir data-konum metninden üretiliyor. Böylece bir adres değişince
// iletisim.html'de tek satır düzeltmek yetiyor; iki yerde birbirini tutmayan
// konum kalmıyor.
//
// output=embed uçlu arama bağlantısı Google Haritalar'ın API anahtarı
// gerektirmeyen gömme biçimi — siteye anahtar/kota bağımlılığı eklemiyor.
function haritalariKur() {
    document.querySelectorAll('.harita[data-konum]').forEach((kutu) => {
        const konum = kutu.dataset.konum;
        if (!konum) return;
        const q = encodeURIComponent(konum);

        // Harita, iframe olarak ancak ekrana yaklaşınca yükleniyor: üçüncü
        // taraf bir gömülü, sayfanın ilk açılışını bekletmesin.
        const cerceve = document.createElement('iframe');
        cerceve.src = `https://www.google.com/maps?q=${q}&output=embed`;
        cerceve.loading = 'lazy';
        cerceve.referrerPolicy = 'no-referrer-when-downgrade';
        cerceve.title = `${konum} — harita`;
        cerceve.setAttribute('allowfullscreen', '');
        cerceve.addEventListener('load', () => {
            const yedek = kutu.querySelector('.harita-yedek');
            if (yedek) yedek.remove();
        });
        kutu.appendChild(cerceve);

        // Aynı karttaki düğme aynı konuma gitsin.
        const baglanti = kutu.parentElement?.querySelector('[data-harita-baglanti]');
        if (baglanti) baglanti.href = `https://www.google.com/maps/search/?api=1&query=${q}`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    ustBariKur();
    haritalariKur();
});
