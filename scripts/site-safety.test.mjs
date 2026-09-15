import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

test('Local environment files stay ignored and untracked', () => {
    const ignore = fs.readFileSync('.gitignore', 'utf8');
    assert.match(ignore, /^\.env$/m);
    assert.match(ignore, /^\.env\.\*$/m);

    const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' });
    assert.doesNotMatch(tracked, /(^|\n)\.env(?:\.|\n)/);
});

test('Public HTML only references HTTPS external resources', () => {
    const htmlFiles = ['index.html', 'modeller/index.html', 'renkler/index.html', 'iletisim/index.html', 'konfigurator/index.html', 'katalog/index.html', '404.html'];
    for (const file of htmlFiles) {
        const html = fs.readFileSync(file, 'utf8');
        assert.doesNotMatch(html, /(?:src|href)="http:\/\//, `${file} has an insecure external resource`);
    }
});

test('The configurator keeps a single neutral radial background', () => {
    const html = fs.readFileSync('konfigurator/index.html', 'utf8');
    const ui = fs.readFileSync('js/ui.js', 'utf8');
    const css = fs.readFileSync('css/base.css', 'utf8');

    assert.doesNotMatch(html, /btn-zemin|zemin-panel/);
    assert.match(ui, /zemin:\s*undefined/);
    assert.doesNotMatch(css, /data-zemin="[2-7]"/);
});

test('Legacy private pages stay unpublished and out of the sitemap', () => {
    const privatePages = ['admin.html', 'giris.html', 'hesabim.html', 'sepet.html', 'siparisler.html'];
    const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

    for (const file of privatePages) {
        assert.equal(fs.existsSync(file), false, `${file} must not be published`);
        assert.doesNotMatch(sitemap, new RegExp(file.replace('.', '\\.')), `${file} must not be indexed`);
    }
});
