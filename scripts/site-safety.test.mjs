import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const publicHtmlFiles = [
    'index.html', 'modeller/index.html', 'renkler/index.html',
    'iletisim/index.html', 'konfigurator/index.html', 'projeler/index.html',
    '404.html'
];

test('Local environment files stay ignored and untracked', () => {
    const ignore = fs.readFileSync('.gitignore', 'utf8');
    assert.match(ignore, /^\.env$/m);
    assert.match(ignore, /^\.env\.\*$/m);

    const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' });
    assert.doesNotMatch(tracked, /(^|\n)\.env(?:\.|\n)/);
});

test('Public HTML only references HTTPS external resources', () => {
    for (const file of publicHtmlFiles) {
        const html = fs.readFileSync(file, 'utf8');
        assert.doesNotMatch(html, /(?:src|href)="http:\/\//, `${file} has an insecure external resource`);
    }
});

test('Public HTML keeps ids unique and new-tab links isolated', () => {
    for (const file of publicHtmlFiles) {
        const html = fs.readFileSync(file, 'utf8');
        const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
        assert.equal(new Set(ids).size, ids.length, `${file} has duplicate ids`);

        for (const link of html.matchAll(/<a\b[^>]*\btarget="_blank"[^>]*>/g)) {
            assert.match(link[0], /\brel="[^"]*noopener[^"]*"/, `${file} has an unsafe new-tab link`);
        }
    }
});

test('Stylesheet assets resolve to files in the repository', () => {
    for (const file of fs.readdirSync('css').filter((name) => name.endsWith('.css'))) {
        const css = fs.readFileSync(`css/${file}`, 'utf8');
        for (const match of css.matchAll(/url\(['"]?([^)'"?#]+)[^)'"]*['"]?\)/g)) {
            if (/^(?:data:|https?:)/.test(match[1])) continue;
            const resource = new URL(match[1], `file:///${process.cwd().replaceAll('\\', '/')}/css/${file}`);
            assert.ok(fs.existsSync(decodeURIComponent(resource.pathname.slice(1))), `${file} references missing ${match[1]}`);
        }
    }
});

test('The configurator keeps a single neutral radial background', () => {
    const html = fs.readFileSync('konfigurator/index.html', 'utf8');
    const ui = fs.readFileSync('js/ui.js', 'utf8');
    const css = fs.readFileSync('css/base.css', 'utf8');

    assert.doesNotMatch(html, /btn-zemin|zemin-panel/);
    assert.match(ui, /zemin:\s*undefined/);
    assert.doesNotMatch(css, /data-zemin="[2-7]"/);
    assert.match(css, /\.konfigurator\s*\{[^}]*position:\s*relative;/s);
});

test('Legacy private pages stay unpublished and out of the sitemap', () => {
    const privatePages = ['admin.html', 'giris.html', 'hesabim.html', 'sepet.html', 'siparisler.html'];
    const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

    for (const file of privatePages) {
        assert.equal(fs.existsSync(file), false, `${file} must not be published`);
        assert.doesNotMatch(sitemap, new RegExp(file.replace('.', '\\.')), `${file} must not be indexed`);
    }
});
