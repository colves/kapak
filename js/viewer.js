import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { renkVerisindenMalzemeOlustur, malzemeUygula } from './materials.js';
import { glbKapakGrubuOlustur } from './glbYukleyici.js';

let sahne, kamera, isleyici, kontroller, pmremUretici;
let kapakGrubu = null;
let mevcutMalzeme = null;
let renderGerekli = true;
let konteyner = null;
let dolduruculIsik, yonluIsik;

// Kameranın başlangıç uzaklığı. Konfigüratör varsayılanı 1600; ana sayfa hero'su
// daha yakın bir çerçeveleme istiyor (orada sahne çok daha büyük, kapak o
// çerçevede kaybolmasın). goruntuyuSifirla() de bu değere döner — yoksa sıfırla
// tuşu hero'yu konfigüratörün çerçevesine atardı.
let baslangicKameraMesafesi = 1600;

export function sahneyiBaslat(konteynerId, { kameraMesafesi, yakinlastirma = true } = {}) {
    konteyner = document.getElementById(konteynerId);

    sahne = new THREE.Scene();
    sahne.background = null;

    const genislik = konteyner.clientWidth || window.innerWidth;
    const yukseklik = konteyner.clientHeight || window.innerHeight;

    // 40°: ui-ux-pro-max'ın önerdiği 45-55° ürün-yakın-çekim aralığıyla
    // karşılaştırıldı (kullanıcı iki değeri de gördü), 40° tercih edildi.
    kamera = new THREE.PerspectiveCamera(40, genislik / yukseklik, 1, 10000);
    if (Number.isFinite(kameraMesafesi) && kameraMesafesi > 0) {
        baslangicKameraMesafesi = kameraMesafesi;
    }
    kamera.position.set(0, 0, baslangicKameraMesafesi);

    // preserveDrawingBuffer: sahnenin görüntüsünün (ör. ileride "kapağı görsel olarak
    // kaydet" gibi bir özellik için) okunabilir kalmasını sağlar; on-demand render
    // deseninde (nadiren çizim yapıldığından) performans maliyeti ihmal edilebilir.
    isleyici = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    isleyici.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    isleyici.setSize(genislik, yukseklik);
    isleyici.outputColorSpace = THREE.SRGBColorSpace;
    // Ekran okuyucular bir WebGL canvas'ından hiçbir bilgi alamaz — bu iki
    // öznitelik, görüntüleyicinin ne olduğunu ve nasıl kullanıldığını duyuran
    // tek açıklamadır. (Canlı seçim metni ayrıca #durum-cubugu'nda okunuyor.)
    isleyici.domElement.setAttribute('role', 'img');
    isleyici.domElement.setAttribute('aria-label',
        'Kapak modelinin etkileşimli 3B önizlemesi. Döndürmek için sürükleyin, yakınlaştırmak için tekerleği kullanın. Seçili model, renk ve ölçüler aşağıdaki durum çubuğunda yazılıdır.');
    konteyner.appendChild(isleyici.domElement);

    pmremUretici = new THREE.PMREMGenerator(isleyici);
    const ortamSahnesi = new RoomEnvironment();
    sahne.environment = pmremUretici.fromScene(ortamSahnesi, 0.04).texture;

    // Bu iki ışık SADECE ilk açılıştaki hızlı procedural RoomEnvironment için var
    // (o gerçek bir fotoğraf değil, düz/sönük bir yaklaşıklık, biraz takviyeye
    // ihtiyacı var). Gerçek bir HDR stüdyo ortamı yüklendiğinde (ortamiDegistir)
    // bunlar söndürülür — gerçek HDR zaten kendi başına tam ışıklandırma sağlıyor,
    // üzerine sabit yönden jenerik ışık eklemek onu sulandırıp "gerçek stüdyo"
    // hissini bozuyordu.
    dolduruculIsik = new THREE.AmbientLight(0xffffff, 0.35);
    sahne.add(dolduruculIsik);

    yonluIsik = new THREE.DirectionalLight(0xffffff, 0.6);
    yonluIsik.position.set(600, 900, 1200);
    sahne.add(yonluIsik);

    kontroller = new OrbitControls(kamera, isleyici.domElement);

    // Kontroller kamerayı her oynattığında çizim İSTE. Bu satır olmadan
    // tekerlekle yakınlaştırma ekranda görünmüyordu (ölçüldü: tekerlekten
    // sonra kamera mesafesi 1600 -> 1238 değişiyor ama render sayacı 3'te
    // sabit kalıyor).
    //
    // Sebep: OrbitControls tekerlek olayını işlerken update()'i KENDİ İÇİNDE
    // çağırıp dolly'yi hemen uyguluyor. Aşağıdaki döngü bir sonraki karede
    // update()'i tekrar çağırdığında değişecek bir şey kalmadığı için false
    // dönüyor, dolayısıyla renderGerekli hiç kurulmuyor. Sürüklemede sorun
    // görünmüyordu çünkü sönümleme (damping) birkaç kare boyunca update()'i
    // true döndürmeye devam ediyor — kullanıcının "önce çevirince
    // yakınlaştırabiliyorum" dediği davranışın tam sebebi bu.
    //
    // three.js'in kendi "render on demand" örneğindeki desen de budur.
    kontroller.addEventListener('change', renderIste);

    kontroller.enableDamping = true;
    kontroller.dampingFactor = 0.08;
    // Ana sayfadaki vitrin önizlemesinde yakınlaştırma kapalı: orası bir
    // inceleme aracı değil, sabit çerçeveli bir vitrin. Ziyaretçi kapağı
    // çevirebilir ama çerçeveden kaçıramaz. Konfigüratörde açık kalır.
    kontroller.enableZoom = yakinlastirma;
    kontroller.minDistance = 300;
    kontroller.maxDistance = 2600;
    // Sağ tık ile sürükleyerek kaydırma (pan) istenmiyor — kapak her zaman
    // merkezde kalsın, sadece döndürme (sol tık) ve yakınlaştırma (tekerlek) olsun.
    kontroller.enablePan = false;
    // Dönüş kilidi: kapak bir ürün önizlemesi, serbest bir 3B sahne değil.
    // Yatayda ±90° — müşteri ön yüzü ve iki yanı görebilir ama kapağın
    // arkasına (üretim açısından anlamsız, düz bir yüzey) dönemez.
    // Dikeyde 0.2π–0.8π (≈36°–144°) — tam tepeden veya tam alttan bakıp
    // kapağı ince bir çizgi hâline getirmeyi engeller.
    kontroller.minAzimuthAngle = -Math.PI / 2;
    kontroller.maxAzimuthAngle = Math.PI / 2;
    kontroller.minPolarAngle = Math.PI * 0.2;
    kontroller.maxPolarAngle = Math.PI * 0.8;
    // Pan kapalıyken sağ tık artık işlevsiz; tarayıcının sağ tık menüsünün
    // sahne üzerinde beliriverdiği garip görünümü engelle.
    isleyici.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    // Trackpad'de iki parmakla "sıkıştırma" (pinch-to-zoom) tarayıcılarda
    // ctrlKey:true'lu bir 'wheel' olayı olarak gelir ve tarayıcı bunu
    // TARAYICI SAYFASINI yakınlaştırmak için kullanır — kullanıcı kapağa
    // değil sayfaya yakınlaşmış olur, "sahneye yaklaştıramıyorum" hissi
    // buradan geliyor olabilir. OrbitControls'ün kendi wheel dinleyicisi
    // preventDefault çağırıyor ama tarayıcılar pinch/ctrl+wheel'i FARKLI bir
    // yakınlaştırma kanalı (sayfa zoom'u) olarak ele alabiliyor; burada
    // AÇIKÇA ve önce engelleniyor ki olay OrbitControls'e sağlam ulaşsın.
    isleyici.domElement.addEventListener('wheel', (e) => {
        if (e.ctrlKey) e.preventDefault();
    }, { passive: false });

    // ResizeObserver, hem pencere boyutu değiştiğinde hem de konteynerin kendi
    // layout'u (flex/grid hesaplaması, panel açılıp kapanması, ilk yüklemede
    // henüz 0x0 olan bir konteynerin gerçek boyutuna kavuşması gibi) değiştiğinde
    // tetiklenir — window 'resize' olayından daha güvenilirdir.
    // Dock panelleri açılıp kapanırken CSS genişlik geçişi ~280ms sürüyor ve bu süre
    // boyunca ResizeObserver çok sık (neredeyse her karede) tetikleniyor. Her
    // tetiklemede WebGL çizim tamponunu yeniden boyutlandırmak (isleyici.setSize)
    // titremeye/kısa süreli kaybolmaya yol açıyordu — bu yüzden gerçek yeniden
    // boyutlandırma (setSize) geçiş bitene kadar ertelenir (debounce); bu sırada
    // sahne son bilinen ölçekte render edilmeye devam eder (boş kalmaz), sadece
    // geçiş bitince keskin şekilde doğru orana oturur.
    let boyutlandirmaZamanlayici = null;
    const boyutGozlemcisi = new ResizeObserver(() => {
        renderIste();
        clearTimeout(boyutlandirmaZamanlayici);
        boyutlandirmaZamanlayici = setTimeout(pencereBoyutlandi, 120);
    });
    boyutGozlemcisi.observe(konteyner);

    donguyuBaslat();
    renderIste();
}

