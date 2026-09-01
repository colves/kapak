// node js/kenarOlcekleme.test.js
//
// Kenar korumalı ölçeklemenin matematiğini doğrular. Bu dosyanın asıl işi,
// ileride yeni bir kapak modeli eklendiğinde davranışın sessizce bozulmamasını
// sağlamak: kural, "çerçeve bandının genişliği kapağın ölçüsünden bağımsızdır".
import assert from 'node:assert';
import { kenarBandiOlc, bandiElleAyarla, eksenEslemesiKur } from './kenarOlcekleme.js';

/* --- Bandın geometriden ölçülmesi --- */

// Çerçeveli bir kapağın X ekseni: kenarlarda profil tepe noktaları, ortada boşluk.
// (450 mm genişlik, iki yanda 93 mm çerçeve -> orta 264 mm boş.)
const cerceveliX = [-225, -220, -180, -140, -132, 132, 140, 180, 220, 225];
const bant = kenarBandiOlc(cerceveliX, 450);
assert.deepStrictEqual(bant, { alt: -132, ust: 132 }, 'çerçeveli kapakta bant sınırları ölçülmeli');

// Yivli bir kapak: tepe noktaları yüzeye yayılmış, düz orta alan yok.
const yivli = [];
for (let x = -185; x <= 185; x += 5) yivli.push(x);
assert.strictEqual(kenarBandiOlc(yivli, 370), null, 'yivli kapakta dilimleme devre dışı kalmalı');

// Sınırın hemen altındaki boşluk (doğal ölçünün %10\'undan küçük) bant sayılmamalı:
// profilin kendi içindeki aralık, çerçeve sınırı değil.
assert.strictEqual(kenarBandiOlc([-225, -20, 20, 225], 450), null, 'küçük boşluk bant sayılmamalı');
assert.deepStrictEqual(kenarBandiOlc([-225, -30, 30, 225], 450), { alt: -30, ust: 30 }, 'eşiği geçen boşluk bant olmalı');

// Asimetrik bant (3970/3976\'nın Y ekseni gerçekten böyle: alt 91.5, üst 111.5 mm).
assert.deepStrictEqual(kenarBandiOlc([-360, -268.5, 248.5, 360], 720), { alt: -268.5, ust: 248.5 });

/* --- Asıl kural: çerçeve genişliği ölçüden bağımsız --- */

for (const hedef of [300, 400, 450, 600, 750, 900]) {
    const esle = eksenEslemesiKur(bant, 450, hedef);
    assert.ok(esle, `${hedef} mm için eşleme kurulmalı`);
    // Sol kenar (-225) ve bandın sol sınırı (-132) arasındaki 93 mm hiç değişmemeli.
    const solKenar = esle(-225);
    const solBant = esle(-132);
    assert.strictEqual(Math.round((solBant - solKenar) * 10) / 10, 93,
        `sol çerçeve ${hedef} mm'de de 93 mm kalmalı`);
    const sagBant = esle(132);
    const sagKenar = esle(225);
    assert.strictEqual(Math.round((sagKenar - sagBant) * 10) / 10, 93,
        `sağ çerçeve ${hedef} mm'de de 93 mm kalmalı`);
    // Toplam ölçü istenen değere oturmalı.
    assert.strictEqual(Math.round((sagKenar - solKenar) * 10) / 10, hedef,
        `dış ölçü ${hedef} mm olmalı`);
    // Profilin içindeki her nokta kendi bandıyla birlikte RİJİT taşınmalı:
    // aralarındaki mesafeler korunmalı, yoksa profil ezilir.
    assert.strictEqual(Math.round((esle(-180) - esle(-220)) * 10) / 10, 40,
        `profil içi mesafe ${hedef} mm'de korunmalı`);
}

/* --- Süreklilik: bandın sınırında iki dal aynı sonucu vermeli --- */

const e = eksenEslemesiKur(bant, 450, 900);
// Bandın hemen içi ile sınırı arasında kopukluk olmamalı (orta bölge orantılı esner).
const sinir = e(-132);
const icerde = e(-131.999);
assert.ok(Math.abs(icerde - sinir) < 0.01, 'bant sınırında geometri kopmamalı');
// Orta bölgeye düşen bir nokta orantılı taşınmalı: merkez merkezde kalır.
assert.strictEqual(Math.round(e(0) * 10) / 10, 0, 'merkez merkezde kalmalı');

/* --- Güvenlik freni: bantlar sığmıyorsa dilimleme yapılmaz --- */

// 93 + 93 = 186 mm çerçeve, 200 mm'lik bir kapağa sığmaz (%90 sınırı = 180 mm).
assert.strictEqual(eksenEslemesiKur(bant, 450, 200), null, 'çerçeve sığmıyorsa düz ölçeklemeye dönülmeli');
// Mevcut modellerin en dar ölçüsünde (300 mm) fren devreye girmemeli.
assert.ok(eksenEslemesiKur(bant, 450, 300), '300 mm mevcut limit — dilimleme çalışmalı');
assert.strictEqual(eksenEslemesiKur(null, 450, 900), null, 'bant yoksa eşleme kurulmamalı');

/* --- Elle ayar ölçümün yerine geçer --- */

assert.deepStrictEqual(bandiElleAyarla(bant, 450, 60, 60), { alt: -165, ust: 165 },
    'elle verilen kenar payı bandı belirlemeli');
assert.deepStrictEqual(bandiElleAyarla(bant, 450, 60, undefined), { alt: -165, ust: 132 },
    'tek taraf verilirse diğeri ölçülen değerde kalmalı');
assert.deepStrictEqual(bandiElleAyarla(bant, 450, undefined, undefined), bant,
    'ayar verilmezse ölçülen bant kullanılmalı');
// Anlamsız ayar (bantlar çakışıyor) ölçülen değeri bozmamalı.
assert.deepStrictEqual(bandiElleAyarla(bant, 450, 300, 300), bant, 'geçersiz ayar yok sayılmalı');
// Ölçüm başarısızken elle ayar tek başına da bant kurabilmeli (yivli model kurtarma yolu).
assert.deepStrictEqual(bandiElleAyarla(null, 370, 40, 40), { alt: -145, ust: 145 },
    'ölçüm başarısızsa elle ayar bant kurabilmeli');

console.log('✔ kenarOlcekleme.test.js: tüm kontroller geçti.');
