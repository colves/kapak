// Her sayfada ortak olan üst bar davranışı: mobil menünün açılıp kapanması ve
// kaydırma çubuğu payının ölçülmesi.
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
function kaydirmaCubuguPayiniOlc() {
    const pay = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.documentElement.style.setProperty('--kaydirma-cubugu', `${pay}px`);
}

export function ustBariKur() {
    kaydirmaCubuguPayiniOlc();
    window.addEventListener('resize', kaydirmaCubuguPayiniOlc);

    // Not: burada bir zamanlar sayfa kaydırılınca barı saydamdan opağa
    // geçiren bir 'kaydirildi' sınıfı vardı. Üst bar artık her sayfada ve her
    // durumda konfigüratörünkiyle aynı opak barla duruyor, o yüzden kalktı.

    const dugme = document.getElementById('menu-dugmesi');
    const menu = document.getElementById('menu');
    if (!dugme || !menu) return;

    const menuyuAyarla = (ac) => {
        menu.classList.toggle('acik', ac);
        dugme.setAttribute('aria-expanded', String(ac));
    };
    dugme.addEventListener('click', () => menuyuAyarla(!menu.classList.contains('acik')));
    // Bir bağlantıya basılınca menü kapansın — aksi hâlde hedef bölümün
    // üstünü kapatıp duruyor.
    menu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') menuyuAyarla(false);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') menuyuAyarla(false);
    });
}
