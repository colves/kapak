import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { kenarBandiOlc, bandiElleAyarla, eksenEslemesiKur } from './kenarOlcekleme.js';

// Kenar korumalı (nine-patch) ölçeklemenin nasıl çalıştığı ve neden gerektiği
// kenarOlcekleme.js'in başındaki açıklamada.

// glTF birimi her zaman metredir (spesifikasyon gereği); sahnemiz milimetre
// cinsinden çalışıyor. Şablon hazırlanırken geometri bir kez mm'ye çevriliyor,
// sonrasında bu dosyadaki her ölçü mm.
const METRE_MM = 1000;

const yukleyici = new GLTFLoader();
// anahtar: `url|icerikDonusu` -> Promise<şablon>
const onbellek = new Map();

function glbSablonunuYukle(url, icerikDonusuZ) {
    const anahtar = `${url}|${icerikDonusuZ || 0}`;
    if (onbellek.has(anahtar)) return onbellek.get(anahtar);

    const soz = new Promise((resolve, reject) => {
        yukleyici.load(
            url,
            (gltf) => {
                const kaynakSahne = gltf.scene;

                // 3ds Max Z-yukarı çalışır ve ön yüzü (Front görünümü) +Y'ye
                // bakar; bu exporter sahneyi glTF'in Y-yukarı eksenine
                // çevirmeden aktarmış. THREE.Object3D.rotateX/Y yerel eksende
                // ardışık uygulanır ve normal vektörüne etkisi ÇAĞRI SIRASININ
                // TERSİ yönde birleşir — bu yüzden önce rotateY(180°) sonra
                // rotateX(-90°) çağırmak gerekiyor (test edilip doğrulandı):
                // sonuç olarak ön yüz normali dünya +Z'ye (kameraya), yükseklik
                // ekseni dünya +Y'ye (dikey) oturuyor.
                kaynakSahne.rotateY(Math.PI);
                kaynakSahne.rotateX(-Math.PI / 2);

                // icerikDonusuZ: bazı modellerde kulp/desen gibi simetrik olmayan
                // bir detay yanlış köşede çıkıyor (3ds Max'teki orijinal modelleme
                // yönüne bağlı). Bu, ön yüz düzleminde ek bir döndürme (örn.
                // Math.PI = 180°, deseni çapraz köşeye taşır). Eskiden klonlanan
                // gruba uygulanıyordu; artık şablona pişiriliyor, çünkü kenar
                // bantları kapağın SON yönünde ölçülmeli — döndürme sonradan
                // gelirse ölçülen "sol bant" ekranda sağda kalırdı.
                const disKap = new THREE.Group();
                disKap.add(kaynakSahne);
                if (icerikDonusuZ) disKap.rotateZ(icerikDonusuZ);
                disKap.updateMatrixWorld(true);

                // 3ds Max/Babylon exporter'dan gelen modelin pivotu genelde tam
                // merkezde olmuyor — sınırlayıcı kutuyu hesaplayıp merkezi orijine
                // taşıyoruz ki hangi dosya gelirse gelsin kapak sahnede ortalansın.
                const kutu = new THREE.Box3().setFromObject(disKap);
                const merkez = kutu.getCenter(new THREE.Vector3());
                const boyut = kutu.getSize(new THREE.Vector3());

                // Tüm mesh'leri TEK ve düz bir koordinat sistemine indir: her
                // mesh'in kendi dönüşümü geometrisine pişiriliyor, sonuç mm
                // cinsinden ve merkezi orijinde. Kenar korumalı eşleme tepe
                // noktalarını doğrudan oynattığı için bu şart — aksi hâlde her
                // mesh'in kendi yerel ekseninde ayrı hesap gerekirdi.
                const pisir = new THREE.Matrix4()
                    .makeScale(METRE_MM, METRE_MM, METRE_MM)
                    .multiply(new THREE.Matrix4().makeTranslation(-merkez.x, -merkez.y, -merkez.z));

                const sablonGrup = new THREE.Group();
                const xler = [];
                const yler = [];
                disKap.traverse((n) => {
                    if (!n.isMesh) return;
                    const geometri = n.geometry.clone();
                    geometri.applyMatrix4(new THREE.Matrix4().multiplyMatrices(pisir, n.matrixWorld));
                    const p = geometri.attributes.position;
                    for (let i = 0; i < p.count; i++) {
                        xler.push(p.getX(i));
                        yler.push(p.getY(i));
                    }
                    const mesh = new THREE.Mesh(geometri, n.material);
                    // Şablonun geometrisi PAYLAŞILIR: her model seçiminde yeniden
                    // yüklenmesin diye önbellekte duruyor, dispose edilmemeli.
                    mesh.userData.paylasilanGeometri = true;
                    sablonGrup.add(mesh);
                });

                const dogalGenislikMM = boyut.x * METRE_MM;
                const dogalYukseklikMM = boyut.y * METRE_MM;

                resolve({
                    sablonGrup,
                    dogalGenislikMM,
                    dogalYukseklikMM,
                    bantX: kenarBandiOlc(xler, dogalGenislikMM),
                    bantY: kenarBandiOlc(yler, dogalYukseklikMM)
                });
            },
            undefined,
            (hata) => reject(hata)
        );
    });

    // Başarısız yükleme önbellekte KALMAMALI: geçici bir ağ kesintisinde
    // reddedilmiş söz sonsuza dek saklanırsa, bağlantı düzelse bile o model
    // bir daha hiç açılmıyor — her denemede aynı eski hata dönüyor.
    soz.catch(() => onbellek.delete(anahtar));

    onbellek.set(anahtar, soz);
    return soz;
}

