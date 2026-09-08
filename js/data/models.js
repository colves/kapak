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
        glbEksenDuzeni: 'y-up',
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
    kapakModeli('hk-026-001', 'HK_026_001'),
    kapakModeli('hk-030-001', 'HK_030_001'),
    kapakModeli('hk-048-001', 'HK_048_001'),
    kapakModeli('hk-047-001', 'HK_047_001'),
    kapakModeli('hk-046-001', 'HK_046_001'),
    kapakModeli('hk-049-001', 'HK_049_001'),
    kapakModeli('hk-074-001', 'HK_074_001'),
    {
        id: 'hk-051-002',
        isim: 'HK_051_002',
        kisaIsim: 'HK_051_002',
        aciklama: '3ds Max\'ten aktarılan gerçek kapak modeli.',
        gorselUrl: 'assets/model-fotograflari/4021.webp',
        gltfUrl: 'assets/models/HK_051_002.glb',
        glbEksenDuzeni: 'y-up',
        glbIcerikDonusu: Math.PI,
        kalinlikAyarlanabilir: false,
        varsayilan: { genislik: 450, yukseklik: 720, kalinlik: 18 },
        limitler: {
            genislik: { min: 250, max: 800 },
            yukseklik: { min: 400, max: 1400 }
        }
    },
    kapakModeli('hk-052-001', 'HK_052_001'),
    kapakModeli('hk-053-001', 'HK_053_001'),
    kapakModeli('hk-054-001', 'HK_054_001'),
    kapakModeli('hk-075-001', 'HK_075_001'),
    kapakModeli('hk-056-003', 'HK_056_003'),
    kapakModeli('hk-057-001', 'HK_057_001'),
    kapakModeli('hk-041-001', 'HK_041_001'),
    kapakModeli('hk-043-001', 'HK_043_001'),
    kapakModeli('hk-044-001', 'HK_044_001'),
    kapakModeli('hk-045-001', 'HK_045_001'),
    kapakModeli('hk-068-002', 'HK_068_002'),
    kapakModeli('hk-069-001', 'HK_069_001'),
    kapakModeli('hk-073-001', 'HK_073_001'),
    kapakModeli('hk-071-001', 'HK_071_001'),
    kapakModeli('hk-072-001', 'HK_072_001'),
    kapakModeli('hk-068-004', 'HK_068_004'),
    kapakModeli('hk-064-001', 'HK_064_001'),
    kapakModeli('hk-065-001', 'HK_065_001'),
    kapakModeli('hk-058-001', 'HK_058_001'),
    kapakModeli('hk-059-001', 'HK_059_001'),
    kapakModeli('hk-080-001', 'HK_080_001'),
    kapakModeli('hk-081-001', 'HK_081_001'),
    kapakModeli('hk-082-001', 'HK_082_001')
];

export function idIleModelBul(id) {
    return KAPAK_MODELLERI.find(m => m.id === id) || null;
}
