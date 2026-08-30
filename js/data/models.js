export const KAPAK_MODELLERI = [
    {
        // Gerçek 3ds Max modelinden (.glb) içe aktarılmış ilk gerçek kapak.
        id: 'hk-012-001',
        isim: 'HK_012_001 (3976)',
        // Model şeridi dar bir yatay kontrol — orada tam ad yerine bu kısa
        // etiket görünür; tam ad durum çubuğunda ve aria-label'da kalır.
        kisaIsim: 'HK_012_001',
        aciklama: '3ds Max\'ten aktarılan gerçek kapak modeli.',
        gorselUrl: null,
        gltfUrl: 'assets/models/3976.glb',
        kalinlikAyarlanabilir: false,
        varsayilan: { genislik: 450, yukseklik: 720, kalinlik: 18 },
        limitler: {
            genislik: { min: 300, max: 900 },
            yukseklik: { min: 400, max: 1400 }
        }
    },
    {
        id: 'hk-051-002',
        isim: 'HK_051_002 (4021)',
        kisaIsim: 'HK_051_002',
        aciklama: '3ds Max\'ten aktarılan gerçek kapak modeli.',
        gorselUrl: null,
        gltfUrl: 'assets/models/4021.glb',
        // Kulp/desen orijinal export'ta sol üstte çıkıyordu, sağ alta gelmesi
        // istendi — modelin tamamı kendi düzleminde 180° döndürülüyor.
        glbIcerikDonusu: Math.PI,
        kalinlikAyarlanabilir: false,
        // Modelin kendi GLB geometrisi 370×711mm'de ("doğal" boyut) ama tüm
        // kapaklar açılışta AYNI 450×720 varsayılanla gelsin diye buradaki
        // hedef ölçü genişletildi — glbYukleyici.js modeli bu hedefe göre
        // ölçeklendirip (X/Y ayrı ayrı) yüklüyor, limitler içinde (450≤800,
        // 720≤1400) olduğu için hiçbir sınırı zorlamıyor.
        varsayilan: { genislik: 450, yukseklik: 720, kalinlik: 18 },
        limitler: {
            genislik: { min: 250, max: 800 },
            yukseklik: { min: 400, max: 1400 }
        }
    },
    {
        // İsim/kod bilgisi henüz verilmedi — dosya adına göre geçici etiket.
        id: 'kapak-3970',
        isim: 'Kapak Modeli (3970)',
        kisaIsim: 'Model 3970',
        aciklama: '3ds Max\'ten aktarılan gerçek kapak modeli.',
        gorselUrl: null,
        gltfUrl: 'assets/models/3970.glb',
        kalinlikAyarlanabilir: false,
        varsayilan: { genislik: 450, yukseklik: 720, kalinlik: 18 },
        limitler: {
            genislik: { min: 300, max: 900 },
            yukseklik: { min: 400, max: 1400 }
        }
    }
];

export function idIleModelBul(id) {
    return KAPAK_MODELLERI.find(m => m.id === id) || null;
}
