// ═══════════════════════════════════════════
// dreams — app.js
// ═══════════════════════════════════════════

// --- Star symbols ---
const STAR_SYMBOLS = ['✦', '✧', '⟡', '⋆', '⊹', '˚', '✶', '⁂', '✴', '∗'];

// --- Mock Data ---
const MOCK_ENTRIES = [
  { id: 'entry-001', title: 'The Long Corridor', date: '2026-05-15', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nCurabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.' },
  { id: 'entry-002', title: 'Floating Architecture', date: '2026-05-16', body: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.\n\nDonec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.' },
  { id: 'entry-003', title: 'The Empty Theater', date: '2026-05-17', body: 'Nullam dignissim lacus ut sapien volutpat euismod. Morbi nec metus. Phasellus blandit leo ut odio. Maecenas ullamcorper, dui et placerat feugiat, eros pede varius leo, sit amet consequat dolor lorem.\n\nSed vel lectus. Donec odio tempus molestie, porttitor ut, iaculis quis, sem. Nullam cursus luctus mauris ut gravida. Cras dapibus. Vivamus elementum semper nisi.' },
  { id: 'entry-004', title: 'Gable Grip', date: '2026-05-18', body: 'Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc.\n\nQuis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, perspiciatis unde omnis iste natus error sit voluptatem.' },
  { id: 'entry-005', title: 'Sheik at the Table', date: '2026-05-19', body: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.\n\n- Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet\n- Consectetur, adipisci velit, sed quia non numquam eius modi tempora\n- Ut enim ad minima veniam, quis nostrum exercitationem ullam\n\nCorporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?' },
  { id: 'entry-006', title: 'The Cell', date: '2026-05-20', body: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.\n\nSimilique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.' },
  { id: 'entry-007', title: 'Shoreline', date: '2026-05-21', body: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.\n\nItaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.' },
  { id: 'entry-008', title: 'Movement', date: '2026-05-22', body: 'Praesent dapibus, neque id cursus faucibus, tortor neque egestas auguae, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.\n\nPhasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus.\n\n# Notes\nHaec disputation perspicua et clara est in somnio\nTemporibus antiquis memoria teneatur et saepe recurrat' },
  { id: 'entry-009', title: 'Submarine', date: '2026-05-23', body: 'Aenean lectus elit, fermentum non, convallis id, sagittis at, neque. Nullam mauris orci, aliquet et, iaculis et, viverra vitae, ligula. Nulla ut felis in purus aliquam imperdiet.\n\nMaecenas aliquet mollis lectus. Vivamus consectetuer risus et tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer malesuada.' },
  { id: 'entry-010', title: 'Missile in the Closet', date: '2026-05-24', body: 'Fusce ornare mi vel risus molestie vel ornare nisl consequat. Cras semper erat et lacus placerat accumsan. Sed massa nibh, molestie nec, commodo vel, mattis sit amet, metus.\n\nSuspendisse potenti. In hac habitasse platea dictumst. Proin eget ligula at nunc vehicula pulvinar. Fusce lobortis risus ac ante viverra fermentum.\n\n# Interpretation' }
];

// --- State ---
let state = {
  view: 'lock',
  activeEntry: null,
  query: '',
  unlocked: false,
};

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

function renderLockScreen() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const lock = document.createElement('div');
  lock.className = 'lock-screen';

  // Star field container
  const starField = document.createElement('div');
  starField.className = 'star-field';
  starField.id = 'star-field';
  lock.appendChild(starField);

  // Prompt
  const prompt = document.createElement('div');
  prompt.className = 'lock-prompt';
  prompt.id = 'lock-prompt';
  prompt.textContent = "What's that tune I hear?";
  lock.appendChild(prompt);

  // Input
  const wrap = document.createElement('div');
  wrap.className = 'lock-input-wrap';
  wrap.id = 'lock-wrap';
  wrap.innerHTML = '<span class="prompt">❯</span><input type="password" id="lock-input" placeholder="..." autocomplete="off" spellcheck="false">';
  lock.appendChild(wrap);

  // Error
  const err = document.createElement('div');
  err.className = 'lock-error';
  err.id = 'lock-error';
  err.textContent = 'access denied';
  lock.appendChild(err);

  app.appendChild(lock);

  startStarAnimation();
}

function startStarAnimation() {
  const field = document.getElementById('star-field');
  const promptEl = document.getElementById('lock-prompt');
  const wrapEl = document.getElementById('lock-wrap');
  const input = document.getElementById('lock-input');
  let starCount = 0;
  const maxStars = 40;
  const spawnInterval = 120; // ms between new stars

  function spawnStar() {
    if (starCount >= maxStars) return;

    const star = document.createElement('span');
    star.className = 'twinkle-star';
    star.textContent = STAR_SYMBOLS[Math.floor(Math.random() * STAR_SYMBOLS.length)];

    // Random position across the field
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    star.style.left = x + '%';
    star.style.top = y + '%';

    // Random size
    const size = 0.6 + Math.random() * 1.2;
    star.style.fontSize = size + 'rem';

    // Random animation duration and delay
    const duration = 1.5 + Math.random() * 2.5;
    const delay = Math.random() * 0.5;
    star.style.animationDuration = duration + 's';
    star.style.animationDelay = delay + 's';

    field.appendChild(star);
    starCount++;

    if (starCount < maxStars) {
      setTimeout(spawnStar, spawnInterval);
    } else {
      // All stars spawned, show prompt
      setTimeout(() => {
        promptEl.classList.add('visible');
        setTimeout(() => {
          wrapEl.classList.add('visible');
          input.focus();
        }, 400);
      }, 600);
    }
  }

  // Start spawning after a beat
  setTimeout(spawnStar, 300);

  // Handle passphrase input
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (input.value.length > 0) {
        state.unlocked = true;
        state.view = 'list';
        render();
      } else {
        const wrap = document.getElementById('lock-wrap');
        const err = document.getElementById('lock-error');
        wrap.classList.add('error');
        err.classList.add('visible');
        input.value = '';
        setTimeout(() => {
          wrap.classList.remove('error');
          err.classList.remove('visible');
        }, 1500);
      }
    }
  });
}

function renderList() {
  const filtered = filterEntries(state.query);

  const entries = filtered.map(e => `
    <div class="entry-item" data-id="${e.id}">
      <span class="entry-title">${escapeHtml(e.title.toLowerCase())}</span>
      <span class="entry-meta">${e.date}</span>
    </div>
  `).join('');

  const empty = filtered.length === 0
    ? '<div class="empty"><div class="empty-icon">//</div><div>no matches found</div></div>'
    : '';

  return `
    <div class="header">
      <div class="header-title">// dreams</div>
      <div class="header-sub">${MOCK_ENTRIES.length} entries · encrypted</div>
    </div>
    <div class="cmd-bar">
      <span class="prompt">❯</span>
      <input type="text" id="search" placeholder="search entries..." value="${escapeHtml(state.query)}" autocomplete="off" spellcheck="false">
    </div>
    <div class="entry-list">
      ${entries}
      ${empty}
    </div>
  `;
}

function renderEntry(entry) {
  const formattedBody = entry.body
    .split('\n')
    .map(line => {
      if (line.startsWith('# ')) return `<h2>${escapeHtml(line.slice(2))}</h2>`;
      if (line.startsWith('- ')) return `<p>${escapeHtml(line)}</p>`;
      if (line.trim() === '') return '';
      return `<p>${escapeHtml(line)}</p>`;
    })
    .join('\n');

  return `
    <button class="entry-view-back" id="back">← back</button>
    <div class="entry-view-header">
      <div class="entry-view-title">${escapeHtml(entry.title)}</div>
      <div class="entry-view-date">${entry.date}</div>
    </div>
    <div class="entry-view-body">
      ${formattedBody}
    </div>
  `;
}

function renderStatusBar() {
  let existing = document.querySelector('.status-bar');
  if (!existing) {
    existing = document.createElement('div');
    existing.className = 'status-bar';
    document.body.appendChild(existing);
  }

  const left = state.view === 'entry'
    ? `<span class="status-accent">reading</span> ${state.activeEntry.id}`
    : `<span class="status-accent">${filterEntries(state.query).length}</span> entries`;

  existing.style.display = 'flex';
  existing.innerHTML = `<span>${left}</span><span>dreams v0.2</span>`;
}

// --- Helpers ---
function filterEntries(query) {
  if (!query) return MOCK_ENTRIES;
  const q = query.toLowerCase();
  return MOCK_ENTRIES.filter(e =>
    e.title.toLowerCase().includes(q) ||
    e.body.toLowerCase().includes(q) ||
    e.date.includes(q)
  );
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
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
      state.activeEntry = MOCK_ENTRIES.find(e => e.id === id);
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
