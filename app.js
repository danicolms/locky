// ═══════════════════════════════════════════
// dreams — app.js
// Real decryption via Web Crypto API
// ═══════════════════════════════════════════

const STAR_SYMBOLS = ['✦', '✧', '⟡', '⋆', '⊹', '˚', '✶', '⁂', '✴', '∗'];

// --- State ---
let state = {
  view: 'lock',
  activeEntry: null,
  query: '',
  passphrase: null,
  entries: [],       // decrypted entries: { id, title, date, body }
  manifest: [],      // from manifest.json: { id, file, title, date }
};

// --- Crypto ---
async function deriveKey(passphrase, salt, iterations) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

async function decryptEntry(passphrase, encText) {
  const lines = encText.trim().split('\n');
  const salt = hexToBytes(lines[0]);
  const iv = hexToBytes(lines[1]);
  const iterations = parseInt(lines[2]);
  const ciphertext = base64ToBytes(lines.slice(3).join('\n'));

  const key = await deriveKey(passphrase, salt, iterations);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decrypted));
}

// --- Helpers ---
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function filterEntries(query) {
  if (!query) return state.entries;
  const q = query.toLowerCase();
  return state.entries.filter(e =>
    e.title.toLowerCase().includes(q) ||
    e.body.toLowerCase().includes(q) ||
    (e.date && e.date.includes(q))
  );
}

// --- Render ---
function render() {
  const app = document.getElementById('app');
  const statusBar = document.querySelector('.status-bar');

  if (state.view === 'lock') {
    if (statusBar) statusBar.style.display = 'none';
    renderLockScreen();
    return;
  }

  if (statusBar) statusBar.style.display = 'flex';

  if (state.view === 'entry' && state.activeEntry) {
    app.innerHTML = renderEntry(state.activeEntry);
  } else {
    app.innerHTML = renderList();
  }

  renderStatusBar();
  bindEvents();
}

// --- Lock Screen ---
function renderLockScreen() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const lock = document.createElement('div');
  lock.className = 'lock-screen';

  const starField = document.createElement('div');
  starField.className = 'star-field';
  starField.id = 'star-field';
  lock.appendChild(starField);

  const prompt = document.createElement('div');
  prompt.className = 'lock-prompt';
  prompt.id = 'lock-prompt';
  prompt.textContent = "What's that tune I hear?";
  lock.appendChild(prompt);

  const wrap = document.createElement('div');
  wrap.className = 'lock-input-wrap';
  wrap.id = 'lock-wrap';
  wrap.innerHTML = '<span class="prompt">❯</span><input type="password" id="lock-input" placeholder="..." autocomplete="off" spellcheck="false">';
  lock.appendChild(wrap);

  const err = document.createElement('div');
  err.className = 'lock-error';
  err.id = 'lock-error';
  err.textContent = 'access denied';
  lock.appendChild(err);

  const hint = document.createElement('div');
  hint.className = 'lock-hint';
  hint.id = 'lock-hint';
  hint.textContent = '↵ enter to continue';
  lock.appendChild(hint);

  app.appendChild(lock);
  startStarAnimation();
}

function startStarAnimation() {
  const field = document.getElementById('star-field');
  const promptEl = document.getElementById('lock-prompt');
  const wrapEl = document.getElementById('lock-wrap');
  const input = document.getElementById('lock-input');
  let starCount = 0;
  const maxStars = 35;

  function spawnStar() {
    if (starCount >= maxStars) {
      setTimeout(() => {
        promptEl.classList.add('visible');
        setTimeout(() => {
          wrapEl.classList.add('visible');
          document.getElementById('lock-hint')?.classList.add('visible');
          input.focus();
        }, 400);
      }, 600);
      return;
    }

    const star = document.createElement('span');
    star.className = 'twinkle-star';
    star.textContent = STAR_SYMBOLS[Math.floor(Math.random() * STAR_SYMBOLS.length)];
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.fontSize = (0.5 + Math.random() * 1) + 'rem';
    star.style.animationDuration = (2 + Math.random() * 3) + 's';
    star.style.animationDelay = (Math.random() * 0.5) + 's';
    field.appendChild(star);
    starCount++;
    setTimeout(spawnStar, 100 + Math.random() * 80);
  }

  setTimeout(spawnStar, 300);

  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const passphrase = input.value;
      if (!passphrase) {
        showError();
        return;
      }

      // Disable input while decrypting
      input.disabled = true;
      input.value = '';

      try {
        await unlock(passphrase);
      } catch (err) {
        showError();
        input.disabled = false;
        input.focus();
      }
    }
  });
}

function showError() {
  const wrap = document.getElementById('lock-wrap');
  const err = document.getElementById('lock-error');
  wrap.classList.add('error');
  err.classList.add('visible');
  setTimeout(() => {
    wrap.classList.remove('error');
    err.classList.remove('visible');
  }, 1500);
}

