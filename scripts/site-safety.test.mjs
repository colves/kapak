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
