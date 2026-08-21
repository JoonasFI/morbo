(function () {
  let config = loadConfig();

  const boardEl = document.getElementById('board');
  const feedForm = document.getElementById('feed-form');
  const feedNameInput = document.getElementById('feed-name');
  const feedUrlInput = document.getElementById('feed-url');
  const feedColumnSelect = document.getElementById('feed-column');
  const feedTestBtn = document.getElementById('feed-test');
  const feedTestResult = document.getElementById('feed-test-result');

  const keywordForm = document.getElementById('keyword-form');
  const keywordInput = document.getElementById('keyword-input');
  const keywordChips = document.getElementById('keyword-chips');

  const itemsPerColumnInput = document.getElementById('items-per-column');

  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const resetBtn = document.getElementById('reset-btn');
  const importExportArea = document.getElementById('import-export-area');
  const statusEl = document.getElementById('status');

  function persist() {
    saveConfig(config);
    const locale = currentLang() === 'en' ? 'en-GB' : 'fi-FI';
    const time = new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    statusEl.textContent = t('status_saved', { time });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function populateColumnSelects() {
    [feedColumnSelect].forEach(select => {
      select.innerHTML = '';
      config.columns.forEach(col => {
        const opt = document.createElement('option');
        opt.value = col.id;
        opt.textContent = col.name;
        select.appendChild(opt);
      });
    });
  }

  // ---------- Board (kortit + drag & drop) ----------

  function getCardsForColumn(columnId) {
    const feeds = config.feeds
      .filter(f => f.columnId === columnId)
      .map(f => ({ kind: 'feed', order: f.order || 0, data: f }));
    const headlines = config.headlines
      .filter(h => h.columnId === columnId)
      .map(h => ({ kind: 'headline', order: h.order || 0, data: h }));
    return [...feeds, ...headlines].sort((a, b) => a.order - b.order);
  }

  function checkFeedStatus(cardEl, url) {
    const dot = cardEl.querySelector('.feed-status');
    if (!dot) return;
    fetch(`/api/feed?url=${encodeURIComponent(url)}`)
      .then(res => {
        if (!res.ok) throw new Error('bad status');
        return res.json();
      })
      .then(data => {
        dot.dataset.status = 'ok';
        dot.title = t('feed_status_ok', { count: data.items.length });
      })
      .catch(() => {
        dot.dataset.status = 'error';
        dot.title = t('feed_status_error');
      });
  }

  function makeCard(item) {
    const el = document.createElement('div');
    el.className = 'card';
    el.draggable = true;
    el.dataset.id = item.data.id;
    el.dataset.kind = item.kind;

    if (item.kind === 'feed') {
      const icon = faviconUrl(item.data.url);
      el.innerHTML = `
        <div class="card-type">${escapeHtml(t('card_type_feed'))} <span class="feed-status" data-status="checking" title="${escapeHtml(t('feed_status_checking'))}"></span></div>
        <div class="card-title">${icon ? `<img class="favicon" src="${escapeHtml(icon)}" alt="" loading="lazy">` : ''}${escapeHtml(item.data.name)}</div>
        <div class="card-url">${escapeHtml(item.data.url)}</div>
        <div class="card-actions">
          <button type="button" class="small secondary" data-action="edit">${escapeHtml(t('card_edit'))}</button>
          <button type="button" class="small danger" data-action="delete">${escapeHtml(t('card_delete'))}</button>
        </div>
      `;
      const iconEl = el.querySelector('.favicon');
      if (iconEl) iconEl.addEventListener('error', () => iconEl.remove());
      checkFeedStatus(el, item.data.url);
    } else {
      el.innerHTML = `
        <div class="card-type">${escapeHtml(t('card_type_headline'))}</div>
        <div class="card-title">${escapeHtml(item.data.title)}</div>
        ${item.data.link ? `<div class="card-url">${escapeHtml(item.data.link)}</div>` : ''}
        <div class="card-actions">
          <button type="button" class="small secondary" data-action="edit">${escapeHtml(t('card_edit'))}</button>
          <button type="button" class="small danger" data-action="delete">${escapeHtml(t('card_delete'))}</button>
        </div>
      `;
    }

    el.addEventListener('dragstart', () => {
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      commitOrderFromDom();
    });

    el.querySelector('[data-action="edit"]').addEventListener('click', () => editCard(item));
    el.querySelector('[data-action="delete"]').addEventListener('click', () => deleteCard(item));

    return el;
  }

  function editCard(item) {
    if (item.kind === 'feed') {
      const name = prompt(t('prompt_feed_name'), item.data.name);
      if (name === null) return;
      const url = prompt(t('prompt_feed_url'), item.data.url);
      if (url === null) return;
      item.data.name = name.trim() || item.data.name;
      item.data.url = url.trim() || item.data.url;
    } else {
      const title = prompt(t('prompt_headline_title'), item.data.title);
      if (title === null) return;
      const link = prompt(t('prompt_headline_link'), item.data.link || '');
      if (link === null) return;
      item.data.title = title.trim() || item.data.title;
      item.data.link = link.trim();
    }
    persist();
    renderBoard();
  }

  function deleteCard(item) {
    const label = item.kind === 'feed' ? item.data.name : item.data.title;
    if (!confirm(t('confirm_delete_card', { label }))) return;
    if (item.kind === 'feed') {
      config.feeds = config.feeds.filter(f => f.id !== item.data.id);
    } else {
      config.headlines = config.headlines.filter(h => h.id !== item.data.id);
    }
    persist();
    renderBoard();
  }

  function getDragAfterElement(container, y) {
    const cards = [...container.querySelectorAll('.card:not(.dragging)')];
    return cards.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
  }

  function commitOrderFromDom() {
    let changed = false;
    boardEl.querySelectorAll('.board-column-body').forEach(body => {
      const columnId = body.dataset.colId;
      [...body.children].forEach((cardEl, index) => {
        const id = cardEl.dataset.id;
        const kind = cardEl.dataset.kind;
        const list = kind === 'feed' ? config.feeds : config.headlines;
        const item = list.find(x => x.id === id);
        if (item) {
          if (item.columnId !== columnId || item.order !== index) changed = true;
          item.columnId = columnId;
          item.order = index;
        }
      });
    });
    if (changed) persist();
  }

  // ---------- Sarakkeiden järjestyksen raahaus ----------

  let draggingColumnId = null;

  function getGridDragAfterElement(container, x, y) {
    const cols = [...container.querySelectorAll('.board-column:not(.dragging-column)')];
    let closestEl = null;
    let closestCenterX = 0;
    let closestDist = Infinity;
    cols.forEach(child => {
      const box = child.getBoundingClientRect();
      const centerX = box.left + box.width / 2;
      const centerY = box.top + box.height / 2;
      const dist = Math.hypot(x - centerX, y - centerY);
      if (dist < closestDist) {
        closestDist = dist;
        closestEl = child;
        closestCenterX = centerX;
      }
    });
    if (!closestEl) return null;
    return x < closestCenterX ? closestEl : closestEl.nextElementSibling;
  }

  function commitColumnOrderFromDom() {
    const newOrder = [...boardEl.querySelectorAll('.board-column')]
      .map(el => config.columns.find(c => c.id === el.dataset.colId))
      .filter(Boolean);
    if (newOrder.length === config.columns.length) {
      config.columns = newOrder;
      persist();
      populateColumnSelects();
    }
  }

  function addColumn() {
    config.columns.push({ id: genId('col'), name: t('admin_new_column_name') });
    persist();
    populateColumnSelects();
    renderBoard();
    const inputs = boardEl.querySelectorAll('.board-column-header input');
    const lastInput = inputs[inputs.length - 1];
    if (lastInput) {
      lastInput.focus();
      lastInput.select();
    }
  }

  function deleteColumn(col) {
    if (config.columns.length <= 1) {
      alert(t('admin_min_column_alert'));
      return;
    }
    if (!confirm(t('confirm_delete_column', { name: col.name }))) return;
    config.columns = config.columns.filter(c => c.id !== col.id);
    config.feeds = config.feeds.filter(f => f.columnId !== col.id);
    config.headlines = config.headlines.filter(h => h.columnId !== col.id);
    persist();
    populateColumnSelects();
    renderBoard();
  }

  boardEl.addEventListener('dragover', e => {
    if (!draggingColumnId) return;
    e.preventDefault();
    const draggingEl = boardEl.querySelector('.dragging-column');
    if (!draggingEl) return;
    const afterEl = getGridDragAfterElement(boardEl, e.clientX, e.clientY);
    if (afterEl == null) {
      boardEl.appendChild(draggingEl);
    } else {
      boardEl.insertBefore(draggingEl, afterEl);
    }
  });
  boardEl.addEventListener('drop', e => {
    if (draggingColumnId) e.preventDefault();
  });

  function renderBoard() {
    boardEl.innerHTML = '';
    config.columns.forEach(col => {
      const colEl = document.createElement('div');
      colEl.className = 'board-column';
      colEl.dataset.colId = col.id;

      const header = document.createElement('div');
      header.className = 'board-column-header';

      const handle = document.createElement('span');
      handle.className = 'drag-handle';
      handle.title = t('admin_drag_handle_title');
      handle.textContent = '⠿';
      handle.draggable = true;
      header.appendChild(handle);

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = col.name;
      nameInput.addEventListener('change', () => {
        col.name = nameInput.value.trim() || col.name;
        persist();
        populateColumnSelects();
      });
      header.appendChild(nameInput);

      const deleteColBtn = document.createElement('button');
      deleteColBtn.type = 'button';
      deleteColBtn.className = 'column-delete-btn';
      deleteColBtn.title = t('admin_delete_column_title');
      deleteColBtn.textContent = '×';
      deleteColBtn.addEventListener('click', () => deleteColumn(col));
      header.appendChild(deleteColBtn);

      handle.addEventListener('dragstart', () => {
        draggingColumnId = col.id;
        colEl.classList.add('dragging-column');
      });
      handle.addEventListener('dragend', () => {
        colEl.classList.remove('dragging-column');
        draggingColumnId = null;
        commitColumnOrderFromDom();
      });

      colEl.appendChild(header);

      const body = document.createElement('div');
      body.className = 'board-column-body';
      body.dataset.colId = col.id;

      const items = getCardsForColumn(col.id);
      if (!items.length) {
        const note = document.createElement('div');
        note.className = 'unsorted-note';
        note.textContent = t('admin_column_empty_note');
        body.appendChild(note);
      } else {
        items.forEach(item => body.appendChild(makeCard(item)));
      }

      body.addEventListener('dragover', e => {
        if (draggingColumnId) return;
        e.preventDefault();
        body.classList.add('drag-over');
        const dragging = boardEl.querySelector('.dragging');
        if (!dragging) return;
        const note = body.querySelector('.unsorted-note');
        if (note) note.remove();
        const afterEl = getDragAfterElement(body, e.clientY);
        if (afterEl == null) {
          body.appendChild(dragging);
        } else {
          body.insertBefore(dragging, afterEl);
        }
      });
      body.addEventListener('dragleave', e => {
        if (e.target === body) body.classList.remove('drag-over');
      });
      body.addEventListener('drop', e => {
        if (draggingColumnId) return;
        e.preventDefault();
        body.classList.remove('drag-over');
      });

      colEl.appendChild(body);
      boardEl.appendChild(colEl);
    });

    const addColBtn = document.createElement('button');
    addColBtn.type = 'button';
    addColBtn.className = 'add-column-btn';
    addColBtn.textContent = t('admin_add_column_btn');
    addColBtn.addEventListener('click', addColumn);
    boardEl.appendChild(addColBtn);
  }

  // ---------- Lomakkeet ----------

  feedForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = feedNameInput.value.trim();
    const url = feedUrlInput.value.trim();
    if (!name || !url) return;
    const columnId = feedColumnSelect.value;
    const order = getCardsForColumn(columnId).length;
    config.feeds.push({ id: genId('feed'), name, url, columnId, order });
    persist();
    renderBoard();
    feedForm.reset();
    feedTestResult.textContent = '';
  });

  feedTestBtn.addEventListener('click', async () => {
    const url = feedUrlInput.value.trim();
    if (!url) {
      feedTestResult.classList.remove('success-text');
      feedTestResult.textContent = t('admin_test_enter_url');
      return;
    }
    feedTestResult.classList.remove('success-text');
    feedTestResult.textContent = t('admin_test_testing');
    try {
      const res = await fetch(`/api/feed?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('admin_test_unknown_error'));
      feedTestResult.classList.add('success-text');
      feedTestResult.textContent = t('admin_test_ok', { title: data.title, count: data.items.length });
    } catch (err) {
      feedTestResult.classList.remove('success-text');
      feedTestResult.textContent = t('admin_test_error', { message: err.message });
    }
  });

  // ---------- Avainsanat ----------

  function renderKeywords() {
    keywordChips.innerHTML = '';
    config.keywords.forEach((kw, idx) => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.innerHTML = `<span>${escapeHtml(kw)}</span>`;
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', () => {
        config.keywords.splice(idx, 1);
        persist();
        renderKeywords();
      });
      chip.appendChild(removeBtn);
      keywordChips.appendChild(chip);
    });
  }

  function syncItemsPerColumnInput() {
    itemsPerColumnInput.value = config.itemsPerColumn;
  }

  itemsPerColumnInput.addEventListener('change', () => {
    const value = Math.round(Number(itemsPerColumnInput.value));
    config.itemsPerColumn = Number.isFinite(value) && value >= 1 ? Math.min(50, value) : 5;
    itemsPerColumnInput.value = config.itemsPerColumn;
    persist();
  });

  keywordForm.addEventListener('submit', e => {
    e.preventDefault();
    const value = keywordInput.value.trim();
    if (!value) return;
    if (!config.keywords.map(k => k.toLowerCase()).includes(value.toLowerCase())) {
      config.keywords.push(value);
      persist();
      renderKeywords();
    }
    keywordInput.value = '';
  });

  // ---------- Tuonti / vienti ----------

  exportBtn.addEventListener('click', () => {
    importExportArea.style.display = 'block';
    importExportArea.value = JSON.stringify(config, null, 2);
    importExportArea.select();
  });

  importBtn.addEventListener('click', () => {
    if (importExportArea.style.display === 'none') {
      importExportArea.style.display = 'block';
      importExportArea.value = '';
      importExportArea.placeholder = t('admin_import_placeholder');
      importExportArea.focus();
      return;
    }
    try {
      const parsed = JSON.parse(importExportArea.value);
      if (!parsed.columns || parsed.columns.length < 1) throw new Error(t('admin_import_invalid_structure'));
      const importedItemsPerColumn = Math.round(Number(parsed.itemsPerColumn));
      config = {
        columns: parsed.columns,
        feeds: parsed.feeds || [],
        headlines: parsed.headlines || [],
        keywords: parsed.keywords || [],
        itemsPerColumn: Number.isFinite(importedItemsPerColumn) && importedItemsPerColumn >= 1
          ? Math.min(50, importedItemsPerColumn)
          : 5,
        theme: VALID_THEMES.includes(parsed.theme) ? parsed.theme : 'light',
        lang: parsed.lang === 'en' ? 'en' : 'fi',
        lastVisitAt: typeof parsed.lastVisitAt === 'string' ? parsed.lastVisitAt : null
      };
      saveConfig(config);
      location.reload();
    } catch (err) {
      alert(t('admin_import_error', { message: err.message }));
    }
  });

  resetBtn.addEventListener('click', () => {
    if (!confirm(t('admin_reset_confirm'))) return;
    config = defaultConfig();
    saveConfig(config);
    location.reload();
  });

  // ---------- Init ----------

  populateColumnSelects();
  renderBoard();
  renderKeywords();
  syncItemsPerColumnInput();
})();
