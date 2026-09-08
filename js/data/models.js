const GENEL_LIMITLER = {
    genislik: { min: 300, max: 900 },
    yukseklik: { min: 400, max: 1400 }
};

const GENEL_VARSAYILAN = { genislik: 450, yukseklik: 720, kalinlik: 18 };

function kapakModeli(id, kod) {
    return {
        id,
        isim: kod,
        kisaIsim: kod,
        aciklama: '3ds Max\'ten aktarılan gerçek kapak modeli.',
        gorselUrl: `assets/model-fotograflari/${kod}.jpeg`,
        gltfUrl: `assets/models/${kod}.glb`,
        kalinlikAyarlanabilir: false,
        varsayilan: { ...GENEL_VARSAYILAN },
        limitler: {
            genislik: { ...GENEL_LIMITLER.genislik },
            yukseklik: { ...GENEL_LIMITLER.yukseklik }
        }
    };
}

export const KAPAK_MODELLERI = [
    kapakModeli('kapak-3970', 'HK_006_001'),
    kapakModeli('hk-007-001', 'HK_007_001'),
    kapakModeli('hk-008-001', 'HK_008_001'),
    kapakModeli('hk-009-001', 'HK_009_001'),
    kapakModeli('hk-010-001', 'HK_010_001'),
    kapakModeli('hk-011-001', 'HK_011_001'),
    kapakModeli('hk-012-001', 'HK_012_001'),
    kapakModeli('hk-013-001', 'HK_013_001'),
    kapakModeli('hk-014-001', 'HK_014_001'),
    kapakModeli('hk-015-001', 'HK_015_001'),
    kapakModeli('hk-090-001', 'HK_090_001'),
    kapakModeli('hk-002-001', 'HK_002_001'),
    kapakModeli('hk-003-001', 'HK_003_001'),
    kapakModeli('hk-005-001', 'HK_005_001'),
    kapakModeli('hk-004-001', 'HK_004_001'),
    kapakModeli('hk-034-001', 'HK_034_001'),
    kapakModeli('hk-099-001', 'HK_099_001'),
    kapakModeli('hk-070-001', 'HK_070_001'),
    kapakModeli('hk-038-001', 'HK_038_001'),
    kapakModeli('hk-039-001', 'HK_039_001'),
    kapakModeli('hk-031-001', 'HK_031_001'),
    kapakModeli('hk-032-001', 'HK_032_001'),
    kapakModeli('hk-033-001', 'HK_033_001'),
    kapakModeli('hk-018-001', 'HK_018_001'),
    kapakModeli('hk-019-001', 'HK_019_001'),
    kapakModeli('hk-020-001', 'HK_020_001'),
    kapakModeli('hk-021-001', 'HK_021_001'),
    kapakModeli('hk-022-001', 'HK_022_001'),
    kapakModeli('hk-023-001', 'HK_023_001'),
    kapakModeli('hk-024-001', 'HK_024_001'),
    kapakModeli('hk-025-001', 'HK_025_001'),
    {
        id: 'hk-051-002',
        isim: 'HK_051_002',
        kisaIsim: 'HK_051_002',
        aciklama: '3ds Max\'ten aktarılan gerçek kapak modeli.',
        gorselUrl: 'assets/model-fotograflari/4021.webp',
        gltfUrl: 'assets/models/HK_051_002.glb',
        glbIcerikDonusu: Math.PI,
        kalinlikAyarlanabilir: false,
        varsayilan: { genislik: 450, yukseklik: 720, kalinlik: 18 },
        limitler: {
            genislik: { min: 250, max: 800 },
            yukseklik: { min: 400, max: 1400 }
        }
    }
];

export function idIleModelBul(id) {
    return KAPAK_MODELLERI.find(m => m.id === id) || null;
}
