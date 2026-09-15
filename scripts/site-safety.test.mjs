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
