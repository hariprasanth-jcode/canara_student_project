/* ============================================
   Student Management System — Application Logic
   Vanilla JavaScript • Full CRUD • API Integration
   ============================================ */

(() => {
  'use strict';

  // ---------- Config ----------
  const API_BASE = '/student';

  // ---------- State ----------
  let students = [];
  let currentSort = { column: null, direction: 'desc' };
  let deleteTargetId = null;
  let editingRowId = null;
  let currentPage = 0;
  let pageSize = 5;

  // ---------- DOM References ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    tableBody:        $('#table-body'),
    tableCount:       $('#table-count'),
    emptyState:       $('#empty-state'),
    searchInput:      $('#search-input'),
    btnAddStudent:    $('#btn-add-student'),
    btnAddEmpty:      $('#btn-add-empty'),
    btnRefresh:       $('#btn-refresh'),

    // Stats
    statTotal:    $('#stat-total'),
    statAvg:      $('#stat-avg'),
    statTop:      $('#stat-top'),
    statSections: $('#stat-sections'),

    // Add Modal
    modalAdd:         $('#modal-add'),
    modalAddTitle:    $('#modal-add-title'),
    modalAddClose:    $('#modal-add-close'),
    modalAddCancel:   $('#modal-add-cancel'),
    modalAddSubmit:   $('#modal-add-submit'),
    studentForm:      $('#student-form'),
    formName:         $('#form-name'),
    formEmail:        $('#form-email'),
    formPercentage:   $('#form-percentage'),
    formGrade:        $('#form-grade'),
    formSection:      $('#form-section'),

    // Delete Modal
    modalDelete:        $('#modal-delete'),
    modalDeleteClose:   $('#modal-delete-close'),
    modalDeleteCancel:  $('#modal-delete-cancel'),
    modalDeleteConfirm: $('#modal-delete-confirm'),
    deleteStudentName:  $('#delete-student-name'),

    // Toast
    toastContainer: $('#toast-container'),

    // Pagination
    paginationContainer: $('#pagination-container'),
    paginationStart:     $('#pagination-start'),
    paginationEnd:       $('#pagination-end'),
    paginationTotal:     $('#pagination-total'),
    btnPrev:             $('#btn-prev'),
    btnNext:             $('#btn-next'),
    paginationPages:     $('#pagination-pages'),
    pageSizeSelect:      $('#page-size-select'),
    btnThemeToggle:      $('#btn-theme-toggle'),
  };

  // ---------- API Helpers ----------
  async function apiGet(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json();
  }

  async function apiPost(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
  }

  async function apiPut(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
  }

  async function apiDelete(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
  }

  // ---------- Toast Notifications ----------
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icon = type === 'success' ? '✅' : '❌';

    toast.innerHTML = `
      <span class="toast__icon">${icon}</span>
      <span class="toast__message">${escapeHtml(message)}</span>
      <button class="toast__close" aria-label="Dismiss">✕</button>
      <div class="toast__progress"></div>
    `;

    const closeBtn = toast.querySelector('.toast__close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    dom.toastContainer.appendChild(toast);

    // Auto remove after 3.5s
    setTimeout(() => removeToast(toast), 3500);
  }

  function removeToast(toast) {
    if (toast.classList.contains('removing')) return;
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }

  // ---------- Modal Helpers ----------
  function openModal(overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ---------- Loading Skeletons ----------
  function showLoadingSkeleton() {
    dom.emptyState.style.display = 'none';
    let html = '';
    for (let i = 0; i < 5; i++) {
      html += `
        <tr class="skeleton-row-tr">
          <td><div class="skeleton-cell" style="width:30px"></div></td>
          <td><div class="skeleton-cell" style="width:120px"></div></td>
          <td><div class="skeleton-cell" style="width:160px"></div></td>
          <td><div class="skeleton-cell" style="width:60px"></div></td>
          <td><div class="skeleton-cell" style="width:40px"></div></td>
          <td><div class="skeleton-cell" style="width:40px"></div></td>
          <td><div class="skeleton-cell" style="width:70px"></div></td>
        </tr>`;
    }
    dom.tableBody.innerHTML = html;
  }

  // ---------- Stats ----------
  function updateStats() {
    // Total
    dom.statTotal.textContent = students.length;

    if (students.length === 0) {
      dom.statAvg.textContent = '—';
      dom.statTop.textContent = '—';
      dom.statSections.textContent = '—';
      return;
    }

    // Average percentage
    const avg = students.reduce((sum, s) => sum + (s.percentage || 0), 0) / students.length;
    dom.statAvg.textContent = avg.toFixed(1) + '%';

    // Top scorer
    const top = students.reduce((best, s) => (s.percentage || 0) > (best.percentage || 0) ? s : best, students[0]);
    dom.statTop.textContent = top.name || '—';

    // Unique sections
    const sections = new Set(students.map(s => s.section).filter(Boolean));
    dom.statSections.textContent = sections.size || '—';
  }

  // ---------- Render Table ----------
  function renderTable(data, totalCount = null) {
    if (!data || data.length === 0) {
      dom.tableBody.innerHTML = '';
      dom.emptyState.style.display = '';
      dom.tableCount.textContent = '0 students';
      return;
    }

    dom.emptyState.style.display = 'none';
    const displayCount = totalCount !== null ? totalCount : data.length;
    dom.tableCount.textContent = `${displayCount} student${displayCount !== 1 ? 's' : ''}`;

    dom.tableBody.innerHTML = data.map(s => {
      const pctClass = (s.percentage || 0) >= 80 ? 'cell-percentage--high'
        : (s.percentage || 0) >= 50 ? 'cell-percentage--mid'
        : 'cell-percentage--low';

      const gradeClass = getGradeClass(s.grade);
      const gradeDisplay = s.grade || '—';
      const sectionDisplay = s.section || '—';

      return `
        <tr data-id="${s.id}">
          <td class="cell-id">#${s.id}</td>
          <td class="cell-name">${escapeHtml(s.name || '')}</td>
          <td class="cell-email" id="email-cell-${s.id}">${escapeHtml(s.email || '—')}</td>
          <td class="cell-percentage ${pctClass}">${s.percentage != null ? s.percentage.toFixed(1) + '%' : '—'}</td>
          <td><span class="cell-grade ${gradeClass}">${escapeHtml(gradeDisplay)}</span></td>
          <td class="cell-section">${escapeHtml(sectionDisplay)}</td>
          <td class="cell-actions">
            <button class="btn btn--ghost btn--icon btn-edit-email" data-id="${s.id}" data-email="${escapeAttr(s.email || '')}" title="Edit email">✏️</button>
            <button class="btn btn--ghost btn--icon btn-delete" data-id="${s.id}" data-name="${escapeAttr(s.name || '')}" title="Delete student">🗑️</button>
          </td>
        </tr>`;
    }).join('');

    // Attach row action listeners
    dom.tableBody.querySelectorAll('.btn-edit-email').forEach(btn => {
      btn.addEventListener('click', handleEditEmailClick);
    });
    dom.tableBody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', handleDeleteClick);
    });
  }

  function getGradeClass(grade) {
    if (!grade) return 'grade--default';
    const g = grade.toUpperCase().replace('+', '');
    if (g === 'O') return 'grade--O';
    if (g === 'A') return 'grade--A';
    if (g === 'B') return 'grade--B';
    if (g === 'C') return 'grade--C';
    return 'grade--default';
  }

  // ---------- Column Sorting ----------
  function updateSortHeaders() {
    $$('.data-table th[data-sort]').forEach(th => {
      th.classList.toggle('sorted', th.dataset.sort === currentSort.column);
      const icon = th.querySelector('.sort-icon');
      if (th.dataset.sort === currentSort.column) {
        icon.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
      } else {
        icon.textContent = '⇅';
      }
    });
  }

  async function handleSort(columnName) {
    // Toggle direction
    if (currentSort.column === columnName) {
      currentSort.direction = currentSort.direction === 'desc' ? 'asc' : 'desc';
    } else {
      currentSort.column = columnName;
      currentSort.direction = 'desc';
    }

    updateSortHeaders();

    try {
      // The API endpoint GET /student/sort/{columnName} always returns descending.
      // We'll use it and reverse client-side if needed.
      const sorted = await apiGet(`/sort/${columnName}`);
      if (currentSort.direction === 'asc') {
        sorted.reverse();
      }
      students = sorted;
      currentPage = 0;
      renderCurrentPage();
    } catch (err) {
      console.error('Sort failed:', err);
      // Fallback: client-side sort
      const sorted = [...students].sort((a, b) => {
        let va = a[columnName], vb = b[columnName];
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return currentSort.direction === 'asc' ? -1 : 1;
        if (va > vb) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
      students = sorted;
      currentPage = 0;
      renderCurrentPage();
    }
  }

  // ---------- Search / Filter ----------
  function applyClientFilter(data) {
    const query = dom.searchInput.value.trim().toLowerCase();
    if (!query) return data;
    return data.filter(s =>
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.email && s.email.toLowerCase().includes(query)) ||
      (s.grade && s.grade.toLowerCase().includes(query)) ||
      (s.section && s.section.toLowerCase().includes(query)) ||
      String(s.id).includes(query)
    );
  }

  // ---------- Fetch Full List ----------
  async function fetchFullList() {
    try {
      students = await apiGet('');
      updateStats();
    } catch (err) {
      console.error('Failed to fetch full list:', err);
      showToast('Failed to load students. Is the server running?', 'error');
    }
  }

  // ---------- Render Current Page ----------
  async function renderCurrentPage() {
    showLoadingSkeleton();
    try {
      const query = dom.searchInput.value.trim().toLowerCase();
      const isSearchOrSort = query || currentSort.column;

      if (isSearchOrSort) {
        let processed = [...students];
        if (currentSort.column) {
          processed.sort((a, b) => {
            let va = a[currentSort.column], vb = b[currentSort.column];
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            if (va < vb) return currentSort.direction === 'asc' ? -1 : 1;
            if (va > vb) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
          });
        }
        if (query) {
          processed = processed.filter(s =>
            (s.name && s.name.toLowerCase().includes(query)) ||
            (s.email && s.email.toLowerCase().includes(query)) ||
            (s.grade && s.grade.toLowerCase().includes(query)) ||
            (s.section && s.section.toLowerCase().includes(query)) ||
            String(s.id).includes(query)
          );
        }

        const totalCount = processed.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        if (currentPage >= totalPages) {
          currentPage = totalPages - 1;
        }

        const startIndex = currentPage * pageSize;
        const pageData = processed.slice(startIndex, startIndex + pageSize);

        renderTable(pageData, totalCount);
        renderPaginationControls(totalCount);
      } else {
        const totalCount = students.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        if (currentPage >= totalPages) {
          currentPage = totalPages - 1;
        }

        const pageData = await apiGet(`/page/${currentPage}/${pageSize}`);
        renderTable(pageData, totalCount);
        renderPaginationControls(totalCount);
      }
    } catch (err) {
      console.error('Failed to render current page:', err);
      dom.tableBody.innerHTML = '';
      dom.emptyState.style.display = '';
      dom.paginationContainer.style.display = 'none';
    }
  }

  // ---------- Load All Students ----------
  async function loadStudents() {
    await fetchFullList();
    await renderCurrentPage();
  }

  // ---------- Render Pagination Controls ----------
  function renderPaginationControls(totalCount) {
    if (totalCount === 0) {
      dom.paginationContainer.style.display = 'none';
      return;
    }
    dom.paginationContainer.style.display = 'flex';

    const totalPages = Math.ceil(totalCount / pageSize);

    if (currentPage >= totalPages) {
      currentPage = Math.max(0, totalPages - 1);
    }

    const start = currentPage * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalCount);
    dom.paginationStart.textContent = start;
    dom.paginationEnd.textContent = end;
    dom.paginationTotal.textContent = totalCount;

    dom.btnPrev.disabled = (currentPage === 0);
    dom.btnNext.disabled = (currentPage >= totalPages - 1);

    let pagesHtml = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    if (startPage > 0) {
      pagesHtml += `<button class="pagination-page" data-page="0">1</button>`;
      if (startPage > 1) {
        pagesHtml += `<span class="pagination-page" style="cursor: default; opacity: 0.6;">...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const activeClass = i === currentPage ? 'active' : '';
      pagesHtml += `<button class="pagination-page ${activeClass}" data-page="${i}">${i + 1}</button>`;
    }

    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pagesHtml += `<span class="pagination-page" style="cursor: default; opacity: 0.6;">...</span>`;
      }
      pagesHtml += `<button class="pagination-page" data-page="${totalPages - 1}">${totalPages}</button>`;
    }

    dom.paginationPages.innerHTML = pagesHtml;

    dom.paginationPages.querySelectorAll('.pagination-page[data-page]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentPage = parseInt(e.currentTarget.dataset.page, 10);
        renderCurrentPage();
      });
    });
  }

  // ---------- Add Student ----------
  function openAddModal() {
    dom.modalAddTitle.textContent = 'Add New Student';
    dom.modalAddSubmit.textContent = 'Add Student';
    dom.studentForm.reset();
    openModal(dom.modalAdd);
    dom.formName.focus();
  }

  async function handleAddSubmit() {
    const name = dom.formName.value.trim();
    const email = dom.formEmail.value.trim();
    const percentage = parseFloat(dom.formPercentage.value);
    const grade = dom.formGrade.value.trim();
    const section = dom.formSection.value.trim();

    // Validation
    if (!name) {
      showToast('Please enter a student name.', 'error');
      dom.formName.focus();
      return;
    }
    if (!email) {
      showToast('Please enter an email address.', 'error');
      dom.formEmail.focus();
      return;
    }
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      showToast('Percentage must be between 0 and 100.', 'error');
      dom.formPercentage.focus();
      return;
    }

    const student = { name, email, percentage };
    if (grade) student.grade = grade;
    if (section) student.section = section;

    dom.modalAddSubmit.disabled = true;
    dom.modalAddSubmit.textContent = 'Adding…';

    try {
      await apiPost('', student);
      closeModal(dom.modalAdd);
      showToast(`${name} added successfully!`);
      await loadStudents();
    } catch (err) {
      console.error('Add failed:', err);
      showToast('Failed to add student. Please try again.', 'error');
    } finally {
      dom.modalAddSubmit.disabled = false;
      dom.modalAddSubmit.textContent = 'Add Student';
    }
  }

  // ---------- Edit Email (Inline) ----------
  function handleEditEmailClick(e) {
    const btn = e.currentTarget;
    const id = parseInt(btn.dataset.id, 10);
    const currentEmail = btn.dataset.email;

    // Cancel any previous inline edit
    cancelInlineEdit();

    editingRowId = id;
    const cell = document.getElementById(`email-cell-${id}`);
    if (!cell) return;

    cell.innerHTML = `
      <div class="inline-edit">
        <input class="inline-edit__input" type="email" id="inline-email-${id}" value="${escapeAttr(currentEmail)}" />
        <button class="inline-edit__btn inline-edit__btn--save" id="inline-save-${id}" title="Save">✓</button>
        <button class="inline-edit__btn inline-edit__btn--cancel" id="inline-cancel-${id}" title="Cancel">✕</button>
      </div>
    `;

    const input = document.getElementById(`inline-email-${id}`);
    input.focus();
    input.select();

    document.getElementById(`inline-save-${id}`).addEventListener('click', () => saveInlineEmail(id));
    document.getElementById(`inline-cancel-${id}`).addEventListener('click', () => cancelInlineEdit());

    // Save on Enter, cancel on Escape
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') saveInlineEmail(id);
      if (ev.key === 'Escape') cancelInlineEdit();
    });
  }

  async function saveInlineEmail(id) {
    const input = document.getElementById(`inline-email-${id}`);
    if (!input) return;

    const newEmail = input.value.trim();
    if (!newEmail) {
      showToast('Email cannot be empty.', 'error');
      input.focus();
      return;
    }

    try {
      await apiPut(`/email/${id}/${encodeURIComponent(newEmail)}`);
      showToast('Email updated successfully!');
      editingRowId = null;
      await loadStudents();
    } catch (err) {
      console.error('Email update failed:', err);
      showToast('Failed to update email.', 'error');
    }
  }

  function cancelInlineEdit() {
    if (editingRowId === null) return;
    // Re-render the table to restore the cell
    renderCurrentPage();
    editingRowId = null;
  }

  // ---------- Delete Student ----------
  function handleDeleteClick(e) {
    const btn = e.currentTarget;
    const id = parseInt(btn.dataset.id, 10);
    const name = btn.dataset.name;

    deleteTargetId = id;
    dom.deleteStudentName.textContent = name || `Student #${id}`;
    openModal(dom.modalDelete);
  }

  async function handleDeleteConfirm() {
    if (deleteTargetId === null) return;

    dom.modalDeleteConfirm.disabled = true;
    dom.modalDeleteConfirm.textContent = 'Deleting…';

    try {
      await apiDelete(`/id/${deleteTargetId}`);
      closeModal(dom.modalDelete);
      showToast('Student deleted successfully.');
      deleteTargetId = null;
      await loadStudents();
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Failed to delete student.', 'error');
    } finally {
      dom.modalDeleteConfirm.disabled = false;
      dom.modalDeleteConfirm.textContent = 'Delete';
    }
  }

  // ---------- Utility ----------
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------- Debounce ----------
  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  // ---------- Event Binding ----------
  function bindEvents() {
    // Add student buttons
    dom.btnAddStudent.addEventListener('click', openAddModal);
    dom.btnAddEmpty.addEventListener('click', openAddModal);

    // Add modal actions
    dom.modalAddClose.addEventListener('click', () => closeModal(dom.modalAdd));
    dom.modalAddCancel.addEventListener('click', () => closeModal(dom.modalAdd));
    dom.modalAddSubmit.addEventListener('click', handleAddSubmit);

    // Submit on Enter in form
    dom.studentForm.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddSubmit();
      }
    });

    // Delete modal actions
    dom.modalDeleteClose.addEventListener('click', () => closeModal(dom.modalDelete));
    dom.modalDeleteCancel.addEventListener('click', () => closeModal(dom.modalDelete));
    dom.modalDeleteConfirm.addEventListener('click', handleDeleteConfirm);

    // Close modals on overlay click
    [dom.modalAdd, dom.modalDelete].forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay);
      });
    });

    // Close modals on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (dom.modalAdd.classList.contains('active')) closeModal(dom.modalAdd);
        if (dom.modalDelete.classList.contains('active')) closeModal(dom.modalDelete);
        cancelInlineEdit();
      }
    });

    // Refresh
    dom.btnRefresh.addEventListener('click', loadStudents);

    // Search (debounced)
    dom.searchInput.addEventListener('input', debounce(() => {
      currentPage = 0;
      renderCurrentPage();
    }, 250));

    // Pagination Next/Prev button actions
    dom.btnPrev.addEventListener('click', () => {
      if (currentPage > 0) {
        currentPage--;
        renderCurrentPage();
      }
    });

    dom.btnNext.addEventListener('click', () => {
      const query = dom.searchInput.value.trim().toLowerCase();
      const totalCount = query ? applyClientFilter(students).length : students.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      if (currentPage < totalPages - 1) {
        currentPage++;
        renderCurrentPage();
      }
    });

    // Pagination Size dropdown action
    dom.pageSizeSelect.addEventListener('change', (e) => {
      pageSize = parseInt(e.currentTarget.value, 10);
      currentPage = 0;
      renderCurrentPage();
    });

    // Column sort
    $$('.data-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => handleSort(th.dataset.sort));
    });

    // Theme Toggle
    dom.btnThemeToggle.addEventListener('click', toggleTheme);
  }

  // ---------- Theme Handler ----------
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    dom.btnThemeToggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    dom.btnThemeToggle.textContent = newTheme === 'light' ? '☀️' : '🌙';
    showToast(`Switched to ${newTheme} mode!`);
  }

  // ---------- Init ----------
  function init() {
    initTheme();
    bindEvents();
    loadStudents();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();