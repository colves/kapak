// Bağımlılıksız, minimal statik dosya sunucusu (yalnızca yerel önizleme/geliştirme için).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 5500;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.hdr': 'application/octet-stream'
};

const sunucu = http.createServer((istek, yanit) => {
    let istenenYol = decodeURIComponent(istek.url.split('?')[0]);
    if (istenenYol === '/') istenenYol = '/index.html';

    const dosyaYolu = path.join(KOK, istenenYol);
    if (!dosyaYolu.startsWith(KOK)) {
        yanit.writeHead(403); yanit.end('Yasak'); return;
    }

    fs.readFile(dosyaYolu, (hata, icerik) => {
        if (hata) {
            yanit.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            yanit.end('Bulunamadı: ' + istenenYol);
            return;
        }
        const uzanti = path.extname(dosyaYolu).toLowerCase();
        yanit.writeHead(200, { 'Content-Type': MIME[uzanti] || 'application/octet-stream' });
        yanit.end(icerik);
    });
});

sunucu.listen(PORT, () => {
    console.log(`Kapak konfiguratoru http://localhost:${PORT} adresinde calisiyor`);
});
