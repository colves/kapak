import * as THREE from 'three';

const dokuOnbellek = new Map();

function tohumdanRastgeleUretici(tohum) {
    let durum = tohum >>> 0;
    return function () {
        durum |= 0; durum = (durum + 0x6D2B79F5) | 0;
        let t = Math.imul(durum ^ (durum >>> 15), 1 | durum);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function metinTohumu(metin) {
    let h = 0;
    for (let i = 0; i < metin.length; i++) {
        h = (Math.imul(31, h) + metin.charCodeAt(i)) | 0;
    }
    return h;
}

function ahsapDokusuUret(renkId, hex) {
    if (dokuOnbellek.has(renkId)) return dokuOnbellek.get(renkId);

    const boyut = 512;
    const canvas = document.createElement('canvas');
    canvas.width = boyut;
    canvas.height = boyut;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = `#${hex.toString(16).padStart(6, '0')}`;
    ctx.fillRect(0, 0, boyut, boyut);

    const rastgele = tohumdanRastgeleUretici(metinTohumu(renkId));
    const temelRenk = new THREE.Color(hex);

    const cizgiSayisi = 40;
    for (let i = 0; i < cizgiSayisi; i++) {
        const y = (i / cizgiSayisi) * boyut + (rastgele() - 0.5) * 10;
        const tonFarki = (rastgele() - 0.5) * 0.18;
        const cizgiRenk = temelRenk.clone().offsetHSL(0, 0, tonFarki);
        ctx.strokeStyle = `#${cizgiRenk.getHexString()}`;
        ctx.globalAlpha = 0.35 + rastgele() * 0.3;
        ctx.lineWidth = 1 + rastgele() * 2.5;
        ctx.beginPath();
        const genlik = 6 + rastgele() * 10;
        const frekans = 0.008 + rastgele() * 0.01;
        const fazKaymasi = rastgele() * Math.PI * 2;
        ctx.moveTo(0, y);
        for (let x = 0; x <= boyut; x += 8) {
            ctx.lineTo(x, y + Math.sin(x * frekans + fazKaymasi) * genlik);
        }
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const doku = new THREE.CanvasTexture(canvas);
    doku.wrapS = THREE.RepeatWrapping;
    doku.wrapT = THREE.RepeatWrapping;
    doku.colorSpace = THREE.SRGBColorSpace;
    dokuOnbellek.set(renkId, doku);
    return doku;
}

export function renkVerisindenMalzemeOlustur(renk) {
    const malzeme = new THREE.MeshPhysicalMaterial({
        color: renk.hex,
        roughness: renk.roughness,
        metalness: renk.metalness,
        clearcoat: renk.clearcoat,
        clearcoatRoughness: renk.clearcoat > 0 ? 0.15 : 0
    });

    if (renk.dokuTipi === 'ahsap') {
        malzeme.map = ahsapDokusuUret(renk.id, renk.hex);
    }

    return malzeme;
}

export function malzemeUygula(nesne, malzeme) {
    if (nesne.isMesh) {
        nesne.material = malzeme;
    } else if (nesne.children) {
        nesne.children.forEach(c => malzemeUygula(c, malzeme));
    }
}
