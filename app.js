(() => {
  const STORAGE_KEY = 'northstar.accounts.v1';
  const SESSION_KEY = 'northstar.session.v1';
  const $ = (selector) => document.querySelector(selector);
  const form = $('#auth-form');
  const notice = $('#notice');
  let mode = 'login';

  function navigate(path) {
    if (window.location.pathname !== path) history.pushState({}, '', path);
    renderRoute();
  }

  function renderRoute() {
    const path = window.location.pathname.replace(/\/$/, '') || '/login';
    if (path === '/home') {
      const email = sessionStorage.getItem(SESSION_KEY);
      const account = accounts().find((item) => item.email === email);
      if (!account) {
        history.replaceState({}, '', '/login');
        $('#account-view').hidden = true;
        $('#auth-view').hidden = false;
        setMode('login');
        return;
      }
      showAccount(account);
      return;
    }
    $('#account-view').hidden = true;
    $('#auth-view').hidden = false;
    setMode(path === '/createaccount' ? 'signup' : 'login');
  }

  function accounts() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  }

  function message(text, type = 'error') {
    notice.textContent = text;
    notice.className = `notice visible ${type}`;
  }

  function setMode(nextMode) {
    mode = nextMode;
    const signup = mode === 'signup';
    $('#login-tab').classList.toggle('active', !signup);
    $('#signup-tab').classList.toggle('active', signup);
    $('#login-tab').setAttribute('aria-selected', String(!signup));
    $('#signup-tab').setAttribute('aria-selected', String(signup));
    $('#form-eyebrow').textContent = signup ? 'A FRESH START' : 'GOOD TO HAVE YOU';
    $('#form-title').textContent = signup ? 'Create your account' : 'Welcome back';
    $('#form-subtitle').textContent = signup ? 'A little space to make big things happen.' : 'Pick up right where you left off.';
    $('#name-field').hidden = !signup;
    $('#confirm-field').hidden = !signup;
    $('#forgot-link').hidden = signup;
    $('#terms-copy').hidden = !signup;
    $('#password').autocomplete = signup ? 'new-password' : 'current-password';
    $('#submit-button').innerHTML = signup ? 'Create account <span>→</span>' : 'Log in <span>→</span>';
    $('#switch-copy').innerHTML = signup
      ? 'Already have an account? <button type="button" data-mode="login">Log in</button>'
      : 'New to Northstar? <button type="button" data-mode="signup">Create an account</button>';
    notice.className = 'notice';
    const destination = signup ? '/createaccount' : '/login';
    if (window.location.pathname !== destination) history.pushState({}, '', destination);
  }

  function showAccount(account) {
    $('#auth-view').hidden = true;
    $('#account-view').hidden = false;
    $('#account-title').textContent = `Welcome${account.name ? `, ${account.name.split(' ')[0]}` : ''}`;
    $('#account-subtitle').textContent = `You’re signed in as ${account.email}.`;
    renderEntries();
  }

  function entryKey() {
    return `northstar.entries.${sessionStorage.getItem(SESSION_KEY) || 'guest'}`;
  }

  function renderEntries() {
    let entries = [];
    try { entries = JSON.parse(localStorage.getItem(entryKey()) || '[]'); } catch { /* Ignore invalid local data. */ }
    const list = $('#entry-list');
    if (!entries.length) {
      list.innerHTML = '<div class="empty-state"><span>✎</span><strong>No entries yet</strong><p>Your saved notes will show up here.</p></div>';
      return;
    }
    list.innerHTML = entries.slice().reverse().map((entry) => `<article class="entry-card"><div class="entry-meta"><span>${escapeHtml(entry.category)}</span><time>${new Date(entry.createdAt).toLocaleDateString()}</time></div><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.content)}</p></article>`).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }

  function showPage(page) {
    document.querySelectorAll('.page-view').forEach((view) => { view.hidden = view.id !== `${page}-page`; });
    document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.page === page));
    if (page === 'entries') renderEntries();
    if (page === 'home') history.replaceState({}, '', '/home');
  }

  function resumeSession() {
    try { renderRoute(); }
    catch { history.replaceState({}, '', '/login'); setMode('login'); }
  }

  document.querySelector('.tabs').addEventListener('click', (event) => {
    if (event.target.id === 'login-tab') setMode('login');
    if (event.target.id === 'signup-tab') setMode('signup');
  });
  $('#switch-copy').addEventListener('click', (event) => {
    const button = event.target.closest('[data-mode]');
    if (button) setMode(button.dataset.mode);
  });
  $('#toggle-password').addEventListener('click', () => {
    const input = $('#password');
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    $('#toggle-password').textContent = visible ? 'Hide' : 'Show';
    $('#toggle-password').setAttribute('aria-label', `${visible ? 'Hide' : 'Show'} password`);
  });
  $('#forgot-link').addEventListener('click', (event) => {
    event.preventDefault();
    message('Password reset isn’t set up yet. Please create a new account or contact your administrator.', 'success');
  });
  $('#logout-button').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    navigate('/login');
    form.reset();
    setMode('login');
    message('You’ve been logged out.', 'success');
  });

  $('#account-view').addEventListener('click', (event) => {
    const link = event.target.closest('[data-page]');
    if (link) showPage(link.dataset.page);
  });
  $('#entry-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const entry = {
      title: $('#entry-title').value.trim(),
      category: $('#entry-category').value,
      content: $('#entry-content').value.trim(),
      createdAt: new Date().toISOString()
    };
    if (!entry.title || !entry.content) return;
    try {
      const saved = JSON.parse(localStorage.getItem(entryKey()) || '[]');
      localStorage.setItem(entryKey(), JSON.stringify([...saved, entry]));
      $('#entry-form').reset();
      $('#entry-notice').textContent = 'Your entry was saved.';
      $('#entry-notice').className = 'notice visible success';
      renderEntries();
      window.setTimeout(() => showPage('entries'), 500);
    } catch {
      $('#entry-notice').textContent = 'Could not save this entry. Please check browser storage.';
      $('#entry-notice').className = 'notice visible error';
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    notice.className = 'notice';
    const email = $('#email').value.trim().toLowerCase();
    const password = $('#password').value;
    if (!/^\S+@\S+\.\S+$/.test(email)) return message('Enter a valid email address.');
    if (password.length < 8) return message('Your password must be at least 8 characters.');

    const savedAccounts = accounts();
    if (mode === 'signup') {
      const name = $('#name').value.trim();
      if (!name) return message('Enter your name to continue.');
      if (password !== $('#confirm-password').value) return message('Those passwords don’t match.');
      if (savedAccounts.some((account) => account.email === email)) return message('An account with that email already exists. Try logging in.');
      const account = { name, email, password, createdAt: new Date().toISOString() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedAccounts, account]));
        sessionStorage.setItem(SESSION_KEY, email);
      } catch { return message('Local storage is unavailable. Please enable browser storage and try again.'); }
      navigate('/home');
    } else {
      const account = savedAccounts.find((item) => item.email === email && item.password === password);
      if (!account) return message('That email and password combination wasn’t found.');
      try { sessionStorage.setItem(SESSION_KEY, email); }
      catch { return message('Session storage is unavailable. Please enable browser storage and try again.'); }
      navigate('/home');
    }
  });

  window.addEventListener('popstate', resumeSession);
  document.querySelector('.app-brand').addEventListener('click', (event) => { event.preventDefault(); navigate('/home'); showPage('home'); });
  resumeSession();
})();
