
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'clouddrop-test-')
);

process.env.STORAGE_PATH = tempDir;
process.env.INITIAL_ERROR_PERCENTAGE = '0';
process.env.APP_VERSION = 'v1.0.0';

const app = require('../src/server');
const controller = require('../src/controllers/fileController');

let server;
let baseUrl;

before(async () => {
    server = app.listen(0, '127.0.0.1');

    await new Promise(resolve => {
        server.once('listening', resolve);
    });

    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close(err => err ? reject(err) : resolve());
    });

    fs.rmSync(tempDir, { recursive: true, force: true });
});

test('health endpoint works', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
});

test('normal checkout succeeds', async () => {
    controller.setErrorRate(0);

    const res = await fetch(`${baseUrl}/checkout`);
    assert.equal(res.status, 200);
});

test('bad canary returns HTTP 500', async () => {
    controller.setErrorRate(100);

    const res = await fetch(`${baseUrl}/checkout`);
    assert.equal(res.status, 500);

    controller.setErrorRate(0);
});

test('Prometheus exports request metrics', async () => {
    const res = await fetch(`${baseUrl}/metrics`);
    const body = await res.text();

    assert.equal(res.status, 200);
    assert.match(body, /http_requests_total/);
    assert.match(body, /http_request_duration_seconds/);
});

test('file upload works', async () => {
    controller.setErrorRate(0);

    const form = new FormData();
    form.append(
        'file',
        new Blob(['CloudDrop test content']),
        'test.txt'
    );

    const res = await fetch(`${baseUrl}/api/upload-file`, {
        method: 'POST',
        body: form
    });

    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.status, 'SUCCESS');
    assert.match(data.file.id, /^[a-f0-9]{32}$/);
});
