import assert from 'node:assert/strict';
import { test } from 'node:test';
import jwt from 'jsonwebtoken';

const baseUrl = process.env.TEST_BASE_URL ?? 'http://localhost:3002';
const jwtSecret = process.env.JWT_ACCESS_SECRET ?? 'local-url-shortener-development-secret-32chars-min';

async function request(path: string, init?: RequestInit) {
  return fetch(`${baseUrl}${path}`, init);
}

async function readJson<T>(response: Response) {
  return response.json() as Promise<T>;
}

async function waitForClickCount(id: string, expected: number) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await request(`/api/urls/${id}/stats`);
    const stats = await readJson<{ data: { url: { clickCount: number } } }>(response);
    if (stats.data.url.clickCount >= expected) return stats;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`clickCount did not reach ${expected}`);
}

function authToken(userId: string) {
  return jwt.sign({ sub: userId, role: 'USER' }, jwtSecret, {
    algorithm: 'HS256', issuer: 'auth-service', audience: 'auth-service', expiresIn: '10m',
  });
}

test('anonymous URL creation redirects and records analytics', async () => {
  const alias = `test-${Date.now()}`;
  const createResponse = await request('/api/urls', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ originalUrl: 'https://example.com/integration', customAlias: alias }),
  });
  assert.equal(createResponse.status, 201);
  const created = await readJson<{ data: { id: string } }>(createResponse);

  const firstRedirect = await request(`/${alias}`, { redirect: 'manual' });
  assert.equal(firstRedirect.status, 302);
  assert.equal(firstRedirect.headers.get('x-redirect-cache'), 'miss');
  assert.equal(firstRedirect.headers.get('location'), 'https://example.com/integration');

  const secondRedirect = await request(`/${alias}`, { redirect: 'manual' });
  assert.equal(secondRedirect.status, 302);
  assert.equal(secondRedirect.headers.get('x-redirect-cache'), 'hit');

  const stats = await waitForClickCount(created.data.id, 2);
  assert.equal(stats.data.url.clickCount, 2);
});

test('authenticated users can manage only their own URLs', async () => {
  const token = authToken('33333333-3333-4333-8333-333333333333');
  const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
  const alias = `owned-test-${Date.now()}`;

  const unauthenticatedList = await request('/api/urls');
  assert.equal(unauthenticatedList.status, 401);

  const createResponse = await request('/api/urls', {
    method: 'POST', headers,
    body: JSON.stringify({ originalUrl: 'https://example.com/owned', customAlias: alias }),
  });
  assert.equal(createResponse.status, 201);
  const created = await readJson<{ data: { id: string } }>(createResponse);

  const listResponse = await request('/api/urls?limit=10', { headers });
  assert.equal(listResponse.status, 200);
  const list = await readJson<{ data: Array<{ id: string }> }>(listResponse);
  assert.ok(list.data.some((url) => url.id === created.data.id));

  const updateResponse = await request(`/api/urls/${created.data.id}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({ originalUrl: 'https://example.com/updated', title: 'Updated' }),
  });
  assert.equal(updateResponse.status, 200);

  const deleteResponse = await request(`/api/urls/${created.data.id}`, { method: 'DELETE', headers });
  assert.equal(deleteResponse.status, 200);
  const deleted = await readJson<{ data: { isActive: boolean } }>(deleteResponse);
  assert.equal(deleted.data.isActive, false);
});