// Verilen .glb'den, istenen ölçüye getirilmiş, sahneye eklenmeye hazır bağımsız
// bir THREE.Group döndürür (Promise).
//
// kenarPayi: isteğe bağlı, modele özel elle ayar — { sol, sag, alt, ust } (mm).
// Verilen alanlar ölçülen bandın yerine geçer. Otomatik ölçüm bir modelde
// şaşarsa (ör. çerçevesi ortada bir hat taşıyan bir desen) models.js'ten tek
// satırla düzeltilebilsin diye var; normalde boş bırakılır.
export function glbKapakGrubuOlustur(url, genislikMM, yukseklikMM, icerikDonusuZ = 0, kenarPayi = null) {
    return glbSablonunuYukle(url, icerikDonusuZ).then((sablon) => {
        const { sablonGrup, dogalGenislikMM, dogalYukseklikMM } = sablon;
        const grup = sablonGrup.clone(true);
        grup.name = 'kapak';

        const bantX = bandiElleAyarla(sablon.bantX, dogalGenislikMM, kenarPayi?.sol, kenarPayi?.sag);
        const bantY = bandiElleAyarla(sablon.bantY, dogalYukseklikMM, kenarPayi?.alt, kenarPayi?.ust);

        const esleX = eksenEslemesiKur(bantX, dogalGenislikMM, genislikMM);
        const esleY = eksenEslemesiKur(bantY, dogalYukseklikMM, yukseklikMM);

        if (esleX || esleY) {
            // En az bir eksende kenar koruma var: bu örneğe ÖZEL geometri gerek,
            // çünkü tepe noktaları oynatılacak. clone(true) geometriyi paylaşır,
            // o yüzden burada açıkça kopyalanıyor ve "paylaşılan" işareti
            // kaldırılıyor — sahneden çıkarılınca dispose edilebilsin.
            grup.traverse((n) => {
                if (!n.isMesh) return;
                const geometri = n.geometry.clone();
                const p = geometri.attributes.position;
                for (let i = 0; i < p.count; i++) {
                    if (esleX) p.setX(i, esleX(p.getX(i)));
                    if (esleY) p.setY(i, esleY(p.getY(i)));
                }
                p.needsUpdate = true;
                geometri.computeBoundingBox();
                geometri.computeBoundingSphere();
                n.geometry = geometri;
                n.userData.paylasilanGeometri = false;
            });
            // Not: normaller yeniden hesaplanmıyor ve hesaplanmamalı. Kenar
            // bantları yalnızca ötelendiği için profilin normalleri zaten doğru;
            // aradaki alan düz olduğundan onun normali de değişmiyor.
        }

        // Kenar koruması uygulanamayan eksende (yivli/desenli modeller) eski
        // davranış sürüyor: modelin tamamı orantılı ölçekleniyor.
        if (!esleX && dogalGenislikMM > 0) grup.scale.x *= genislikMM / dogalGenislikMM;
        if (!esleY && dogalYukseklikMM > 0) grup.scale.y *= yukseklikMM / dogalYukseklikMM;

        return grup;
    });
}
