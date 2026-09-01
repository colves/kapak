import * as THREE from 'three';

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
export function renkVerisindenMalzemeOlustur(renk, yuzey) {
    return new THREE.MeshPhysicalMaterial({
        color: renk.hex,
        // Parlaklığı YÜZEY belirliyor, renk değil: aynı ton mat da parlak da
        // olabiliyor. Renk yalnızca rengi taşıyor.
        roughness: yuzey ? yuzey.roughness : renk.roughness,
        metalness: renk.metalness,
        clearcoat: yuzey ? yuzey.clearcoat : renk.clearcoat,
        clearcoatRoughness: yuzey ? yuzey.clearcoatRoughness : (renk.clearcoat > 0 ? 0.15 : 0)
    });
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