function pencereBoyutlandi() {
    if (!konteyner || !kamera || !isleyici) return;
    const genislik = konteyner.clientWidth;
    const yukseklik = konteyner.clientHeight;
    if (genislik <= 0 || yukseklik <= 0) return; // henüz layout hazır değil, sonraki tetiklemeyi bekle
    kamera.aspect = genislik / yukseklik;
    kamera.updateProjectionMatrix();
    isleyici.setSize(genislik, yukseklik);
    renderIste();
}

export function renderIste() {
    renderGerekli = true;
}

// On-demand render döngüsü: requestAnimationFrame her zaman çalışır (bu ucuz bir
// vsync callback'idir), ancak pahalı renderer.render() çağrısı yalnızca kamera
// hareket ettiğinde (kontroller.update() true dönerse) veya renderIste() ile
// açıkça istendiğinde yapılır. Bu, three.js'in resmi "render on demand" desenidir.
function donguyuBaslat() {
    requestAnimationFrame(donguyuBaslat);
    const kameraDegisti = kontroller ? kontroller.update() : false;
    if (kameraDegisti) renderGerekli = true;
    if (renderGerekli && isleyici && sahne && kamera) {
        isleyici.render(sahne, kamera);
        renderGerekli = false;
    }
}

let istekSirasi = 0;

