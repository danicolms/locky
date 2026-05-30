// ═══════════════════════════════════════════
// dreams — app.js
// ═══════════════════════════════════════════

// --- Mock Data ---
const MOCK_ENTRIES = [
  {
    id: 'entry-001',
    title: 'The Long Corridor',
    date: '2026-05-15',
    body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.`
  },
  {
    id: 'entry-002',
    title: 'Floating Architecture',
    date: '2026-05-16',
    body: `Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.

Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.

Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.`
  },
  {
    id: 'entry-003',
    title: 'The Empty Theater',
    date: '2026-05-17',
    body: `Nullam dignissim lacus ut sapien volutpat euismod. Morbi nec metus. Phasellus blandit leo ut odio. Maecenas ullamcorper, dui et placerat feugiat, eros pede varius leo, sit amet consequat dolor lorem.

Sed vel lectus. Donec odio tempus molestie, porttitor ut, iaculis quis, sem. Nullam cursus luctus mauris ut gravida. Cras dapibus. Vivamus elementum semper nisi.

Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus.`
  },
  {
    id: 'entry-004',
    title: 'Gable Grip',
    date: '2026-05-18',
    body: `Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc.

Quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, perspiciatis unde omnis iste natus error sit voluptatem.

Accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`
  },
  {
    id: 'entry-005',
    title: 'Sheik at the Table',
    date: '2026-05-19',
    body: `Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

• Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet
• Consectetur, adipisci velit, sed quia non numquam eius modi tempora
• Ut enim ad minima veniam, quis nostrum exercitationem ullam

Corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.`
  },
  {
    id: 'entry-006',
    title: 'The Cell',
    date: '2026-05-20',
    body: `At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.

Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.`
  },
  {
    id: 'entry-007',
    title: 'Shoreline',
    date: '2026-05-21',
    body: `Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.

Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut non enim eleifend felis pretium feugiat. Vivamus quis mi. Donec quis orci eget orci vehicula condimentum.`
  },
  {
    id: 'entry-008',
    title: 'Movement',
    date: '2026-05-22',
    body: `Praesent dapibus, neque id cursus faucibus, tortor neque egestas auguae, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.

Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi.

Pellentesque fermentum dolor. Aliquam quam lectus, facilisis auctor, ultrices ut, elementum vulputate, nunc. Sed pretium blandit orci. Ut eu diam at pede suscipit sodales.

# Notes
* Haec disputation perspicua et clara est in somnio
* Temporibus antiquis memoria teneatur et saepe recurrat`
  },
  {
    id: 'entry-009',
    title: 'Submarine',
    date: '2026-05-23',
    body: `Aenean lectus elit, fermentum non, convallis id, sagittis at, neque. Nullam mauris orci, aliquet et, iaculis et, viverra vitae, ligula. Nulla ut felis in purus aliquam imperdiet.

Maecenas aliquet mollis lectus. Vivamus consectetuer risus et tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer malesuada.

Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet.`
  },
  {
    id: 'entry-010',
    title: 'Missile in the Closet',
    date: '2026-05-24',
    body: `Fusce ornare mi vel risus molestie vel ornare nisl consequat. Cras semper erat et lacus placerat accumsan. Sed massa nibh, molestie nec, commodo vel, mattis sit amet, metus.

Suspendisse potenti. In hac habitasse platea dictumst. Proin eget ligula at nunc vehicula pulvinar. Fusce lobortis risus ac ante viverra fermentum.

# Interpretation`
  }
];

// --- State ---
let state = {
  view: 'list', // 'list' | 'entry'
  activeEntry: null,
  query: '',
};

// --- Render ---
function render() {
  const app = document.getElementById('app');

  if (state.view === 'entry' && state.activeEntry) {
    app.innerHTML = renderEntry(state.activeEntry);
  } else {
    app.innerHTML = renderList();
  }

  renderStatusBar();
  bindEvents();
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
    ? `<div class="empty"><div class="empty-icon">//</div><div>no matches found</div></div>`
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
  // Format body: convert # headings to styled elements, preserve paragraphs
  const formattedBody = entry.body
    .split('\n')
    .map(line => {
      if (line.startsWith('# ')) {
        return `<h2>${escapeHtml(line.slice(2))}</h2>`;
      }
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

  existing.innerHTML = `
    <span>${left}</span>
    <span>dreams v0.1</span>
  `;
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
      // Re-focus and restore cursor
      const newSearch = document.getElementById('search');
      if (newSearch) {
        newSearch.focus();
        newSearch.setSelectionRange(state.query.length, state.query.length);
      }
    });
    // Auto-focus search
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

// --- Boot Sequence ---
function boot() {
  const bootEl = document.createElement('div');
  bootEl.className = 'boot';
  bootEl.innerHTML = `<div class="boot-content" id="boot-lines"></div>`;
  document.body.appendChild(bootEl);

  const lines = [
    '> dreams v0.1',
    '> initializing...',
    '> loading entries: 10 found',
    '> encryption: AES-256-GCM',
    '> status: ready',
  ];

  const container = bootEl.querySelector('#boot-lines');

  lines.forEach((line, i) => {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'boot-line';
      el.style.animationDelay = `${i * 0.05}s`;

      if (i === lines.length - 1) {
        el.innerHTML = `${line} <span class="cursor"></span>`;
      } else {
        el.textContent = line;
      }

      container.appendChild(el);

      // After last line, fade out boot screen
      if (i === lines.length - 1) {
        setTimeout(() => {
          bootEl.classList.add('fade-out');
          setTimeout(() => {
            bootEl.remove();
            render();
          }, 400);
        }, 600);
      }
    }, i * 200);
  });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', boot);
