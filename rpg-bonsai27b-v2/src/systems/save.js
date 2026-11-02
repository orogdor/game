export function save(data) {
  try {
    localStorage.setItem('threejs-save', JSON.stringify(data));
  } catch (e) {
    console.error('[Save] Failed:', e);
  }
}

export function load() {
  try {
    const raw = localStorage.getItem('threejs-save');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('[Load] Failed:', e);
    return null;
  }
}

export function clear() {
  try {
    localStorage.removeItem('threejs-save');
  } catch (e) {
    console.error('[Clear] Failed:', e);
  }
}