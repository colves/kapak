import * as THREE from 'three';

let lakeNoiseDokusu = null;

function lakeNoiseDokusuOlustur() {
    if (lakeNoiseDokusu) return lakeNoiseDokusu;

    const boyut = 64;
    const veri = new Uint8Array(boyut * boyut * 4);
    let tohum = 0x51a7e;
    for (let i = 0; i < boyut * boyut; i += 1) {
        tohum = (tohum * 1664525 + 1013904223) >>> 0;
        const ton = 132 + ((tohum >>> 24) % 124);
        veri[i * 4] = ton;
        veri[i * 4 + 1] = ton;
        veri[i * 4 + 2] = ton;
        veri[i * 4 + 3] = 255;
    }

    // Tek-piksellik rastgelelik uzaktan bakıldığında ortalamaya karışıp yok
    // oluyordu. İki yumuşatma turu Corona Noise'a daha yakın, kümeli bir
    // portakal kabuğu yüzeyi üretir.
    for (let tur = 0; tur < 2; tur += 1) {
        const onceki = veri.slice();
        for (let y = 0; y < boyut; y += 1) {
            for (let x = 0; x < boyut; x += 1) {
                let toplam = 0;
                for (let dy = -1; dy <= 1; dy += 1) {
                    for (let dx = -1; dx <= 1; dx += 1) {
                        const px = (x + dx + boyut) % boyut;
                        const py = (y + dy + boyut) % boyut;
                        toplam += onceki[(py * boyut + px) * 4];
                    }
                }
                const ton = Math.round(toplam / 9);
                const i = (y * boyut + x) * 4;
                veri[i] = ton;
                veri[i + 1] = ton;
                veri[i + 2] = ton;
            }
        }
    }

    lakeNoiseDokusu = new THREE.DataTexture(veri, boyut, boyut, THREE.RGBAFormat);
    lakeNoiseDokusu.wrapS = THREE.RepeatWrapping;
    lakeNoiseDokusu.wrapT = THREE.RepeatWrapping;
    lakeNoiseDokusu.repeat.set(5, 8);
    lakeNoiseDokusu.minFilter = THREE.LinearMipmapLinearFilter;
    lakeNoiseDokusu.magFilter = THREE.LinearFilter;
    lakeNoiseDokusu.colorSpace = THREE.NoColorSpace;
    lakeNoiseDokusu.needsUpdate = true;
    return lakeNoiseDokusu;
}

// Katalogdaki her renk lake: yarı mat bir taban (roughness 0.35) üzerine ince
// bir cila katmanı (clearcoat). Değerler colors.js'te renk başına tutuluyor,
// burada sabitlenmiyor — ileride farklı bir parlaklık istenirse tek yerden
// değişsin.
//
// Not: burada bir zamanlar ahşap damarı çizen bir canvas doku üreteci vardı.
// Üretim yalnızca lake kapak yaptığı için hiçbir renk onu tetiklemiyordu;
// hiç çalışmayan kod olarak kaldırıldı.
// yuzey: yuzeyler.js'ten gelen bitiş (mat / yarı parlak / parlak). Verilmezse
// rengin kendi değerleri kullanılır — böylece yüzey seçimi olmayan bir çağrı
// (ör. eski bir kod yolu) yine de çalışır.
export function renkVerisindenMalzemeOlustur(renk, yuzey, dokuAktif = false, dokuYogunlugu = 35) {
    const ayarlar = {
        color: renk.hex,
        // Parlaklığı YÜZEY belirliyor, renk değil: aynı ton mat da parlak da
        // olabiliyor. Renk yalnızca rengi taşıyor.
        roughness: yuzey ? yuzey.roughness : renk.roughness,
        metalness: renk.metalness,
        clearcoat: yuzey ? yuzey.clearcoat : renk.clearcoat,
        clearcoatRoughness: yuzey ? yuzey.clearcoatRoughness : (renk.clearcoat > 0 ? 0.15 : 0)
    };

    const dokuOrani = Math.min(1, Math.max(0, Number(dokuYogunlugu) || 0) / 100);
    if (dokuAktif && dokuOrani > 0) {
        ayarlar.bumpMap = lakeNoiseDokusuOlustur();
        ayarlar.bumpScale = 1.1 * dokuOrani;
        ayarlar.roughness = Math.min(0.72, ayarlar.roughness * (1 + (0.18 * dokuOrani)));
    }

    return new THREE.MeshPhysicalMaterial(ayarlar);
}

function camMalzemesiOlustur() {
    return new THREE.MeshPhysicalMaterial({
        color: 0xdfe7e5,
        roughness: 0.16,
        metalness: 0,
        transmission: 0.9,
        thickness: 6,
        ior: 1.52,
        transparent: true,
        opacity: 0.42,
        clearcoat: 0.35,
        clearcoatRoughness: 0.08,
        side: THREE.DoubleSide
    });
}

// Gruptaki tüm mesh'lere aynı malzemeyi uygular. .glb modelleri iç içe
// gruplardan oluşabildiği için özyinelemeli.
export function malzemeUygula(nesne, malzeme, camMalzemesi = null) {
    if (nesne.isMesh) {
        const camMi = /cam|glass|clear/.test(nesne.userData?.orijinalMalzemeAdi || '');
        nesne.material = camMi ? (camMalzemesi || camMalzemesiOlustur()) : malzeme;
        if (camMi) camMalzemesi = nesne.material;
    }
    if (nesne.children) {
        nesne.children.forEach((c) => {
            camMalzemesi = malzemeUygula(c, malzeme, camMalzemesi);
        });
    }
    return camMalzemesi;
}