// Sahneden çıkarılan grubun geometrilerini serbest bırakır.
// .glb'den yüklenip önbelleğe alınmış geometriler PAYLAŞILIR (bkz.
// glbYukleyici.js); bunları dispose etmek aynı modelin bir sonraki seçiminde
// bozuk/boş görünmesine yol açar, o yüzden işaretli olanlar atlanıyor.
function kapakGeometrisiTemizle(nesne) {
    if (!nesne) return;
    if (nesne.geometry && !nesne.userData?.paylasilanGeometri) nesne.geometry.dispose();
    if (nesne.children && nesne.children.length) {
        nesne.children.forEach(kapakGeometrisiTemizle);
    }
}

function yeniGrubuSahneyeUygula(yeniGrup, renkVerisi, buIstek) {
    // Kullanıcı yükleme bitmeden başka bir model/renk seçmiş olabilir — o
    // durumda bu (artık eski) sonucu sahneye koymadan temizleyip at.
    if (buIstek !== istekSirasi) {
        kapakGeometrisiTemizle(yeniGrup);
        return;
    }
    if (kapakGrubu) {
        sahne.remove(kapakGrubu);
        kapakGeometrisiTemizle(kapakGrubu);
    }
    if (mevcutMalzeme) {
        mevcutMalzeme.dispose();
    }

    kapakGrubu = yeniGrup;
    mevcutMalzeme = renkVerisindenMalzemeOlustur(renkVerisi);
    malzemeUygula(kapakGrubu, mevcutMalzeme);

    sahne.add(kapakGrubu);
    renderIste();
}

// glbUrl verilmişse (gerçek 3ds Max'ten aktarılmış model), procedural geometri
// yerine o dosya asenkron olarak yüklenip kullanılır.
export function kapagiGuncelle(genislikMM, yukseklikMM, renkVerisi, glbUrl, glbIcerikDonusu, kenarPayi) {
    const buIstek = ++istekSirasi;

    // Her modelin bir .glb dosyası var (üretim yalnızca bu modellerden yapılıyor).
    // Eskiden burada, dosyası olmayan modeller için prosedürel bir kapak üreten
    // ikinci bir yol vardı; hiçbir zaman çalışmadığı için kaldırıldı. Yine de
    // sessizce hiçbir şey yapmak yerine açık bir hata veriliyor: gltfUrl'i
    // unutulmuş bir model eklenirse fark edilsin.
    if (!glbUrl) {
        return Promise.reject(new Error('Modelin gltfUrl alanı yok; kapak çizilemiyor.'));
    }

    // Söz ÇAĞIRANA DÖNDÜRÜLÜYOR: model dosyası yüklenemediğinde ui.js hatayı
    // yakalayıp kullanıcıya bildiriyor (yoksa boş bir sahneye bakıp kalıyordu).
    return glbKapakGrubuOlustur(glbUrl, genislikMM, yukseklikMM, glbIcerikDonusu || 0, kenarPayi || null)
        .then((grup) => yeniGrubuSahneyeUygula(grup, renkVerisi, buIstek));
}

