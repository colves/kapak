import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const base = 'https://sahinkayamobilya.com/';
const routes = ['', 'renkler/', 'modeller/', 'iletisim/', 'konfigurator/'];
test('SEO addresses, structured data and local resources stay consistent', () => {
    const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
    const titles = new Set();
    for (const route of routes) {
        const html = fs.readFileSync(`${route}index.html`, 'utf8');
        assert.ok(html.includes(`rel="canonical" href="${base}${route}"`));
        assert.ok(sitemap.includes(`<loc>${base}${route}</loc>`));
        const title = html.match(/<title>(.*?)<\/title>/)[1];
        assert.ok(!titles.has(title)); titles.add(title);
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
