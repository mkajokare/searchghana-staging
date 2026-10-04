/* Shared site-wide header logic.
   The nav's profile widget previously showed a hardcoded "Kwame A." on every
   page regardless of who (if anyone) was actually signed in. This file makes
   it reflect the real Supabase session: real initials, real short name, real
   dropdown name/email -- and when no one is signed in, it hides the profile
   widget and shows a plain "Sign in" link instead (there was previously no
   logged-out state at all). It also wires the Sign Out menu item, which was
   previously a dead `href="#"` that did nothing. */
(function () {
  function initials(name) {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }

  async function initNavProfile() {
    if (!window.sbClient) return;
    const wrapper = document.querySelector('.profile-wrapper');
    const signInLink = document.getElementById('navSignInLink');

    let session = null;
    try {
      const { data } = await window.sbClient.auth.getSession();
      session = data && data.session;
    } catch (e) {
      session = null;
    }

    if (!session) {
      if (wrapper) wrapper.style.display = 'none';
      if (signInLink) signInLink.style.display = 'inline-flex';
      return;
    }

    if (wrapper) wrapper.style.display = '';
    if (signInLink) signInLink.style.display = 'none';

    const user = session.user;
    const meta = user.user_metadata || {};
    const fullName = meta.full_name || '';
    const displayName = meta.display_name || fullName || user.email || 'Account';
    const firstName = meta.first_name || fullName.split(' ')[0] || '';
    const lastName = meta.last_name || fullName.split(' ').slice(1).join(' ') || '';
    const shortName = firstName ? `${firstName} ${lastName ? lastName[0] + '.' : ''}`.trim() : displayName;
    const initialsText = initials(displayName);

    const avatarSm = document.getElementById('navAvatarSm');
    const nameSm = document.getElementById('navNameSm');
    const avatarLg = document.getElementById('navAvatarLg');
    const dropName = document.getElementById('navDropdownName');
    const dropEmail = document.getElementById('navDropdownEmail');
    if (avatarSm) avatarSm.textContent = initialsText;
    if (nameSm) nameSm.textContent = shortName;
    if (avatarLg) avatarLg.textContent = initialsText;
    if (dropName) dropName.textContent = displayName;
    if (dropEmail) dropEmail.textContent = user.email || '';
  }

  window.navSignOut = async function () {
    if (window.sbClient) {
      try { await window.sbClient.auth.signOut(); } catch (e) { /* fall through to redirect regardless */ }
    }
    window.location.href = 'Index.html';
  };

  /* ── Accessibility: the profile dropdown had no ARIA state at all (a sighted
     mouse user could tell it was open; a screen-reader user had no way to
     know), and keyboard users had no visible focus indicator anywhere on the
     site. Both are added here, centrally, rather than in each page's own
     copy-pasted script. ── */
  function wireDropdownAria() {
    const btn = document.getElementById('profileBtn');
    const dropdown = document.getElementById('profileDropdown');
    if (!btn || !dropdown) return;
    btn.setAttribute('aria-haspopup', 'true');
    if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
    dropdown.setAttribute('role', 'menu');
    dropdown.querySelectorAll('.menu-item').forEach(item => item.setAttribute('role', 'menuitem'));

    // The page's own toggleProfile() flips the 'open' class; reflect that
    // in aria-expanded a tick later rather than re-implementing the toggle.
    btn.addEventListener('click', function () {
      setTimeout(function () {
        btn.setAttribute('aria-expanded', btn.classList.contains('open') ? 'true' : 'false');
      }, 0);
    });
  }

  function injectFocusVisibleStyle() {
    if (document.getElementById('navA11yFocusStyle')) return;
    const style = document.createElement('style');
    style.id = 'navA11yFocusStyle';
    style.textContent = '*:focus-visible { outline: 2px solid var(--brand-red, #CE1126); outline-offset: 2px; }';
    document.head.appendChild(style);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavProfile();
    wireDropdownAria();
    injectFocusVisibleStyle();
  });
  if (window.sbClient && window.sbClient.auth && window.sbClient.auth.onAuthStateChange) {
    window.sbClient.auth.onAuthStateChange(function () { initNavProfile(); });
  }
})();
