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
// Kart içindeki önizleme OpenStreetMap kullanır; harici API anahtarı ya da
// kota gerektirmez. Alttaki düğme ise kullanıcıyı Google Haritalar'a götürür.
function haritalariKur() {
    document.querySelectorAll('.konum-kart').forEach((kart) => {
        const kutu = kart.querySelector('.harita');
        const baglanti = kart.querySelector('[data-harita-baglanti]');
        if (!kutu || !baglanti) return;

        let q = baglanti.dataset.haritaSorgu;
        if (!q) {
            try {
                q = new URL(baglanti.href).searchParams.get('query');
            } catch {
                q = null;
            }
        }
        const enlem = Number(baglanti.dataset.haritaEnlem);
        const boylam = Number(baglanti.dataset.haritaBoylam);
        if (!q || !Number.isFinite(enlem) || !Number.isFinite(boylam)) return;

        const yatayPay = 0.012;
        const dikeyPay = 0.0075;
        const sinirlar = [
            boylam - yatayPay,
            enlem - dikeyPay,
            boylam + yatayPay,
            enlem + dikeyPay
        ].join(',');

        const cerceve = document.createElement('iframe');
        cerceve.src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(sinirlar)}&layer=mapnik&marker=${encodeURIComponent(`${enlem},${boylam}`)}`;
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
