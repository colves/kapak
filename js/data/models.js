const GENEL_LIMITLER = {
    genislik: { min: 300, max: 900 },
    yukseklik: { min: 400, max: 1400 }
};

const LISTE_SONU_MODELLERI = new Set([
    'acili-kapak', 'alttan-kulplu', 'camli-1', 'camli-2', 'camli-3', 'camli-4',
    'ek-kapak', 'gardrop-1', 'gardrop-2', 'gardrop-3', 'gardrop-4'
]);

const GENEL_VARSAYILAN = { genislik: 450, yukseklik: 720, kalinlik: 18 };

const VARYANTLI_URETIM_KODLARI = new Set(['HK_068_002', 'HK_068_004']);

function mKodunuBul(uretimKodu) {
    const eslesme = /^HK_(\d{3})_(\d{3})$/.exec(uretimKodu);
    if (!eslesme) throw new Error(`Geçersiz HK üretim kodu: ${uretimKodu}`);

    const [, anaKod, varyant] = eslesme;
    return VARYANTLI_URETIM_KODLARI.has(uretimKodu)
        ? `M${anaKod}-${varyant.slice(-2)}`
        : `M${anaKod}`;
}

function kapakModeli(id, kod) {
    const modelKodu = mKodunuBul(kod);
    return {
        id,
        isim: modelKodu,
        kisaIsim: modelKodu,
        uretimKodu: kod,
        aciklama: '3ds Max\'ten aktarılan gerçek kapak modeli.',
        gorselUrl: `assets/model-fotograflari/${kod}.webp`,
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

function ozelModel(id, isim, dosya, varsayilan = GENEL_VARSAYILAN, gorselUrl = null, glbIcerikDonusu = 0) {
    return {
        id,
        isim,
        kisaIsim: isim,
        uretimKodu: isim,
        aciklama: '3ds Max kaynak dosyasından aktarılan kapak modeli.',
        gorselUrl,
        gltfUrl: `assets/models/${dosya}.glb`,
        glbIcerikDonusu,
        glbEksenDuzeni: 'y-up',
        kalinlikAyarlanabilir: false,
        varsayilan: { ...varsayilan },
        limitler: {
            genislik: { min: Math.max(200, Math.round(varsayilan.genislik * 0.6)), max: Math.round(varsayilan.genislik * 1.4) },
            yukseklik: { min: Math.max(300, Math.round(varsayilan.yukseklik * 0.6)), max: Math.round(varsayilan.yukseklik * 1.4) }
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
        isim: 'M051',
        kisaIsim: 'M051',
        uretimKodu: 'HK_051_002',
        aciklama: '3ds Max\'ten aktarılan gerçek kapak modeli.',
        gorselUrl: 'assets/model-fotograflari/HK_051_002.webp',
        gltfUrl: 'assets/models/HK_051_002.glb',
        glbEksenDuzeni: 'y-up',
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
    kapakModeli('hk-082-001', 'HK_082_001'),
    ozelModel('acili-kapak', 'açılı kapak', 'acili-kapak'),
    ozelModel('alttan-kulplu', 'alttankulplu', 'alttankulplu', GENEL_VARSAYILAN, null, Math.PI),
    ozelModel('camli-1', 'camlı1', 'camli1', GENEL_VARSAYILAN, 'assets/model-fotograflari/camli1.webp'),
    ozelModel('camli-2', 'camlı2', 'camli2', GENEL_VARSAYILAN, 'assets/model-fotograflari/camli2.webp'),
    ozelModel('camli-3', 'camlı3', 'camli3', GENEL_VARSAYILAN, 'assets/model-fotograflari/camli3.webp'),
    ozelModel('camli-4', 'camlı4', 'camli4', GENEL_VARSAYILAN, 'assets/model-fotograflari/camli4.webp'),
    ozelModel('ek-kapak', 'ekkapak', 'ekkapak', { genislik: 446, yukseklik: 711, kalinlik: 20 }, 'assets/model-fotograflari/ekkapak.webp'),
    ozelModel('gardrop-1', 'gardrop 1', 'gardrop-1', { genislik: 1200, yukseklik: 2200, kalinlik: 20 }),
    ozelModel('gardrop-2', 'gardrop 2', 'gardrop-2', { genislik: 1204, yukseklik: 2200, kalinlik: 20 }),
    ozelModel('gardrop-3', 'gardrop 3', 'gardrop-3', { genislik: 1210, yukseklik: 1800, kalinlik: 20 }),
    ozelModel('gardrop-4', 'gardrop 4', 'gardrop-4', { genislik: 1206, yukseklik: 1800, kalinlik: 20 }),
    ozelModel('yandan-kulplu', 'yandankulplu', 'yandankulplu', GENEL_VARSAYILAN, 'assets/model-fotograflari/yankulplu.webp')
].sort((a, b) => Number(LISTE_SONU_MODELLERI.has(a.id)) - Number(LISTE_SONU_MODELLERI.has(b.id))
    || a.isim.localeCompare(b.isim, 'tr', { numeric: true }));

export function idIleModelBul(id) {
    return KAPAK_MODELLERI.find(m => m.id === id) || null;
}
