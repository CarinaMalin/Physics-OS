const SYNC_CONFIG_KEY = 'physics-os-sync-config-v1';
const DEVICE_KEY = 'physics-os-device-id-v1';

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function loadSyncConfig() {
  try {
    return {
      endpoint: '',
      syncId: '',
      autoSync: false,
      ...JSON.parse(localStorage.getItem(SYNC_CONFIG_KEY) || '{}')
    };
  } catch {
    return { endpoint: '', syncId: '', autoSync: false };
  }
}

export function saveSyncConfig(config) {
  localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
}

export function generateSyncId() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return bytesToBase64Url(bytes);
}

function bytesToBase64Url(bytes) {
  let raw = '';
  for (const byte of bytes) raw += String.fromCharCode(byte);
  return btoa(raw).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function normalizeEndpoint(endpoint) {
  return endpoint.trim().replace(/\/+$/, '');
}

export async function pushEncryptedSnapshot({ endpoint, syncId, envelope, deviceId }) {
  const base = normalizeEndpoint(endpoint);
  if (!base) throw new Error('NO_ENDPOINT');
  if (!syncId) throw new Error('NO_SYNC_ID');
  const response = await fetch(`${base}/sync/${encodeURIComponent(syncId)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      protocol: 1,
      deviceId,
      clientUpdatedAt: new Date().toISOString(),
      envelope
    })
  });
  if (!response.ok) throw new Error(`SYNC_HTTP_${response.status}`);
  return response.json();
}

export async function pullEncryptedSnapshot({ endpoint, syncId }) {
  const base = normalizeEndpoint(endpoint);
  if (!base) throw new Error('NO_ENDPOINT');
  if (!syncId) throw new Error('NO_SYNC_ID');
  const response = await fetch(`${base}/sync/${encodeURIComponent(syncId)}`, {
    method: 'GET',
    cache: 'no-store'
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`SYNC_HTTP_${response.status}`);
  return response.json();
}
