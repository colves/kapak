// Her sayfada ortak olan üst bar davranışı: kaydırınca opaklaşma ve
// mobil menünün açılıp kapanması.
//
// Ayrı bir modül olmasının sebebi iletişim sayfası: ana sayfa modülü
// three.js'i (ve dolayısıyla ~600 KB'ı) içeri alıyor, 3B'si olmayan bir
// sayfanın bunu indirmesi için hiçbir neden yok.

export function ustBariKur() {
    const ust = document.getElementById('ust');
    if (!ust) return;

    // Hero'nun üzerindeyken saydam, aşağı inince opak. Eşik 40px: barın
    // kendi yüksekliğinden küçük, yani kullanıcı daha ilk hareketde geçişi
    // görüyor, sonradan ani bir sıçrama olmuyor.
    const durumuYaz = () => ust.classList.toggle('kaydirildi', window.scrollY > 40);
    window.addEventListener('scroll', durumuYaz, { passive: true });
    durumuYaz();

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