async function unlock(passphrase) {
  state.passphrase = passphrase;

  // Fetch manifest
  const manifestResp = await fetch('data/manifest.json');
  if (!manifestResp.ok) throw new Error('no manifest');
  state.manifest = await manifestResp.json();

  // Try decrypting first entry to validate passphrase
  const firstEntry = state.manifest[0];
  if (!firstEntry) throw new Error('empty manifest');

  const encResp = await fetch(`data/${firstEntry.file}`);
  if (!encResp.ok) throw new Error('file not found');
  const encText = await encResp.text();

  // If this fails, passphrase is wrong → throws
  const payload = await decryptEntry(passphrase, encText);

  // Passphrase is valid. Decrypt all entries.
  state.entries = [];
  for (const entry of state.manifest) {
    try {
      const resp = await fetch(`data/${entry.file}`);
      const text = await resp.text();
      const decrypted = await decryptEntry(passphrase, text);
      state.entries.push({
        id: entry.id,
        title: decrypted.title || entry.title,
        date: decrypted.date || entry.date,
        body: decrypted.body,
      });
    } catch (e) {
      // Skip entries that fail to decrypt
      console.warn(`Failed to decrypt ${entry.file}`, e);
    }
  }

  // Sort by date descending (newest first)
  state.entries.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  state.view = 'list';
  render();
}

// --- Entry List ---
function renderList() {
  const filtered = filterEntries(state.query);

  const entries = filtered.map(e => `
    <div class="entry-item" data-id="${e.id}">
      <div class="entry-left">
        <span class="entry-marker">▸</span>
        <span class="entry-title">${escapeHtml(e.title.toLowerCase())}</span>
      </div>
      <span class="entry-meta">${e.date || '—'}</span>
    </div>
  `).join('');

  const empty = filtered.length === 0
    ? '<div class="empty"><div class="empty-icon">∅</div><div>no matches</div></div>'
    : '';

  return `
    <div class="header">
      <div class="header-title">cat <span class="accent">dreams</span></div>
      <div class="header-sub">${state.entries.length} entries · decrypted</div>
      <div class="header-divider">─────────────────────────────────</div>
    </div>
    <div class="cmd-bar">
      <span class="prompt">❯</span>
      <input type="text" id="search" placeholder="grep..." value="${escapeHtml(state.query)}" autocomplete="off" spellcheck="false">
    </div>
    <div class="entry-list">
      ${entries}
      ${empty}
    </div>
  `;
}

// --- Entry View ---
function renderEntry(entry) {
  const formattedBody = entry.body
    .split('\n')
    .map(line => {
      if (line.startsWith('# ')) return `<h2>${escapeHtml(line.slice(2))}</h2>`;
      if (line.startsWith('- ')) return `<p>  ${escapeHtml(line)}</p>`;
      if (line.trim() === '') return '';
      return `<p>${escapeHtml(line)}</p>`;
    })
    .join('\n');

  return `
    <button class="entry-view-back" id="back">← back</button>
    <div class="entry-view-header">
      <div class="entry-view-title">${escapeHtml(entry.title)}</div>
      <div class="entry-view-date">${entry.date || '—'}</div>
    </div>
    <div class="entry-view-body">
      ${formattedBody}
    </div>
  `;
}

// --- Status Bar ---
function renderStatusBar() {
  let existing = document.querySelector('.status-bar');
  if (!existing) {
    existing = document.createElement('div');
    existing.className = 'status-bar';
    document.body.appendChild(existing);
  }

  const left = state.view === 'entry'
    ? `<span class="status-accent">read</span> ${state.activeEntry.id}`
    : `<span class="status-accent">${filterEntries(state.query).length}</span> entries`;

  existing.style.display = 'flex';
  existing.innerHTML = `<span>${left}</span><span>v0.3</span>`;
}

// --- Events ---
function bindEvents() {
  const search = document.getElementById('search');
  if (search) {
    search.addEventListener('input', (e) => {
      state.query = e.target.value;
      render();
      const newSearch = document.getElementById('search');
      if (newSearch) {
        newSearch.focus();
        newSearch.setSelectionRange(state.query.length, state.query.length);
      }
    });
    search.focus();
  }

  const back = document.getElementById('back');
  if (back) {
    back.addEventListener('click', () => {
      state.view = 'list';
      state.activeEntry = null;
      render();
    });
  }

  document.querySelectorAll('.entry-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      state.activeEntry = state.entries.find(e => e.id === id);
      state.view = 'entry';
      render();
    });
  });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  let sb = document.querySelector('.status-bar');
  if (!sb) {
    sb = document.createElement('div');
    sb.className = 'status-bar';
    document.body.appendChild(sb);
  }
  sb.style.display = 'none';
  render();
});
