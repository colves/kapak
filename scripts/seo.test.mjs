import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const base = 'https://sahinkayamobilya.com/';
const routes = ['', 'renkler/', 'modeller/', 'iletisim/', 'konfigurator/', 'projeler/'];
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

test('Homepage exposes local showroom data and product paths', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert.match(html, /"@type": "FurnitureStore"/);
    assert.match(html, /"addressLocality": "Adapazarı"/);
    assert.match(html, /href="\/modeller\/"/);
    assert.match(html, /href="\/renkler\/"/);
    assert.match(html, /href="\/konfigurator\/"/);
});

test('Projects page uses the curated completed-project photography', () => {
    const html = fs.readFileSync('projeler/index.html', 'utf8');
    const projects = [
        ['Sakarya Beyaz Lake Mutfak', 'sakarya-beyaz-lake-mutfak-', 3],
        ['Sakarya Aynalı Lake Vitrin', 'sakarya-aynali-lake-vitrin-', 4],
        ['Sakarya Klasik Çocuk Odası', 'sakarya-klasik-cocuk-odasi-', 7]
    ];

    for (const [name, prefix, expectedCount] of projects) {
        assert.ok(html.includes(name), `Missing project: ${name}`);
        assert.equal(html.match(new RegExp(`src="assets/projeler/${prefix}`, 'g'))?.length, expectedCount);
    }
    assert.doesNotMatch(html, /assets\/renderlar|\/katalog\//);
});

test('Projects lead site navigation and describe only completed work', () => {
    for (const route of ['', 'renkler/', 'modeller/', 'projeler/', 'iletisim/', 'konfigurator/']) {
        const html = fs.readFileSync(`${route}index.html`, 'utf8');
        const nav = html.match(/<nav class="menu"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
        assert.ok(nav, `Missing primary navigation: ${route}`);
        assert.ok(nav.indexOf('href="/projeler/"') < nav.indexOf('href="/modeller/"'), `Projects should come before models: ${route}`);
        assert.match(nav, /class="[^"]*one-cikan[^"]*" href="\/projeler\/"/);
    }
    const projects = fs.readFileSync('projeler/index.html', 'utf8');
    for (const term of ['mutfak', 'gardırop', 'çalışma alanı']) {
        assert.ok(projects.toLocaleLowerCase('tr').includes(term), `Missing real project category: ${term}`);
    }
});

test('Mobile menu loads independently of the 3D page modules', () => {
    for (const route of ['', 'renkler/', 'modeller/', 'projeler/', 'iletisim/']) {
        const html = fs.readFileSync(`${route}index.html`, 'utf8');
        assert.match(html, /<script src="js\/mobilMenu\.js" defer><\/script>/, `Missing standalone mobile menu: ${route}`);
    }
    const listeners = {};
    const classes = new Set();
    const button = {
        addEventListener: (type, handler) => { listeners.button = handler; },
        setAttribute: (name, value) => { listeners.expanded = value; }
    };
    const menu = {
        classList: {
            contains: (name) => classes.has(name),
            toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name)
        },
        addEventListener: (type, handler) => { listeners.menu = handler; }
    };
    const document = {
        getElementById: (id) => id === 'menu-dugmesi' ? button : menu,
        addEventListener: (type, handler) => { listeners.keydown = handler; }
    };
    vm.runInNewContext(fs.readFileSync('js/mobilMenu.js', 'utf8'), { document });
    listeners.button();
    assert.equal(listeners.expanded, 'true');
    assert.ok(classes.has('acik'));
    listeners.menu({ target: { closest: () => ({ tagName: 'A' }) } });
    assert.equal(listeners.expanded, 'false');
    listeners.button();
    listeners.keydown({ key: 'Escape' });
    assert.equal(listeners.expanded, 'false');
});

test('Primary pages keep contact prominent and the showroom map resolvable', () => {
    for (const route of ['', 'renkler/', 'modeller/', 'projeler/', 'iletisim/', 'konfigurator/']) {
        const html = fs.readFileSync(`${route}index.html`, 'utf8');
        assert.match(html, /class="iletisim-link(?: etkin)?" href="\/iletisim\/"/);
    }

    const contact = fs.readFileSync('iletisim/index.html', 'utf8');
    const script = fs.readFileSync('js/iletisim.js', 'utf8');
    assert.match(contact, /href="https:\/\/maps\.app\.goo\.gl\/wLMP4kPqc7LdECur8"/);
    assert.match(contact, /data-harita-enlem="40\.7886866" data-harita-boylam="30\.4225954"/);
    assert.match(contact, /"hasMap": "https:\/\/maps\.app\.goo\.gl\/wLMP4kPqc7LdECur8"/);
    assert.match(script, /maps\.google\.com\/maps\?q=/);
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
