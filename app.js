// ═══════════════════════════════════════════
// dreams — app.js
// ═══════════════════════════════════════════

const STAR_SYMBOLS = ['✦', '✧', '⟡', '⋆', '⊹', '˚', '✶', '⁂', '✴', '∗'];

// --- State ---
let state = {
  view: 'lock',
  activeEntry: null,
  query: '',
  passphrase: null,
  entries: [],
  manifest: [],
};

// --- Crypto ---
async function deriveKey(passphrase, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, keyMaterial,
    { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
}

async function decryptEntry(passphrase, encText) {
  const lines = encText.trim().split('\n');
  const salt = hexToBytes(lines[0]);
  const iv = hexToBytes(lines[1]);
  const iterations = parseInt(lines[2]);
  const ciphertext = base64ToBytes(lines.slice(3).join('\n'));
  const key = await deriveKey(passphrase, salt, iterations);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(decrypted));
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  return bytes;
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
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
    e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q) || (e.date && e.date.includes(q))
  );
}

// --- Star Field (persistent) ---
function initStarField() {
  let field = document.getElementById('global-stars');
  if (field) return;

  field = document.createElement('div');
  field.className = 'star-field';
  field.id = 'global-stars';
  document.body.prepend(field);

  const count = 30;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    star.className = 'twinkle-star';
    star.textContent = STAR_SYMBOLS[Math.floor(Math.random() * STAR_SYMBOLS.length)];
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.fontSize = (0.4 + Math.random() * 0.8) + 'rem';
    const duration = 2.5 + Math.random() * 3;
    star.style.animationDuration = duration + 's';
    star.style.animationDelay = (Math.random() * duration) + 's';
    field.appendChild(star);
  }
}

// --- Render ---
function render() {
  const app = document.getElementById('app');

  if (state.view === 'lock') {
    renderLockScreen();
    return;
  }

  if (state.view === 'loading') {
    app.innerHTML = '<div class="loading-screen"><div class="loading-text">decrypting...</div></div>';
    return;
  }

  if (state.view === 'entry' && state.activeEntry) {
    app.innerHTML = renderEntry(state.activeEntry);
  } else {
    app.innerHTML = renderList();
  }

  bindEvents();
}

// --- Lock Screen ---
function renderLockScreen() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const lock = document.createElement('div');
  lock.className = 'lock-screen';

  const prompt = document.createElement('div');
  prompt.className = 'lock-prompt';
  prompt.id = 'lock-prompt';
  prompt.textContent = "What's that tune I hear?";
  lock.appendChild(prompt);

  const wrap = document.createElement('div');
  wrap.className = 'input-wrap lock-input-wrap';
  wrap.id = 'lock-wrap';
  wrap.innerHTML = '<span class="prompt">❯</span><input type="password" id="lock-input" placeholder="..." autocomplete="off" spellcheck="false">';
  lock.appendChild(wrap);

  const err = document.createElement('div');
  err.className = 'lock-error';
  err.id = 'lock-error';
  err.textContent = 'wrong key — try again';
  lock.appendChild(err);

  const hint = document.createElement('div');
  hint.className = 'lock-hint';
  hint.id = 'lock-hint';
  hint.textContent = '↵ enter to continue';
  lock.appendChild(hint);

  app.appendChild(lock);

  // Show prompt + input quickly (stars are already running)
  setTimeout(() => {
    prompt.classList.add('visible');
    setTimeout(() => {
      wrap.classList.add('visible');
      document.getElementById('lock-hint')?.classList.add('visible');
      document.getElementById('lock-input')?.focus();
    }, 200);
  }, 300);

  const input = document.getElementById('lock-input');
  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const passphrase = input.value;
      if (!passphrase) { showError(); return; }
      input.disabled = true;
      input.value = '';
      try {
        state.view = 'loading';
        render();
        await unlock(passphrase);
      } catch (err) {
        state.view = 'lock';
        render();
        setTimeout(() => {
          showError();
          const newInput = document.getElementById('lock-input');
          if (newInput) { newInput.disabled = false; newInput.focus(); }
        }, 100);
      }
    }
  });
}

function showError() {
  const wrap = document.getElementById('lock-wrap');
  const err = document.getElementById('lock-error');
  if (wrap) wrap.classList.add('error');
  if (err) err.classList.add('visible');
  setTimeout(() => {
    if (wrap) wrap.classList.remove('error');
    if (err) err.classList.remove('visible');
  }, 1500);
}

async function unlock(passphrase) {
  state.passphrase = passphrase;

  const manifestResp = await fetch('data/manifest.json');
  if (!manifestResp.ok) throw new Error('no manifest');
  state.manifest = await manifestResp.json();

  const firstEntry = state.manifest[0];
  if (!firstEntry) throw new Error('empty manifest');

  const encResp = await fetch(`data/${firstEntry.file}`);
  if (!encResp.ok) throw new Error('file not found');
  const encText = await encResp.text();

  // Validate passphrase
  await decryptEntry(passphrase, encText);

  // Decrypt all
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
      console.warn(`Failed to decrypt ${entry.file}`, e);
    }
  }

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
    ? '<div class="empty">no matches</div>'
    : '';

  return `
    <div class="list-header">
      <div class="search-wrap">
        <div class="input-wrap">
          <span class="prompt">❯</span>
          <input type="text" id="search" placeholder="search..." value="${escapeHtml(state.query)}" autocomplete="off" spellcheck="false">
        </div>
      </div>
      <div class="list-count">${filtered.length} ${filtered.length === 1 ? 'entry' : 'entries'}</div>
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
    <div class="entry-view">
      <div class="entry-header">
        <div class="entry-header-title">${escapeHtml(entry.title)}</div>
        <button class="entry-close" id="close-entry">×</button>
      </div>
      <div class="entry-date">${entry.date || '—'}</div>
      <div class="entry-body">
        ${formattedBody}
      </div>
    </div>
    <button class="scroll-top" id="scroll-top">↑</button>
  `;
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

  const close = document.getElementById('close-entry');
  if (close) {
    close.addEventListener('click', () => {
      state.view = 'list';
      state.activeEntry = null;
      window.scrollTo(0, 0);
      render();
    });
  }

  document.querySelectorAll('.entry-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      state.activeEntry = state.entries.find(e => e.id === id);
      state.view = 'entry';
      window.scrollTo(0, 0);
      render();
    });
  });

  // Scroll-to-top button
  const scrollTop = document.getElementById('scroll-top');
  if (scrollTop) {
    const toggle = () => {
      scrollTop.classList.toggle('visible', window.scrollY > 300);
    };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();

    scrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  initStarField();
  render();
});
