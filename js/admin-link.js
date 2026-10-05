/* Admin-only menu link.
   Adds an "Admin dashboard" item to the account dropdown, but ONLY for signed-in
   admins. For everyone else the item is never created at all (it is not just
   hidden with CSS), so it does not appear in the page source either.
   This is a convenience only: the real protection is in the database, where
   every admin action and Admin.html's own check call is_admin() server-side. */
(function () {
  var LINK_ID = 'navAdminLink';

  function removeLink() {
    var old = document.getElementById(LINK_ID);
    if (old) old.remove();
  }

  async function refreshAdminLink() {
    var body = document.querySelector('#profileDropdown .dropdown-body');
    if (!body || !window.sbClient) return;

    var isAdmin = false;
    try {
      var s = await window.sbClient.auth.getSession();
      if (s && s.data && s.data.session) {
        var r = await window.sbClient.rpc('is_admin');
        isAdmin = !r.error && r.data === true;
      }
    } catch (e) {
      isAdmin = false;
    }

    removeLink();
    if (!isAdmin) return;

    var a = document.createElement('a');
    a.id = LINK_ID;
    a.href = 'Admin.html';
    a.className = 'menu-item';
    a.setAttribute('role', 'menuitem');
    a.innerHTML = '<div class="menu-icon gold">🛡️</div><span class="menu-label">Admin dashboard</span>';

    // Sit above the divider that precedes "Sign Out".
    var signOut = body.querySelector('.menu-item.danger');
    var anchor = signOut;
    if (signOut && signOut.previousElementSibling && signOut.previousElementSibling.classList.contains('menu-sep')) {
      anchor = signOut.previousElementSibling;
    }
    if (anchor) body.insertBefore(a, anchor);
    else body.appendChild(a);
  }

  function start() {
    refreshAdminLink();
    if (window.sbClient && window.sbClient.auth && window.sbClient.auth.onAuthStateChange) {
      window.sbClient.auth.onAuthStateChange(function () {
        // Deferred: do not call Supabase from inside its own auth callback.
        setTimeout(refreshAdminLink, 0);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
