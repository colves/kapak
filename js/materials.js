import * as THREE from 'three';

let lakeNoiseDokusu = null;

function lakeNoiseDokusuOlustur() {
    if (lakeNoiseDokusu) return lakeNoiseDokusu;

    const boyut = 128;
    const veri = new Uint8Array(boyut * boyut);
    let tohum = 0x51a7e;
    for (let i = 0; i < veri.length; i += 1) {
        // Sabit tohum sayesinde her açılışta aynı, çok ince lake portakallanması.
        tohum = (tohum * 1664525 + 1013904223) >>> 0;
        veri[i] = 88 + ((tohum >>> 24) % 80);
    }

    lakeNoiseDokusu = new THREE.DataTexture(veri, boyut, boyut, THREE.RedFormat);
    lakeNoiseDokusu.wrapS = THREE.RepeatWrapping;
    lakeNoiseDokusu.wrapT = THREE.RepeatWrapping;
    lakeNoiseDokusu.repeat.set(42, 68);
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
export function renkVerisindenMalzemeOlustur(renk, yuzey, dokuAktif = false) {
    const ayarlar = {
        color: renk.hex,
        // Parlaklığı YÜZEY belirliyor, renk değil: aynı ton mat da parlak da
        // olabiliyor. Renk yalnızca rengi taşıyor.
        roughness: yuzey ? yuzey.roughness : renk.roughness,
        metalness: renk.metalness,
        clearcoat: yuzey ? yuzey.clearcoat : renk.clearcoat,
        clearcoatRoughness: yuzey ? yuzey.clearcoatRoughness : (renk.clearcoat > 0 ? 0.15 : 0)
    };

    if (dokuAktif) {
        ayarlar.bumpMap = lakeNoiseDokusuOlustur();
        ayarlar.bumpScale = 0.15;
    }

    return new THREE.MeshPhysicalMaterial(ayarlar);
}

// Gruptaki tüm mesh'lere aynı malzemeyi uygular. .glb modelleri iç içe
// gruplardan oluşabildiği için özyinelemeli.
export function malzemeUygula(nesne, malzeme) {
    if (nesne.isMesh) {
        nesne.material = malzeme;
    }
    if (nesne.children) {
        nesne.children.forEach((c) => malzemeUygula(c, malzeme));
    }
}
