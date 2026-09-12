// Eski yer imleri ve logo bağlantıları da kök adresi kullansın.
// 3B modüller yüklenmese bile bu küçük betik bağımsız çalışır.
function anaSayfaAdresiniTemizle() {
    const { pathname, search, hash } = window.location;
    if (pathname !== '/' && pathname !== '/index.html') return;
    const temizHash = hash === '#tepe' ? '' : hash;
    const hedef = `/${search}${temizHash}`;
    if (`${pathname}${search}${hash}` !== hedef) {
        window.history.replaceState(window.history.state, '', hedef);
    }
}

anaSayfaAdresiniTemizle();
window.addEventListener('hashchange', anaSayfaAdresiniTemizle);
