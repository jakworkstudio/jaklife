/**
 * JAK Life — Shared Components
 * Injects <nav> and <footer> into every page.
 *
 * ONE line before </body> on every page:
 *   index.html / book.html  →  <script src="./components.js"></script>
 *   tools/*.html            →  <script src="../components.js"></script>
 *
 * FIX: does NOT use document.currentScript (null at end-of-body).
 * Instead reads src from the script tag directly via querySelector.
 */

(function () {
  'use strict';

  /* ── 1. Find script tag by its src ending in "components.js" ──────
     querySelector('script[src]') finds it even at end of <body>.
     We use the script's absolute src URL to locate the site root.
  ─────────────────────────────────────────────────────────────────── */
  var allScripts = document.querySelectorAll('script[src]');
  var scriptURL  = null;
  for (var i = 0; i < allScripts.length; i++) {
    if (allScripts[i].src.indexOf('components.js') !== -1) {
      scriptURL = new URL(allScripts[i].src);
      break;
    }
  }

  if (!scriptURL) {
    console.warn('JAK components.js: could not find own script tag.');
    return;
  }

  /* ── 2. Compute base path ─────────────────────────────────────────
     The script always lives at the SITE ROOT (same folder as index.html).
     So the root directory = the script's directory.

     From the current PAGE, how many "../" do we need to reach root?
     Answer: count page path segments below root minus script path segments below root.

     Examples (file:// or http://):
       script: /jaklife/components.js          → scriptDir = /jaklife/
       page:   /jaklife/index.html             → pageDir   = /jaklife/      → base = "./"
       page:   /jaklife/tools/calc.html        → pageDir   = /jaklife/tools/ → base = "../"
       page:   /jaklife/a/b/page.html          → base = "../../"
  ─────────────────────────────────────────────────────────────────── */
  var scriptDir   = scriptURL.pathname.substring(0, scriptURL.pathname.lastIndexOf('/') + 1);
  var pagePathname = window.location.pathname;
  var pageDir     = pagePathname.substring(0, pagePathname.lastIndexOf('/') + 1);

  // Count depth difference
  var scriptSegments = scriptDir.replace(/^\/|\/$/g, '').split('/').filter(function(s){ return s !== ''; });
  var pageSegments   = pageDir.replace(/^\/|\/$/g, '').split('/').filter(function(s){ return s !== ''; });
  var extraDepth     = pageSegments.length - scriptSegments.length;

  var base = '';
  if (extraDepth <= 0) {
    base = './';
  } else {
    for (var d = 0; d < extraDepth; d++) base += '../';
  }

  /* ── 3. All site links — pure relative, no file:// or http:// ────*/
  var LOGO  = base + 'assets/JAKLifeLOGO.svg';
  var FootLOGO = base + 'assets/JAKLifeLOGO-lite.svg';
  var HOME     = base + 'index.html';
  var ABOUT    = base + 'about.html';
  var SERVICES = base + 'services.html';
  var SOCIAL   = base + 'social.html';
  var OMF      = base + 'one-more-friend.html';
  var BOOK     = base + 'book.html';
  var TOOL     = base + 'tools/interest-calculator.html';
  var CONTACT  = base + 'contact.html';

  /* ── 3b. Services sub-sections (drives the Services dropdown) ─────
     Each service now lives on its own page. `file` is the page,
     `id` is kept as the matching section id on services.html (used
     only for active-state matching, not for linking anymore).
  ─────────────────────────────────────────────────────────────────── */
  var SERVICE_AREAS = [
    { id: 'life-personal-growth',        file: 'life-personal-growth.html',        label: 'Life &amp; Personal Growth' },
    { id: 'career-professional-growth',  file: 'career-professional-growth.html',  label: 'Career &amp; Professional Growth' },
    { id: 'legal-guidance',              file: 'legal-guidance.html',              label: 'Legal Guidance' },
    { id: 'financial-discipline',        file: 'financial-discipline.html',        label: 'Financial Discipline' },
    { id: 'business-entrepreneurship',   file: 'business-entrepreneurship.html',   label: 'Business &amp; Entrepreneurship' },
    { id: 'ngo-social-impact',           file: 'ngo-social-impact.html',           label: 'NGO &amp; Social Impact' }
  ];

  /* ── 4. Detect current page ──────────────────────────────────────*/
  var isBook     = pagePathname.indexOf('book.html') !== -1;
  var isTool     = pagePathname.indexOf('interest-calculator') !== -1;
  var isServiceDetail = SERVICE_AREAS.some(function (a) { return pagePathname.indexOf('/' + a.file) !== -1 || pagePathname === a.file; });
  var isServices = pagePathname.indexOf('services.html') !== -1 || isServiceDetail;
  var isSocial   = pagePathname.indexOf('social.html') !== -1 || pagePathname.indexOf('one-more-friend') !== -1;
  var isHome     = !isBook && !isTool && !isServices && !isSocial;

  /* ── 5. Active class helper ──────────────────────────────────────*/
  function activeClass(checkPath) {
    if (pagePathname.indexOf(checkPath) !== -1) return ' class="active"';
    return '';
  }

  /* ── 6. SVGs ─────────────────────────────────────────────────────*/
  var SVG_R = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="7" x2="12" y2="7"/><polyline points="8,3 12,7 8,11"/></svg>';
  var SVG_L = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="7" x2="2" y2="7"/><polyline points="6,3 2,7 6,11"/></svg>';

  /* ── 7. Right-side nav element ───────────────────────────────────*/
  var navRight = isBook
    ? '<a class="jak-back" href="' + HOME + '">' + SVG_L + ' Back to home</a>'
    : '<a class="jak-cta" href="' + BOOK + '">Book a consultation ' + SVG_R + '</a>';

  /* ── 7b. Services dropdown menu + drawer sub-items (desktop + mobile) ── */
  var CHEVRON = '<svg class="jak-chevron" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,1 5,5 9,1"/></svg>';

  var servicesMenuItems = '';
  var servicesDrawerItems = '';
  for (var s = 0; s < SERVICE_AREAS.length; s++) {
    var area = SERVICE_AREAS[s];
    var areaHref = base + area.file;
    var areaActive = (pagePathname.indexOf('/' + area.file) !== -1 || pagePathname === area.file) ? ' jak-dropdown-item--active' : '';
    servicesMenuItems += '<a href="' + areaHref + '" class="jak-dropdown-item' + areaActive + '" role="menuitem">' + area.label + '</a>';
    servicesDrawerItems += '<li><a class="jak-drawer-sub" href="' + areaHref + '">' + area.label + '</a></li>';
  }

  /* ── 8. NAV HTML ─────────────────────────────────────────────────*/
  var NAV = ''
    + '<nav id="jak-nav">'
    +   '<a class="jak-logo" href="' + HOME + '"><img src="' + LOGO + '" alt="JAK Life"/></a>'
    +   '<ul class="jak-links">'
    +     '<li><a href="' + ABOUT + '"' + activeClass('about') + '>About</a></li>'
    +     '<li class="jak-dropdown">'
    +       '<a href="' + SERVICES + '" class="jak-dropdown-trigger jak-dropdown-trigger--link' + (isServices ? ' active' : '') + '" aria-expanded="false" aria-haspopup="true">'
    +         'Services'
    +         CHEVRON
    +       '</a>'
    +       '<div class="jak-dropdown-menu jak-dropdown-menu--wide" role="menu">'
    +         '<a href="' + SERVICES + '" class="jak-dropdown-item jak-dropdown-item--all" role="menuitem">All Services</a>'
    +         '<div class="jak-dropdown-divider"></div>'
    +         servicesMenuItems
    +       '</div>'
    +     '</li>'
    +     '<li class="jak-dropdown">'
    +       '<button class="jak-dropdown-trigger' + (isSocial ? ' active' : '') + '" aria-expanded="false" aria-haspopup="true">'
    +         'Social Initiative'
    +         CHEVRON
    +       '</button>'
    +       '<div class="jak-dropdown-menu" role="menu">'
    +         '<a href="' + OMF + '" class="jak-dropdown-item' + (pagePathname.indexOf('one-more-friend') !== -1 ? ' jak-dropdown-item--active' : '') + '" role="menuitem">One More Friend</a>'
    +       '</div>'
    +     '</li>'

    +     '<li><a href="' + TOOL + '"' + activeClass('interest-calculator') + '>Tools</a></li>'
    +     '<li><a href="' + HOME + '#resources">Resources</a></li>'
    +     '<li><a href="' + CONTACT + '"' + activeClass('contact') + '>Contact</a></li>'
    +   '</ul>'
    +   navRight
    +   '<button class="jak-ham" aria-label="Open menu" aria-expanded="false">'
    +     '<span></span><span></span><span></span>'
    +   '</button>'
    +   '<div class="jak-drawer">'
    +     '<ul>'
    +       '<li><a href="' + ABOUT + '">About</a></li>'
    +       '<li><a href="' + SERVICES + '">Services</a></li>'
    +       servicesDrawerItems
    +       '<li><a href="' + OMF + '"' + activeClass('one-more-friend') + '>One More Friend</a></li>'
    +       '<li><a href="' + TOOL + '">Tools</a></li>'
    +       '<li><a href="' + HOME + '#resources">Resources</a></li>'
    +       '<li><a href="' + CONTACT + '">Contact</a></li>'
    +     '</ul>'
    +     '<a class="jak-drawer-cta" href="' + BOOK + '">Book a consultation ' + SVG_R + '</a>'
    +   '</div>'
    + '</nav>';

  /* ── 9. FOOTER HTML ──────────────────────────────────────────────*/
  var FOOTER = ''
    + '<footer id="jak-footer">'
    +   '<div class="jak-foot">'
    +     '<p class="jak-foot-l">Clarity &middot; Direction &middot; Freedom</p>'
    +     '<a class="jak-logo-footer" href="' + HOME + '"><img src="' + FootLOGO + '" alt="JAK Life"/></a>'
    +   '</div>'
    + '</footer>';

  /* ── 10. CSS ─────────────────────────────────────────────────────*/
  var CSS = ''
/* nav shell */
+ '#jak-nav{'
+   'position:relative;z-index:200;display:flex;align-items:center;'
+   'justify-content:space-between;padding:0 var(--pad-x);height:88px;background:transparent;'
+ '}'
/* logo */
+ '.jak-logo{display:flex;align-items:center;text-decoration:none;flex-shrink:0;}'
+ '.jak-logo img{height:120px;width:auto;display:block;}'
+ '.jak-logo-footer img{height:80px;width:auto;display:block;}'
/* desktop links list */
+ '.jak-links{display:flex;align-items:center;gap:36px;list-style:none;margin:0;padding:0;}'
+ '.jak-links a{'
+   'text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.16em;'
+   'color:var(--navy);text-transform:uppercase;opacity:.7;transition:opacity .18s;'
+   'display:flex;align-items:center;gap:5px;position:relative;white-space:nowrap;'
+ '}'
+ '.jak-links a:hover{opacity:1;}'
+ '.jak-links a.active{opacity:1;}'
+ '.jak-links a.active::after{'
+   'content:"";position:absolute;left:0;right:0;bottom:-33px;height:2.5px;background:var(--teal);'
+ '}'
/* cta */
+ '.jak-cta{'
+   'background:var(--navy);color:#fff;padding:13px 22px;border-radius:6px;'
+   'font-size:13px;font-weight:600;letter-spacing:.07em;text-decoration:none;'
+   'display:flex;align-items:center;gap:12px;white-space:nowrap;flex-shrink:0;'
+   'transition:background .2s,transform .15s;'
+ '}'
+ '.jak-cta:hover{background:var(--navy-light);transform:translateY(-1px);}'
+ '.jak-cta svg{width:14px;height:14px;flex-shrink:0;}'
/* back link */
+ '.jak-back{'
+   'text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.13em;'
+   'text-transform:uppercase;color:var(--navy);display:flex;align-items:center;'
+   'gap:10px;opacity:.6;white-space:nowrap;flex-shrink:0;transition:opacity .18s,gap .2s;'
+ '}'
+ '.jak-back:hover{opacity:1;gap:14px;}'
+ '.jak-back svg{width:14px;height:14px;flex-shrink:0;}'
/* hamburger */
+ '.jak-ham{'
+   'display:none;flex-direction:column;justify-content:center;gap:5px;'
+   'background:none;border:none;cursor:pointer;padding:8px;border-radius:6px;'
+   'transition:background .15s;flex-shrink:0;'
+ '}'
+ '.jak-ham:hover{background:rgba(11,31,58,.06);}'
+ '.jak-ham span{display:block;width:22px;height:2px;background:var(--navy);border-radius:2px;transition:transform .25s,opacity .25s;}'
+ '.jak-ham.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}'
+ '.jak-ham.open span:nth-child(2){opacity:0;}'
+ '.jak-ham.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}'
/* drawer */
+ '.jak-drawer{'
+   'display:none;position:absolute;top:88px;left:0;right:0;'
+   'background:#fff;border-bottom:1px solid var(--border);'
+   'box-shadow:0 12px 40px rgba(11,31,58,.12);'
+   'padding:16px var(--pad-x) 24px;flex-direction:column;z-index:199;'
+   'opacity:0;transform:translateY(-6px);'
+   'transition:opacity .22s,transform .22s;pointer-events:none;'
+ '}'
+ '.jak-drawer.open{opacity:1;transform:translateY(0);pointer-events:all;}'
+ '.jak-drawer ul{list-style:none;margin:0;padding:0;}'
+ '.jak-drawer ul a{'
+   'display:block;padding:13px 0;font-size:13px;font-weight:700;letter-spacing:.14em;'
+   'text-transform:uppercase;color:var(--navy);text-decoration:none;opacity:.7;'
+   'border-bottom:1px solid var(--border);transition:opacity .15s;'
+ '}'
+ '.jak-drawer ul a:hover{opacity:1;}'
+ '.jak-drawer ul a.jak-drawer-sub{padding-left:18px;font-size:11px;letter-spacing:.10em;opacity:.5;}'
+ '.jak-drawer ul a.jak-drawer-sub:hover{opacity:.85;}'
+ '.jak-drawer ul li:last-child a{border-bottom:none;}'
+ '.jak-drawer-cta{'
+   'display:inline-flex;align-items:center;gap:10px;margin-top:18px;'
+   'background:var(--navy);color:#fff;padding:13px 22px;border-radius:6px;'
+   'font-size:13px;font-weight:600;letter-spacing:.07em;text-decoration:none;transition:background .2s;'
+ '}'
+ '.jak-drawer-cta:hover{background:var(--navy-light);}'
+ '.jak-drawer-cta svg{width:14px;height:14px;}'
/* dropdown */
+ '.jak-dropdown{position:relative;list-style:none;}'
+ '.jak-dropdown-trigger{'
+   'background:none;border:none;cursor:pointer;padding:0;text-decoration:none;'
+   'display:flex;align-items:center;gap:5px;'
+   'font-family:inherit;font-size:12px;font-weight:700;letter-spacing:0.16em;'
+   'color:var(--navy);text-transform:uppercase;opacity:.7;'
+   'transition:opacity .18s;white-space:nowrap;position:relative;'
+ '}'
+ '.jak-dropdown-trigger:hover{opacity:1;}'
+ '.jak-dropdown-trigger.active{opacity:1;}'
+ '.jak-dropdown-trigger.active::after{'
+   'content:"";position:absolute;left:0;right:0;bottom:-33px;height:2.5px;background:var(--teal);'
+ '}'
+ '.jak-chevron{width:8px;height:8px;flex-shrink:0;transition:transform .2s;}'
+ '.jak-dropdown.open .jak-chevron{transform:rotate(180deg);}'
+ '.jak-dropdown-menu{'
+   'position:absolute;top:calc(100% + 20px);left:50%;'
+   'transform:translateX(-50%) translateY(-4px);'
+   'background:#fff;border:1px solid var(--border);border-radius:10px;'
+   'box-shadow:0 16px 40px rgba(11,31,58,.12),0 3px 8px rgba(11,31,58,.06);'
+   'min-width:180px;padding:6px;'
+   'opacity:0;pointer-events:none;'
+   'transition:opacity .18s,transform .18s;'
+ '}'
+ '.jak-dropdown.open .jak-dropdown-menu{'
+   'opacity:1;pointer-events:all;transform:translateX(-50%) translateY(0);'
+ '}'
+ '.jak-dropdown-menu--wide{min-width:252px;}'
+ '.jak-dropdown-menu--wide .jak-dropdown-item{white-space:normal;line-height:1.4;}'
+ '.jak-dropdown-item{'
+   'display:block;padding:10px 14px;border-radius:6px;'
+   'text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.14em;'
+   'text-transform:uppercase;color:var(--navy);opacity:.7;'
+   'transition:background .13s,opacity .13s;white-space:nowrap;'
+ '}'
+ '.jak-dropdown-item:hover{background:rgba(11,31,58,.04);opacity:1;}'
+ '.jak-dropdown-item--active{opacity:1;color:var(--teal);}'
+ '.jak-dropdown-item--all{opacity:.95;color:var(--blue);}'
+ '.jak-dropdown-divider{height:1px;background:var(--border);margin:6px 6px;}'
/* footer */
+ '#jak-footer{margin-top:auto;}'
+ '.jak-foot{background:var(--navy);padding:22px var(--pad-x);display:flex;align-items:center;justify-content:space-between;}'
+ '.jak-foot-l{font-size:11px;letter-spacing:.14em;color:#fff;opacity:.35;font-weight:500;}'
+ '.jak-foot-r{font-family:"Cormorant Garamond",serif;font-size:16px;font-weight:600;color:var(--teal);letter-spacing:.06em;}'
/* responsive */
+ '@media(max-width:900px){'
+   '#jak-nav{height:72px;}'
+   '.jak-logo img{height:80px;}'
+   '.jak-links{display:none;}'
+   '.jak-cta{display:none;}'
+   '.jak-back{display:none;}'
+   '.jak-ham{display:flex;}'
+   '.jak-drawer{display:flex;top:72px;}'
+ '}'
+ '@media(max-width:520px){'
+   '#jak-nav{height:64px;}'
+   '.jak-logo img{height:64px;}'
+   '.jak-drawer{top:64px;}'
+ '}';

  /* ── 11. Inject style ────────────────────────────────────────────*/
  if (!document.getElementById('jak-css')) {
    var st = document.createElement('style');
    st.id  = 'jak-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ── 12. Inject nav at top of body ──────────────────────────────*/
  if (!document.getElementById('jak-nav')) {
    var navWrap = document.createElement('div');
    navWrap.innerHTML = NAV;
    document.body.insertBefore(navWrap.firstElementChild, document.body.firstChild);
  }

  /* ── 13. Inject footer at bottom of body ─────────────────────────*/
  if (!document.getElementById('jak-footer')) {
    var footWrap = document.createElement('div');
    footWrap.innerHTML = FOOTER;
    document.body.appendChild(footWrap.firstElementChild);
  }

  /* ── 14. Hamburger toggle ────────────────────────────────────────*/
  var ham    = document.querySelector('.jak-ham');
  var drawer = document.querySelector('.jak-drawer');

  if (ham && drawer) {
    ham.addEventListener('click', function () {
      var open = ham.classList.toggle('open');
      ham.setAttribute('aria-expanded', String(open));
      drawer.classList.toggle('open', open);
    });
    var dlinks = drawer.querySelectorAll('a');
    for (var k = 0; k < dlinks.length; k++) {
      dlinks[k].addEventListener('click', function () {
        ham.classList.remove('open');
        drawer.classList.remove('open');
        ham.setAttribute('aria-expanded', 'false');
      });
    }
  }

  /* ── 14b. Dropdowns — click toggle + hover with 2s linger ─────────
     Supports MULTIPLE dropdowns in the nav (Services, Social Initiative, …).
     Opening one closes any other that's open.
  ─────────────────────────────────────────────────────────────────── */
  var dropdownEls    = document.querySelectorAll('.jak-dropdown');
  var dropdownTimers = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;
  var fallbackTimers = []; // used only if WeakMap unsupported

  function getTimer(dd) {
    return dropdownTimers ? dropdownTimers.get(dd) : fallbackTimers[Array.prototype.indexOf.call(dropdownEls, dd)];
  }
  function setTimer(dd, t) {
    if (dropdownTimers) { dropdownTimers.set(dd, t); }
    else { fallbackTimers[Array.prototype.indexOf.call(dropdownEls, dd)] = t; }
  }

  function closeDropdownEl(dd) {
    dd.classList.remove('open');
    var trig = dd.querySelector('.jak-dropdown-trigger');
    if (trig) trig.setAttribute('aria-expanded', 'false');
  }

  function closeAllDropdowns(except) {
    for (var x = 0; x < dropdownEls.length; x++) {
      if (dropdownEls[x] !== except) closeDropdownEl(dropdownEls[x]);
    }
  }

  for (var p = 0; p < dropdownEls.length; p++) {
    (function (dropdownEl) {
      var triggerBtn = dropdownEl.querySelector('.jak-dropdown-trigger');
      if (!triggerBtn) return;

      function openDropdown() {
        clearTimeout(getTimer(dropdownEl));
        closeAllDropdowns(dropdownEl);
        dropdownEl.classList.add('open');
        triggerBtn.setAttribute('aria-expanded', 'true');
      }

      function closeDropdown() {
        clearTimeout(getTimer(dropdownEl));
        closeDropdownEl(dropdownEl);
      }

      function scheduleClose() {
        setTimer(dropdownEl, setTimeout(closeDropdown, 2000));
      }

      /* Click toggles open/close (link triggers still navigate on click) */
      triggerBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        clearTimeout(getTimer(dropdownEl));
        var isOpen = dropdownEl.classList.contains('open');
        if (isOpen) { closeDropdown(); } else { openDropdown(); }
      });

      /* Hover opens immediately; leaving starts the 2s countdown */
      dropdownEl.addEventListener('mouseenter', function () {
        clearTimeout(getTimer(dropdownEl));
        openDropdown();
      });
      dropdownEl.addEventListener('mouseleave', function () {
        scheduleClose();
      });

      /* Clicking a menu item closes immediately and lets the link navigate */
      var menuItems = dropdownEl.querySelectorAll('.jak-dropdown-item');
      for (var m = 0; m < menuItems.length; m++) {
        menuItems[m].addEventListener('click', function () {
          closeDropdown();
        });
      }
    })(dropdownEls[p]);
  }

  /* Clicking outside any dropdown closes them all */
  document.addEventListener('click', function (e) {
    var insideAny = false;
    for (var y = 0; y < dropdownEls.length; y++) {
      if (dropdownEls[y].contains(e.target)) { insideAny = true; break; }
    }
    if (!insideAny) closeAllDropdowns();
  });

  /* Escape key closes them all */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllDropdowns();
  });

  /* ── 15. Anchor smooth-scroll with nav offset ────────────────────
     Handles TWO cases:
     A) Clicking "#about" while ON index.html → smooth scroll
     B) Clicking "#about" from another page   → let browser navigate
        to index.html#about, then scroll on load

     The browser handles (B) natively when the href is "index.html#about".
     We only intercept (A) — when the target ID exists on the current page.
  ─────────────────────────────────────────────────────────────────── */
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return false;
    var navEl  = document.getElementById('jak-nav');
    var navH   = navEl ? navEl.offsetHeight : 88;
    var top    = el.getBoundingClientRect().top + window.pageYOffset - navH - 8;
    window.scrollTo({ top: top, behavior: 'smooth' });
    return true;
  }

  // On page load — if URL has a hash, scroll to it after a tick
  // (handles case B: arriving at index.html#about from another page)
  if (window.location.hash) {
    setTimeout(function () {
      scrollToId(window.location.hash.slice(1));
    }, 80);
  }

  // Intercept clicks on anchor links
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;

    var href = link.getAttribute('href') || '';

    // Only handle links that contain a # fragment
    if (href.indexOf('#') === -1) return;

    var hashIdx  = href.lastIndexOf('#');
    var targetId = href.slice(hashIdx + 1);
    if (!targetId) return;

    // If the target element exists on THIS page, intercept and smooth scroll
    if (document.getElementById(targetId)) {
      e.preventDefault();
      scrollToId(targetId);
      // Close mobile drawer if open
      if (ham) { ham.classList.remove('open'); drawer.classList.remove('open'); }
      // Update URL hash without jump
      history.pushState(null, '', '#' + targetId);
    }
    // Otherwise: let the browser navigate normally to index.html#about etc.
  });

})();