// ---------------- Stüdyo HDR ortam ışığı (gerçek fotoğraflanmış ışıklandırma) ----------------
// Sayfa ilk açılışında sahneyeBaslat() içindeki hızlı procedural RoomEnvironment
// kullanılır (ağ isteği yok, anında hazır); gerçek HDR dosyaları TEMBEL yüklenir —
// yalnızca seçildiklerinde indirilir ve bir daha indirilmesin diye önbelleğe alınır.
const rgbeYukleyici = new RGBELoader();
const ortamOnbellek = new Map(); // url -> Promise<THREE.Texture> (PMREM, kullanıma hazır)

function ortamYukle(url) {
    if (ortamOnbellek.has(url)) return ortamOnbellek.get(url);

    const soz = new Promise((resolve, reject) => {
        rgbeYukleyici.load(
            url,
            (hdrDoku) => {
                const pmrem = pmremUretici.fromEquirectangular(hdrDoku).texture;
                hdrDoku.dispose();
                resolve(pmrem);
            },
            undefined,
            (hata) => reject(hata)
        );
    });

    // Başarısız yükleme önbellekte kalmamalı — bkz. glbYukleyici.js'teki aynı
    // not: aksi hâlde tek bir ağ kesintisi HDR'ı o oturum boyunca kalıcı
    // olarak devre dışı bırakıyor.
    soz.catch(() => ortamOnbellek.delete(url));

    ortamOnbellek.set(url, soz);
    return soz;
}

// Verilen HDR dosyasına geçiş yapar; yüklenene kadar mevcut ışıklandırma
// (procedural veya önceki HDR) sahnede kalmaya devam eder, ansızın kararmaz.
export function ortamiDegistir(url) {
    if (!url) return Promise.resolve(false);
    return ortamYukle(url).then((pmrem) => {
        sahne.environment = pmrem;
        // Gerçek HDR kendi başına tam ışıklandırma sağlıyor — procedural ortam
        // için eklenen dolgu/yönlü ışıkları söndür, yoksa HDR'nin gerçek
        // karakterini (yön, kontrast, sıcaklık) sulandırıyorlardı.
        if (dolduruculIsik) dolduruculIsik.intensity = 0;
        if (yonluIsik) yonluIsik.intensity = 0;
        renderIste();
        return true;
    });
}

export function goruntuyuSifirla() {
    if (!kontroller || !kamera) return;
    kontroller.reset();
    kamera.position.set(0, 0, baslangicKameraMesafesi);
    kontroller.target.set(0, 0, 0);
    kamera.position.y = kontroller.target.y = -dikeyDunyaOfseti;
    renderIste();
}

// Sahnenin üstünde/altında yüzen UI (model seçici, renk/boyut/ışık tuşları,
// durum çubuğu) iki taraftan FARKLI yükseklikte boşluk kaplıyor — kapak
// canvas'ın tam ortasında kalırsa bu yüzden ekranda simetrik durmuyor
// (ölçüldü: alt küme üst kümeden belirgin daha kalın). Kapağın kendisini
// KAYDIRMAK yerine (o zaman kırpılma sınırları da kaymış olurdu) kamerayı ve
// baktığı noktayı BİRLİKTE, aynı miktarda dikey öteliyoruz — ikisi arasındaki
// mesafe ve açı hiç değişmediği için görüntü sadece çerçeve içinde kayar,
// perspektif bozulmaz. ui.js sahnedeki gerçek DOM ölçülerinden piksel
// cinsinden gereken kaydırmayı hesaplayıp burayı çağırıyor (viewer.js
// konfigüratöre özgü DOM kimliklerini bilmiyor — bu bilinçli bir ayrım).
let dikeyDunyaOfseti = 0;
export function kareyiDikeyKaydir(pxOfset) {
    if (!kamera || !kontroller || !isleyici) return;
    const rect = isleyici.domElement.getBoundingClientRect();
    if (!rect.height) return;
    const mesafe = kamera.position.distanceTo(kontroller.target);
    // Bir perspektif kamerada, hedef mesafesindeki düzlemde görünen dünya
    // yüksekliği: 2 * mesafe * tan(FOV/2). Piksel/dünya oranı bu yükseklik ile
    // canvas'ın piksel yüksekliğinin oranından çıkıyor.
    const dunyaYuksekligi = 2 * mesafe * Math.tan(THREE.MathUtils.degToRad(kamera.fov) / 2);
    dikeyDunyaOfseti = (pxOfset / rect.height) * dunyaYuksekligi;
    // Kamerayı ve hedefi AŞAĞI kaydırmak, sabit bir dünya noktasının ekranda
    // YUKARI görünmesini sağlar — istenen piksel kaydırması pozitifse (kapak
    // yukarı çıksın) burada eksi işaretle uygulanıyor.
    kamera.position.y = kontroller.target.y = -dikeyDunyaOfseti;
    kontroller.update();
    renderIste();
}
