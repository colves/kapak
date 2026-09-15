import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const base = 'https://sahinkayamobilya.com/';
const routes = ['', 'renkler/', 'modeller/', 'iletisim/', 'konfigurator/', 'katalog/'];
test('Old homepage addresses lose #tepe and index.html without losing query data', () => {
    const script = fs.readFileSync('js/ana-sayfa-adresi.js', 'utf8');
    for (const [pathname, search, hash, expected] of [
        ['/', '', '#tepe', '/'],
        ['/index.html', '', '#tepe', '/'],
        ['/index.html', '?utm_source=qr', '', '/?utm_source=qr'],
        ['/', '', '#other', null],
        ['/renkler/', '', '#seri-7000', null]
    ]) {
        let result = null;
        const state = { existing: true };
        vm.runInNewContext(script, { window: {
            location: { pathname, search, hash },
            history: { state, replaceState: (value, unused, url) => {
                assert.equal(value, state); result = url;
            } },
            addEventListener() {}
        } });
        assert.equal(result, expected);
    }
});
test('SEO addresses, structured data and local resources stay consistent', () => {
    const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
    const titles = new Set();
    for (const route of routes) {
        const html = fs.readFileSync(`${route}index.html`, 'utf8');
        assert.ok(html.includes(`rel="canonical" href="${base}${route}"`));
        assert.ok(sitemap.includes(`<loc>${base}${route}</loc>`));
        assert.match(sitemap, new RegExp(`<loc>${base}${route.replaceAll('/', '\\/')}</loc><lastmod>\\d{4}-\\d{2}-\\d{2}</lastmod>`));
        const title = html.match(/<title>(.*?)<\/title>/)[1];
        assert.ok(!titles.has(title)); titles.add(title);
        assert.match(html, /<meta name="description" content="[^"]+">/);
        assert.match(html, new RegExp(`<meta property="og:url" content="${base}${route}">`));
        assert.match(html, /<meta property="og:image" content="https:\/\/sahinkayamobilya\.com\/[^\"]+">/);
        assert.match(html, /<meta property="og:image:alt" content="[^"]+">/);
        assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
        assert.match(html, /<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/);
        for (const image of html.matchAll(/<img\b[^>]*>/g)) {
            assert.match(image[0], /\balt="[^"]*"/, `Missing alt attribute in ${route || 'home'}`);
        }
        assert.ok(!/href="(?:[^"/]+\.html|#tepe)"/.test(html));
        for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
            assert.equal(JSON.parse(match[1])['@context'], 'https://schema.org');
        }
        for (const [, value] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
            const url = new URL(value, base);
            if (url.origin !== new URL(base).origin) continue;
            let local = decodeURIComponent(url.pathname).slice(1);
            if (!local || local.endsWith('/')) local += 'index.html';
            assert.ok(fs.existsSync(local), `Missing local resource: ${local}`);
        }
    }
    assert.ok(fs.readFileSync('robots.txt', 'utf8').includes(`Sitemap: ${base}sitemap.xml`));
    assert.equal(fs.readFileSync('CNAME', 'utf8').trim(), 'sahinkayamobilya.com');
});

test('Homepage describes the local showroom and product paths', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert.match(html, /Sakarya’da ölçüye özel lake kapak üretimi/);
    assert.match(html, /"@type": "FurnitureStore"/);
    assert.match(html, /"addressLocality": "Adapazarı"/);
    assert.match(html, /href="\/modeller\/"/);
    assert.match(html, /href="\/renkler\/"/);
    assert.match(html, /href="\/konfigurator\/"/);
});

test('The not-found page stays branded and out of search results', () => {
    const html = fs.readFileSync('404.html', 'utf8');
    assert.match(html, /<meta name="robots" content="noindex, follow">/);
    assert.match(html, /<h1>Aradığınız sayfayı bulamadık\.?<\/h1>/);
    assert.match(html, /href="\/modeller\/"/);
    assert.match(html, /href="\/konfigurator\/"/);
});

test('Legacy redirects preserve shared selections and fragments', () => {
    for (const [old, route] of Object.entries({ 'renkler.html':'renkler/', 'modeller.html':'modeller/', 'iletisim.html':'iletisim/', 'configurator.html':'konfigurator/' })) {
        const html = fs.readFileSync(old, 'utf8');
        let target;
        vm.runInNewContext(html.match(/<script>(.*?)<\/script>/s)[1], {
            location: { search: '?m=hk-012-001&r=7044', hash: '#example', replace: value => { target = value; } }
        });
        assert.equal(target, `/${route}?m=hk-012-001&r=7044#example`);
    }
});
