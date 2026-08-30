import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// glTF birimi her zaman metredir (spesifikasyon gereği); sahnemiz milimetre
// cinsinden çalışıyor (mevcut procedural geometriyle tutarlı olsun diye).
const METRE_MM = 1000;

const yukleyici = new GLTFLoader();
const onbellek = new Map(); // url -> Promise<{ sablonGrup, dogalGenislikMM, dogalYukseklikMM }>

function glbSablonunuYukle(url) {
    if (onbellek.has(url)) return onbellek.get(url);

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
                // ekseni dünya +Y'ye (dikey) oturuyor. Genişlik ekseni bu
                // sırada aynalanıyor (-X) ama simetrik bir kapak için görsel
                // fark yaratmıyor.
                kaynakSahne.rotateY(Math.PI);
                kaynakSahne.rotateX(-Math.PI / 2);
                kaynakSahne.updateMatrixWorld(true);

                // 3ds Max/Babylon exporter'dan gelen modelin pivotu genelde tam
                // merkezde olmuyor — sınırlayıcı kutuyu hesaplayıp merkezi orijine
                // taşıyoruz ki hangi dosya gelirse gelsin kapak sahnede ortalansın.
                const kutu = new THREE.Box3().setFromObject(kaynakSahne);
                const merkez = kutu.getCenter(new THREE.Vector3());
                const boyut = kutu.getSize(new THREE.Vector3());
                kaynakSahne.position.sub(merkez);

                // Paylaşılan (önbelleğe alınmış) geometriyi işaretle: bu geometri
                // her model değişiminde dispose edilmemeli, sadece önbellek tamamen
                // atıldığında serbest bırakılmalı — aksi halde ikinci seçimde
                // model bozuk/boş görünür.
                kaynakSahne.traverse((n) => {
                    if (n.isMesh) n.userData.paylasilanGeometri = true;
                });

                const sablonGrup = new THREE.Group();
                sablonGrup.add(kaynakSahne);
                sablonGrup.scale.setScalar(METRE_MM);

                resolve({
                    sablonGrup,
                    dogalGenislikMM: boyut.x * METRE_MM,
                    dogalYukseklikMM: boyut.y * METRE_MM
                });
            },
            undefined,
            (hata) => reject(hata)
        );
    });

    onbellek.set(url, soz);
    return soz;
}

// Verilen .glb'den, istenen genişlik/yükseklik oranına ölçeklenmiş, sahneye
// eklenmeye hazır bağımsız bir THREE.Group döndürür (Promise).
// icerikDonusuZ: bazı modellerde kulp/desen gibi simetrik olmayan bir detay
// yanlış köşede çıkabiliyor (3ds Max'teki orijinal modelleme yönüne bağlı) —
// bu, o modele özel, ön yüz düzleminde (kameraya bakan eksende) ek bir
// döndürme uygulamak için var (örn. Math.PI = 180°, deseni çapraz köşeye taşır).
export function glbKapakGrubuOlustur(url, genislikMM, yukseklikMM, icerikDonusuZ = 0) {
    return glbSablonunuYukle(url).then(({ sablonGrup, dogalGenislikMM, dogalYukseklikMM }) => {
        const grup = sablonGrup.clone(true);
        grup.name = 'kapak';
        const genislikOlcegi = dogalGenislikMM > 0 ? genislikMM / dogalGenislikMM : 1;
        const yukseklikOlcegi = dogalYukseklikMM > 0 ? yukseklikMM / dogalYukseklikMM : 1;
        grup.scale.x *= genislikOlcegi;
        grup.scale.y *= yukseklikOlcegi;
        if (icerikDonusuZ) grup.rotateZ(icerikDonusuZ);
        return grup;
    });
}
