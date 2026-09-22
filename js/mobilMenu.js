// Gezinme, 3B önizleme veya sayfa modülleri yüklenmese de çalışır.
const dugme = document.getElementById('menu-dugmesi');
const menu = document.getElementById('menu');

if (dugme && menu) {
    const menuyuAyarla = (ac) => {
        menu.classList.toggle('acik', ac);
        dugme.setAttribute('aria-expanded', String(ac));
    };

    dugme.addEventListener('click', () => menuyuAyarla(!menu.classList.contains('acik')));
    menu.addEventListener('click', (event) => {
        if (event.target.closest('a')) menuyuAyarla(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') menuyuAyarla(false);
    });
}
