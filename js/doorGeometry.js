import * as THREE from 'three';

const CERCEVE_GENISLIK = 60; // mm, çerçeve/çıta payı (her kenardan)
const PANEL_FARK = 8;        // mm, çerçeve kalınlığı ile iç panelin gömülme derinliği farkı
const PANEL_MIN_KALINLIK = 6; // mm, iç panelin inemeyeceği alt sınır

function duzKapakGeometrisiOlustur(genislikMM, yukseklikMM, kalinlikMM) {
    return new THREE.BoxGeometry(genislikMM, yukseklikMM, kalinlikMM);
}

function citaliKapakGrubuOlustur(genislikMM, yukseklikMM, cerceveKalinlikMM) {
    const grup = new THREE.Group();

    const panelKalinlikMM = Math.max(cerceveKalinlikMM - PANEL_FARK, PANEL_MIN_KALINLIK);

    const icGenislik = Math.max(genislikMM - CERCEVE_GENISLIK * 2, 10);
    const icYukseklik = Math.max(yukseklikMM - CERCEVE_GENISLIK * 2, 10);

    const disSekil = new THREE.Shape();
    disSekil.moveTo(-genislikMM / 2, -yukseklikMM / 2);
    disSekil.lineTo(genislikMM / 2, -yukseklikMM / 2);
    disSekil.lineTo(genislikMM / 2, yukseklikMM / 2);
    disSekil.lineTo(-genislikMM / 2, yukseklikMM / 2);
    disSekil.closePath();

    const delik = new THREE.Path();
    delik.moveTo(-icGenislik / 2, -icYukseklik / 2);
    delik.lineTo(icGenislik / 2, -icYukseklik / 2);
    delik.lineTo(icGenislik / 2, icYukseklik / 2);
    delik.lineTo(-icGenislik / 2, icYukseklik / 2);
    delik.closePath();
    disSekil.holes.push(delik);

    const cerceveGeometri = new THREE.ExtrudeGeometry(disSekil, {
        depth: cerceveKalinlikMM,
        bevelEnabled: false,
        curveSegments: 1
    });
    // ExtrudeGeometry z=0..depth arası üretir; merkezi z=0 olacak şekilde kaydır.
    cerceveGeometri.translate(0, 0, -cerceveKalinlikMM / 2);

    const cerceveMesh = new THREE.Mesh(cerceveGeometri);
    cerceveMesh.name = 'cerceve';
    grup.add(cerceveMesh);

    const panelGeometri = new THREE.BoxGeometry(icGenislik, icYukseklik, panelKalinlikMM);
    const panelMesh = new THREE.Mesh(panelGeometri);
    panelMesh.name = 'panel';
    // Panel arkadan çerçeveyle hizalı, önden (cerceveKalinlikMM - panelKalinlikMM) kadar gömülü.
    const panelZ = -cerceveKalinlikMM / 2 + panelKalinlikMM / 2;
    panelMesh.position.set(0, 0, panelZ);
    grup.add(panelMesh);

    return grup;
}

export function kapakGrubuOlustur(modelId, genislikMM, yukseklikMM, kalinlikMM) {
    if (modelId === 'citali') {
        const grup = citaliKapakGrubuOlustur(genislikMM, yukseklikMM, kalinlikMM);
        grup.name = 'kapak';
        return grup;
    }

    const grup = new THREE.Group();
    grup.name = 'kapak';
    const geometri = duzKapakGeometrisiOlustur(genislikMM, yukseklikMM, kalinlikMM);
    const mesh = new THREE.Mesh(geometri);
    mesh.name = 'govde';
    grup.add(mesh);
    return grup;
}

export function kapakGeometrisiTemizle(nesne) {
    if (!nesne) return;
    // .glb'den yüklenip önbelleğe alınmış geometriler paylaşılır (bkz. glbYukleyici.js);
    // bunları dispose etmek, aynı modelin bir sonraki seçiminde bozuk/boş görünmesine yol açar.
    if (nesne.geometry && !nesne.userData?.paylasilanGeometri) nesne.geometry.dispose();
    if (nesne.children && nesne.children.length) {
        nesne.children.forEach(kapakGeometrisiTemizle);
    }
}
