// Her sayfada ortak olan üst bar davranışı: kaydırma durumu ve çubuk payı.
// Mobil menü ayrı, bağımsız mobilMenu.js dosyasında kuruluyor.
//
// Ayrı bir modül olmasının sebebi iletişim sayfası: ana sayfa modülü
// three.js'i (ve dolayısıyla ~600 KB'ı) içeri alıyor, 3B'si olmayan bir
// sayfanın bunu indirmesi için hiçbir neden yok.

// Ana sayfa kaydırılabilir, konfigüratör değil — yani ana sayfada dikey bir
// kaydırma çubuğu var, orada yok. Bu, iki sayfanın kullanılabilir genişliğini
// (Windows'ta ~15px) farklılaştırıyor ve sağ üstteki Konfigüratör tuşu,
// konfigüratördeki "Görseli İndir" tuşuyla tam hizalanmıyordu.
//
// Çubuğun gerçek kalınlığı işletim sistemine ve tarayıcıya göre değişiyor
// (macOS'ta 0), o yüzden sabit bir sayı yazılmıyor: bir kez ölçülüp CSS'e
// değişken olarak veriliyor.
import { whatsappAdresiOlustur } from './iletisimBaglantilari.js';

function kaydirmaCubuguPayiniOlc() {
    const pay = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.documentElement.style.setProperty('--kaydirma-cubugu', `${pay}px`);
}

function whatsappBaglantisiniEkle() {
    if (document.querySelector('.whatsapp-yuzen')) return;

    const baglanti = document.createElement('a');
    baglanti.className = 'whatsapp-yuzen';
    baglanti.href = whatsappAdresiOlustur();
    baglanti.target = '_blank';
    baglanti.rel = 'noopener';
    baglanti.setAttribute('aria-label', 'WhatsApp üzerinden iletişime geçin');
    baglanti.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M19.1 17.5c-.3-.2-1.7-.8-1.9-.9-.3-.1-.5-.2-.7.2-.2.3-.7.9-.8 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.8-3.4-.3-.5.3-.5.8-1.6.1-.2.1-.4 0-.6-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.3 3.6 5.6 5 .8.3 1.4.6 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.4zM16 3.2c-7 0-12.6 5.6-12.6 12.6 0 2.2.6 4.3 1.7 6.2L3.3 28.8l7-1.8c1.8 1 3.8 1.5 5.8 1.5 7 0 12.7-5.6 12.7-12.6S23 3.2 16 3.2zm0 22.9c-1.9 0-3.7-.5-5.3-1.4l-.4-.2-4.1 1.1 1.1-4-.3-.4a10.2 10.2 0 0 1-1.6-5.4C5.4 10 10.1 5.3 16 5.3S26.7 10 26.7 15.8 21.9 26.1 16 26.1z"/></svg><span>WhatsApp\'tan yazın</span>';
    document.body.append(baglanti);
}

export function ustBariKur() {
    kaydirmaCubuguPayiniOlc();
    whatsappBaglantisiniEkle();
    window.addEventListener('resize', kaydirmaCubuguPayiniOlc);

    // Ana sayfada bar hero görselinin üzerinde saydam başlıyor; sayfa
    // kaydırılınca opaklaşması gerekiyor. Saydam durumun stili yalnızca
    // .hero-var gövdesinde tanımlı olduğu için bu sınıfı diğer sayfalara
    // eklemek zararsız — orada hiçbir kurala denk gelmiyor.
    const ust = document.getElementById('ust');
    if (ust) {
        const durumuYaz = () => ust.classList.toggle('kaydirildi', window.scrollY > 40);
        durumuYaz();
        // passive: kaydırmayı bloklamasın.
        window.addEventListener('scroll', durumuYaz, { passive: true });
    }

}
