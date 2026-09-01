// Lake yüzey bitişleri.
//
// Aynı RAL tonu, farklı parlaklıkta bambaşka görünür: mat bir yüzey ışığı
// dağıtıp rengi "düz" gösterirken, parlak yüzey ortamı ayna gibi yansıtır ve
// aynı ton daha koyu/derin okunur. Bu yüzden yüzey, renkten AYRI bir karar
// olarak sunuluyor.
//
// Değerler three.js MeshPhysicalMaterial'a doğrudan giriyor:
//   roughness          — 0 = ayna, 1 = tamamen dağıtıcı.
//   clearcoat          — üstteki şeffaf cila katmanının gücü (0–1).
//   clearcoatRoughness — o cilanın kendi pürüzlülüğü; parlakta çok düşük.
//
// Sayılar sektördeki parlaklık ölçümlerinin (60° gloss birimi) görsel
// karşılığına göre seçildi: mat ~10–20 GU, yarı parlak ~40–60 GU,
// parlak ~85+ GU.
export const YUZEYLER = [
    {
        id: 'mat',
        isim: 'Mat',
        aciklama: 'Işığı dağıtır, parmak izi göstermez',
        roughness: 0.62,
        clearcoat: 0.15,
        clearcoatRoughness: 0.45
    },
    {
        id: 'yari-parlak',
        isim: 'Yarı Parlak',
        aciklama: 'Hafif cila; en çok tercih edilen',
        roughness: 0.35,
        clearcoat: 0.5,
        clearcoatRoughness: 0.15,
        varsayilan: true
    },
    {
        id: 'parlak',
        isim: 'Parlak',
        aciklama: 'Yansımalı cila, rengi derinleştirir',
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.03
    }
];

export function varsayilanYuzey() {
    return YUZEYLER.find((y) => y.varsayilan) || YUZEYLER[0];
}

export function idIleYuzeyBul(id) {
    return YUZEYLER.find((y) => y.id === id) || null;
}
