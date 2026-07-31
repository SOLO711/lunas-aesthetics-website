/* ════════════════════════════════════════
   Luna's Esthetics – Main JavaScript
   ════════════════════════════════════════ */

/* ── HandWrittenTitle SVG draw animation ── */
(function () {
  const path = document.getElementById('htPath');
  if (!path) return;
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
  path.style.animation = `htDraw 2.5s cubic-bezier(0.43,0.13,0.23,0.96) 0.7s forwards`;
})();

/* ── Launch Week Promo ── */
const LAUNCH_DATE = '2026-06-11';
const LAUNCH_END  = '2026-06-15';

(function initLaunchPromo() {
  const today = new Date().toISOString().split('T')[0];
  if (today < LAUNCH_DATE || today > LAUNCH_END) return;

  const msLeft   = new Date(LAUNCH_END + 'T23:59:59') - Date.now();
  const daysLeft = Math.max(0, Math.ceil(msLeft / 86400000));

  /* Sitewide announcement bar */
  if (!sessionStorage.getItem('lunas_launch_dismissed')) {
    const bar = document.createElement('div');
    bar.id        = 'launchBar';
    bar.className = 'launch-bar';
    bar.innerHTML = `<div class="launch-bar-inner">
      <span class="launch-bar-icon" aria-hidden="true">🎉</span>
      <span class="launch-bar-text"><strong>Grand Opening Special:</strong> 10% OFF all July bookings<em class="launch-bar-excl"> — waxing excluded</em></span>
      <span class="launch-bar-pill">July only</span>
      <a href="book.html" class="launch-bar-cta">Book Now</a>
      <button class="launch-bar-close" aria-label="Dismiss promotion">×</button>
    </div>`;
    document.body.insertBefore(bar, document.body.firstChild);

    const navEl = document.querySelector('.navbar');
    if (navEl) navEl.style.top = bar.offsetHeight + 'px';

    bar.querySelector('.launch-bar-close').addEventListener('click', () => {
      const h = bar.offsetHeight;
      Object.assign(bar.style, { height: h + 'px', overflow: 'hidden', transition: 'height 0.25s ease, opacity 0.25s ease' });
      requestAnimationFrame(() => { bar.style.height = '0'; bar.style.opacity = '0'; });
      setTimeout(() => { bar.remove(); if (navEl) navEl.style.top = ''; }, 270);
      sessionStorage.setItem('lunas_launch_dismissed', '1');
    });
  }

  /* Front page promo section */
  const promoSec = document.getElementById('launchPromoSection');
  if (promoSec) {
    promoSec.style.display = '';

    const validEl = document.getElementById('lpsValidUntil');
    if (validEl) {
      validEl.textContent = 'July appointments only';
    }

    function updateLpsCountdown() {
      const el = document.getElementById('lpsCountdown');
      if (!el) return;
      const diff = new Date(LAUNCH_END + 'T23:59:59') - Date.now();
      if (diff <= 0) { promoSec.style.display = 'none'; return; }
      const d  = Math.floor(diff / 86400000);
      const h  = Math.floor((diff % 86400000) / 3600000);
      const m  = Math.floor((diff % 3600000) / 60000);
      el.innerHTML =
        `<div class="lps-cd-unit"><span class="lps-cd-num">${d}</span><span class="lps-cd-label">Day${d !== 1 ? 's' : ''}</span></div>` +
        `<div class="lps-cd-unit"><span class="lps-cd-num">${String(h).padStart(2,'0')}</span><span class="lps-cd-label">Hours</span></div>` +
        `<div class="lps-cd-unit"><span class="lps-cd-num">${String(m).padStart(2,'0')}</span><span class="lps-cd-label">Mins</span></div>`;
    }
    updateLpsCountdown();
    setInterval(updateLpsCountdown, 60000);
  }
})();

/* ── Scroll lock ── */
// body.overflow:hidden stops scroll in Chrome/Firefox without touching the fixed-positioning
// containing block. iOS Safari needs touchmove preventDefault to stop rubber-band scroll.
// We never set position:fixed on body — Chrome incorrectly uses it as a fixed-child container.
function _noTouchMove(e) {
  if (e.target.closest && e.target.closest('.qb-body,.consent-body,.cart-items')) return;
  e.preventDefault();
}
function lockScroll() {
  document.body.dataset.lockY = window.scrollY;
  document.body.style.overflow = 'hidden';
  document.addEventListener('touchmove', _noTouchMove, { passive: false });
}
function unlockScroll() {
  const y = parseInt(document.body.dataset.lockY || '0', 10);
  document.body.style.overflow = '';
  document.removeEventListener('touchmove', _noTouchMove);
  delete document.body.dataset.lockY;
  window.scrollTo(0, y);
}

/* ── Navbar ── */
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

function closeMobileMenu() {
  if (!hamburger || !navLinks) return;
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
  unlockScroll();
}

function updateNav() {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  if (hamburger && hamburger.classList.contains('open')) closeMobileMenu();
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    open ? lockScroll() : unlockScroll();
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMobileMenu);
  });
  // Close menu when tapping outside the navbar on mobile
  document.addEventListener('click', e => {
    if (!navLinks.classList.contains('open')) return;
    if (!navbar.contains(e.target)) closeMobileMenu();
  });
}

/* Active nav link */
const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(a => {
  if (a.getAttribute('href') === page) a.classList.add('active');
});

/* ── Service Detail Drawer ── */
const svcData = {
  'hydrafacial': {
    icon: '💆', category: 'Advanced Facials', name: 'HydraFacial',
    price: 'From TTD 800', duration: '60 min',
    desc: 'A multi-step skin resurfacing treatment that simultaneously cleanses, exfoliates, extracts, and deeply hydrates the skin using patented Vortex-Fusion® technology. Suitable for all skin types with zero downtime.',
    entails: ['Deep cleansing & gentle exfoliation', 'Painless vortex extraction of blackheads & impurities', 'Customised serum infusion (antioxidants, peptides, hyaluronic acid)', 'Optional LED light therapy add-on', 'Instant results — no redness, no recovery'],
    benefits: ['Immediate radiant glow', 'Minimised pores', 'Reduced fine lines', 'Even skin tone'],
  },
  'microneedling': {
    icon: '💆', category: 'Advanced Facials', name: 'Micro-needling & Exosome Infusion',
    price: 'TTD 1,400', duration: '90 min',
    desc: 'A precision skin-renewal treatment using ultra-fine needles to create controlled micro-channels in the skin, triggering the body\'s natural collagen and elastin production. Paired with exosome infusion for accelerated healing and cellular regeneration.',
    entails: ['Topical numbing cream applied for comfort', 'Medical-grade micro-needling device', 'Exosome serum infused directly into micro-channels', 'Cooling & calming post-treatment mask', 'Aftercare protocol provided'],
    benefits: ['Collagen stimulation', 'Scar & pigmentation reduction', 'Firmer skin texture', 'Long-term rejuvenation'],
  },
  'chemical-peel': {
    icon: '💆', category: 'Advanced Facials', name: 'Chemical Peels',
    price: 'From TTD 500', duration: '45–75 min',
    desc: 'A controlled application of medical-grade chemical solutions to resurface the skin by removing dead and damaged outer layers. Treatment strength is customised to your skin concerns — from mild brightening peels to deeper resurfacing formulas.',
    entails: ['Skin analysis & peel selection consultation', 'Pre-peel preparation & cleanse', 'Professional-grade acid application (AHA, BHA, TCA or enzyme)', 'Neutralisation & soothing mask', 'SPF & aftercare guidance'],
    benefits: ['Brighter complexion', 'Reduced hyperpigmentation', 'Smoother texture', 'Acne scar improvement'],
  },
  'microdermabrasion': {
    icon: '💆', category: 'Advanced Facials', name: 'Microdermabrasion',
    price: 'TTD 500', duration: '60 min',
    desc: 'A non-invasive mechanical exfoliation treatment that uses a diamond-tip wand or fine crystals to polish away the outermost layer of dead skin cells, revealing the smoother, brighter skin underneath.',
    entails: ['Double cleanse & skin prep', 'Diamond-tip or crystal microdermabrasion pass', 'Vacuum suction to remove debris & stimulate circulation', 'Hydrating serum & calming mask', 'SPF finish'],
    benefits: ['Instant skin smoothing', 'Improved radiance', 'Reduced dullness', 'Evened skin texture'],
  },
  'anti-aging-facial': {
    icon: '💆', category: 'Advanced Facials', name: 'Anti-Aging Facial',
    price: 'From TTD 550', duration: '60 min',
    desc: 'A targeted facial designed to combat the visible signs of ageing. Combines high-potency actives including retinol, peptides, and growth factors to firm, lift, and deeply nourish mature or ageing skin.',
    entails: ['Deep cleanse & exfoliation', 'Firming serum & peptide infusion', 'Facial massage for lymphatic drainage & muscle toning', 'Anti-ageing mask (collagen or gold)', 'Eye treatment & moisturiser with SPF'],
    benefits: ['Reduced wrinkles & fine lines', 'Lifted & firmer skin', 'Deep hydration', 'Improved elasticity'],
  },
  'laser-full-body': {
    icon: '✨', category: 'Laser Hair Removal', name: 'Full Body Platinum',
    price: 'TTD 2,500', duration: '3h 20 min',
    desc: 'Our most comprehensive laser hair removal package covering all major body zones in one session. Uses advanced diode laser technology calibrated to your skin tone for safe, precise, and long-lasting results across every area.',
    entails: ['Full legs (front & back)', 'Full arms', 'Underarms', 'Bikini line (extended or Hollywood)', 'Abdomen, chest & back', 'Face & neck (optional)'],
    benefits: ['Permanent hair reduction', 'Smooth skin year-round', 'Precision targeting', 'Suitable for all skin tones'],
  },
  'laser-face-neck': {
    icon: '✨', category: 'Laser Hair Removal', name: 'Confidence Glow — Face & Neck',
    price: 'From TTD 750', duration: '2 hrs',
    desc: 'Precision laser targeting for facial and neck hair — including upper lip, chin, cheeks, jawline, and full neck. Ideal for those dealing with hormonal hair growth or unwanted facial fuzz.',
    entails: ['Consultation & skin tone assessment', 'Cooling gel application', 'Diode laser treatment across specified zones', 'Post-treatment soothing & SPF', 'Session spacing guidance (4–6 weeks)'],
    benefits: ['Smooth, hair-free face', 'Confidence boost', 'Long-term reduction', 'No more daily shaving'],
  },
  'laser-bikini': {
    icon: '✨', category: 'Laser Hair Removal', name: 'Luna\'s Starter — Bikini + Underarms',
    price: 'TTD 550', duration: '50 min',
    desc: 'A popular entry-point package targeting the two most common areas for hair removal. The underarms and bikini line are treated simultaneously using a medical-grade diode laser with a built-in cooling system for maximum comfort.',
    entails: ['Pre-treatment shave (if needed)', 'Cooling gel application', 'Laser pass — underarms (both sides)', 'Laser pass — bikini line (extended or regular)', 'Post-treatment cooling & aftercare'],
    benefits: ['Less ingrown hairs', 'Smoother skin', 'Reduced regrowth', 'Quick & efficient session'],
  },
  'laser-legs': {
    icon: '✨', category: 'Laser Hair Removal', name: 'Full & Half Leg Laser',
    price: 'From TTD 600', duration: '60–90 min',
    desc: 'Targeted laser hair removal for the legs — available as half leg (knee to ankle) or full leg (hip to ankle). Ideal for achieving silky smooth legs without the constant need for shaving or waxing.',
    entails: ['Skin assessment & cooling gel prep', 'Precise laser treatment in sections', 'Full leg: thighs, knees, shins, calves', 'Half leg: knee to ankle only', 'Post-treatment care & SPF'],
    benefits: ['Permanent hair reduction', 'No razor bumps', 'Even skin tone on legs', 'Long-lasting smoothness'],
  },
  'laser-jawline': {
    icon: '✨', category: 'Laser Hair Removal', name: 'Jawline & Chin Laser',
    price: 'From TTD 200', duration: '30 min',
    desc: 'A targeted single-zone laser session for the chin and/or jawline area. Highly effective for hormonal or persistent chin hair in both women and men.',
    entails: ['Pre-treatment cleanse', 'Cooling gel & laser calibration', 'Precision treatment of chin and/or jawline', 'Post-treatment soothing spray', 'Recommended session frequency guidance'],
    benefits: ['Clean jawline definition', 'Reduced hormonal regrowth', 'Quick 30-min session', 'Noticeable results in 2–3 sessions'],
  },
  'fat-cavitation': {
    icon: '🌊', category: 'Body Contouring', name: 'Ultrasonic Fat Cavitation',
    price: 'From TTD 350', duration: '90 min',
    desc: 'A non-invasive treatment that uses low-frequency ultrasonic waves to break down fat cell membranes in targeted areas. The liquefied fat is then naturally eliminated through the lymphatic system over the following days.',
    entails: ['Body measurement & treatment area marking', 'Ultrasonic cavitation device applied in circular motions', 'Targeted zones: abdomen, flanks, thighs, or arms', 'Lymphatic drainage massage to aid elimination', 'Hydration guidance & aftercare plan'],
    benefits: ['Inch loss in targeted areas', 'No surgery or downtime', 'Improved body shape', 'Results visible in 3–5 sessions'],
  },
  'rf-tightening': {
    icon: '🌊', category: 'Body Contouring', name: 'RF Skin Tightening',
    price: 'From TTD 350', duration: '60 min',
    desc: 'Uses controlled radiofrequency energy to heat the deeper layers of the skin, stimulating collagen and elastin production. Results in visibly tighter, more lifted skin — particularly effective post-weight loss or pregnancy.',
    entails: ['Consultation & skin assessment', 'Conductive gel applied to treatment area', 'RF wand passed in slow overlapping movements', 'Core targets: face, neck, abdomen, thighs, arms', 'Cooling & soothing finish'],
    benefits: ['Skin firming & lifting', 'Reduced laxity', 'Collagen stimulation', 'Non-surgical facelift effect'],
  },
  'laser-lipo': {
    icon: '🌊', category: 'Body Contouring', name: 'Laser Lipo 360',
    price: 'TTD 550', duration: '2 hrs',
    desc: 'Combines low-level laser technology with body wrapping to target and shrink fat cells in a 360° circumferential approach. The laser energy penetrates fat cells and releases their contents, which are then processed by the body naturally.',
    entails: ['Full measurement & photo documentation', 'Laser lipo pads applied around treatment area', '20-minute laser session', 'Optional cavitation or RF follow-up', 'Body wrap to enhance results', 'Recommended package: 6–10 sessions'],
    benefits: ['Circumference reduction', 'No downtime', 'Can target multiple areas', 'Enhanced with cavitation combo'],
  },
  'anti-cellulite': {
    icon: '🌊', category: 'Body Contouring', name: 'Anti-Cellulite Treatment',
    price: 'TTD 500', duration: '1h 45 min',
    desc: 'A multi-technology treatment specifically targeting the appearance of cellulite by breaking down the fibrous bands beneath the skin and improving circulation, lymphatic drainage, and skin texture.',
    entails: ['Body brush & exfoliation prep', 'Cavitation over cellulite zones', 'RF skin tightening to firm tissue', 'Manual lymphatic drainage massage', 'Cellulite-reduction body wrap'],
    benefits: ['Smoother skin surface', 'Reduced dimpling', 'Improved circulation', 'Firmer, more even skin'],
  },
  'hollywood-wax': {
    icon: '🦋', category: 'Waxing', name: 'Hollywood Wax',
    price: 'TTD 300', duration: '30 min',
    desc: 'Complete removal of all pubic hair — front, back, and everything in between — using premium low-temperature hard wax specifically formulated for sensitive intimate areas. Clean, precise, and as comfortable as possible.',
    entails: ['Pre-wax skin cleanse & powder application', 'Premium hard wax applied in small sections', 'Gentle, swift removal technique', 'Full front, back, and perineum coverage', 'Soothing post-wax oil & anti-bump serum'],
    benefits: ['Completely smooth result', 'Less irritation than strip wax', 'Longer-lasting than shaving', 'Fewer ingrown hairs over time'],
  },
  'full-body-wax': {
    icon: '🦋', category: 'Waxing', name: 'Full Body Wax',
    price: 'TTD 1,650', duration: '2h 30 min',
    desc: 'Head-to-toe hair removal in a single appointment. Covers all major body zones using a combination of hard wax (sensitive areas) and strip wax (larger zones) for the most efficient and thorough result.',
    entails: ['Full legs (front & back)', 'Full arms', 'Underarms', 'Hollywood or bikini line', 'Abdomen & back', 'Face wax (brows, lip, chin)'],
    benefits: ['Complete body smoothness', 'One appointment, zero hassle', 'Tailored wax type per zone', 'Results last 3–5 weeks'],
  },
  'hollywood-vajacial': {
    icon: '🦋', category: 'Waxing', name: 'Hollywood Wax + Vajacial',
    price: 'TTD 550', duration: '60 min',
    desc: 'The ultimate intimate treatment — a Hollywood wax followed immediately by a Vajacial. The Vajacial is a facial for your intimate area: cleansing, exfoliating, extracting ingrown hairs, and applying brightening & soothing masks.',
    entails: ['Hollywood wax (full intimate removal)', 'Post-wax cleanse of the bikini area', 'Gentle enzymatic exfoliation', 'Manual ingrown hair extraction', 'Brightening mask application', 'Anti-inflammatory & hydrating finish'],
    benefits: ['Silky smooth & radiant skin', 'Ingrown hair prevention', 'Brightened intimate area', 'Reduced post-wax irritation'],
  },
  'brow-shaping': {
    icon: '🦋', category: 'Waxing', name: 'Brow Shaping & Lamination',
    price: 'From TTD 30', duration: '15–60 min',
    desc: 'Eyebrow services ranging from a simple wax and sculpt to a full brow lamination with tint. Each service is tailored to your natural brow shape and face structure for the most flattering, defined result.',
    entails: ['Brow mapping to your face shape', 'Wax & precise tweezing', 'Optional lamination (restructures brow hairs)', 'Optional tint (fills and defines)', 'Setting gel & aftercare guidance'],
    benefits: ['Defined, symmetrical brows', 'Fuller-looking arches', 'Long-lasting shape', 'Frame your features beautifully'],
  },
  'intimate-waxing': {
    icon: '🦋', category: 'Waxing', name: 'Face & Intimate Waxing',
    price: 'From TTD 30', duration: '15–30 min',
    desc: 'Single-zone waxing services for facial areas (upper lip, chin, cheeks, sideburns, nose) and intimate zones (bikini line, extended bikini). Uses premium hard wax on all sensitive areas to minimise discomfort.',
    entails: ['Area-specific pre-wax prep', 'Hard wax application for sensitive zones', 'Precise removal technique', 'Post-wax soothing oil', 'Ingrown hair prevention aftercare'],
    benefits: ['Clean, precise result', 'Minimal discomfort', 'Suitable for sensitive skin', 'Quick in-and-out appointment'],
  },
  'goddess-glow': {
    icon: '🌺', category: 'Luxury Spa Packages', name: 'Goddess Glow Package',
    price: 'TTD 900', duration: '3h 30 min',
    desc: 'A curated luxury experience designed to leave you feeling completely renewed from head to toe. The Goddess Glow combines signature facial treatments with body care and relaxation rituals for a truly transformative visit.',
    entails: ['Signature HydraFacial or advanced facial', 'Full body exfoliation & hydration wrap', 'Luxury pedicure with foot massage', 'Brow sculpt & tint', 'Head & shoulder relaxation massage', 'Welcome refreshment on arrival'],
    benefits: ['Head-to-toe renewal', 'Deep relaxation', 'Radiant glowing skin', 'A truly luxurious experience'],
  },
  'platinum-experience': {
    icon: '🌺', category: 'Luxury Spa Packages', name: 'Luna\'s Platinum Experience',
    price: 'TTD 1,500', duration: '6 hrs',
    desc: 'The most exclusive package Luna\'s Esthetics offers. A full-day luxury spa immersion with champagne, premium treatments, and total pampering from arrival to departure. Perfect for birthdays, anniversaries, or a gift to yourself.',
    entails: ['Welcome champagne & refreshments', 'Micro-needling or HydraFacial', 'Full body massage (60 min)', 'Luxury pedicure & manicure', 'Lash or brow treatment of choice', 'Hollywood wax', 'Light spa lunch included', 'Personalised gift bag'],
    benefits: ['Complete luxury from start to finish', 'Visible skin transformation', 'The ultimate self-care day', 'Unforgettable gifting experience'],
  },
  'double-birthday': {
    icon: '🌺', category: 'Luxury Spa Packages', name: 'Double Birthday Package',
    price: 'TTD 1,000', duration: '4h 10 min',
    desc: 'Celebrate with your best friend, sister, or partner. A shared luxury experience for two people, running simultaneously so you enjoy every moment together — the perfect birthday or anniversary treat.',
    entails: ['Welcome champagne for two', 'Signature facials (both guests)', 'Luxury pedicures side-by-side', 'Brow sculpt for both', 'Body wax of choice for both', 'Shared gift bag & keepsake'],
    benefits: ['Shared luxury experience', 'Perfect birthday celebration', 'Side-by-side treatments', 'Memories that last'],
  },
  'body-sculpt-shots': {
    icon: '💉', category: 'Weight Loss & Lipo', name: 'Body Sculpt Shots + Cavitation',
    price: 'TTD 900', duration: '1h 10 min',
    desc: 'A powerful combination treatment pairing body sculpt injections with an ultrasonic cavitation session. The shots support fat metabolism and appetite regulation, while cavitation mechanically breaks down localised fat deposits.',
    entails: ['Health & wellness consultation', 'Body sculpt injection administered by trained professional', 'Targeted ultrasonic cavitation (abdomen, flanks or thighs)', 'Lymphatic drainage stimulation', 'Follow-up nutrition & hydration guidance'],
    benefits: ['Dual fat-reduction approach', 'Boosted metabolism', 'Targeted inch loss', 'Complementary results'],
  },
  'liquid-lipo': {
    icon: '💉', category: 'Weight Loss & Lipo', name: 'Liquid Lipo Injections',
    price: 'From TTD 500', duration: '30–40 min',
    desc: 'Localised fat-dissolving injections applied directly into stubborn fat pockets. The active compounds cause the fat cells to rupture and be reabsorbed by the body\'s lymphatic system over 4–6 weeks.',
    entails: ['Pre-treatment consultation & area assessment', 'Topical numbing if required', 'Precision injection into fat deposit (arms, back, inner thigh, or stomach)', 'Post-injection massage for dispersion', 'Follow-up appointment scheduling'],
    benefits: ['Targeted fat spot reduction', 'Non-surgical alternative', 'Results in 4–6 weeks', 'Progressive, natural-looking outcome'],
  },
  'lipo-shots': {
    icon: '💉', category: 'Weight Loss & Lipo', name: 'Back & Arm Lipo Shots',
    price: 'From TTD 500', duration: '30–40 min',
    desc: 'Targeted lipo injection sessions for the back and/or arms — two of the most difficult areas to address through diet and exercise alone. Injections break down localised fat for a more contoured silhouette.',
    entails: ['Zone-specific consultation', 'Numbing prep if required', 'Injection into back fat (bra strap area, lower back) or arm fat', 'Gentle post-injection massage', 'Hydration & aftercare plan'],
    benefits: ['Contoured back & arms', 'Non-surgical', 'Visible in 3–6 weeks', 'Combined well with cavitation'],
  },
  'consultation': {
    icon: '💉', category: 'Weight Loss & Lipo', name: 'Wellness Consultation',
    price: 'TTD 100', duration: '30 min',
    desc: 'A one-on-one consultation with Chel-C or a team member to assess your body contouring or weight loss goals. Available in-person at our Chaguanas location or virtually via video call — fully refunded if you book a treatment.',
    entails: ['Review of health history & goals', 'Body composition assessment (in-person)', 'Personalised treatment plan recommendation', 'Pricing breakdown & package options', 'Q&A — all your questions answered'],
    benefits: ['Clarity on best treatment path', 'Tailored plan for your body', 'No obligation to book', 'Virtual option available'],
  },
};

/* ── Service Accordion ── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.svc-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const key = link.dataset.svc;
      const d = svcData[key];
      if (!d) return;

      const li = link.closest('li');
      const isOpen = link.classList.contains('active');

      // Close all open dropdowns
      document.querySelectorAll('.svc-link.active').forEach(l => {
        l.classList.remove('active');
        const dd = l.closest('li').querySelector('.svc-dropdown');
        if (dd) dd.classList.remove('open');
      });

      // If it wasn't open, open this one
      if (!isOpen) {
        link.classList.add('active');
        let dd = li.querySelector('.svc-dropdown');
        if (!dd) {
          dd = document.createElement('div');
          dd.className = 'svc-dropdown';
          dd.innerHTML = `<div class="svc-dropdown-inner">
            <div class="svc-dd-meta">💰 ${d.price} &nbsp;·&nbsp; ⏱ ${d.duration}</div>
            <p class="svc-dd-desc">${d.desc}</p>
            <a href="book.html" class="btn btn-gold svc-dd-book">Book This Service</a>
          </div>`;
          li.appendChild(dd);
        }
        requestAnimationFrame(() => dd.classList.add('open'));
      }
    });
  });
});

/* ── FeatureGrid stagger animation ── */
(function () {
  const grid = document.getElementById('fgGrid');
  if (!grid) return;
  const items = grid.querySelectorAll('.fg-item');
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      items.forEach((item, i) => setTimeout(() => item.classList.add('fg-visible'), i * 100));
      obs.unobserve(grid);
    }
  }, { threshold: 0.12 });
  obs.observe(grid);
})();

/* ── Scroll fade-in ── */
const fadeObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      fadeObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.service-card,.pricing-item,.testimonial-card,.value-card,.team-card,.product-card,.course-card,.why-card,.stat-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(22px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  fadeObs.observe(el);
});

/* ── Services Filter Tabs ── */
function initFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      document.querySelectorAll('.service-cat-section').forEach(sec => {
        sec.style.display = (cat === 'all' || sec.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
}
initFilterTabs();

/* ── Gallery filter (animated) ── */
function initGalleryFilter() {
  const tabs = document.querySelectorAll('.gallery-filter-tab');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      const items = document.querySelectorAll('.gallery-item');
      items.forEach((item, i) => {
        const match = cat === 'all' || item.dataset.cat === cat;
        if (match) {
          item.classList.remove('filtered-out');
          item.classList.add('filtered-in');
          item.style.animationDelay = (i * 0.045) + 's';
          setTimeout(() => item.classList.remove('filtered-in'), 500);
        } else {
          item.classList.remove('filtered-in');
          item.classList.add('filtered-out');
        }
      });
    });
  });
}
initGalleryFilter();

/* ── Booking Page ── */

// ═══════════════════════════════════════════════════════════════════
// EMAILJS SETUP (free at emailjs.com)
// ── Template 1: Business notification (already working) ──────────────────
//    Goes to Leabacademyltd@gmail.com when a booking is made.
//    Variables used: {{from_name}}, {{from_phone}}, {{from_email}}, {{subject}}, {{body}}
//
// ── Template 2: Customer confirmation (new) ──────────────────────────────
//    Sent to the CUSTOMER'S email address after they book.
//    Create it at emailjs.com → Email Templates → New Template
//    Set the "To Email" field in the template to: {{to_email}}
//    Variables used: {{to_name}}, {{to_email}}, {{service}}, {{price}},
//                    {{date}}, {{time}}, {{status_line}}
//    Sample subject: Your appointment at Luna's Esthetics ✨
//    Paste EMAILJS_CLIENT_TEMPLATE_ID below once created.
const EMAILJS_PUBLIC_KEY          = 'aWI5mNtamAEwmv6Zq';
const EMAILJS_SERVICE_ID          = 'service_uloa9rp';
const EMAILJS_TEMPLATE_ID         = 'template_m4ug865';     // business notification
const EMAILJS_CLIENT_TEMPLATE_ID  = 'template_kfqntkg';        // customer confirmation
const EMAILJS_PRO_TEMPLATE_ID        = 'template_6mlyx2a'; // Professionals Only order — business notification
const EMAILJS_PRO_CLIENT_TEMPLATE_ID = 'template_499gpde';  // Professionals Only order — client invoice

if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

// FIREBASE SETUP (optional — enables real-time slot availability)
// Without this, booked slots are only tracked per browser session.
// 1. console.firebase.google.com → Create project → Build → Firestore Database
// 2. Project Settings → General → Your apps → Add web app → copy config
// 3. Firestore Rules: allow read, write: if true;  (for testing — tighten later)
// ── Firestore REST API (no external SDK needed) ──
const _FS_BASE = 'https://firestore.googleapis.com/v1/projects/lunas-2305d/databases/(default)/documents/site_data';
const _FS_KEY  = 'AIzaSyBkakoNS6VyC-n-4voFbkukFA4z5f3Bszg';
// ═══════════════════════════════════════════════════════════════════

let _syncReady = false;
const _syncCallbacks = [];
function onSyncReady(fn) { _syncReady ? fn() : _syncCallbacks.push(fn); }

async function _fsGet(key) {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`${_FS_BASE}/${key}?key=${_FS_KEY}`, { signal: ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) return null;
    const doc = await res.json();
    const sv = doc.fields?.value?.stringValue;
    return sv ? JSON.parse(sv) : null;
  } catch(e) { return null; }
}
async function _fsSet(key, val) {
  try {
    const res = await fetch(`${_FS_BASE}/${key}?key=${_FS_KEY}&updateMask.fieldPaths=value`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { value: { stringValue: JSON.stringify(val) } } }),
    });
    return res.ok;
  } catch(e) { console.warn('[Firestore] write failed [' + key + ']:', e.message); return false; }
}
(async function _syncOnLoad() {
  const keys = ['services', 'specials', 'courses', 'bookings', 'clients', 'inventory', 'blocked_dates', 'manual_events', 'course_enrollments', 'pro_orders', 'pro_order_counter'];
  const results = await Promise.allSettled(keys.map(k => _fsGet(k)));
  keys.forEach((k, i) => {
    const r = results[i];
    if (r.status === 'fulfilled' && r.value !== null) {
      localStorage.setItem('lunas_' + k, JSON.stringify(r.value));
    }
  });
  _syncReady = true;
  _syncCallbacks.forEach(fn => { try { fn(); } catch(e) {} });
})();

/* ── Blocked Dates helpers ── */
function getBlockedDates() {
  try { return JSON.parse(localStorage.getItem('lunas_blocked_dates') || 'null') || { months: [], days: [] }; }
  catch(e) { return { months: [], days: [] }; }
}
async function saveBlockedDates(data) {
  const ok = await _fsSet('blocked_dates', data);
  if (ok) localStorage.setItem('lunas_blocked_dates', JSON.stringify(data));
  return ok;
}
function isDateBlocked(dateStr) {
  const bd = getBlockedDates();
  return (bd.days || []).includes(dateStr) || (bd.months || []).includes(dateStr.substring(0, 7));
}
function isSlotBlocked(dateStr, timeStr) {
  const bd = getBlockedDates();
  return (bd.timeSlots || []).some(s => s.date === dateStr && s.slot === timeStr);
}

/* ── Course Enrollments helpers ── */
function getCourseEnrollments() {
  try { return JSON.parse(localStorage.getItem('lunas_course_enrollments') || '[]'); }
  catch(e) { return []; }
}
function saveCourseEnrollments(data) {
  localStorage.setItem('lunas_course_enrollments', JSON.stringify(data));
  _fsSet('course_enrollments', data);
}

/* ── Professional Orders helpers ── */
function getProOrders() {
  try { return JSON.parse(localStorage.getItem('lunas_pro_orders') || '[]'); }
  catch(e) { return []; }
}
async function saveProOrderRecord(order) {
  const all = getProOrders();
  all.push(order);
  localStorage.setItem('lunas_pro_orders', JSON.stringify(all));
  return await _fsSet('pro_orders', all);
}
function saveProOrders(all) {
  localStorage.setItem('lunas_pro_orders', JSON.stringify(all));
  return _fsSet('pro_orders', all);
}
async function nextProInvoiceId() {
  let counter = await _fsGet('pro_order_counter');
  if (typeof counter !== 'number' || isNaN(counter)) {
    counter = parseInt(localStorage.getItem('lunas_pro_order_counter') || '0', 10) || 0;
  }
  counter += 1;
  localStorage.setItem('lunas_pro_order_counter', String(counter));
  await _fsSet('pro_order_counter', counter);
  return 'INV-LEABUSH' + String(counter).padStart(6, '0');
}

/* ── Manual Events helpers ── */
function getManualEvents() {
  try { return JSON.parse(localStorage.getItem('lunas_manual_events') || '[]'); }
  catch(e) { return []; }
}
function saveManualEvents(data) {
  localStorage.setItem('lunas_manual_events', JSON.stringify(data));
  _fsSet('manual_events', data);
}

function _to12hr(t24) {
  const [h, m] = t24.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function _to24hr(t12) {
  if (!t12) return '';
  const [time, ampm] = t12.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Single source of truth for the daily booking grid (24hr) — was previously duplicated
// as a separate 12hr array for rendering, which could drift out of sync.
const SLOT_GRID_24 = ['10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];
const SLOT_GRID_12 = SLOT_GRID_24.map(_to12hr);
// Salon closes at 5:00 PM (matches posted hours in index.html/about.html) — a booking
// starting late enough to run past this shouldn't be selectable.
const CLOSING_MINUTES = 17 * 60;

function _toMins(t24) { const [h, m] = t24.split(':').map(Number); return h * 60 + m; }

// Returns every 30-min booking slot string (12hr) that falls inside [startTime, endTime)
function _manualBlockedSlots(startTime, endTime) {
  const start = _toMins(startTime);
  const end   = _toMins(endTime);
  return SLOT_GRID_24.filter(t => { const m = _toMins(t); return m >= start && m < end; }).map(_to12hr);
}

// Parses a free-text service duration ('1 hr', '1h 30m', '6 hrs', '30 mins', ...) into
// total minutes. Falls back to 30 when missing/unparseable (e.g. admin-added bookings
// whose Service field is freeform text with no linked catalog duration).
function parseDurationMinutes(str) {
  if (!str) return 30;
  const hMatch = str.match(/(\d+)\s*h/i);
  const mMatch = str.match(/(\d+)\s*m/i);
  const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
  const mins  = mMatch ? parseInt(mMatch[1], 10) : 0;
  const total = hours * 60 + mins;
  return total > 0 ? total : 30;
}

function totalDurationMinutes(services) {
  if (!services || !services.length) return 30;
  return services.reduce((sum, s) => sum + parseDurationMinutes(s && s.duration), 0);
}

// Returns every 30-min grid slot (12hr) occupied by a booking starting at startTime12hr
// (12hr string, e.g. '10:00 AM') and lasting durationMinutes.
function _occupiedSlots(startTime12hr, durationMinutes) {
  const idx = SLOT_GRID_12.indexOf(startTime12hr);
  if (idx === -1) return [startTime12hr];
  const start = _toMins(SLOT_GRID_24[idx]);
  const end = start + durationMinutes;
  return SLOT_GRID_24.filter(t => { const m = _toMins(t); return m >= start && m < end; }).map(_to12hr);
}

async function getBookedSlots(dateStr) {
  const chelcBooked = [];
  const timothyBooked = [];
  const manualBlocked = [];

  function _categorize(bookings) {
    bookings
      .filter(b => b.date === dateStr && b.status !== 'cancelled')
      .forEach(b => {
        const occupied = _occupiedSlots(b.time, totalDurationMinutes(b.services));
        if (b.esthetician === 'timothy') timothyBooked.push(...occupied);
        else chelcBooked.push(...occupied);
      });
  }

  try {
    const allBookings = await _fsGet('bookings');
    _categorize(allBookings || getDB('lunas_bookings'));
  } catch(e) {
    _categorize(getDB('lunas_bookings'));
  }

  try {
    const allManual = await _fsGet('manual_events');
    const source = allManual || getManualEvents();
    manualBlocked.push(...source
      .filter(e => e.date === dateStr && e.startTime && e.endTime)
      .flatMap(e => _manualBlockedSlots(e.startTime, e.endTime)));
  } catch(e) {
    manualBlocked.push(...getManualEvents()
      .filter(e => e.date === dateStr && e.startTime && e.endTime)
      .flatMap(e => _manualBlockedSlots(e.startTime, e.endTime)));
  }

  return { chelcBooked, timothyBooked, manualBlocked };
}

async function saveBookingRecord(booking) {
  const all = getDB('lunas_bookings');
  all.push(booking);
  localStorage.setItem('lunas_bookings', JSON.stringify(all));
  return await _fsSet('bookings', all);
}

function sendEmail(subject, fromName, fromPhone, fromEmail, body) {
  if (EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') return Promise.resolve();
  if (typeof emailjs === 'undefined') return Promise.resolve();
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    from_name:  fromName,
    from_phone: fromPhone,
    from_email: fromEmail || 'Not provided',
    subject:    subject,
    body:       body,
  });
}

function sendClientEmail(toName, toEmail, service, price, date, time, isRequest, customStatus) {
  if (!toEmail) return Promise.resolve();
  if (EMAILJS_CLIENT_TEMPLATE_ID === 'YOUR_CLIENT_TEMPLATE_ID') return Promise.resolve();
  if (typeof emailjs === 'undefined') return Promise.resolve();
  const statusLine = customStatus || (isRequest
    ? "Your request has been received and Chel-C will contact you shortly to confirm your time."
    : "Your appointment is confirmed. We look forward to seeing you!");
  const bankingInfo =
    "OUR BANKING INFORMATION\n" +
    "Bank: Republic Bank\n" +
    "Account Name: Lunas Esthetics and Academy Ltd\n" +
    "Account #: 660804250301\n" +
    "Account Type: Chequing\n\n" +
    "⚠️ IMPORTANT: Please attach your first and last name and the date of your appointment to the receipt. " +
    "Failure to do so will result in us not being able to identify you as the payee — Lunas will not be held liable.\n\n" +
    "Kindly send a screenshot of your payment to 1(868) 463-9306.";
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CLIENT_TEMPLATE_ID, {
    to_name:      toName,
    to_email:     toEmail,
    service:      service,
    price:        price || '',
    date:         date || '',
    time:         time || '',
    status_line:  statusLine,
    banking_info: bankingInfo,
  });
}

/* ── Professionals Only order emails ── */
function _proDeliveryLine(order) {
  return order.deliveryMethod === 'delivery'
    ? `Delivery (${order.island === 'tobago' ? 'Tobago' : 'Trinidad'})`
    : 'Pickup at the salon';
}
function _proItemLines(order) {
  return order.items.map(i => `  • ${i.name} x${i.qty} — TTD ${(i.price * i.qty).toFixed(2)}`).join('\n');
}
function _proItemRowsHtml(order) {
  return order.items.map(i => `
    <tr>
      <td style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#2C1800;padding:8px 0;border-bottom:1px solid #EFE3D0;">${safe(i.name)}</td>
      <td align="center" style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#5A4030;padding:8px 0;border-bottom:1px solid #EFE3D0;">${i.qty}</td>
      <td align="right" style="font-family:'Playfair Display',Georgia,serif;font-size:13px;font-weight:600;color:#8B4F1C;padding:8px 0;border-bottom:1px solid #EFE3D0;">TTD ${(i.price * i.qty).toFixed(2)}</td>
    </tr>`).join('');
}

function sendProBusinessEmail(order) {
  if (EMAILJS_PRO_TEMPLATE_ID === 'YOUR_PRO_TEMPLATE_ID') return Promise.resolve();
  if (typeof emailjs === 'undefined') return Promise.resolve();
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_PRO_TEMPLATE_ID, {
    invoice_id:       order.invoiceId,
    items:            _proItemLines(order),
    subtotal:         `TTD ${order.subtotal.toFixed(2)}`,
    shipping:         `TTD ${order.shipping.toFixed(2)}`,
    total:            `TTD ${order.total.toFixed(2)}`,
    from_name:        order.name,
    from_email:       order.email,
    from_phone:       order.phone,
    delivery_method:  _proDeliveryLine(order),
    shipping_address: order.address || 'N/A — pickup at salon',
  });
}

function sendProClientEmail(order) {
  if (!order.email) return Promise.resolve();
  if (EMAILJS_PRO_CLIENT_TEMPLATE_ID === 'YOUR_PRO_CLIENT_TEMPLATE_ID') return Promise.resolve();
  if (typeof emailjs === 'undefined') return Promise.resolve();
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_PRO_CLIENT_TEMPLATE_ID, {
    to_name:          order.name,
    to_email:         order.email,
    invoice_id:       order.invoiceId,
    date:             new Date().toLocaleDateString('en-TT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    items:            _proItemLines(order),
    items_html:       _proItemRowsHtml(order),
    subtotal:         `TTD ${order.subtotal.toFixed(2)}`,
    shipping:         `TTD ${order.shipping.toFixed(2)}`,
    total:            `TTD ${order.total.toFixed(2)}`,
    delivery_method:  _proDeliveryLine(order),
    client_address:   order.address || 'Pickup at the salon',
  });
}

function calcActiveDiscount(svcs) {
  const CAT_MAP = {
    'cat:Facials':    'Advanced Facials',
    'cat:Laser':      'Laser Hair Removal',
    'cat:Body':       'Body Contouring',
    'cat:Waxing':     'Waxing',
    'cat:Packages':   'Spa Packages',
    'cat:WeightLoss': 'Weight Loss & Lipo Shots',
    'cat:Pedicures':  'Pedicures',
    'cat:Eyebrows':   'Eyebrow Services',
    'cat:Brightening':'Intimate Brightening',
  };
  const live = getSpecials().filter(s => specialStatus(s) === 'active' && s.type !== 'custom');
  for (const sp of live) {
    const eligible = svcs.filter(s => sp.applies === 'all' || CAT_MAP[sp.applies] === s.category);
    if (!eligible.length) continue;
    let discAmt = 0;
    if (sp.type === 'percent') {
      eligible.forEach(s => {
        const m = s.price.replace(/,/g, '').match(/\d+(\.\d+)?/);
        if (m) discAmt += Math.round(parseFloat(m[0]) * sp.value / 100);
      });
    } else if (sp.type === 'fixed') {
      discAmt = sp.value;
    }
    if (discAmt > 0) return { discAmt, specialName: sp.name };
  }
  return { discAmt: 0, specialName: null };
}

function initBooking() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const catSelect = document.getElementById('bookCat');
  const svcSelect = document.getElementById('bookService');
  const dateInput = document.getElementById('bookDate');
  const timeWrap = document.getElementById('timeSlots');
  const selectedTimeInput = document.getElementById('selectedTime');
  const summary = document.getElementById('bookingSummary');
  const addServiceBtn = document.getElementById('addServiceBtn');
  let selectedServices = [];

  function renderSelectedServices() {
    const wrap = document.getElementById('selectedServicesWrap');
    const list = document.getElementById('selectedServicesList');
    if (!wrap || !list) return;
    if (!selectedServices.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
    list.innerHTML = selectedServices.map((s, i) => `
      <div class="selected-svc-item">
        <div>
          <div class="selected-svc-name">${s.name}</div>
          <div class="selected-svc-meta">${s.price} &nbsp;·&nbsp; ${s.duration}</div>
        </div>
        <button type="button" class="selected-svc-remove" onclick="window._removeSelectedService(${i})">✕</button>
      </div>`).join('');
  }

  window._removeSelectedService = i => {
    selectedServices.splice(i, 1);
    renderSelectedServices();
    updateEstheticianPicker();
    updateSummary();
    if (dateInput?.value) renderTimeSlots(dateInput.value);
  };

  // Min date = today
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.min = today;

  // Load from localStorage if admin has customised, otherwise use defaults
  const services = JSON.parse(localStorage.getItem('lunas_services') || 'null') || {
    'The Lunas Collection': [
      { name: 'Laser Hair Removal Bundle', price: 'TTD 1,000', duration: '1h 30m' },
      { name: 'Waxing Package', price: 'TTD 400', duration: '1 hr' },
      { name: 'Facial Package', price: 'TTD 300', duration: '2 hrs' },
      { name: 'The Lunas Effect Weight Loss Bundle', price: 'TTD 1,800', duration: '' },
      { name: 'Body Contouring Bundle', price: 'TTD 1,000', duration: '2 hrs' },
    ],
    'Spa Packages': [
      { name: 'The Goddess Glow Package', price: 'TTD 900', duration: '3h 30m' },
      { name: 'The It Girl Package', price: 'TTD 600', duration: '2h 5m' },
      { name: 'Lunas Platinum Experience', price: 'TTD 1,500', duration: '6 hrs' },
      { name: 'Double Birthday Package', price: 'TTD 1,000', duration: '4h 10m' },
      { name: 'Spa Escape', price: 'TTD 600', duration: '2 hrs' },
    ],
    'Pedicures': [
      { name: 'Classic Pedicure', price: 'TTD 180', duration: '1 hr' },
      { name: 'Jelly Pedicure', price: 'TTD 250', duration: '1h 30m' },
      { name: 'Luxury Pedicure', price: 'TTD 320', duration: '2 hrs' },
    ],
    'Eyebrow Services': [
      { name: 'Brow Lamination + Sculpt', price: 'TTD 250', duration: '1 hr' },
      { name: 'Eyebrow Tint + Lift and Sculpt', price: 'TTD 450', duration: '2 hrs' },
      { name: 'Eyebrow Tint and Sculpt', price: 'TTD 250', duration: '1 hr' },
    ],
    'Advanced Facials': [
      { name: 'KRX Green Sea Peel', price: 'TTD 800', duration: '2 hrs' },
      { name: 'Signature Hydrafacial', price: 'TTD 800', duration: '1 hr' },
      { name: 'Micro-needling Exosome Infusion', price: 'TTD 1,400', duration: '1h 30m' },
      { name: 'Dermaplain + Peel', price: 'TTD 700', duration: '1 hr' },
      { name: 'Microdermabrasion Facial', price: 'TTD 500', duration: '1 hr' },
      { name: 'Anti-Aging Facial', price: 'TTD 550', duration: '1 hr' },
      { name: 'Enzyme Anti Aging Facial', price: 'TTD 600', duration: '1 hr' },
      { name: 'Teen Facial', price: 'TTD 200', duration: '1 hr' },
      { name: 'Deep Cleanse Back Facial', price: 'TTD 450', duration: '1 hr' },
    ],
    'Waxing': [
      { name: 'Hollywood Wax', price: 'TTD 300', duration: '30 mins' },
      { name: 'Hollywood Wax + Vajacial', price: 'TTD 550', duration: '1 hr' },
      { name: 'Full Body Wax', price: 'TTD 1,650', duration: '2h 30m' },
      { name: 'Full Leg Wax', price: 'TTD 280', duration: '50 mins' },
      { name: 'Half Arm Wax', price: 'TTD 130', duration: '50 mins' },
      { name: 'Full Face Wax', price: 'TTD 150', duration: '25 mins' },
      { name: 'Brow/Lip/Chin/Sideburn/Nose Wax', price: 'TTD 30', duration: '15 mins' },
      { name: 'Underarm Wax (Female)', price: 'TTD 60', duration: '15 mins' },
      { name: 'Underarm Wax (Male)', price: 'TTD 70', duration: '15 mins' },
      { name: 'Manzalian Wax (Male)', price: 'TTD 350', duration: '45 mins' },
      { name: 'Lunas Deluxe Wax Package', price: 'TTD 700', duration: '1h 50m' },
    ],
    'Laser Hair Removal': [
      { name: 'Full Body Platinum', price: 'TTD 2,500', duration: '3h 20m' },
      { name: 'Lunas Starter (Bikini + Underarms)', price: 'TTD 550', duration: '50 mins' },
      { name: 'Confidence Glow (Face + Neck)', price: 'TTD 750', duration: '2 hrs' },
      { name: 'Half Leg + Bikini Line', price: 'TTD 750', duration: '1h 30m' },
      { name: 'Extended Bikini / Regular Bikini Line', price: 'from TTD 400', duration: '30 mins' },
      { name: 'Full Face', price: 'from TTD 400', duration: '30 mins' },
      { name: 'Full Legs', price: 'from TTD 900', duration: '1 hr' },
      { name: 'Half Legs', price: 'from TTD 600', duration: '1 hr' },
      { name: 'Chin', price: 'from TTD 200', duration: '30 mins' },
      { name: 'Jawline', price: 'from TTD 350', duration: '30 mins' },
      { name: 'Toes and Fingers', price: 'from TTD 150', duration: '15 mins' },
    ],
    'Body Contouring': [
      { name: 'Anti-Cellulite Treatment', price: 'TTD 500', duration: '1h 45m' },
      { name: 'Ultrasonic Fat Cavitation + Laser Lipo 360', price: 'TTD 550', duration: '2 hrs' },
      { name: 'Cavitation + Laser Lipo + RF Skin Tightening', price: 'TTD 350', duration: '1h 30m' },
    ],
    'Intimate Brightening': [
      { name: 'Brazilian Intimate Brightening', price: 'TTD 600', duration: '1 hr' },
      { name: 'Full Butt Brightening', price: 'TTD 600', duration: '1 hr' },
      { name: 'Underarm Brightening', price: 'TTD 500', duration: '1 hr' },
      { name: 'Elbows or Knees Brightening', price: 'TTD 350', duration: '1 hr' },
    ],
    'Weight Loss & Lipo Shots': [
      { name: 'Consultation (Virtual/In Person)', price: 'TTD 100', duration: '30 mins' },
      { name: 'Body Sculpt Shots + Cavitation', price: 'TTD 900', duration: '1h 10m' },
      { name: 'Body Sculpt Shots (1 Month Supply)', price: 'TTD 3,200', duration: '10 mins' },
      { name: 'Back Lipo Shots', price: 'TTD 550', duration: '40 mins' },
      { name: 'Arms Lipo Shots', price: 'TTD 500', duration: '30 mins' },
      { name: 'Inner Thigh Lipo Shots', price: 'TTD 500', duration: '30 mins' },
      { name: 'Full Stomach Lipo Shots + Back', price: 'TTD 900', duration: '1h 30m' },
    ],
  };  // end services defaults

  // Categories that must not be bookable online (client instructions). Removing
  // a name from this list re-enables it — no other logic needs to change.
  const DISABLED_BOOKING_CATEGORIES = ['Pedicures'];

  // Populate category dropdown
  if (catSelect) {
    Object.keys(services).filter(cat => !DISABLED_BOOKING_CATEGORIES.includes(cat)).forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      catSelect.appendChild(opt);
    });

    catSelect.addEventListener('change', () => {
      svcSelect.innerHTML = '<option value="">Select a service</option>';
      (services[catSelect.value] || []).forEach(s => {
        const opt = document.createElement('option');
        opt.value = JSON.stringify(s);
        opt.textContent = `${s.name} — ${s.price}`;
        svcSelect.appendChild(opt);
      });
      svcSelect.disabled = !catSelect.value;
      if (addServiceBtn) addServiceBtn.disabled = true;
      updateEstheticianPicker();
    });

    // Pre-fill from URL params (coming from services page)
    const params = new URLSearchParams(location.search);
    const preCat = params.get('cat');
    const preSvc = params.get('svc');
    if (preCat && !DISABLED_BOOKING_CATEGORIES.includes(preCat)) {
      catSelect.value = preCat;
      catSelect.dispatchEvent(new Event('change'));
      if (preSvc && svcSelect) {
        for (const opt of svcSelect.options) {
          if (!opt.value) continue;
          try {
            if (JSON.parse(opt.value).name === preSvc) {
              svcSelect.value = opt.value;
              svcSelect.dispatchEvent(new Event('change'));
              // Auto-add to selectedServices (can't click the button — listener not attached yet)
              const _preSvc = JSON.parse(opt.value);
              selectedServices.push({ ..._preSvc, category: preCat });
              renderSelectedServices();
              catSelect.value = '';
              svcSelect.innerHTML = '<option value="">Select a service first</option>';
              svcSelect.disabled = true;
              break;
            }
          } catch (_) {}
        }
      }
      // Scroll booking form into view, clearing the fixed navbar
      setTimeout(() => {
        const navH = document.querySelector('.navbar')?.offsetHeight || 80;
        const top = form.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }, 150);
    }
  }

  // Time slots
  const times = SLOT_GRID_12;

  let _bookingType = 'confirmed';
  let _selectedEsthetician = 'chel-c'; // 'chel-c' | 'timothy'

  function updateEstheticianPicker() {
    const esthGroup = document.getElementById('estheticianGroup');
    if (!esthGroup) return;
    const allFacials = selectedServices.length === 0 || selectedServices.every(s => s.category === 'Advanced Facials');
    const show = catSelect?.value === 'Advanced Facials' && allFacials;
    esthGroup.style.display = show ? '' : 'none';
    if (!show) {
      _selectedEsthetician = 'chel-c';
      esthGroup.querySelectorAll('.esth-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.esth === 'chel-c'));
    }
  }

  document.querySelectorAll('.esth-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _selectedEsthetician = btn.dataset.esth;
      document.querySelectorAll('.esth-btn').forEach(b => b.classList.toggle('active', b === btn));
      if (dateInput?.value) renderTimeSlots(dateInput.value);
    });
  });

  async function renderTimeSlots(dateStr) {
    if (!timeWrap) return;
    const requestNotice = document.getElementById('requestNotice');

    // Block Mondays (0=Sun, 1=Mon)
    if (new Date(dateStr + 'T00:00').getDay() === 1) {
      timeWrap.innerHTML = '<div class="slot-closed-msg">🚫 We\'re closed on Mondays — please choose another day.</div>';
      selectedTimeInput.value = '';
      _bookingType = 'confirmed';
      if (requestNotice) requestNotice.style.display = 'none';
      updateSummary();
      return;
    }

    // Fetch fresh blocked dates from Firestore for real-time accuracy.
    // Fail CLOSED: if we can't verify availability, don't show any slots as bookable.
    const freshBD = await _fsGet('blocked_dates');
    if (!freshBD) {
      timeWrap.innerHTML = '<div class="slot-closed-msg">⚠️ Couldn\'t verify availability — check your connection and <a href="#" id="retryAvailabilityLink">try again</a>.</div>';
      document.getElementById('retryAvailabilityLink')?.addEventListener('click', ev => { ev.preventDefault(); renderTimeSlots(dateStr); });
      selectedTimeInput.value = '';
      _bookingType = 'confirmed';
      if (requestNotice) requestNotice.style.display = 'none';
      updateSummary();
      return;
    }
    localStorage.setItem('lunas_blocked_dates', JSON.stringify(freshBD));

    if (isDateBlocked(dateStr)) {
      timeWrap.innerHTML = '<div class="slot-closed-msg">🚫 This date is fully booked out — please choose a different date.</div>';
      selectedTimeInput.value = '';
      _bookingType = 'confirmed';
      if (requestNotice) requestNotice.style.display = 'none';
      updateSummary();
      return;
    }

    timeWrap.innerHTML = '<span style="color:var(--text-light);font-size:0.84rem;padding:0.4rem 0;display:block;">Checking availability…</span>';
    const { chelcBooked, timothyBooked, manualBlocked } = await getBookedSlots(dateStr);
    timeWrap.innerHTML = '';
    if (requestNotice) requestNotice.style.display = 'none';

    const duration = totalDurationMinutes(selectedServices);

    times.forEach(t => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot';
      btn.textContent = t;
      const isTaken = (_selectedEsthetician === 'timothy' ? timothyBooked : chelcBooked).includes(t);
      const isAdminBlocked = isSlotBlocked(dateStr, t);
      const isManualBlocked = manualBlocked.includes(t);
      const isTooLate = _toMins(SLOT_GRID_24[SLOT_GRID_12.indexOf(t)]) + duration > CLOSING_MINUTES;
      if (isAdminBlocked || isManualBlocked) {
        btn.disabled = true;
        btn.classList.add('slot-admin-blocked');
      } else if (isTaken) {
        btn.disabled = true;
        btn.classList.add('slot-booked');
      } else if (isTooLate) {
        btn.disabled = true;
        btn.classList.add('slot-too-late');
      }

      btn.addEventListener('click', () => {
        if (isAdminBlocked || isManualBlocked || isTaken || isTooLate) return;
        timeWrap.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedTimeInput.value = t;
        _bookingType = 'confirmed';
        if (requestNotice) requestNotice.style.display = 'none';
        updateSummary();
      });

      timeWrap.appendChild(btn);
    });
  }

  function updateSummary() {
    if (!summary) return;
    const date = dateInput?.value;
    const time = selectedTimeInput?.value;
    if (!selectedServices.length || !date || !time) { summary.style.display = 'none'; return; }

    summary.style.display = 'block';

    // Render each service as its own row
    const sumList = document.getElementById('sumServicesList');
    if (sumList) {
      sumList.innerHTML = selectedServices.map(s =>
        `<div class="summary-row"><span>${s.name}</span><span>${s.price}</span></div>`
      ).join('');
    }

    // Duration — list all if multiple
    const durEl = document.getElementById('sumDuration');
    if (durEl) durEl.textContent = selectedServices.length === 1
      ? selectedServices[0].duration
      : selectedServices.map(s => s.duration).join(' + ');

    const dateEl = document.getElementById('sumDate');
    if (dateEl) dateEl.textContent = new Date(date + 'T00:00').toLocaleDateString('en-TT', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    const timeEl = document.getElementById('sumTime');
    if (timeEl) timeEl.textContent = time;

    // Sum base prices
    let totalBase = 0;
    let hasFrom = false;
    selectedServices.forEach(s => {
      const m = s.price.replace(/,/g, '').match(/\d+(\.\d+)?/);
      if (m) totalBase += parseFloat(m[0]);
      if (s.price.trim().toLowerCase().startsWith('from')) hasFrom = true;
    });

    const prefix = hasFrom ? 'from ' : '';
    const _discRow = document.getElementById('sumDiscountRow');
    const _totRow  = document.getElementById('sumTotalRow');
    const { discAmt: _discAmt, specialName: _spName } = calcActiveDiscount(selectedServices);

    if (_discAmt > 0) {
      const _sumDiscEl   = document.getElementById('sumDiscount');
      const _sumLabelEl  = document.getElementById('sumDiscountLabel');
      if (_discRow) {
        _discRow.style.display = '';
        if (_sumLabelEl) _sumLabelEl.textContent = _spName || 'Discount';
        if (_sumDiscEl)  _sumDiscEl.textContent  = `−TTD ${_discAmt}`;
      }
      if (_totRow)  { _totRow.style.display = ''; document.getElementById('sumTotal').textContent = `${prefix}TTD ${(totalBase - _discAmt).toLocaleString()}`; }
    } else {
      if (_discRow) _discRow.style.display = 'none';
      if (_totRow)  { _totRow.style.display = ''; document.getElementById('sumTotal').textContent = `${prefix}TTD ${totalBase.toLocaleString()}`; }
    }
  }

  svcSelect?.addEventListener('change', () => {
    if (addServiceBtn) addServiceBtn.disabled = !svcSelect.value;
    updateSummary();
  });

  addServiceBtn?.addEventListener('click', () => {
    if (!svcSelect.value) return;
    const svc = JSON.parse(svcSelect.value);
    selectedServices.push({ ...svc, category: catSelect.value });
    renderSelectedServices();
    catSelect.value = '';
    svcSelect.innerHTML = '<option value="">Select a service first</option>';
    svcSelect.disabled = true;
    if (addServiceBtn) addServiceBtn.disabled = true;
    updateEstheticianPicker();
    updateSummary();
    if (dateInput?.value) renderTimeSlots(dateInput.value);
  });
  dateInput?.addEventListener('change', () => {
    if (dateInput.value && dateInput.value < today) {
      dateInput.value = '';
      if (timeWrap) timeWrap.innerHTML = '<div class="slot-closed-msg">🚫 Please select a date from today onwards.</div>';
      selectedTimeInput.value = '';
      updateSummary();
      return;
    }
    selectedTimeInput.value = '';
    updateSummary();
    if (dateInput.value) renderTimeSlots(dateInput.value);
    else if (timeWrap) timeWrap.innerHTML = '';
  });

  // Submit → save booking + email notification
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    const fd = new FormData(form);
    // Honeypot — bots fill the hidden "website" field
    if (fd.get('website')) { form.style.display = 'none'; document.getElementById('bookingSuccess')?.style && (document.getElementById('bookingSuccess').style.display = 'block'); return; }

    // Rate limiting — prevent rapid resubmission
    const _COOLDOWN_MS = 30000;
    const _lastBook = parseInt(localStorage.getItem('lunas_last_book') || '0', 10);
    const _msSinceLast = Date.now() - _lastBook;
    if (_msSinceLast < _COOLDOWN_MS) {
      const secsLeft = Math.ceil((_COOLDOWN_MS - _msSinceLast) / 1000);
      submitBtn.disabled = true;
      submitBtn.textContent = `Please wait ${secsLeft}s…`;
      const _cdInterval = setInterval(() => {
        const rem = Math.ceil((_COOLDOWN_MS - (Date.now() - _lastBook)) / 1000);
        if (rem <= 0) {
          clearInterval(_cdInterval);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Confirm Booking ✨';
        } else {
          submitBtn.textContent = `Please wait ${rem}s…`;
        }
      }, 1000);
      return;
    }

    // Input validation and sanitization
    const rawName  = (fd.get('clientName')  || '').trim();
    const rawPhone = (fd.get('clientPhone') || '').trim();
    const rawEmail = (fd.get('clientEmail') || '').trim();
    const rawNotes = (fd.get('notes')       || '').trim();
    if (!rawName) { alert('Please enter your full name.'); return; }
    if (!rawPhone) { alert('Please enter your phone number.'); return; }
    if (!/^[0-9+\-()\s]{7,30}$/.test(rawPhone)) {
      alert('Please enter a valid phone number (digits, spaces, dashes, parentheses and + are allowed).');
      return;
    }
    if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Check if client is blocked before checking slot (uses cleaned phone)
    const _blockedCheck = getDB('lunas_clients').find(c => c.phone === rawPhone);
    if (_blockedCheck?.blocked) {
      alert('We\'re unable to process your booking at this time. Please contact us directly on 1(868) 463-9306.');
      return;
    }

    if (!selectedServices.length) { alert('Please add at least one service.'); return; }
    if (!selectedTimeInput?.value) { alert('Please select a time slot.'); return; }
    const dateStr = fd.get('bookDate');
    const timeStr = selectedTimeInput.value;

    // Active specials discount calculation
    let _totalBase = 0;
    selectedServices.forEach(s => {
      const _m = s.price.replace(/,/g, '').match(/\d+(\.\d+)?/);
      if (_m) _totalBase += parseFloat(_m[0]);
    });
    const { discAmt: _discAmtRaw, specialName: _spNameRaw } = calcActiveDiscount(selectedServices);
    let _discAmt   = _discAmtRaw > 0 ? _discAmtRaw : null;
    let _discTotal = _discAmt ? _totalBase - _discAmt : null;
    let _spName    = _discAmt ? _spNameRaw : null;

    // Re-check blocked dates before confirming. Fail CLOSED: if we can't verify
    // against the server, do not proceed — a stale/empty local cache must never
    // be treated as "unblocked".
    const freshBD2 = await _fsGet('blocked_dates');
    if (!freshBD2) {
      alert('Unable to verify availability right now — please check your connection and try again in a moment.');
      return;
    }
    localStorage.setItem('lunas_blocked_dates', JSON.stringify(freshBD2));
    if (isDateBlocked(dateStr) || isSlotBlocked(dateStr, timeStr)) {
      alert('This time is no longer available. Please choose a different date or time.');
      await renderTimeSlots(dateStr);
      selectedTimeInput.value = '';
      updateSummary();
      return;
    }

    // Re-check slot availability before confirming
    const { chelcBooked: _fc, timothyBooked: _ft, manualBlocked: freshManual } = await getBookedSlots(dateStr);
    const freshEsthBooked = _selectedEsthetician === 'timothy' ? _ft : _fc;
    if (freshEsthBooked.includes(timeStr) || freshManual.includes(timeStr)) {
      alert('This time is no longer available. Please choose a different time.');
      await renderTimeSlots(dateStr);
      selectedTimeInput.value = '';
      updateSummary();
      return;
    }

    // Show consent modal — only proceed after client agrees
    showConsentModal(catSelect.value, async () => {

    submitBtn.disabled = true;
    submitBtn.textContent = 'Confirming…';

    // Final authoritative re-check, right before writing — closes the window
    // where the client sat on the consent modal while the day got blocked.
    const freshBD3 = await _fsGet('blocked_dates');
    if (!freshBD3) {
      alert('Unable to verify availability right now — please check your connection and try again in a moment.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Booking ✨';
      return;
    }
    localStorage.setItem('lunas_blocked_dates', JSON.stringify(freshBD3));
    if (isDateBlocked(dateStr) || isSlotBlocked(dateStr, timeStr)) {
      alert('This time is no longer available. Please choose a different time.');
      await renderTimeSlots(dateStr);
      selectedTimeInput.value = '';
      updateSummary();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Booking ✨';
      return;
    }
    const { chelcBooked: _fc2, timothyBooked: _ft2, manualBlocked: _freshManual2 } = await getBookedSlots(dateStr);
    const _freshEsthBooked2 = _selectedEsthetician === 'timothy' ? _ft2 : _fc2;
    if (_freshEsthBooked2.includes(timeStr) || _freshManual2.includes(timeStr)) {
      alert('This time is no longer available. Please choose a different time.');
      await renderTimeSlots(dateStr);
      selectedTimeInput.value = '';
      updateSummary();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Booking ✨';
      return;
    }

    const _hasFromPrice = selectedServices.some(s => s.price.trim().toLowerCase().startsWith('from'));
    const _combinedName = selectedServices.map(s => s.name).join(' + ');
    const _combinedPrice = (_hasFromPrice ? 'from TTD ' : 'TTD ') + _totalBase.toLocaleString();
    const booking = {
      id: Date.now(),
      name: rawName,
      phone: rawPhone,
      email: rawEmail,
      services: selectedServices,
      service: _combinedName,
      price: _combinedPrice,
      discountedPrice: _discAmt ? `TTD ${_discTotal.toLocaleString()}` : null,
      promoApplied: _discAmt ? _spName : null,
      date: dateStr,
      time: timeStr,
      notes: rawNotes,
      status: _bookingType,
      esthetician: _selectedEsthetician,
      created: new Date().toISOString(),
    };

    const _fsSaved = await saveBookingRecord(booking);

    // Auto-save client record
    const clients = getDB('lunas_clients');
    const existingIdx = clients.findIndex(c => c.phone === booking.phone);
    if (existingIdx >= 0) {
      clients[existingIdx].lastVisit = booking.date;
      clients[existingIdx].totalVisits = (clients[existingIdx].totalVisits || 0) + 1;
      if (!clients[existingIdx].email && booking.email) clients[existingIdx].email = booking.email;
    } else {
      clients.push({
        id: Date.now() + 1,
        name: booking.name,
        phone: booking.phone,
        email: booking.email || '',
        dob: '',
        notes: '',
        lastVisit: booking.date,
        totalVisits: 1,
        created: new Date().toISOString(),
      });
    }
    setDB('lunas_clients', clients);

    const formattedDate = new Date(dateStr + 'T00:00').toLocaleDateString('en-TT', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const isRequest = _bookingType === 'pending';
    const _svcLines = selectedServices.map(s => `           • ${s.name} (${s.price})`).join('\n');
    const emailBody =
      `${isRequest ? '⚠️ BOOKING REQUEST (slot already taken — needs your review)' : '✅ NEW CONFIRMED BOOKING'}\n\n` +
      `Client:   ${booking.name}\n` +
      `Phone:    ${booking.phone}\n` +
      `Email:    ${booking.email || 'Not provided'}\n\n` +
      `Services:\n${_svcLines}\n` +
      `Total:    ${booking.price}${booking.discountedPrice ? `\nDiscount: −TTD ${_discAmt} (${_spName})\nFinal:    ${booking.discountedPrice}` : ''}\n` +
      `Date:     ${formattedDate}\n` +
      `Time:     ${booking.time}\n` +
      `Esthetician: ${_selectedEsthetician === 'timothy' ? 'Timothy' : 'Chel-C'}\n\n` +
      `Notes:    ${booking.notes || 'None'}`;

    // Send business notification
    try {
      await sendEmail(
        isRequest
          ? `⚠️ Booking Request — ${booking.service} on ${formattedDate}`
          : `✅ New Booking Confirmed — ${booking.service} on ${formattedDate}`,
        booking.name, booking.phone, booking.email, emailBody
      );
    } catch (err) {
      console.error('Business email failed:', err);
      try {
        const _failLog = JSON.parse(localStorage.getItem('lunas_email_fails') || '[]');
        _failLog.push({ ts: new Date().toISOString(), bookingId: booking.id, clientName: booking.name });
        localStorage.setItem('lunas_email_fails', JSON.stringify(_failLog.slice(-20)));
      } catch(_e) {}
    }

    // Send customer confirmation (only if they provided an email)
    if (booking.email) {
      try {
        await sendClientEmail(
          booking.name, booking.email,
          booking.service, booking.price,
          formattedDate, booking.time, isRequest
        );
      } catch (err) { console.error('Customer confirmation email failed:', err); }
    }

    // Show success panel
    form.style.display = 'none';
    const successEl = document.getElementById('bookingSuccess');
    if (successEl) {
      document.getElementById('bsName').textContent = booking.name;
      const bsServiceEl = document.getElementById('bsService');
      if (bsServiceEl) {
        bsServiceEl.textContent = '';
        if (selectedServices.length === 1) {
          bsServiceEl.textContent = selectedServices[0].name;
        } else {
          selectedServices.forEach((s, i) => {
            if (i > 0) bsServiceEl.appendChild(document.createElement('br'));
            bsServiceEl.appendChild(document.createTextNode('• ' + s.name));
          });
        }
      }
      document.getElementById('bsDate').textContent = formattedDate;
      document.getElementById('bsTime').textContent = booking.time;
      const bsHeading = document.getElementById('bsHeading');
      const bsMsg = document.getElementById('bsMsg');
      if (bsHeading) bsHeading.textContent = isRequest ? 'Request Sent!' : 'Booking Confirmed!';
      if (bsMsg) bsMsg.textContent = isRequest
        ? 'That time slot is taken, but your request has been sent. Chel-C will review and contact you to confirm.'
        : 'Your appointment is confirmed. We look forward to seeing you!';
      successEl.style.display = 'block';
      if (!_fsSaved) {
        const bsWarn = document.getElementById('bsFirestoreWarning');
        if (bsWarn) bsWarn.style.display = 'block';
      }
      const icalBtn = document.getElementById('icalBtn');
      if (icalBtn) {
        icalBtn.style.display = 'inline-flex';
        icalBtn.onclick = () => downloadICS(booking);
      }
    }

    localStorage.setItem('lunas_last_book', Date.now().toString());
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm Booking ✨';

    }); // end showConsentModal callback
  }); // end form submit

  // After Firestore sync, refresh the services category dropdown with latest data
  onSyncReady(() => {
    if (!catSelect) return;
    const freshData = JSON.parse(localStorage.getItem('lunas_services') || 'null');
    if (!freshData) return;
    const prevCat = catSelect.value;
    catSelect.innerHTML = '<option value="">Select a category</option>';
    Object.keys(freshData).filter(cat => !DISABLED_BOOKING_CATEGORIES.includes(cat)).forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat;
      catSelect.appendChild(opt);
    });
    catSelect.value = DISABLED_BOOKING_CATEGORIES.includes(prevCat) ? '' : prevCat;
    if (catSelect.value) catSelect.dispatchEvent(new Event('change'));
  });
}
initBooking();

/* ── Shop / Cart ── */
let cart = JSON.parse(localStorage.getItem('lunas_cart') || '[]');

function saveCart() { localStorage.setItem('lunas_cart', JSON.stringify(cart)); }
function cartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }

function renderCart() {
  const itemsWrap = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const countEl = document.getElementById('cartCount');
  if (!itemsWrap) return;
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  if (countEl) { countEl.textContent = totalQty; countEl.style.display = totalQty ? '' : 'none'; }
  if (!cart.length) {
    itemsWrap.innerHTML = '<div class="cart-empty-msg"><div class="cart-empty-icon">🛍️</div><p>Your cart is empty.</p></div>';
    if (totalEl) totalEl.textContent = 'TTD 0';
    return;
  }
  itemsWrap.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">TTD ${(item.price * item.qty).toFixed(2)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
        </div>
      </div>
      <button class="cart-remove" onclick="removeCartItem(${i})">✕</button>
    </div>`).join('');
  if (totalEl) totalEl.textContent = `TTD ${cartTotal().toFixed(2)}`;
}

window.changeQty = (i, d) => { cart[i].qty = Math.max(1, cart[i].qty + d); saveCart(); renderCart(); };
window.removeCartItem = i => { cart.splice(i, 1); saveCart(); renderCart(); };

window.addToCart = (name, price, emoji) => {
  const ex = cart.find(i => i.name === name);
  if (ex) { ex.qty++; } else { cart.push({ name, price, emoji, qty: 1 }); }
  saveCart(); renderCart();
  openCart();
};

function openCart() {
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  lockScroll();
}
function closeCart() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  unlockScroll();
}

document.getElementById('openCartBtn')?.addEventListener('click', openCart);
document.getElementById('cartCloseBtn')?.addEventListener('click', closeCart);
document.getElementById('cartOverlay')?.addEventListener('click', closeCart);

document.getElementById('checkoutBtn')?.addEventListener('click', () => {
  if (!cart.length) { alert('Your cart is empty!'); return; }
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.add('open');
});

document.getElementById('checkoutModalClose')?.addEventListener('click', () => {
  document.getElementById('checkoutModal')?.classList.remove('open');
});

document.getElementById('checkoutForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!cart.length) return;
  const submitBtn = e.target.querySelector('[type="submit"]');
  const fd = new FormData(e.target);

  // Input sanitization and validation
  const coName  = (fd.get('coName')  || '').trim();
  const coPhone = (fd.get('coPhone') || '').trim();
  const coEmail = (fd.get('coEmail') || '').trim();
  if (!coName)  { alert('Please enter your name.'); return; }
  if (!coPhone) { alert('Please enter your phone number.'); return; }
  if (!/^[0-9+\-()\s]{7,30}$/.test(coPhone)) {
    alert('Please enter a valid phone number (digits, spaces, dashes, parentheses and + are allowed).');
    return;
  }
  if (coEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coEmail)) {
    alert('Please enter a valid email address.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  const lines = cart.map(i => `  • ${i.name} x${i.qty} — TTD ${(i.price * i.qty).toFixed(2)}`).join('\n');
  const body =
    `Product Order\n\n` +
    `Name:  ${coName}\n` +
    `Phone: ${coPhone}\n` +
    `Email: ${coEmail || 'Not provided'}\n\n` +
    `Items:\n${lines}\n\n` +
    `Total: TTD ${cartTotal().toFixed(2)}`;
  try {
    await sendEmail(
      `Product Order from ${coName}`,
      coName, coPhone, coEmail, body
    );
  } catch (err) { console.error('Order email failed:', err); }
  // Customer order confirmation
  if (coEmail) {
    try {
      await sendClientEmail(
        coName, coEmail,
        lines, `TTD ${cartTotal().toFixed(2)}`,
        new Date().toLocaleDateString('en-TT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        '', false,
        "Thank you for your order with Luna's Esthetics! We've received it and will contact you shortly to arrange payment and delivery."
      );
    } catch (err) { console.error('Order confirmation email failed:', err); }
  }
  cart = []; saveCart(); renderCart();
  document.getElementById('checkoutModal')?.classList.remove('open');
  const toast = document.getElementById('orderSuccess');
  if (toast) { toast.style.display = 'block'; setTimeout(() => toast.style.display = 'none', 6000); }
  submitBtn.disabled = false;
  submitBtn.textContent = 'Send Order ✉️';
  e.target.reset();
});

renderCart();

/* ── Professionals Only Shop (Bushbalm Pro wholesale) ── */
function initProShop() {
  const grid = document.getElementById('proProductGrid');
  if (!grid) return;

  const PRO_PRODUCTS = [
    { id: 1,  name: "Basic Starter Kit: Best for Beginners", shortDesc: "A curated starter bundle covering Nude, Watermelon Sugar & Bermuda aftercare, plus Roller Rescue serum and toner pads. Includes free backbar oil, window sticker, tent cards & retail display box.", price: 3500.00, image: "basic-starter-kit.jpeg" },
    { id: 2,  name: "Bushbalm Pro Starter Kit", shortDesc: "The complete pro bundle: full oil & scrub range across scents, Hydrogel Vajacial strips, Roller Rescue serum, toner pads & Brightening Gel — plus free backbar oils, window sticker, tent cards & retail display box.", price: 4500.00, image: "pro-starter-kit.jpeg" },
    { id: 3,  name: "x6 Nude · Ingrown Hair + Pre-Post Wax Oil (1 fl oz)", shortDesc: "Antioxidant-rich oil that softens skin and reduces ingrown hairs & razor bumps after hair removal. Signature barely-there tea tree scent.", price: 1250.00, image: "nude-oil.jpeg" },
    { id: 4,  name: "x6 Nude · Ingrown Hair Exfoliating Scrub (8 fl oz)", shortDesc: "Lightweight sugar scrub that clears pores and softens skin pre- and post-treatment. Same signature Nude scent.", price: 1300.00, image: "nude-scrub.jpeg" },
    { id: 5,  name: "x6 Vanilla Tangerine · Ingrown Hair Oil (1 fl oz)", shortDesc: "Antioxidant-rich blend that improves the look of irritation and ingrown hairs. Soft vanilla-tangerine aroma.", price: 1250.00, image: "vanilla-tangerine-oil.jpeg" },
    { id: 6,  name: "x6 Vanilla Tangerine · Exfoliating Body Scrub (8 fl oz)", shortDesc: "Hydrating sugar scrub that smooths skin pre- and post-hair removal. Soft vanilla-tangerine aroma.", price: 1300.00, image: "vanilla-tangerine-scrub.jpeg" },
    { id: 7,  name: "x6 Unscented Hydrogel Vajacial Mask Set", shortDesc: "Cooling hydrogel masks (triangle + side strips) infused with hyaluronic acid, aloe & green tea to calm and hydrate post-treatment skin.", price: 650.00, image: "hydrogel-vajacial-mask.jpeg" },
    { id: 8,  name: "x6 AHA/BHA Roller Rescue Soothing Serum", shortDesc: "Lightweight chemical exfoliant with a cooling stainless-steel rollerball — smooths texture, clears pores & reduces redness after hair removal.", price: 1250.00, image: "roller-rescue-serum.jpeg" },
    { id: 9,  name: "x6 Bermuda · Dark Spot Oil (1 fl oz)", shortDesc: "Six natural ingredients that brighten, soften and reduce the look of dark spots anywhere on the body. Fresh citrus scent.", price: 1250.00, image: "bermuda-oil.jpeg" },
    { id: 10, name: "x6 Bermuda · Dark Spot Exfoliating Scrub (8 fl oz)", shortDesc: "Hydrating sugar scrub that smooths skin while reducing the look of dark spots. Fresh citrus scent.", price: 1300.00, image: "bermuda-scrub.jpeg" },
    { id: 11, name: "x6 After Dark Brightening Gel (3% TXA / 2% Niacinamide)", shortDesc: "Overnight brightening gel for intimate skin — reduces dark spots and enhances radiance. Gynecologist & dermatologist approved.", price: 1250.00, image: "after-dark-gel.jpeg" },
    { id: 12, name: "x6 Radiant Reset Exfoliating Toner Pads", shortDesc: "Alcohol-free AHA/BHA/TXA toner pads that smooth & brighten without disrupting the skin's pH. Safe for bikini line to full body.", price: 1250.00, image: "radiant-reset-pads.jpeg" },
    { id: 13, name: "x24 Summer Vacay Ingrown Hair Oil & Scrub Bundle", shortDesc: "Pre- and after-care duo in a summery vanilla-blossom-and-almond scent — reduces irritation, ingrown hairs and bumps.", price: 3500.00, image: "summer-vacay-bundle.jpeg" },
    { id: 14, name: "x12 Mini Ingrown Hair Oil (Assorted)", shortDesc: "Travel-size ingrown hair oils in Nude, Watermelon Sugar, Vanilla Tangerine & Bermuda — perfect for retail add-ons or trial sizes.", price: 600.00, image: "mini-ingrown-hair-oil.jpeg" },
    { id: 15, name: "Frosty Fizz Hard Wax Beads (2.42 lb / 1.1 kg)", shortDesc: "Low-temperature Italian hard wax beads with a cool, icy finish — rosin-based formula for fast, clean strip-free removal on larger areas.", price: 350.00, image: "frosty-fizz-wax.jpeg" },
    { id: 16, name: "Lunar Lilac Hard Wax Beads (1.67 lb / 750 g)", shortDesc: "Soft lilac-toned hard wax beads that melt smooth and grip hair effectively — gentle enough for sensitive areas, ideal for full-body waxing.", price: 300.00, image: "lunar-lilac-wax.jpeg" },
    { id: 17, name: "Coconut Cookie Hard Wax Beads (1 lb / 453 g)", shortDesc: "Hypoallergenic rosin-free hard wax with a warm coconut cookie scent — melts like butter for effortless application on face, chest & back.", price: 200.00, image: "coconut-cookie-wax.jpeg" },
    { id: 18, name: "Azulene Film Hard Wax Beads (2.2 lb / 1 kg)", shortDesc: "Calming azulene-infused film wax that forms a flexible, easy-to-remove strip — non-irritating and ideal for sensitive skin.", price: 350.00, image: "azulene-film-wax.jpeg" },
    { id: 19, name: "White Chocolate Film Hard Wax Beads (2.2 lb / 1 kg)", shortDesc: "Creamy, sweet-scented film hard wax that hardens into a flexible strip for gentle, low-pain hair removal on all body areas.", price: 350.00, image: "white-chocolate-wax.jpeg" },
    { id: 20, name: "Sensi Clear Rosin Free Hard Wax (2.2 lb / 1 kg)", shortDesc: "Crystal-clear, rosin-free hard wax formulated for the most sensitive skin — hypoallergenic and gentle on delicate areas.", price: 350.00, image: "sensi-clear-wax.jpeg" },
    { id: 21, name: "White Strawberry Thermochromic Hard Wax (2.2 lb / 1 kg)", shortDesc: "Rosin-free hard wax that shifts to a pearly pink when warmed and ready to use — a visual cue built for precision application.", price: 350.00, image: "white-strawberry-wax.jpeg" },
    { id: 22, name: "Azulene Soft Wax (14 oz / 397 g)", shortDesc: "Flexible, less-sticky roll or tin soft wax infused with calming azulene — suited to large areas and higher-volume waxing.", price: 115.00, image: "azulene-soft-wax.jpeg" },
    { id: 23, name: "Natural Soft Wax — No-Sticky Formula (14 oz / 397 g)", shortDesc: "Smooth amber soft wax with a no-sticky finish — versatile everyday formula for full-body strip waxing.", price: 115.00, image: "natural-soft-wax.jpeg" },
    { id: 24, name: "Aloe Vera Soft Wax (14 oz / 397 g)", shortDesc: "Soothing aloe vera-enriched soft wax recommended for coarse hair and larger treatment areas.", price: 115.00, image: "aloe-vera-soft-wax.jpeg" },
    { id: 25, name: "Zinc Oxide Sensitive Skin Soft Wax Cartridges (3.38 oz, Pack of 4)", shortDesc: "Zinc oxide roll-on cartridges that buffer sensitive skin during waxing — reduces bruising and discomfort on delicate areas.", price: 285.00, image: "zinc-oxide-cartridge-4pk.jpeg" },
    { id: 26, name: "Spa Choice Zinc Oxide Creamy Soft Wax (14 oz / 397 g)", shortDesc: "Creamy zinc oxide soft wax tin for facial and full-body waxing on fine to medium hair — extra buffer for sensitive skin.", price: 115.00, image: "zinc-oxide-creamy-soft-wax.jpeg" },
    { id: 27, name: "Soft Wax Pearl for Face & Eyebrows Mini Tin (5 oz / 141 g)", shortDesc: "Rosin-free hypoallergenic pearl-white soft wax built for precision face and eyebrow work — gentle on delicate skin.", price: 60.00, image: "soft-wax-pearl-mini-tin.jpeg" },
    { id: 28, name: "Spa Choice Rosin Free Gel Soft Wax — Lavender (14 oz / 397 g)", shortDesc: "Light purple, rosin-free gel wax with a relaxing lavender scent — hypoallergenic formula safe for the most sensitive skin types.", price: 115.00, image: "rosin-free-gel-lavender.jpeg" },
    { id: 29, name: "Noire Soft Wax Cartridges (3.38 oz, Pack of 4)", shortDesc: "High-density titanium dioxide roll-on cartridges built for short, coarse hair — advanced adhesion with fewer passes.", price: 200.00, image: "noire-cartridge-4pk.jpeg" },
    { id: 30, name: "Extra Comfort Pink Glow Epilating Strips (100 pcs, 2.75 x 7.83 in)", shortDesc: "Micro-engineered pink strips with superior adhesion to soft wax — clean removal on large body areas, trimmable for smaller ones.", price: 110.00, image: "epilating-strips-pink-glow.jpeg" },
    { id: 31, name: "Extra Comfort Epilating Strips (100 pcs, 2.75 x 7.83 in)", shortDesc: "Classic non-woven epilating strips with strong wax adhesion for efficient, everyday soft-wax removal.", price: 80.00, image: "epilating-strips-classic.jpeg" },
    { id: 32, name: "After Wax Lotion — Azulene (8.45 oz / 250 ml)", shortDesc: "Fast-absorbing, non-greasy post-wax lotion with soothing chamomile and azulene — leaves a cooling, satin finish.", price: 100.00, image: "after-wax-lotion-azulene.jpeg" },
    { id: 33, name: "Pre Waxing Lotion — Natural Aloe Vera Extract (8.45 oz / 250 ml)", shortDesc: "Aloe vera-enriched pre-wax lotion that preps and calms the skin before treatment.", price: 230.00, image: "pre-wax-lotion-aloe-vera.jpeg" },
    { id: 34, name: "After Waxing Cooling Gel — Witch Hazel, Aloe & Menthol (8.45 fl oz / 250 ml)", shortDesc: "Oil-free post-wax gel with witch hazel, aloe and a cooling menthol finish — won't clog pores or follicles.", price: 230.00, image: "after-wax-cooling-gel.jpeg" },
    { id: 35, name: "Pre Waxing Cosmetic Talc (5.29 oz / 150 g)", shortDesc: "Ultra-purified, super-absorbent pre-wax powder that removes excess moisture for better wax grip.", price: 200.00, image: "pre-wax-cosmetic-talc.jpeg" },
    { id: 36, name: "Digital Double Cartridge Wax Heater (WX-1D x2)", shortDesc: "Variable-temperature double roll-on heater with digital display and detachable base — run two cartridge colors at once.", price: 900.00, image: "double-cartridge-heater.jpeg" },
    { id: 37, name: "Large Professional Wax Warmer — Pink Elite Series (5.5 lb)", shortDesc: "Salon-grade 5.5 lb pot warmer with precise electronic temperature control and a detachable aluminum pot for easy cleaning.", price: 1850.00, image: "pink-pot-5.5lb.jpeg" },
    { id: 38, name: "Mini W-Cube Metallic Warmer (1 lb, Digital)", shortDesc: "Compact digital pot warmer with a removable metal liner — quick, even meltdown for smaller wax batches. Available in assorted metallic finishes.", price: 650.00, image: "mini-w-cube-warmer.jpeg" },
    { id: 39, name: "Professional Double Wax Warmer (2 x 1 lb)", shortDesc: "Twin-pot warmer with detachable aluminum liners — run two wax types side by side for back-to-back appointments.", price: 950.00, image: "double-warmer.jpeg" },
    { id: 40, name: "Large Professional Wax Warmer — Sage Elite Series (5.5 lb)", shortDesc: "Salon-grade 5.5 lb pot warmer with precise electronic temperature control and a detachable aluminum pot for easy cleaning.", price: 1900.00, image: "sage-elite-pot-5.5lb.jpeg" },
    { id: 41, name: "Large Professional Wax Warmer — Wild Luxe Leopard Elite Series (5.5 lb)", shortDesc: "Salon-grade 5.5 lb pot warmer in a bold leopard-print finish, with precise electronic temperature control and a detachable aluminum pot.", price: 1850.00, image: "leopard-pot-5.5lb.jpeg" },
    { id: 42, name: "Wax Warmer — Wild Luxe Leopard Elite Series (16 oz)", shortDesc: "Compact leopard-print pot warmer with silicone liner — ideal for smaller wax batches or single-service stations.", price: 800.00, image: "leopard-pot-small.jpeg" },
    { id: 43, name: "Empty Wax Can (14 oz / 397 g)", shortDesc: "Refillable empty tin for melting and storing any hard wax bead flavor — fits most standard pot warmers.", price: 50.00, image: "empty-wax-can.jpeg" },
    { id: 44, name: "Silicone Wax Stirring Spatula (12 in)", shortDesc: "Heat-resistant silicone spatula for stirring and applying wax — faster and easier to clean than wooden applicators.", price: 60.00, image: "silicone-spatula.jpeg" },
    { id: 45, name: "Dark Spot Oil — Backbar (6.7 fl oz / 200 mL, Bermuda)", shortDesc: "Backbar-size Bermuda Dark Spot Oil for in-service use — brightens hyperpigmentation, soothes skin post-treatment, and softens skin & body hair. Fresh citrus scent.", price: 400.00, image: "dark-spot-oil-backbar.jpeg" },
    { id: 46, name: "Brightening Hydrogel Vajacial Triangle Mask — Backbar (36 Units)", shortDesc: "Vitamin C & niacinamide hydrogel triangle mask for the backbar — brightens the bikini line and mons pubis post-hair-removal in as little as 10 minutes.", price: 1850.00, image: "vajacial-triangle-mask-backbar.jpeg" },
    { id: 47, name: "Ingrown Hair + Pre-Post Wax Oil — Backbar (6.7 fl oz / 200 mL, Watermelon Sugar)", shortDesc: "Backbar-size Watermelon Sugar oil for in-service use — soothes post-treatment, prevents ingrown hairs, and softens skin & body hair. Juicy, sweet scent.", price: 400.00, image: "ingrown-hair-oil-backbar-watermelon.jpeg" },
    { id: 48, name: "x6 Ingrown Hair Pre/Post-Wax Oil (1 fl oz, Vanilla Coconut)", shortDesc: "Limited-edition Vanilla Coconut ingrown hair oil — antioxidant-rich blend that reduces the look of ingrown hairs and irritation. Warm coconut-vanilla scent.", price: 1250.00, image: "ingrown-hair-oil-vanilla-coconut.jpeg" },
    { id: 49, name: "The Ultimate Brightening Duo (Toner Pads x6 + Bermuda Oil x6)", shortDesc: "Bundle of Radiant Reset Exfoliating Toner Pads + Bermuda Dark Spot Oil — a complete brightening aftercare recommendation for clients.", price: 2300.00, image: "ultimate-brightening-duo.jpeg" },
    { id: 50, name: "x12 Mini Ingrown Hair Oil (5 mL, Vanilla Tangerine)", shortDesc: "Travel/discovery-size ingrown hair oil dropper — softens skin and reduces razor bumps & ingrown hairs. Sweet tangerine-vanilla creamsicle scent.", price: 600.00, image: "mini-ingrown-hair-oil-vanilla-tangerine.jpeg" },
    { id: 51, name: "x6 Ingrown Hair Exfoliating Body Scrub (8 fl oz, Vanilla Coconut)", shortDesc: "Limited-edition Vanilla Coconut sugar scrub — clears pores and softens skin pre- and post-treatment to maximize hair-removal results.", price: 1300.00, image: "exfoliating-body-scrub-vanilla-coconut.jpeg" },
    { id: 52, name: "x6 Highlighting Body Glaze (3.3 fl oz, Vanilla Coconut)", shortDesc: "Lightweight squalane & shea butter body glaze — hydrates and leaves a soft, radiant sheen without grease or glitter. Vanilla-coconut scent.", price: 1300.00, image: "highlighting-body-glaze-vanilla-coconut.jpeg" },
    { id: 53, name: "x6 Brightening Hydrogel Vajacial Mask Set (Triangle + Side Strips)", shortDesc: "Vitamin C & niacinamide hydrogel mask set — triangle mask plus side strips for bikini line, mons pubis & underarms. Hydrates & brightens in 10 minutes.", price: 500.00, image: "vajacial-mask-set.jpeg" },
  ];

  grid.innerHTML = PRO_PRODUCTS.map(p => `
    <div class="pro-product-card">
      <div class="pro-product-img">${p.image ? `<img src="products-pro/${p.image}" alt="${safe(p.name)}" loading="lazy"/>` : `<div class="pro-product-img-fallback">🧴</div>`}</div>
      <div class="pro-product-body">
        <h3>${safe(p.name)}</h3>
        <p>${safe(p.shortDesc)}</p>
      </div>
      <div class="pro-product-footer">
        <div class="pro-product-price">TTD ${p.price.toFixed(2)}</div>
        <button class="btn-add-pro-cart" data-id="${p.id}">Add to Cart</button>
      </div>
    </div>`).join('');

  let proCart = JSON.parse(localStorage.getItem('lunas_pro_cart') || '[]');
  function saveProCart() { localStorage.setItem('lunas_pro_cart', JSON.stringify(proCart)); }
  function proCartSubtotal() { return proCart.reduce((s, i) => s + i.price * i.qty, 0); }

  function renderProCart() {
    const itemsWrap = document.getElementById('proCartItems');
    const subtotalEl = document.getElementById('proCartSubtotal');
    const countEl = document.getElementById('proCartCount');
    const totalQty = proCart.reduce((s, i) => s + i.qty, 0);
    if (countEl) { countEl.textContent = totalQty; countEl.style.display = totalQty ? '' : 'none'; }
    if (!itemsWrap) return;
    if (!proCart.length) {
      itemsWrap.innerHTML = '<div class="cart-empty-msg"><div class="cart-empty-icon">🧴</div><p>Your cart is empty.</p></div>';
      if (subtotalEl) subtotalEl.textContent = 'TTD 0.00';
      return;
    }
    itemsWrap.innerHTML = proCart.map((item, i) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${safe(item.name)}</div>
          <div class="cart-item-price">TTD ${(item.price * item.qty).toFixed(2)}</div>
          <div class="cart-item-qty">
            <button type="button" class="qty-btn" data-qty-change="${i}" data-d="-1">−</button>
            <span class="qty-num">${item.qty}</span>
            <button type="button" class="qty-btn" data-qty-change="${i}" data-d="1">+</button>
          </div>
        </div>
        <button type="button" class="cart-remove" data-remove="${i}">✕</button>
      </div>`).join('');
    if (subtotalEl) subtotalEl.textContent = `TTD ${proCartSubtotal().toFixed(2)}`;
  }

  grid.addEventListener('click', e => {
    const btn = e.target.closest('.btn-add-pro-cart');
    if (!btn) return;
    const p = PRO_PRODUCTS.find(x => x.id == btn.dataset.id);
    if (!p) return;
    const ex = proCart.find(i => i.name === p.name);
    if (ex) ex.qty++; else proCart.push({ name: p.name, price: p.price, qty: 1 });
    saveProCart(); renderProCart(); openProCart();
  });

  document.getElementById('proCartItems')?.addEventListener('click', e => {
    const qtyBtn = e.target.closest('[data-qty-change]');
    const rmBtn  = e.target.closest('[data-remove]');
    if (qtyBtn) {
      const i = parseInt(qtyBtn.dataset.qtyChange, 10);
      const d = parseInt(qtyBtn.dataset.d, 10);
      proCart[i].qty = Math.max(1, proCart[i].qty + d);
      saveProCart(); renderProCart(); updateCheckoutTotals();
    }
    if (rmBtn) {
      proCart.splice(parseInt(rmBtn.dataset.remove, 10), 1);
      saveProCart(); renderProCart(); updateCheckoutTotals();
    }
  });

  function openProCart() {
    document.getElementById('proCartSidebar')?.classList.add('open');
    document.getElementById('proCartOverlay')?.classList.add('open');
    lockScroll();
  }
  function closeProCart() {
    document.getElementById('proCartSidebar')?.classList.remove('open');
    document.getElementById('proCartOverlay')?.classList.remove('open');
    unlockScroll();
  }
  document.getElementById('openProCartBtn')?.addEventListener('click', openProCart);
  document.getElementById('proCartCloseBtn')?.addEventListener('click', closeProCart);
  document.getElementById('proCartOverlay')?.addEventListener('click', closeProCart);

  /* ── Checkout modal ── */
  const checkoutModal = document.getElementById('proCheckoutModal');
  const checkoutForm  = document.getElementById('proCheckoutForm');
  const islandSelect  = document.getElementById('pcIsland');
  const addressWrap   = document.getElementById('pcAddressWrap');
  const islandWrap    = document.getElementById('pcIslandWrap');

  function currentShipping() {
    const delivery = document.querySelector('input[name="pcDelivery"]:checked')?.value;
    if (delivery !== 'delivery') return 0;
    return islandSelect?.value === 'tobago' ? 70 : 50;
  }

  function updateCheckoutTotals() {
    const subtotal = proCartSubtotal();
    const shipping = currentShipping();
    const total = subtotal + shipping;
    const subEl  = document.getElementById('pcSubtotal');
    const shipEl = document.getElementById('pcShipping');
    const totEl  = document.getElementById('pcTotal');
    if (subEl)  subEl.textContent  = `TTD ${subtotal.toFixed(2)}`;
    if (shipEl) shipEl.textContent = `TTD ${shipping.toFixed(2)}`;
    if (totEl)  totEl.textContent  = `TTD ${total.toFixed(2)}`;
  }

  function toggleDeliveryFields() {
    const delivery = document.querySelector('input[name="pcDelivery"]:checked')?.value;
    const isDelivery = delivery === 'delivery';
    if (islandWrap)  islandWrap.style.display  = isDelivery ? '' : 'none';
    if (addressWrap) addressWrap.style.display = isDelivery ? '' : 'none';
    const addrInput = document.getElementById('pcAddress');
    if (addrInput) addrInput.required = isDelivery;
    updateCheckoutTotals();
  }

  document.getElementById('openProCheckoutBtn')?.addEventListener('click', () => {
    if (!proCart.length) { alert('Your cart is empty!'); return; }
    toggleDeliveryFields();
    checkoutModal?.classList.add('open');
  });
  document.getElementById('proCheckoutModalClose')?.addEventListener('click', () => {
    checkoutModal?.classList.remove('open');
  });
  document.querySelectorAll('input[name="pcDelivery"]').forEach(r => r.addEventListener('change', toggleDeliveryFields));
  islandSelect?.addEventListener('change', updateCheckoutTotals);

  checkoutForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!proCart.length) return;
    const submitBtn = e.target.querySelector('[type="submit"]');
    const fd = new FormData(e.target);

    const pcName   = (fd.get('pcName')   || '').trim();
    const pcPhone  = (fd.get('pcPhone')  || '').trim();
    const pcEmail  = (fd.get('pcEmail')  || '').trim();
    const deliveryMethod = fd.get('pcDelivery') || 'pickup';
    const island   = fd.get('pcIsland') || 'trinidad';
    const pcAddress = (fd.get('pcAddress') || '').trim();

    if (!pcName)  { alert('Please enter your name.'); return; }
    if (!pcPhone) { alert('Please enter your phone number.'); return; }
    if (!/^[0-9+\-()\s]{7,30}$/.test(pcPhone)) { alert('Please enter a valid phone number (digits, spaces, dashes, parentheses and + are allowed).'); return; }
    if (!pcEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pcEmail)) { alert('Please enter a valid email address — your invoice will be sent there.'); return; }
    if (deliveryMethod === 'delivery' && !pcAddress) { alert('Please enter a shipping address.'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const subtotal = proCartSubtotal();
    const shipping = currentShipping();
    const total = subtotal + shipping;

    try {
      const invoiceId = await nextProInvoiceId();
      const order = {
        id: Date.now(),
        invoiceId,
        name: pcName, email: pcEmail, phone: pcPhone,
        deliveryMethod,
        island:  deliveryMethod === 'delivery' ? island : null,
        address: deliveryMethod === 'delivery' ? pcAddress : null,
        items: proCart.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
        subtotal, shipping, total,
        status: 'pending',
        created: new Date().toISOString(),
      };
      await saveProOrderRecord(order);
      try { await sendProBusinessEmail(order); } catch (err) { console.error('Pro order business email failed:', err); }
      try { await sendProClientEmail(order); }   catch (err) { console.error('Pro order client email failed:', err); }

      proCart = []; saveProCart(); renderProCart();
      checkoutModal?.classList.remove('open');
      closeProCart();
      const toast = document.getElementById('proOrderSuccess');
      if (toast) { toast.style.display = 'block'; setTimeout(() => toast.style.display = 'none', 7000); }
    } catch (err) {
      console.error('Pro order failed:', err);
      alert('Something went wrong sending your order. Please try again or contact us directly.');
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Order ✉️';
    e.target.reset();
  });

  renderProCart();
}
initProShop();

/* ── Contact Form ── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    const fd = new FormData(contactForm);
    // Honeypot — bots fill the hidden "website" field, humans leave it blank
    if (fd.get('website')) {
      const ok = document.getElementById('contactSuccess');
      if (ok) { ok.style.display = 'block'; setTimeout(() => ok.style.display = 'none', 6000); }
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message ✉️';
      return;
    }

    // Input sanitization and validation
    const cName    = (fd.get('name')    || '').trim();
    const cPhone   = (fd.get('phone')   || '').trim();
    const cEmail   = (fd.get('email')   || '').trim();
    const cMessage = (fd.get('message') || '').trim();
    if (!cName)  { submitBtn.disabled = false; submitBtn.textContent = 'Send Message ✉️'; alert('Please enter your name.'); return; }
    if (!cPhone) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message ✉️'; alert('Please enter your phone number.'); return; }
    if (!/^[0-9+\-()\s]{7,30}$/.test(cPhone)) {
      submitBtn.disabled = false; submitBtn.textContent = 'Send Message ✉️';
      alert('Please enter a valid phone number (digits, spaces, dashes, parentheses and + are allowed).');
      return;
    }
    if (cEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cEmail)) {
      submitBtn.disabled = false; submitBtn.textContent = 'Send Message ✉️';
      alert('Please enter a valid email address.');
      return;
    }

    const body =
      `Website Enquiry\n\n` +
      `Name:     ${cName}\n` +
      `Phone:    ${cPhone}\n` +
      `Email:    ${cEmail || 'Not provided'}\n` +
      `Subject:  ${fd.get('subject') || 'General'}\n\n` +
      `Message:\n${cMessage}`;
    try {
      await sendEmail(
        `Website Enquiry from ${cName}`,
        cName, cPhone, cEmail, body
      );
    } catch (err) { console.error('Contact email failed:', err); }
    // Customer confirmation
    if (cEmail) {
      try {
        await sendClientEmail(
          cName, cEmail,
          fd.get('subject') || 'General Enquiry', '',
          new Date().toLocaleDateString('en-TT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          '', false,
          "Thank you for reaching out to Luna's Esthetics! We've received your message and will get back to you within 24 hours."
        );
      } catch (err) { console.error('Contact confirmation email failed:', err); }
    }
    // If this is a course enrolment, save structured record to Firestore
    if (fd.get('subject') === 'Course Enrollment') {
      const courseName = fd.get('courseRef') || 'Unknown Course';
      const coursesList = JSON.parse(localStorage.getItem('lunas_courses') || '[]');
      const matchedCourse = coursesList.find(c => c.name === courseName);
      const amount = matchedCourse ? parseTTD(matchedCourse.price) : 0;
      const enrollment = {
        id: 'ce_' + Date.now(),
        name: cName,
        phone: cPhone,
        email: cEmail,
        course: courseName,
        amount,
        enrolledDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        notes: '',
        source: 'website',
      };
      const existing = getCourseEnrollments();
      existing.unshift(enrollment);
      saveCourseEnrollments(existing);
    }

    const ok = document.getElementById('contactSuccess');
    if (ok) { ok.style.display = 'block'; setTimeout(() => ok.style.display = 'none', 6000); }
    contactForm.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message ✉️';
  });
}

/* ── Shared auth helpers (used by login + settings) ── */
const _DEFAULT_HASH = 'afc27beb96af151ae8b94c016c882a583016eb42c116276bbbb03b7bb55e7cde';
function getAdminHash() { return localStorage.getItem('lunas_pw_hash') || _DEFAULT_HASH; }
async function hashPw(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ── Admin Dashboard ── */
function initAdmin() {
  const loginOverlay = document.getElementById('loginOverlay');
  if (!loginOverlay) return;

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS   = 15 * 60 * 1000;
  const SESSION_MS   = 4 * 60 * 60 * 1000;

  function getLockout() { return JSON.parse(sessionStorage.getItem('lunas_lockout') || 'null'); }
  function isLocked() {
    const l = getLockout();
    return l && Date.now() < l.until;
  }
  function recordFailure() {
    const l = getLockout() || { count: 0, until: 0 };
    l.count++;
    if (l.count >= MAX_ATTEMPTS) { l.until = Date.now() + LOCKOUT_MS; l.count = 0; }
    sessionStorage.setItem('lunas_lockout', JSON.stringify(l));
  }
  function clearLockout() { sessionStorage.removeItem('lunas_lockout'); }

  function doLogout() {
    sessionStorage.removeItem('lunas_admin');
    sessionStorage.removeItem('lunas_admin_ts');
    if (window._adminTimeoutId) clearTimeout(window._adminTimeoutId);
    loginOverlay.style.display = 'flex';
  }
  function startSessionTimer() {
    if (window._adminTimeoutId) clearTimeout(window._adminTimeoutId);
    window._adminTimeoutId = setTimeout(doLogout, SESSION_MS);
  }

  const authed = sessionStorage.getItem('lunas_admin') === '1';
  if (authed) {
    const ts = parseInt(sessionStorage.getItem('lunas_admin_ts') || '0', 10);
    if (Date.now() - ts > SESSION_MS) {
      doLogout();
    } else {
      loginOverlay.style.display = 'none';
      startSessionTimer();
    }
  } else {
    loginOverlay.style.display = 'flex';
  }

  document.getElementById('loginForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const errEl = document.getElementById('loginErr');
    if (isLocked()) {
      const l = getLockout();
      const mins = Math.ceil((l.until - Date.now()) / 60000);
      errEl.textContent = `Too many attempts. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`;
      errEl.style.display = 'block';
      return;
    }
    const pw = document.getElementById('adminPassword')?.value || '';
    const hash = await hashPw(pw);
    if (hash === getAdminHash()) {
      clearLockout();
      sessionStorage.setItem('lunas_admin', '1');
      sessionStorage.setItem('lunas_admin_ts', Date.now().toString());
      loginOverlay.style.display = 'none';
      errEl.style.display = 'none';
      errEl.textContent = 'Incorrect password. Please try again.';
      startSessionTimer();
      loadAdminData();
    } else {
      recordFailure();
      if (isLocked()) {
        errEl.textContent = `Too many failed attempts. Locked for 15 minutes. To reset early, close this browser tab completely and reopen it.`;
      } else {
        const l = getLockout() || { count: 0 };
        const left = MAX_ATTEMPTS - l.count;
        errEl.textContent = `Incorrect password. ${left} attempt${left !== 1 ? 's' : ''} remaining.`;
      }
      errEl.style.display = 'block';
    }
  });

  document.getElementById('logoutBtn')?.addEventListener('click', doLogout);

  // Central panel switcher — syncs sidebar, mobile bottom nav, and panel visibility
  function switchPanel(name) {
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-bottom-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));

    document.querySelectorAll(`.admin-nav-btn[data-panel="${name}"]`).forEach(b => b.classList.add('active'));
    document.querySelectorAll(`.admin-bottom-btn[data-panel="${name}"]`).forEach(b => b.classList.add('active'));
    document.getElementById('panel-' + name)?.classList.add('active');

    if (name === 'dashboard') renderDashboard();
    else if (name === 'bookings') renderBookingsTable(document.getElementById('bookingSearch')?.value.toLowerCase() || '');
    else if (name === 'clients')  renderClientsTable(document.getElementById('clientSearch')?.value.toLowerCase() || '');
    else if (name === 'inventory') renderInventoryTable(document.getElementById('inventorySearch')?.value.toLowerCase() || '');
    else if (name === 'calendar') { renderCalendar(); renderBlockedDates(); }
    else if (name === 'analytics') renderAnalytics();
    else if (name === 'specials') renderSpecials();
    else if (name === 'course-enrollments') renderCourseEnrollments(document.getElementById('ceSearch')?.value.toLowerCase() || '');
    else if (name === 'pro-orders') renderProOrders(document.getElementById('poSearch')?.value.toLowerCase() || '');

    // Scroll mobile bottom nav to keep active tab visible
    const activeTab = document.querySelector(`.admin-bottom-btn[data-panel="${name}"]`);
    activeTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // Wire sidebar nav buttons
  document.querySelectorAll('.admin-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
  });

  // Wire mobile bottom nav buttons
  document.querySelectorAll('.admin-bottom-btn').forEach(btn => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
  });

  // Sync bottom nav active state on initial load
  const initPanel = document.querySelector('.admin-nav-btn.active')?.dataset.panel || 'dashboard';
  document.querySelectorAll(`.admin-bottom-btn[data-panel="${initPanel}"]`).forEach(b => b.classList.add('active'));

  document.querySelectorAll('.an-period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.an-period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAnalytics(parseInt(btn.dataset.days));
    });
  });

  if (authed) setTimeout(loadAdminData, 0);
}

function getDB(key) { return JSON.parse(localStorage.getItem(key) || '[]'); }
function setDB(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
  const fsKey = key.replace('lunas_', '');
  if (['bookings', 'clients', 'inventory'].includes(fsKey)) _fsSet(fsKey, val);
}

function checkEmailFailBanner() {
  const fails = JSON.parse(localStorage.getItem('lunas_email_fails') || '[]');
  if (!fails.length) return;
  const topbarRight = document.querySelector('.admin-topbar-right');
  if (!topbarRight || document.getElementById('emailFailBanner')) return;
  const banner = document.createElement('div');
  banner.id = 'emailFailBanner';
  banner.style.cssText = 'background:#FEF3C7;color:#92400E;padding:0.4rem 0.8rem;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer;margin-right:0.5rem;';
  banner.title = 'Click to dismiss';
  banner.innerHTML = `⚠️ ${fails.length} booking email${fails.length > 1 ? 's' : ''} may not have been sent — <u>click to dismiss</u>`;
  banner.addEventListener('click', () => { localStorage.removeItem('lunas_email_fails'); banner.remove(); });
  topbarRight.insertBefore(banner, topbarRight.firstChild);
}

function loadAdminData() {
  checkEmailFailBanner();
  const _renderAll = () => {
    renderDashboard();
    renderBookingsTable();
    renderClientsTable();
    renderInventoryTable();
    renderCalendar();
    renderSpecials();
    renderCourseEnrollments();
  };
  _renderAll();
  initSettings();
  initBlockedDates();
  const expBtn = document.getElementById('exportCsvBtn');
  if (expBtn) expBtn.onclick = exportBookingsCSV;
  onSyncReady(_renderAll);
}

/* ── Blocked Dates Admin UI ── */
function renderBlockedDates() {
  const bd = getBlockedDates();
  const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const monthsList = document.getElementById('blockedMonthsList');
  if (monthsList) {
    if (!(bd.months || []).length) {
      monthsList.innerHTML = '<span style="color:var(--text-light);font-size:0.82rem;">No months blocked.</span>';
    } else {
      monthsList.innerHTML = bd.months.map(m => {
        const [y, mo] = m.split('-');
        const label = `${MONTHS_FULL[parseInt(mo, 10) - 1]} ${y}`;
        return `<span class="blocked-tag">${label} <button class="blocked-tag-remove" onclick="unblockMonth('${m}')">✕</button></span>`;
      }).join('');
    }
  }

  const daysList = document.getElementById('blockedDaysList');
  if (daysList) {
    if (!(bd.days || []).length) {
      daysList.innerHTML = '<span style="color:var(--text-light);font-size:0.82rem;">No individual days blocked.</span>';
    } else {
      daysList.innerHTML = bd.days.map(d => {
        const label = new Date(d + 'T00:00').toLocaleDateString('en-TT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        return `<span class="blocked-tag">${label} <button class="blocked-tag-remove" onclick="unblockDay('${d}')">✕</button></span>`;
      }).join('');
    }
  }

  const slotsList = document.getElementById('blockedSlotsList');
  if (slotsList) {
    if (!(bd.timeSlots || []).length) {
      slotsList.innerHTML = '<span style="color:var(--text-light);font-size:0.82rem;">No time slots blocked.</span>';
    } else {
      slotsList.innerHTML = bd.timeSlots.map(s => {
        const dateLabel = new Date(s.date + 'T00:00').toLocaleDateString('en-TT', { weekday: 'short', day: 'numeric', month: 'short' });
        return `<span class="blocked-tag blocked-tag-slot">${dateLabel} · ${s.slot} <button class="blocked-tag-remove" onclick="unblockTimeSlot('${s.date}','${s.slot.replace(/'/g,'')}')">✕</button></span>`;
      }).join('');
    }
  }
}

// Fetches the freshest blocked_dates from Firestore (falling back to local
// cache only if that fetch fails), applies `mutatorFn` to it, and saves.
// `mutatorFn` should mutate `bd` in place and return `false` to signal a
// no-op (nothing changed, skip the save). Guards against the admin-side
// lost-update race where a delayed background sync — or a second block
// action fired before the first one's round-trip finishes — could silently
// revert a just-applied block; all calls are serialized through a single
// queue so a fetch never overlaps with another call's in-flight save.
// Surfaces a clear error if the Firestore write itself fails instead of
// silently rendering as if it succeeded.
let _blockedDatesQueue = Promise.resolve();
function _mutateBlockedDates(mutatorFn, btn) {
  const run = async () => {
    if (btn) btn.disabled = true;
    try {
      const fresh = await _fsGet('blocked_dates');
      const bd = fresh || getBlockedDates();
      if (mutatorFn(bd) === false) return;
      const ok = await saveBlockedDates(bd);
      if (!ok) {
        alert('⚠️ Could not save to the server — check your connection and try again. This change was NOT saved.');
        return;
      }
      renderBlockedDates();
      renderCalendar();
    } finally {
      if (btn) btn.disabled = false;
    }
  };
  _blockedDatesQueue = _blockedDatesQueue.then(run, run);
  return _blockedDatesQueue;
}

window.unblockMonth = m => {
  _mutateBlockedDates(bd => { bd.months = (bd.months || []).filter(x => x !== m); });
};
window.unblockDay = d => {
  _mutateBlockedDates(bd => { bd.days = (bd.days || []).filter(x => x !== d); });
};
window.unblockTimeSlot = (date, slot) => {
  _mutateBlockedDates(bd => { bd.timeSlots = (bd.timeSlots || []).filter(s => !(s.date === date && s.slot === slot)); });
};

function initBlockedDates() {
  document.getElementById('blockMonthBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('blockMonthBtn');
    const input = document.getElementById('blockMonthInput');
    const val = input?.value;
    if (!val) { alert('Please select a month first.'); return; }
    await _mutateBlockedDates(bd => {
      if ((bd.months || []).includes(val)) return false;
      bd.months = [...(bd.months || []), val].sort();
    }, btn);
    if (input) input.value = '';
  });

  document.getElementById('blockDayBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('blockDayBtn');
    const input = document.getElementById('blockDayInput');
    const val = input?.value;
    if (!val) { alert('Please select a date first.'); return; }
    await _mutateBlockedDates(bd => {
      if ((bd.days || []).includes(val)) return false;
      bd.days = [...(bd.days || []), val].sort();
    }, btn);
    if (input) input.value = '';
  });

  document.getElementById('blockSlotBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('blockSlotBtn');
    const dateInput = document.getElementById('blockSlotDateInput');
    const timeInput = document.getElementById('blockSlotTimeInput');
    const dateVal = dateInput?.value;
    const timeVal = timeInput?.value;
    if (!dateVal) { alert('Please select a date first.'); return; }
    if (!timeVal) { alert('Please select a time first.'); return; }
    await _mutateBlockedDates(bd => {
      if ((bd.timeSlots || []).some(s => s.date === dateVal && s.slot === timeVal)) return false;
      bd.timeSlots = [...(bd.timeSlots || []), { date: dateVal, slot: timeVal }]
        .sort((a, b) => a.date.localeCompare(b.date) || a.slot.localeCompare(b.slot));
    }, btn);
    if (dateInput) dateInput.value = '';
    if (timeInput) timeInput.value = '';
  });

  renderBlockedDates();
}

/* ── Admin Calendar ── */
let _calYear = new Date().getFullYear();
let _calMonth = new Date().getMonth();

function renderCalendar() {
  const grid = document.getElementById('calGrid');
  const title = document.getElementById('calTitle');
  if (!grid || !title) return;

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  title.textContent = `${MONTHS[_calMonth]} ${_calYear}`;

  const bookings = getDB('lunas_bookings');
  const bookingMap = {};
  bookings.forEach(b => {
    if (!bookingMap[b.date]) bookingMap[b.date] = [];
    bookingMap[b.date].push(b);
  });
  const manualEventsAll = getManualEvents();
  const eventMap = {};
  manualEventsAll.forEach(e => {
    if (!eventMap[e.date]) eventMap[e.date] = [];
    eventMap[e.date].push(e);
  });

  const blockedDates = getBlockedDates();
  const monthStr = `${_calYear}-${String(_calMonth + 1).padStart(2, '0')}`;
  const isMonthBlocked = (blockedDates.months || []).includes(monthStr);

  if (isMonthBlocked) {
    title.innerHTML = `${MONTHS[_calMonth]} ${_calYear} <span style="font-size:0.65rem;background:#FEE2E2;color:#DC2626;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:8px;vertical-align:middle;">BLOCKED</span>`;
  } else {
    title.textContent = `${MONTHS[_calMonth]} ${_calYear}`;
  }

  const firstDay = new Date(_calYear, _calMonth, 1).getDay();
  const daysInMonth = new Date(_calYear, _calMonth + 1, 0).getDate();
  const today = new Date();

  let html = '';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
    html += `<div class="cal-day-header">${d}</div>`;
  });
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-cell cal-empty"></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${_calYear}-${String(_calMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayB = bookingMap[ds] || [];
    const dayE = eventMap[ds] || [];
    const isToday = d === today.getDate() && _calMonth === today.getMonth() && _calYear === today.getFullYear();
    const isBlocked = isMonthBlocked || (blockedDates.days || []).includes(ds);
    const hasActivity = dayB.length > 0 || dayE.length > 0;
    const visibleE = dayE.slice(0, 2);
    const visibleB = dayB.slice(0, Math.max(0, 3 - visibleE.length));
    const moreCount = (dayB.length + dayE.length) - visibleE.length - visibleB.length;
    html += `<div class="cal-cell${isToday ? ' cal-today' : ''}${isBlocked ? ' cal-blocked' : ''}${hasActivity ? ' cal-has-bookings' : ''}" onclick="selectCalDay('${ds}')">
      <div class="cal-day-num">${d}${isBlocked ? '<span class="cal-blocked-tag">Blocked</span>' : ''}</div>
      ${visibleE.map(e => `<div class="cal-booking-chip cal-chip-manual">${e.startTime} ${e.title.split(' ')[0]}</div>`).join('')}
      ${visibleB.map(b => `<div class="cal-booking-chip cal-chip-${b.status}">${b.time} ${b.name.split(' ')[0]}</div>`).join('')}
      ${moreCount > 0 ? `<div class="cal-more">+${moreCount} more</div>` : ''}
    </div>`;
  }
  grid.innerHTML = html;
}

window.selectCalDay = dateStr => {
  const bookings = getDB('lunas_bookings').filter(b => b.date === dateStr);
  const manualEntries = getManualEvents().filter(e => e.date === dateStr);
  const detail = document.getElementById('calDetail');
  if (!detail) return;
  const formatted = new Date(dateStr + 'T00:00').toLocaleDateString('en-TT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const addEntryBtn = `<button class="btn-admin btn-admin-sm" style="white-space:nowrap;" onclick="showAddEntryForm('${dateStr}')">+ Add Entry</button>`;
  let html = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
    <h4 style="color:var(--pink-dark);margin:0;">${formatted}</h4>
    ${addEntryBtn}
  </div>
  <div id="addEntryFormWrap-${dateStr}"></div>`;

  const allItems = [
    ...bookings.map(b => ({ ...b, _type: 'booking', _sortTime: b.time })),
    ...manualEntries.map(e => ({ ...e, _type: 'manual', _sortTime: e.startTime }))
  ].sort((a, b) => a._sortTime.localeCompare(b._sortTime));

  if (!allItems.length) {
    html += `<p style="color:var(--text-light);font-size:0.88rem;">No bookings or entries for this day.</p>`;
  } else {
    const bCount = bookings.length;
    const eCount = manualEntries.length;
    html += `<div style="font-size:0.8rem;color:var(--text-light);margin-bottom:0.75rem;">${bCount} booking${bCount !== 1 ? 's' : ''}${eCount ? ` · ${eCount} manual entr${eCount !== 1 ? 'ies' : 'y'}` : ''}</div>`;
    html += allItems.map(item => {
      if (item._type === 'booking') {
        return `<div class="cal-booking-detail">
          <div class="cal-detail-time">${item.time}</div>
          <div class="cal-detail-info">
            <strong>${item.name}</strong>
            <div>${item.service} — ${item.price}</div>
            <div class="cal-sub">${item.phone}${item.email ? ' · ' + item.email : ''}${item.notes ? ' · ' + item.notes : ''}</div>
          </div>
          <span class="badge badge-${item.status}">${item.status}</span>
        </div>`;
      } else {
        return `<div class="cal-booking-detail cal-manual-entry" id="manual-entry-${item.id}">
          <div class="cal-detail-time">${item.startTime}<br><span style="font-size:0.7rem;color:var(--text-light);">→ ${item.endTime}</span></div>
          <div class="cal-detail-info">
            <strong>${safe(item.title)}</strong>
            <div style="font-size:0.78rem;color:#7C3AED;font-weight:600;">Manual Entry</div>
          </div>
          <div style="display:flex;gap:0.4rem;">
            <button class="btn-admin" style="font-size:0.72rem;padding:4px 10px;background:#EDE9FE;color:#6D28D9;border:1px solid #C4B5FD;" onclick="editManualEvent('${item.id}','${dateStr}')">Edit</button>
            <button class="btn-admin" style="font-size:0.72rem;padding:4px 10px;background:#FEE2E2;color:#991B1B;border:1px solid #FCA5A5;" onclick="deleteManualEvent('${item.id}','${dateStr}')">Remove</button>
          </div>
        </div>`;
      }
    }).join('');
  }
  detail.innerHTML = html;
};

window.showAddEntryForm = dateStr => {
  const wrap = document.getElementById(`addEntryFormWrap-${dateStr}`);
  if (!wrap) return;
  wrap.innerHTML = `<div style="background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:1rem;margin-bottom:1rem;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
      <div style="grid-column:1/-1;">
        <label style="font-size:0.8rem;font-weight:600;color:var(--text);display:block;margin-bottom:0.3rem;">Client Name / Title</label>
        <input id="addEntryTitle" type="text" placeholder="e.g. Walk-in — Sarah" style="width:100%;padding:0.55rem 0.75rem;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:0.88rem;box-sizing:border-box;font-family:var(--font-body);"/>
      </div>
      <div>
        <label style="font-size:0.8rem;font-weight:600;color:var(--text);display:block;margin-bottom:0.3rem;">Start Time</label>
        <input id="addEntryStart" type="time" style="width:100%;padding:0.55rem 0.75rem;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:0.88rem;box-sizing:border-box;font-family:var(--font-body);"/>
      </div>
      <div>
        <label style="font-size:0.8rem;font-weight:600;color:var(--text);display:block;margin-bottom:0.3rem;">End Time</label>
        <input id="addEntryEnd" type="time" style="width:100%;padding:0.55rem 0.75rem;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:0.88rem;box-sizing:border-box;font-family:var(--font-body);"/>
      </div>
    </div>
    <div style="display:flex;gap:0.5rem;">
      <button class="btn-admin btn-admin-pink" onclick="saveManualEntry('${dateStr}')">Save Entry</button>
      <button class="btn-admin" onclick="document.getElementById('addEntryFormWrap-${dateStr}').innerHTML=''">Cancel</button>
    </div>
  </div>`;
  document.getElementById('addEntryTitle')?.focus();
};

window.saveManualEntry = dateStr => {
  const title = document.getElementById('addEntryTitle')?.value.trim();
  const startTime = document.getElementById('addEntryStart')?.value;
  const endTime = document.getElementById('addEntryEnd')?.value;
  if (!title) { alert('Please enter a client name or title.'); return; }
  if (!startTime) { alert('Please enter a start time.'); return; }
  if (!endTime) { alert('Please enter an end time.'); return; }
  const events = getManualEvents();
  events.push({ id: Date.now().toString(), date: dateStr, title, startTime, endTime });
  saveManualEvents(events);
  renderCalendar();
  selectCalDay(dateStr);
};

window.deleteManualEvent = (id, dateStr) => {
  if (!confirm('Remove this entry?')) return;
  saveManualEvents(getManualEvents().filter(e => e.id !== id));
  renderCalendar();
  selectCalDay(dateStr);
};

window.editManualEvent = (id, dateStr) => {
  const entry = getManualEvents().find(e => e.id === id);
  if (!entry) return;
  const wrap = document.getElementById(`manual-entry-${id}`);
  if (!wrap) return;
  const inputStyle = 'width:100%;padding:0.5rem 0.7rem;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:0.85rem;box-sizing:border-box;font-family:var(--font-body);';
  wrap.innerHTML = `
    <div style="width:100%;display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;padding:0.75rem;background:#FAF5FF;border-radius:var(--radius-sm);">
      <div style="grid-column:1/-1;">
        <label style="font-size:0.78rem;font-weight:600;color:var(--text);display:block;margin-bottom:0.25rem;">Client Name / Title</label>
        <input id="editEntryTitle-${id}" type="text" value="${safe(entry.title)}" style="${inputStyle}"/>
      </div>
      <div>
        <label style="font-size:0.78rem;font-weight:600;color:var(--text);display:block;margin-bottom:0.25rem;">Start Time</label>
        <input id="editEntryStart-${id}" type="time" value="${entry.startTime}" style="${inputStyle}"/>
      </div>
      <div>
        <label style="font-size:0.78rem;font-weight:600;color:var(--text);display:block;margin-bottom:0.25rem;">End Time</label>
        <input id="editEntryEnd-${id}" type="time" value="${entry.endTime}" style="${inputStyle}"/>
      </div>
      <div style="grid-column:1/-1;display:flex;gap:0.5rem;margin-top:0.25rem;">
        <button class="btn-admin btn-admin-pink" style="font-size:0.8rem;" onclick="saveEditManualEvent('${id}','${dateStr}')">Save Changes</button>
        <button class="btn-admin btn-admin-ghost" style="font-size:0.8rem;" onclick="selectCalDay('${dateStr}')">Cancel</button>
      </div>
    </div>`;
  document.getElementById(`editEntryTitle-${id}`)?.focus();
};

window.saveEditManualEvent = (id, dateStr) => {
  const title = document.getElementById(`editEntryTitle-${id}`)?.value.trim();
  const startTime = document.getElementById(`editEntryStart-${id}`)?.value;
  const endTime = document.getElementById(`editEntryEnd-${id}`)?.value;
  if (!title) { alert('Please enter a client name or title.'); return; }
  if (!startTime) { alert('Please enter a start time.'); return; }
  if (!endTime) { alert('Please enter an end time.'); return; }
  const events = getManualEvents();
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return;
  events[idx] = { ...events[idx], title, startTime, endTime };
  saveManualEvents(events);
  renderCalendar();
  selectCalDay(dateStr);
};

document.getElementById('calPrev')?.addEventListener('click', () => {
  _calMonth--; if (_calMonth < 0) { _calMonth = 11; _calYear--; } renderCalendar();
});
document.getElementById('calNext')?.addEventListener('click', () => {
  _calMonth++; if (_calMonth > 11) { _calMonth = 0; _calYear++; } renderCalendar();
});

function safe(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function parseTTD(str) {
  return parseFloat(String(str || '0').replace(/[^0-9.]/g, '')) || 0;
}

/* ── Course Enrollments Panel ── */
const _ceStatusColor = { pending: '#F59E0B', confirmed: '#10B981', completed: '#6366F1', cancelled: '#EF4444' };

function renderCourseEnrollments(search = '') {
  const tbody = document.getElementById('ceBody');
  if (!tbody) return;
  const countEl = document.getElementById('ceCount');
  const all = getCourseEnrollments();
  const q = search.toLowerCase();
  const filtered = q ? all.filter(e =>
    (e.name || '').toLowerCase().includes(q) ||
    (e.course || '').toLowerCase().includes(q) ||
    (e.phone || '').toLowerCase().includes(q) ||
    (e.email || '').toLowerCase().includes(q)
  ) : all;

  const revenue = all
    .filter(e => e.status === 'confirmed' || e.status === 'completed')
    .reduce((sum, e) => sum + (parseTTD(e.amount) || 0), 0);

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('ceTotal', all.length);
  setEl('cePending', all.filter(e => e.status === 'pending').length);
  setEl('ceConfirmed', all.filter(e => e.status === 'confirmed').length);
  setEl('ceCompleted', all.filter(e => e.status === 'completed').length);
  setEl('ceRevenue', `TTD ${revenue.toLocaleString('en-TT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`);
  if (countEl) countEl.textContent = `${filtered.length} enrolment${filtered.length !== 1 ? 's' : ''}`;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;color:#9CA3AF;">${q ? 'No results found.' : 'No course enrolments yet. They will appear here when students enrol via the website or are added manually.'}</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(e => {
    const date = e.enrolledDate ? new Date(e.enrolledDate + 'T00:00').toLocaleDateString('en-TT', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
    const srcBadge = e.source === 'manual'
      ? '<span style="font-size:0.7rem;background:#EDE9FE;color:#7C3AED;padding:2px 6px;border-radius:4px;font-weight:600;">Manual</span>'
      : '<span style="font-size:0.7rem;background:#E0F2FE;color:#0369A1;padding:2px 6px;border-radius:4px;font-weight:600;">Website</span>';
    const amtNum = parseTTD(e.amount);
    const amtDisplay = amtNum > 0 ? `<span style="font-weight:700;color:#065F46;">TTD ${amtNum.toLocaleString('en-TT')}</span>` : '<span style="color:#9CA3AF;">—</span>';
    return `<tr>
      <td><strong>${safe(e.name)}</strong><br>${srcBadge}</td>
      <td>${safe(e.phone)}</td>
      <td style="font-size:0.83rem;">${safe(e.email || '—')}</td>
      <td style="font-size:0.83rem;font-weight:600;color:var(--pink-dark);">${safe(e.course)}</td>
      <td style="font-size:0.84rem;">${amtDisplay}</td>
      <td style="font-size:0.82rem;color:var(--text-light);">${date}</td>
      <td>
        <select class="ce-status-sel" data-id="${e.id}" style="font-size:0.8rem;padding:4px 8px;border:1px solid var(--border);border-radius:6px;color:${_ceStatusColor[e.status]||'#374151'};font-weight:600;background:#fff;">
          <option value="pending" ${e.status==='pending'?'selected':''}>Pending</option>
          <option value="confirmed" ${e.status==='confirmed'?'selected':''}>Confirmed</option>
          <option value="completed" ${e.status==='completed'?'selected':''}>Completed</option>
          <option value="cancelled" ${e.status==='cancelled'?'selected':''}>Cancelled</option>
        </select>
      </td>
      <td style="font-size:0.8rem;max-width:140px;color:var(--text-light);">${safe(e.notes || '—')}</td>
      <td><button class="btn-admin" style="font-size:0.72rem;padding:4px 10px;background:#FEE2E2;color:#991B1B;border:1px solid #FCA5A5;" onclick="deleteCourseEnrolment('${e.id}')">Remove</button></td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.ce-status-sel').forEach(sel => {
    sel.addEventListener('change', () => {
      const list = getCourseEnrollments();
      const idx = list.findIndex(e => e.id === sel.dataset.id);
      if (idx === -1) return;
      list[idx].status = sel.value;
      saveCourseEnrollments(list);
      renderCourseEnrollments(document.getElementById('ceSearch')?.value.toLowerCase() || '');
    });
  });
}

window.deleteCourseEnrolment = id => {
  if (!confirm('Remove this enrolment record?')) return;
  saveCourseEnrollments(getCourseEnrollments().filter(e => e.id !== id));
  renderCourseEnrollments(document.getElementById('ceSearch')?.value.toLowerCase() || '');
};

(function initCourseEnrolments() {
  const searchEl = document.getElementById('ceSearch');
  if (!searchEl) return;

  searchEl.addEventListener('input', () => renderCourseEnrollments(searchEl.value.toLowerCase()));

  document.getElementById('exportCeBtn')?.addEventListener('click', () => {
    const all = getCourseEnrollments();
    if (!all.length) { alert('No enrolments to export.'); return; }
    const headers = ['Name', 'Phone', 'Email', 'Course', 'Date Enrolled', 'Status', 'Notes', 'Source'];
    const rows = all.map(e => [e.name, e.phone, e.email, e.course, e.enrolledDate, e.status, e.notes, e.source].map(v => `"${String(v||'').replace(/"/g,'""')}"`));
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `lunas-course-enrolments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  });

  document.getElementById('addEnrolmentBtn')?.addEventListener('click', () => {
    const courses = JSON.parse(localStorage.getItem('lunas_courses') || '[]');
    const courseNames = courses.map(c => c.name).filter(Boolean);
    const modal = document.getElementById('enrolmentModal');
    const list = document.getElementById('ceCourseSuggestions');
    if (list) list.innerHTML = courseNames.map(n => `<option value="${safe(n)}"/>`).join('');
    modal?.classList.add('open');
    document.getElementById('enrolmentForm')?.reset();
  });

  document.getElementById('enrolmentModalClose')?.addEventListener('click', () => {
    document.getElementById('enrolmentModal')?.classList.remove('open');
  });

  document.getElementById('enrolmentForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const enrollment = {
      id: 'ce_' + Date.now(),
      name: fd.get('ceName') || '',
      phone: fd.get('cePhone') || '',
      email: fd.get('ceEmail') || '',
      course: fd.get('ceCourse') || '',
      amount: parseTTD(fd.get('ceAmount')),
      enrolledDate: fd.get('ceDate') || new Date().toISOString().split('T')[0],
      status: fd.get('ceStatus') || 'pending',
      notes: fd.get('ceNotes') || '',
      source: 'manual',
    };
    const list = getCourseEnrollments();
    list.unshift(enrollment);
    saveCourseEnrollments(list);
    document.getElementById('enrolmentModal')?.classList.remove('open');
    renderCourseEnrollments(document.getElementById('ceSearch')?.value.toLowerCase() || '');
  });
})();
function fmtDate(ds) {
  if (!ds) return '—';
  return new Date(ds + 'T00:00').toLocaleDateString('en-TT', { day:'numeric', month:'short', year:'numeric' });
}

/* ── Professional Orders (admin) ── */
const _poStatusColor = { pending: '#F59E0B', confirmed: '#10B981', fulfilled: '#6366F1', cancelled: '#EF4444' };

function renderProOrders(search = '') {
  const tbody = document.getElementById('poBody');
  if (!tbody) return;
  const countEl = document.getElementById('poCount');
  const all = getProOrders().slice().sort((a, b) => new Date(b.created) - new Date(a.created));
  const q = search.toLowerCase();
  const filtered = q ? all.filter(o =>
    (o.name || '').toLowerCase().includes(q) ||
    (o.email || '').toLowerCase().includes(q) ||
    (o.phone || '').toLowerCase().includes(q) ||
    (o.invoiceId || '').toLowerCase().includes(q)
  ) : all;

  const revenue = all
    .filter(o => o.status === 'confirmed' || o.status === 'fulfilled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('poTotal', all.length);
  setEl('poPending', all.filter(o => o.status === 'pending').length);
  setEl('poConfirmed', all.filter(o => o.status === 'confirmed').length);
  setEl('poFulfilled', all.filter(o => o.status === 'fulfilled').length);
  setEl('poRevenue', `TTD ${revenue.toLocaleString('en-TT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`);
  if (countEl) countEl.textContent = `${filtered.length} order${filtered.length !== 1 ? 's' : ''}`;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:#9CA3AF;">${q ? 'No results found.' : 'No professional orders yet. They will appear here when a Professionals Only order is placed.'}</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(o => {
    const date = o.created ? new Date(o.created).toLocaleDateString('en-TT', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
    const itemsSummary = (o.items || []).map(i => `${i.name} ×${i.qty}`).join(', ');
    const deliveryLabel = o.deliveryMethod === 'delivery'
      ? `Delivery — ${o.island === 'tobago' ? 'Tobago' : 'Trinidad'}`
      : 'Pickup at salon';
    return `<tr>
      <td style="font-size:0.82rem;font-weight:700;color:var(--pink-dark);">${safe(o.invoiceId)}</td>
      <td><strong>${safe(o.name)}</strong><br><span style="font-size:0.78rem;color:#9CA3AF;">${safe(o.phone)} · ${safe(o.email || '—')}</span></td>
      <td style="font-size:0.8rem;max-width:220px;color:var(--text-light);">${safe(itemsSummary)}</td>
      <td style="font-size:0.84rem;font-weight:700;color:#065F46;">TTD ${(o.total || 0).toLocaleString('en-TT', { minimumFractionDigits: 2 })}</td>
      <td style="font-size:0.8rem;color:var(--text-light);">${safe(deliveryLabel)}${o.address ? `<br><span style="font-size:0.75rem;">${safe(o.address)}</span>` : ''}</td>
      <td style="font-size:0.82rem;color:var(--text-light);">${date}</td>
      <td>
        <select class="po-status-sel" data-id="${o.id}" style="font-size:0.8rem;padding:4px 8px;border:1px solid var(--border);border-radius:6px;color:${_poStatusColor[o.status]||'#374151'};font-weight:600;background:#fff;">
          <option value="pending" ${o.status==='pending'?'selected':''}>Pending</option>
          <option value="confirmed" ${o.status==='confirmed'?'selected':''}>Confirmed</option>
          <option value="fulfilled" ${o.status==='fulfilled'?'selected':''}>Fulfilled</option>
          <option value="cancelled" ${o.status==='cancelled'?'selected':''}>Cancelled</option>
        </select>
      </td>
      <td><button class="btn-admin" style="font-size:0.72rem;padding:4px 10px;background:#FEE2E2;color:#991B1B;border:1px solid #FCA5A5;" onclick="deleteProOrder(${o.id})">Remove</button></td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.po-status-sel').forEach(sel => {
    sel.addEventListener('change', () => {
      const list = getProOrders();
      const idx = list.findIndex(o => o.id == sel.dataset.id);
      if (idx === -1) return;
      list[idx].status = sel.value;
      saveProOrders(list);
      renderProOrders(document.getElementById('poSearch')?.value.toLowerCase() || '');
    });
  });
}

window.deleteProOrder = id => {
  if (!confirm('Remove this order record?')) return;
  saveProOrders(getProOrders().filter(o => o.id != id));
  renderProOrders(document.getElementById('poSearch')?.value.toLowerCase() || '');
};

(function initProOrdersMgr() {
  const searchEl = document.getElementById('poSearch');
  if (!searchEl) return;

  searchEl.addEventListener('input', () => renderProOrders(searchEl.value.toLowerCase()));

  document.getElementById('exportPoBtn')?.addEventListener('click', () => {
    const all = getProOrders();
    if (!all.length) { alert('No orders to export.'); return; }
    const headers = ['Invoice ID', 'Name', 'Phone', 'Email', 'Items', 'Subtotal', 'Shipping', 'Total', 'Delivery Method', 'Island', 'Address', 'Status', 'Date'];
    const rows = all.map(o => [
      o.invoiceId, o.name, o.phone, o.email,
      (o.items || []).map(i => `${i.name} x${i.qty}`).join('; '),
      o.subtotal, o.shipping, o.total,
      o.deliveryMethod, o.island || '', o.address || '',
      o.status, o.created,
    ].map(v => `"${String(v || '').replace(/"/g, '""')}"`));
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `lunas-professional-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  });
})();

function renderDashboard() {
  const bookings = getDB('lunas_bookings');
  const clients = getDB('lunas_clients');
  const inventory = getDB('lunas_inventory');
  const lowStock = inventory.filter(i => i.qty <= i.minQty).length;

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const monthBookings = bookings.filter(b => b.date && b.date.startsWith(monthPrefix) && b.status !== 'cancelled');
  const monthBookRev = monthBookings.reduce((sum, b) => sum + _parsePrice(b.discountedPrice || b.price), 0);

  // Include confirmed/completed course enrollment revenue in monthly total
  const monthEnrolRev = getCourseEnrollments()
    .filter(e => e.enrolledDate && e.enrolledDate.startsWith(monthPrefix) && (e.status === 'confirmed' || e.status === 'completed'))
    .reduce((sum, e) => sum + parseTTD(e.amount), 0);

  const monthRevenue = monthBookRev + monthEnrolRev;

  const revEl = document.getElementById('statMonthRevenue');
  const revLabel = document.getElementById('statMonthRevenueLabel');
  const mbEl = document.getElementById('statMonthBookings');
  const mbLabel = document.getElementById('statMonthBookingsLabel');
  if (revEl) revEl.textContent = `TTD ${monthRevenue.toLocaleString('en-TT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  if (revLabel) revLabel.textContent = `${monthNames[now.getMonth()]} Revenue`;
  if (mbEl) mbEl.textContent = monthBookings.length;
  if (mbLabel) mbLabel.textContent = `${monthNames[now.getMonth()]} Bookings`;

  document.getElementById('statBookings').textContent = bookings.length;
  document.getElementById('statClients').textContent = clients.length;
  document.getElementById('statProducts').textContent = inventory.length;
  document.getElementById('statLowStock').textContent = lowStock;

  const tbody = document.getElementById('recentBookings');
  if (!tbody) return;
  const recent = [...bookings].reverse().slice(0, 5);
  tbody.innerHTML = recent.length ? recent.map(b => `
    <tr>
      <td>${safe(b.name)}</td>
      <td>${safe(b.service)}</td>
      <td>${fmtDate(b.date)}</td>
      <td>${safe(b.time)}</td>
      <td><span class="badge badge-${safe(b.status)}">${safe(b.status)}</span></td>
    </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;color:#9CA3AF;padding:2rem">No bookings yet</td></tr>';
}

/* ── Bookings ── */
function renderBookingsTable(query = '') {
  const bookings = getDB('lunas_bookings').filter(b =>
    !query || b.name?.toLowerCase().includes(query) || b.service?.toLowerCase().includes(query));
  const tbody = document.getElementById('bookingsBody');
  if (!tbody) return;
  tbody.innerHTML = bookings.length ? [...bookings].reverse().map(b => `
    <tr>
      <td>${safe(b.name)}</td>
      <td>${safe(b.phone)}</td>
      <td>${safe(b.service)}</td>
      <td>${safe(b.price)}</td>
      <td>${fmtDate(b.date)}</td>
      <td>${safe(b.time)}</td>
      <td>${b.esthetician === 'timothy' ? 'Timothy' : 'Chel-C'}</td>
      <td>
        <select class="tbl-btn tbl-edit" data-prev="${safe(b.status)}" onchange="updateBookingStatus(${b.id},this.value,this)" style="padding:4px 8px;border:1px solid #E5E7EB;border-radius:6px;font-size:0.78rem;cursor:pointer;">
          ${['pending','confirmed','completed','cancelled'].map(s => `<option value="${s}" ${b.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
        </select>
      </td>
      <td style="font-size:0.78rem;color:#6B7280;max-width:160px;">${b.cancelReason ? `<span title="${safe(b.cancelReason)}" style="color:#DC2626;">⚠ ${safe(b.cancelReason.length>40?b.cancelReason.slice(0,40)+'…':b.cancelReason)}</span>` : '—'}</td>
      <td style="white-space:nowrap;">
        <button class="tbl-btn tbl-edit-btn" onclick="editBooking(${b.id})" style="margin-right:4px;">Edit</button>
        <button class="tbl-btn tbl-delete" onclick="deleteBooking(${b.id})">Delete</button>
      </td>
    </tr>`).join('') : '<tr><td colspan="10" style="text-align:center;color:#9CA3AF;padding:2rem">No bookings found</td></tr>';
}

window.updateBookingStatus = (id, status, selectEl) => {
  if (status === 'cancelled') {
    const modal = document.getElementById('cancelReasonModal');
    modal.classList.add('open');
    modal.dataset.bookingId = id;
    modal.dataset.prevStatus = selectEl ? (selectEl.dataset.prev || 'confirmed') : 'confirmed';
    document.getElementById('cancelReasonInput').value = '';
    document.getElementById('cancelReasonInput').focus();
    // stash selectEl reference so we can revert if user cancels
    modal._selectEl = selectEl;
    return;
  }
  const bookings = getDB('lunas_bookings');
  const b = bookings.find(x => x.id === id);
  if (b) {
    b.status = status;
    if (status !== 'cancelled') delete b.cancelReason;
    b.modified = new Date().toISOString();
    b.modifiedBy = 'admin';
    setDB('lunas_bookings', bookings);
    renderBookingsTable();
    renderDashboard();
    renderCalendar();
    if (selectEl) selectEl.dataset.prev = status;
  }
};
window.deleteBooking = id => {
  if (!confirm('Delete this booking?')) return;
  setDB('lunas_bookings', getDB('lunas_bookings').filter(b => b.id !== id));
  renderBookingsTable(); renderDashboard(); renderCalendar();
};

window.editBooking = id => {
  const b = getDB('lunas_bookings').find(x => x.id === id);
  if (!b) return;
  document.getElementById('editBookingTitle').textContent = 'Edit Booking';
  document.getElementById('ebId').value           = id;
  document.getElementById('ebName').value         = b.name || '';
  document.getElementById('ebPhone').value        = b.phone || '';
  document.getElementById('ebEmail').value        = b.email || '';
  document.getElementById('ebService').value      = b.service || '';
  document.getElementById('ebPrice').value        = b.price || '';
  document.getElementById('ebEsthetician').value  = b.esthetician || 'chel-c';
  document.getElementById('ebDate').value         = b.date || '';
  document.getElementById('ebTime').value         = b.time ? _to24hr(b.time) : '';
  document.getElementById('ebNotes').value        = b.notes || '';
  document.getElementById('editBookingModal').classList.add('open');
};

window.openAddBooking = () => {
  document.getElementById('editBookingTitle').textContent = 'Add Booking';
  document.getElementById('ebId').value           = Date.now();
  document.getElementById('ebName').value         = '';
  document.getElementById('ebPhone').value        = '';
  document.getElementById('ebEmail').value        = '';
  document.getElementById('ebService').value      = '';
  document.getElementById('ebPrice').value        = '';
  document.getElementById('ebEsthetician').value  = 'chel-c';
  document.getElementById('ebDate').value         = new Date().toISOString().split('T')[0];
  document.getElementById('ebTime').value         = '';
  document.getElementById('ebNotes').value        = '';
  document.getElementById('editBookingModal').classList.add('open');
};
document.getElementById('addBookingBtn')?.addEventListener('click', () => window.openAddBooking());

document.getElementById('editBookingForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const id = Number(document.getElementById('ebId').value);
  const bookings = getDB('lunas_bookings');
  let b = bookings.find(x => x.id === id);
  const isNew = !b;

  const name        = document.getElementById('ebName').value.trim();
  const phone       = document.getElementById('ebPhone').value.trim();
  const date        = document.getElementById('ebDate').value;
  const timeRaw     = document.getElementById('ebTime').value;
  const time        = timeRaw ? _to12hr(timeRaw) : '';
  const esthetician = document.getElementById('ebEsthetician').value;

  if (isNew) {
    if (!name)  { alert('Please enter a client name.'); return; }
    if (!phone) { alert('Please enter a phone number.'); return; }
    if (!date)  { alert('Please choose a date.'); return; }
    if (!time)  { alert('Please choose a time.'); return; }
    const { chelcBooked, timothyBooked } = await getBookedSlots(date);
    const esthBooked = esthetician === 'timothy' ? timothyBooked : chelcBooked;
    if (esthBooked.includes(time) && !confirm('This time overlaps an existing booking for this esthetician — add anyway?')) {
      return;
    }
    b = { id, created: new Date().toISOString(), services: [], discountedPrice: null, promoApplied: null, status: 'confirmed' };
    bookings.push(b);
  }

  b.name        = name;
  b.phone       = phone;
  b.email       = document.getElementById('ebEmail').value.trim();
  b.service     = document.getElementById('ebService').value.trim();
  b.price       = document.getElementById('ebPrice').value.trim();
  b.esthetician = esthetician;
  b.date        = date;
  b.time        = time;
  b.notes       = document.getElementById('ebNotes').value.trim();
  if (!isNew) { b.modified = new Date().toISOString(); b.modifiedBy = 'admin'; }
  setDB('lunas_bookings', bookings);
  document.getElementById('editBookingModal').classList.remove('open');
  renderBookingsTable(); renderDashboard(); renderCalendar();
});

['editBookingClose','editBookingCancel'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', () =>
    document.getElementById('editBookingModal').classList.remove('open'));
});

/* Cancel-reason modal handlers */
document.getElementById('cancelReasonForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const modal = document.getElementById('cancelReasonModal');
  const reason = document.getElementById('cancelReasonInput').value.trim();
  if (!reason) { document.getElementById('cancelReasonInput').focus(); return; }
  const id = Number(modal.dataset.bookingId);
  const bookings = getDB('lunas_bookings');
  const b = bookings.find(x => x.id === id);
  if (b) { b.status = 'cancelled'; b.cancelReason = reason; b.modified = new Date().toISOString(); b.modifiedBy = 'admin'; setDB('lunas_bookings', bookings); }
  modal.classList.remove('open');
  renderBookingsTable();
  renderDashboard();
  renderCalendar();
});
function dismissCancelModal() {
  const modal = document.getElementById('cancelReasonModal');
  if (modal._selectEl) modal._selectEl.value = modal.dataset.prevStatus || 'confirmed';
  modal.classList.remove('open');
}
document.getElementById('cancelReasonDismiss')?.addEventListener('click', dismissCancelModal);
document.getElementById('cancelReasonDismiss2')?.addEventListener('click', dismissCancelModal);

document.getElementById('bookingSearch')?.addEventListener('input', e => renderBookingsTable(e.target.value.toLowerCase()));

/* ── Clients ── */
function renderClientsTable(query = '') {
  const clients = getDB('lunas_clients').filter(c =>
    !query || c.name?.toLowerCase().includes(query) || c.phone?.toLowerCase().includes(query));
  const tbody = document.getElementById('clientsBody');
  if (!tbody) return;
  tbody.innerHTML = clients.length ? clients.map(c => `
    <tr class="${c.blocked ? 'client-blocked' : ''}">
      <td>${safe(c.name)}</td>
      <td>${safe(c.phone)}</td>
      <td>${safe(c.email) || '—'}</td>
      <td>${fmtDate(c.dob)}</td>
      <td>${fmtDate(c.lastVisit)}</td>
      <td>${c.totalVisits || 0}</td>
      <td><span class="badge-${c.blocked ? 'blocked' : 'active'}">${c.blocked ? 'Blocked' : 'Active'}</span></td>
      <td style="max-width:200px;">${safe(c.notes) || '—'}</td>
      <td>
        <div class="tbl-actions">
          <button class="tbl-btn tbl-edit" onclick="editClient(${c.id})">Edit</button>
          <button class="tbl-btn ${c.blocked ? 'tbl-unblock' : 'tbl-block'}" onclick="toggleBlockClient(${c.id})">${c.blocked ? 'Unblock' : 'Block'}</button>
          <button class="tbl-btn tbl-delete" onclick="deleteClient(${c.id})">Delete</button>
        </div>
      </td>
    </tr>`).join('') : '<tr><td colspan="9" style="text-align:center;color:#9CA3AF;padding:2rem">No clients found</td></tr>';
}

document.getElementById('clientSearch')?.addEventListener('input', e => renderClientsTable(e.target.value.toLowerCase()));

document.getElementById('addClientBtn')?.addEventListener('click', () => openClientModal());
document.getElementById('clientModalClose')?.addEventListener('click', () => closeModal('clientModal'));

function openClientModal(client = null) {
  const modal = document.getElementById('clientModal');
  const form = document.getElementById('clientForm');
  document.getElementById('clientModalTitle').textContent = client ? 'Edit Client' : 'Add Client';
  form.reset();
  if (client) {
    form.querySelector('[name="clientId"]').value = client.id;
    form.querySelector('[name="cName"]').value = client.name;
    form.querySelector('[name="cPhone"]').value = client.phone;
    form.querySelector('[name="cEmail"]').value = client.email || '';
    form.querySelector('[name="cDob"]').value = client.dob || '';
    form.querySelector('[name="cNotes"]').value = client.notes || '';
  } else {
    form.querySelector('[name="clientId"]').value = '';
  }
  openModal('clientModal');
}

window.editClient = id => { const c = getDB('lunas_clients').find(x => x.id === id); if (c) openClientModal(c); };
window.deleteClient = id => {
  const clients = getDB('lunas_clients');
  const clientToDelete = clients.find(c => c.id === id);
  if (!clientToDelete) return;
  if (!confirm(`Delete ${clientToDelete.name}?\n\nTheir personal details (name, phone, email) will be anonymised in all existing bookings. Booking history and dates are kept for reporting purposes.`)) return;
  const bookings = getDB('lunas_bookings');
  let bookingsChanged = false;
  bookings.forEach(b => {
    if (b.phone === clientToDelete.phone || (clientToDelete.email && b.email === clientToDelete.email)) {
      b.name = 'Deleted Client'; b.phone = ''; b.email = '';
      bookingsChanged = true;
    }
  });
  if (bookingsChanged) setDB('lunas_bookings', bookings);
  setDB('lunas_clients', clients.filter(c => c.id !== id));
  renderClientsTable(); renderDashboard();
};

window.toggleBlockClient = id => {
  const clients = getDB('lunas_clients');
  const c = clients.find(x => x.id === id);
  if (!c) return;
  const action = c.blocked ? 'unblock' : 'block';
  if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${c.name}? ${c.blocked ? 'They will be able to book again.' : 'They will not be able to complete bookings.'}`)) return;
  c.blocked = !c.blocked;
  setDB('lunas_clients', clients);
  renderClientsTable(); renderDashboard();
};

document.getElementById('clientForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const id = fd.get('clientId') ? parseInt(fd.get('clientId')) : Date.now();
  const clients = getDB('lunas_clients');
  const existing = clients.findIndex(c => c.id === id);
  const prev = existing >= 0 ? clients[existing] : null;
  const client = { id, name: fd.get('cName'), phone: fd.get('cPhone'), email: fd.get('cEmail'), dob: fd.get('cDob'), notes: fd.get('cNotes'), lastVisit: prev?.lastVisit || '', totalVisits: prev?.totalVisits || 0, blocked: prev?.blocked || false, created: prev?.created || new Date().toISOString() };
  if (existing >= 0) clients[existing] = client; else clients.push(client);
  setDB('lunas_clients', clients);
  closeModal('clientModal');
  renderClientsTable(); renderDashboard();
});

/* ── Inventory ── */
function renderInventoryTable(query = '') {
  const items = getDB('lunas_inventory').filter(i =>
    !query || i.name?.toLowerCase().includes(query) || i.category?.toLowerCase().includes(query));
  const tbody = document.getElementById('inventoryBody');
  if (!tbody) return;
  tbody.innerHTML = items.length ? items.map(item => `
    <tr>
      <td>${safe(item.name)}</td>
      <td>${safe(item.category) || '—'}</td>
      <td>${item.price ? 'TTD ' + item.price : '—'}</td>
      <td class="${item.qty <= item.minQty ? 'stock-low' : ''}">${item.qty}</td>
      <td>${item.minQty}</td>
      <td><span class="badge ${item.qty <= item.minQty ? 'badge-low' : 'badge-ok'}">${item.qty <= item.minQty ? 'Low Stock' : 'OK'}</span></td>
      <td style="max-width:200px;">${safe(item.notes) || '—'}</td>
      <td>
        <div class="tbl-actions">
          <button class="tbl-btn tbl-edit" onclick="editInventory(${item.id})">Edit</button>
          <button class="tbl-btn tbl-delete" onclick="deleteInventory(${item.id})">Delete</button>
        </div>
      </td>
    </tr>`).join('') : '<tr><td colspan="8" style="text-align:center;color:#9CA3AF;padding:2rem">No items found</td></tr>';
}

document.getElementById('inventorySearch')?.addEventListener('input', e => renderInventoryTable(e.target.value.toLowerCase()));
document.getElementById('addInventoryBtn')?.addEventListener('click', () => openInventoryModal());
document.getElementById('inventoryModalClose')?.addEventListener('click', () => closeModal('inventoryModal'));

function openInventoryModal(item = null) {
  const form = document.getElementById('inventoryForm');
  document.getElementById('inventoryModalTitle').textContent = item ? 'Edit Item' : 'Add Item';
  form.reset();
  if (item) {
    form.querySelector('[name="itemId"]').value = item.id;
    form.querySelector('[name="iName"]').value = item.name;
    form.querySelector('[name="iCategory"]').value = item.category || '';
    form.querySelector('[name="iPrice"]').value = item.price || '';
    form.querySelector('[name="iQty"]').value = item.qty;
    form.querySelector('[name="iMinQty"]').value = item.minQty;
    form.querySelector('[name="iNotes"]').value = item.notes || '';
  } else {
    form.querySelector('[name="itemId"]').value = '';
  }
  openModal('inventoryModal');
}

window.editInventory = id => { const i = getDB('lunas_inventory').find(x => x.id === id); if (i) openInventoryModal(i); };
window.deleteInventory = id => {
  if (!confirm('Delete this item?')) return;
  setDB('lunas_inventory', getDB('lunas_inventory').filter(i => i.id !== id));
  renderInventoryTable(); renderDashboard();
};

document.getElementById('inventoryForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const id = fd.get('itemId') ? parseInt(fd.get('itemId')) : Date.now();
  const items = getDB('lunas_inventory');
  const ex = items.findIndex(i => i.id === id);
  const item = { id, name: fd.get('iName'), category: fd.get('iCategory'), price: parseFloat(fd.get('iPrice')) || 0, qty: parseInt(fd.get('iQty')) || 0, minQty: parseInt(fd.get('iMinQty')) || 0, notes: fd.get('iNotes') };
  if (ex >= 0) items[ex] = item; else items.push(item);
  setDB('lunas_inventory', items);
  closeModal('inventoryModal');
  renderInventoryTable(); renderDashboard();
});

/* Modal helpers */
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
document.querySelectorAll('.modal-backdrop').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

initAdmin();

/* ── Analytics ── */
let _anDays = 30;
const _anCharts = {};

function _parsePrice(str) {
  const n = parseFloat((str || '').toString().replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function _anPctChange(cur, prev) {
  if (prev === 0 && cur === 0) return '';
  if (prev === 0) return '<span class="an-up">↑ New</span>';
  const pct = Math.round(((cur - prev) / prev) * 100);
  const cls = pct >= 0 ? 'an-up' : 'an-down';
  return `<span class="${cls}">${pct >= 0 ? '↑' : '↓'} ${Math.abs(pct)}% vs prev period</span>`;
}

function _destroyChart(key) {
  if (_anCharts[key]) { _anCharts[key].destroy(); delete _anCharts[key]; }
}

async function renderAnalytics(days) {
  if (days) _anDays = days;

  // Pull fresh data from Firestore so analytics is always accurate
  const [fsBook, fsCl, fsEnr] = await Promise.all([
    _fsGet('bookings'), _fsGet('clients'), _fsGet('course_enrollments')
  ]);
  if (fsBook) localStorage.setItem('lunas_bookings',           JSON.stringify(fsBook));
  if (fsCl)   localStorage.setItem('lunas_clients',            JSON.stringify(fsCl));
  if (fsEnr)  localStorage.setItem('lunas_course_enrollments', JSON.stringify(fsEnr));

  const bookings    = getDB('lunas_bookings');
  const clients     = getDB('lunas_clients');
  const enrollments = getCourseEnrollments();

  const now = new Date();
  const toStr = d => d.toISOString().split('T')[0];
  const nowStr = toStr(now);

  const periodStart = new Date(now); periodStart.setDate(now.getDate() - _anDays);
  const prevStart   = new Date(periodStart); prevStart.setDate(periodStart.getDate() - _anDays);
  const curStr  = toStr(periodStart);
  const prevStr = toStr(prevStart);

  const inCur  = bookings.filter(b => b.date >= curStr  && b.date <= nowStr && b.status !== 'cancelled');
  const inPrev = bookings.filter(b => b.date >= prevStr && b.date < curStr  && b.status !== 'cancelled');
  const allCur = bookings.filter(b => b.date >= curStr  && b.date <= nowStr);

  // Course enrollments: only confirmed or completed count toward revenue
  const enrCur  = enrollments.filter(e => e.enrolledDate >= curStr  && e.enrolledDate <= nowStr && (e.status === 'confirmed' || e.status === 'completed'));
  const enrPrev = enrollments.filter(e => e.enrolledDate >= prevStr && e.enrolledDate < curStr  && (e.status === 'confirmed' || e.status === 'completed'));

  // Revenue = service bookings (use discountedPrice if promo applied) + course enrollments
  const curBookRev  = inCur.reduce((s, b)  => s + _parsePrice(b.discountedPrice || b.price), 0);
  const prevBookRev = inPrev.reduce((s, b) => s + _parsePrice(b.discountedPrice || b.price), 0);
  const curEnrRev   = enrCur.reduce((s, e)  => s + parseTTD(e.amount), 0);
  const prevEnrRev  = enrPrev.reduce((s, e) => s + parseTTD(e.amount), 0);
  const curRev  = curBookRev  + curEnrRev;
  const prevRev = prevBookRev + prevEnrRev;

  const curAvg  = inCur.length  ? curBookRev  / inCur.length  : 0;
  const prevAvg = inPrev.length ? prevBookRev / inPrev.length : 0;

  // Count unique phones, not bookings — a new client with 2+ bookings in the
  // same period must only count once, not once per booking.
  const knownPhones = new Set(bookings.filter(b => b.date < curStr).map(b => b.phone));
  const newClients  = new Set(inCur.filter(b => !knownPhones.has(b.phone)).map(b => b.phone));
  const knownPrev   = new Set(bookings.filter(b => b.date < prevStr).map(b => b.phone));
  const prevNewCl   = new Set(inPrev.filter(b => !knownPrev.has(b.phone)).map(b => b.phone));

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setH = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

  set('anRevVal',    `TTD ${Math.round(curRev).toLocaleString()}`);
  set('anBookVal',   inCur.length);
  set('anClientVal', newClients.size);
  set('anAvgVal',    `TTD ${Math.round(curAvg).toLocaleString()}`);
  setH('anRevDelta',    _anPctChange(curRev,          prevRev));
  setH('anBookDelta',   _anPctChange(inCur.length,    inPrev.length));
  setH('anClientDelta', _anPctChange(newClients.size, prevNewCl.size));
  setH('anAvgDelta',    _anPctChange(curAvg,          prevAvg));

  /* ── Overview chart ── */
  const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const labels = [], revData = [], bookData = [];

  if (_anDays <= 35) {
    for (let w = 3; w >= 0; w--) {
      const ws = new Date(now); ws.setDate(now.getDate() - (w + 1) * 7);
      const we = new Date(now); we.setDate(now.getDate() - w * 7);
      const wsS = toStr(ws), weS = toStr(we);
      const wb  = bookings.filter(b => b.date >= wsS && b.date < weS && b.status !== 'cancelled');
      const we2 = enrollments.filter(e => e.enrolledDate >= wsS && e.enrolledDate < weS && (e.status === 'confirmed' || e.status === 'completed'));
      labels.push(`Wk ${4 - w}`);
      revData.push(wb.reduce((s, b) => s + _parsePrice(b.discountedPrice || b.price), 0) + we2.reduce((s, e) => s + parseTTD(e.amount), 0));
      bookData.push(wb.length);
    }
  } else {
    const months = Math.ceil(_anDays / 30);
    for (let m = months - 1; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mb  = bookings.filter(b => b.date && b.date.startsWith(mStr) && b.status !== 'cancelled');
      const me2 = enrollments.filter(e => e.enrolledDate && e.enrolledDate.startsWith(mStr) && (e.status === 'confirmed' || e.status === 'completed'));
      labels.push(MONTH_SHORT[d.getMonth()]);
      revData.push(mb.reduce((s, b) => s + _parsePrice(b.discountedPrice || b.price), 0) + me2.reduce((s, e) => s + parseTTD(e.amount), 0));
      bookData.push(mb.length);
    }
  }

  _destroyChart('overview');
  const ovCtx = document.getElementById('chartOverview');
  if (ovCtx) {
    _anCharts['overview'] = new Chart(ovCtx, {
      data: {
        labels,
        datasets: [
          { type: 'line', label: 'Revenue (TTD)', data: revData, borderColor: '#6B3010', backgroundColor: 'rgba(107,48,16,0.07)', fill: true, tension: 0.4, pointBackgroundColor: '#6B3010', pointRadius: 4, yAxisID: 'yRev' },
          { type: 'bar',  label: 'Bookings',      data: bookData, backgroundColor: 'rgba(201,168,76,0.65)', borderColor: '#C9A84C', borderWidth: 1, borderRadius: 5, yAxisID: 'yBook' }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
          tooltip: { callbacks: { label: c => c.datasetIndex === 0 ? `Revenue: TTD ${c.parsed.y.toLocaleString()}` : `Bookings: ${c.parsed.y}` } }
        },
        scales: {
          yRev:  { type: 'linear', position: 'left',  ticks: { callback: v => `TTD ${v.toLocaleString()}`, font: { size: 11 } }, grid: { color: '#F3F4F6' } },
          yBook: { type: 'linear', position: 'right', ticks: { stepSize: 1, font: { size: 11 } }, grid: { drawOnChartArea: false } },
          x: { ticks: { font: { size: 11 } }, grid: { color: '#F3F4F6' } }
        }
      }
    });
  }

  /* ── Top Services ── */
  const svcMap = {};
  inCur.forEach(b => { const s = (b.service || 'Other').split('(')[0].trim(); svcMap[s] = (svcMap[s] || 0) + 1; });
  const topSvcs = Object.entries(svcMap).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const svcEmpty = document.getElementById('chartServicesEmpty');
  const svcCanvas = document.getElementById('chartServices');
  _destroyChart('services');
  if (!topSvcs.length) {
    if (svcEmpty)  svcEmpty.style.display  = 'block';
    if (svcCanvas) svcCanvas.style.display = 'none';
  } else {
    if (svcEmpty)  svcEmpty.style.display  = 'none';
    if (svcCanvas) svcCanvas.style.display = '';
    const BROWNS = ['rgba(107,48,16,0.85)','rgba(155,88,40,0.85)','rgba(201,168,76,0.85)','rgba(196,98,45,0.85)','rgba(143,170,124,0.85)','rgba(74,142,212,0.85)','rgba(184,107,90,0.85)'];
    _anCharts['services'] = new Chart(svcCanvas, {
      type: 'bar',
      data: { labels: topSvcs.map(([n]) => n), datasets: [{ data: topSvcs.map(([,v]) => v), backgroundColor: BROWNS, borderRadius: 4 }] },
      options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#F3F4F6' } }, y: { ticks: { font: { size: 11 } }, grid: { display: false } } } }
    });
  }

  /* ── Booking Status doughnut ── */
  const confirmed  = allCur.filter(b => b.status === 'confirmed').length;
  const pending    = allCur.filter(b => b.status === 'pending').length;
  const cancelled  = allCur.filter(b => b.status === 'cancelled').length;
  const statEmpty  = document.getElementById('chartStatusEmpty');
  const statCanvas = document.getElementById('chartStatus');
  _destroyChart('status');
  if (!allCur.length) {
    if (statEmpty)  statEmpty.style.display  = 'block';
    if (statCanvas) statCanvas.style.display = 'none';
  } else {
    if (statEmpty)  statEmpty.style.display  = 'none';
    if (statCanvas) statCanvas.style.display = '';
    _anCharts['status'] = new Chart(statCanvas, {
      type: 'doughnut',
      data: { labels: ['Confirmed', 'Pending', 'Cancelled'], datasets: [{ data: [confirmed, pending, cancelled], backgroundColor: ['#6B3010','#C9A84C','#DC2626'], borderWidth: 0, hoverOffset: 6 }] },
      options: { responsive: true, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 12 }, padding: 14 } } } }
    });
  }

  /* ── Busiest Days ── */
  const DAY_KEYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dayMap = { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 };
  inCur.forEach(b => { if (b.date) { const dk = DAY_KEYS[new Date(b.date + 'T12:00').getDay()]; dayMap[dk]++; } });
  const dayVals = DAY_KEYS.map(d => dayMap[d]);
  const maxDay  = Math.max(...dayVals);
  _destroyChart('days');
  const daysCtx = document.getElementById('chartDays');
  if (daysCtx) {
    _anCharts['days'] = new Chart(daysCtx, {
      type: 'bar',
      data: { labels: DAY_KEYS, datasets: [{ data: dayVals, backgroundColor: dayVals.map(v => v === maxDay && maxDay > 0 ? '#6B3010' : 'rgba(107,48,16,0.25)'), borderRadius: 4 }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#F3F4F6' } }, x: { ticks: { font: { size: 11 } }, grid: { display: false } } } }
    });
  }
}

/* ── BackgroundPaths Hero (Courses Page) ── */
function initCourseHero() {
  const svg = document.getElementById('bpSvg');
  if (!svg) return;

  const W = 1440, H = 900;

  // 36 paths mirrored left + right — each defined by a cubic bezier control-point set
  const pathDefs = [
    { d: `M${-380 + 0*38},${-189 + 0*38} C${-145 + 0*38},${-100 + 0*38} ${400 + 0*38},${500 + 0*38} ${820 + 0*38},${900 + 0*38}`, w: 0.45, op: 0.35, delay: 0*0.5 },
    { d: `M${-380 + 1*38},${-189 + 1*38} C${-145 + 1*38},${-100 + 1*38} ${400 + 1*38},${500 + 1*38} ${820 + 1*38},${900 + 1*38}`, w: 0.45, op: 0.35, delay: 1*0.5 },
    { d: `M${-380 + 2*38},${-189 + 2*38} C${-145 + 2*38},${-100 + 2*38} ${400 + 2*38},${500 + 2*38} ${820 + 2*38},${900 + 2*38}`, w: 0.45, op: 0.35, delay: 2*0.5 },
    { d: `M${-380 + 3*38},${-189 + 3*38} C${-145 + 3*38},${-100 + 3*38} ${400 + 3*38},${500 + 3*38} ${820 + 3*38},${900 + 3*38}`, w: 0.45, op: 0.35, delay: 3*0.5 },
    { d: `M${-380 + 4*38},${-189 + 4*38} C${-145 + 4*38},${-100 + 4*38} ${400 + 4*38},${500 + 4*38} ${820 + 4*38},${900 + 4*38}`, w: 0.45, op: 0.35, delay: 4*0.5 },
    { d: `M${-380 + 5*38},${-189 + 5*38} C${-145 + 5*38},${-100 + 5*38} ${400 + 5*38},${500 + 5*38} ${820 + 5*38},${900 + 5*38}`, w: 0.45, op: 0.35, delay: 5*0.5 },
    { d: `M${-380 + 6*38},${-189 + 6*38} C${-145 + 6*38},${-100 + 6*38} ${400 + 6*38},${500 + 6*38} ${820 + 6*38},${900 + 6*38}`, w: 0.45, op: 0.35, delay: 6*0.5 },
    { d: `M${-380 + 7*38},${-189 + 7*38} C${-145 + 7*38},${-100 + 7*38} ${400 + 7*38},${500 + 7*38} ${820 + 7*38},${900 + 7*38}`, w: 0.45, op: 0.35, delay: 7*0.5 },
    { d: `M${-380 + 8*38},${-189 + 8*38} C${-145 + 8*38},${-100 + 8*38} ${400 + 8*38},${500 + 8*38} ${820 + 8*38},${900 + 8*38}`, w: 0.45, op: 0.35, delay: 8*0.5 },
    { d: `M${-380 + 9*38},${-189 + 9*38} C${-145 + 9*38},${-100 + 9*38} ${400 + 9*38},${500 + 9*38} ${820 + 9*38},${900 + 9*38}`, w: 0.45, op: 0.35, delay: 9*0.5 },
    { d: `M${-380 + 10*38},${-189 + 10*38} C${-145 + 10*38},${-100 + 10*38} ${400 + 10*38},${500 + 10*38} ${820 + 10*38},${900 + 10*38}`, w: 0.45, op: 0.35, delay: 10*0.5 },
    { d: `M${-380 + 11*38},${-189 + 11*38} C${-145 + 11*38},${-100 + 11*38} ${400 + 11*38},${500 + 11*38} ${820 + 11*38},${900 + 11*38}`, w: 0.45, op: 0.35, delay: 11*0.5 },
    { d: `M${-380 + 12*38},${-189 + 12*38} C${-145 + 12*38},${-100 + 12*38} ${400 + 12*38},${500 + 12*38} ${820 + 12*38},${900 + 12*38}`, w: 0.45, op: 0.35, delay: 12*0.5 },
    { d: `M${-380 + 13*38},${-189 + 13*38} C${-145 + 13*38},${-100 + 13*38} ${400 + 13*38},${500 + 13*38} ${820 + 13*38},${900 + 13*38}`, w: 0.45, op: 0.35, delay: 13*0.5 },
    { d: `M${-380 + 14*38},${-189 + 14*38} C${-145 + 14*38},${-100 + 14*38} ${400 + 14*38},${500 + 14*38} ${820 + 14*38},${900 + 14*38}`, w: 0.45, op: 0.35, delay: 14*0.5 },
    { d: `M${-380 + 15*38},${-189 + 15*38} C${-145 + 15*38},${-100 + 15*38} ${400 + 15*38},${500 + 15*38} ${820 + 15*38},${900 + 15*38}`, w: 0.45, op: 0.35, delay: 15*0.5 },
    { d: `M${-380 + 16*38},${-189 + 16*38} C${-145 + 16*38},${-100 + 16*38} ${400 + 16*38},${500 + 16*38} ${820 + 16*38},${900 + 16*38}`, w: 0.45, op: 0.35, delay: 16*0.5 },
    { d: `M${-380 + 17*38},${-189 + 17*38} C${-145 + 17*38},${-100 + 17*38} ${400 + 17*38},${500 + 17*38} ${820 + 17*38},${900 + 17*38}`, w: 0.45, op: 0.35, delay: 17*0.5 },
  ];

  // Add mirrored right-side versions
  const allPaths = [];
  pathDefs.forEach(p => {
    allPaths.push(p);
    // mirror: flip X around center W/2=720
    const mirroredD = p.d.replace(/-?\d+\.?\d*/g, (num, offset, str) => {
      // Only flip X coordinates in the path; rough approach: negate then offset
      return num;
    });
    // Build mirrored path by reflecting X coords around W
    allPaths.push({ ...p, mirror: true, delay: p.delay + 0.25 });
  });

  // Generate all 36 paths (18 left + 18 right mirrored via SVG transform)
  pathDefs.forEach((p, i) => {
    // Left-side path
    const pathL = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathL.setAttribute('d', p.d);
    pathL.setAttribute('stroke', `rgba(107,48,16,${p.op})`);
    pathL.setAttribute('stroke-width', String(p.w));
    pathL.setAttribute('class', 'bp-path');
    pathL.style.animationDuration = `${7 + (i % 5)}s`;
    pathL.style.animationDelay = `${-p.delay}s`;
    svg.appendChild(pathL);

    // Right-side path (mirror of left)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `scale(-1,1) translate(-${W},0)`);
    const pathR = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathR.setAttribute('d', p.d);
    pathR.setAttribute('stroke', `rgba(107,48,16,${p.op})`);
    pathR.setAttribute('stroke-width', String(p.w));
    pathR.setAttribute('class', 'bp-path');
    pathR.style.animationDuration = `${7 + (i % 5)}s`;
    pathR.style.animationDelay = `${-(p.delay + 0.25)}s`;
    g.appendChild(pathR);
    svg.appendChild(g);
  });

  // Animate title letters — "Master Your" line 1, "Craft" line 2
  const lines = [
    { el: document.getElementById('bpLine1'), text: 'Master Your', baseDelay: 0.05 },
    { el: document.getElementById('bpLine2'), text: 'Craft',       baseDelay: 0.65 },
  ];
  lines.forEach(({ el, text, baseDelay }) => {
    if (!el) return;
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'bp-letter';
      span.style.setProperty('--d', `${(baseDelay + i * 0.055).toFixed(3)}s`);
      span.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(span);
    });
  });
}

initCourseHero();

/* ── Magnetic Text List ── */
function initMagneticText() {
  const rows = document.querySelectorAll('.mgt-row');
  if (!rows.length) return;
  // Skip on touch-only devices
  if (window.matchMedia('(hover: none)').matches) return;

  const CIRCLE = 150;
  const lerp = (a, b, t) => a + (b - a) * t;

  const states = Array.from(rows).map(row => ({
    el: row,
    circle: row.querySelector('.mgt-circle'),
    text:   row.querySelector('.mgt-circle-text'),
    tx: 0, ty: 0,   // lerp targets
    cx: 0, cy: 0,   // current (smoothed) positions
    active: false,
  }));

  function tick() {
    states.forEach(s => {
      s.cx = lerp(s.cx, s.tx, 0.15);
      s.cy = lerp(s.cy, s.ty, 0.15);

      if (s.circle) {
        s.circle.style.transform =
          `translate(${s.cx}px, ${s.cy}px) translate(-50%, -50%)`;
      }
      if (s.text) {
        // Counter-move so text stays at the row's visual center.
        // Circle origin (top:0, left:0) sits at (cx-50%, cy-50%) in the row.
        // text at top:50% left:50% of circle = (cx, cy) in the row.
        // Translate(-cx, -cy) → brings text top-left to (0,0) of the row,
        // then flex-center shows it at the row's centre.
        s.text.style.transform = `translate(${-s.cx}px, ${-s.cy}px)`;
      }
    });
    requestAnimationFrame(tick);
  }

  states.forEach(s => {
    s.el.addEventListener('mouseenter', e => {
      const r = s.el.getBoundingClientRect();
      s.tx = s.cx = e.clientX - r.left;
      s.ty = s.cy = e.clientY - r.top;
      s.active = true;
      if (s.circle) {
        s.circle.style.width  = CIRCLE + 'px';
        s.circle.style.height = CIRCLE + 'px';
      }
      if (s.text) {
        s.text.style.width  = s.el.offsetWidth  + 'px';
        s.text.style.height = s.el.offsetHeight + 'px';
      }
    });

    s.el.addEventListener('mousemove', e => {
      const r = s.el.getBoundingClientRect();
      s.tx = e.clientX - r.left;
      s.ty = e.clientY - r.top;
    });

    s.el.addEventListener('mouseleave', () => {
      s.active = false;
      if (s.circle) {
        s.circle.style.width  = '0';
        s.circle.style.height = '0';
      }
    });
  });

  requestAnimationFrame(tick);
}
initMagneticText();

/* ── Scroll Reveal ── */
function initReveal() {
  // Auto-tag common content blocks across every page — no HTML edits needed.
  // Each entry: [CSS selector, per-item stagger seconds (0 = all together)]
  const AUTO = [
    ['.feature-strip-item', 0.07],
    ['.service-card',       0.08],
    ['.testimonial-card',   0.09],
    ['.value-card',         0.07],
    ['.team-card',          0.10],
    ['.about-story',        0   ],
    ['.services-category',  0.12],
    ['.contact-layout',     0   ],
    ['.booking-form-panel', 0   ],
    ['.booking-policy',     0   ],
    ['.cta-banner-content', 0   ],
    ['.fg-header',          0   ],
    ['.fg-card',            0   ],
  ];

  AUTO.forEach(([sel, stagger]) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (!el.classList.contains('reveal-up')) {
        el.classList.add('reveal-up');
        if (stagger > 0)
          el.style.transitionDelay = `${Math.min(i * stagger, 0.36)}s`;
      }
    });
  });

  const els = document.querySelectorAll('.reveal-up');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  els.forEach(el => obs.observe(el));
}
initReveal();

/* ── Page transitions (fade-out before navigate, fade-in on load) ── */
function initPageTransitions() {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // Skip anchors, external links, mailto, tel, blank targets
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto:') || href.startsWith('tel:') ||
        link.target === '_blank') return;
    link.addEventListener('click', e => {
      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(() => { window.location.href = href; }, 260);
    });
  });
}
initPageTransitions();

/* ── Specials & Discounts ── */
const SPECIALS_KEY = 'lunas_specials';

function getSpecials() {
  const raw = localStorage.getItem(SPECIALS_KEY);
  if (raw !== null) return JSON.parse(raw);
  const today = new Date().toISOString().split('T')[0];
  if (today >= LAUNCH_DATE && today <= LAUNCH_END) {
    return [{
      id: 'launch_2026', name: 'Grand Opening — 10% Off July Bookings',
      desc: 'Book any service for a July appointment and save 10%. Excludes all waxing services.',
      type: 'percent', value: 10, applies: 'All Services excl. Waxing',
      startDate: LAUNCH_DATE, endDate: LAUNCH_END,
      colour: 'gold', active: true, createdAt: 1749600000000,
    }];
  }
  return [];
}
function saveSpecials(d) { localStorage.setItem(SPECIALS_KEY, JSON.stringify(d)); _fsSet('specials', d); }

function specialStatus(sp) {
  if (!sp.active) return 'inactive';
  const today = new Date().toISOString().split('T')[0];
  if (sp.startDate && sp.startDate > today) return 'upcoming';
  if (sp.endDate   && sp.endDate   < today) return 'expired';
  return 'active';
}

function specialLabel(sp) {
  if (sp.type === 'percent') return `${sp.value}% OFF`;
  if (sp.type === 'fixed')   return `TTD ${sp.value} OFF`;
  return 'SPECIAL';
}

function appliesToLabel(a) {
  const m = { all:'All Services', 'cat:Facials':'Advanced Facials', 'cat:Laser':'Laser Hair Removal',
    'cat:Body':'Body Contouring', 'cat:Waxing':'Waxing', 'cat:Packages':'Spa Packages',
    'cat:WeightLoss':'Weight Loss & Lipo', 'cat:Courses':'Courses & Training' };
  return m[a] || a;
}

function spEsc(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function spFmtDate(iso) {
  if (!iso) return '';
  const [y,m,d] = iso.split('-');
  const mn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${mn[+m-1]} ${+d}, ${y}`;
}

function renderSpecials() {
  const grid  = document.getElementById('spGrid');
  const empty = document.getElementById('spEmpty');
  const sum   = document.getElementById('spSummary');
  if (!grid) return;

  const all      = getSpecials();
  const active   = all.filter(s => specialStatus(s) === 'active').length;
  const upcoming = all.filter(s => specialStatus(s) === 'upcoming').length;

  if (sum) sum.innerHTML = `
    <div class="sp-stat"><div class="sp-stat-val">${active}</div><div class="sp-stat-label">Active Now</div></div>
    <div class="sp-stat"><div class="sp-stat-val">${upcoming}</div><div class="sp-stat-label">Upcoming</div></div>
    <div class="sp-stat"><div class="sp-stat-val">${all.length}</div><div class="sp-stat-label">Total Created</div></div>`;

  if (!all.length) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  const order = { active:0, upcoming:1, inactive:2, expired:3 };
  const sorted = [...all].sort((a,b) => (order[specialStatus(a)]||0) - (order[specialStatus(b)]||0));

  const statusBadge = {
    active:   '<span class="sp-status-badge sp-status-active">● Live</span>',
    upcoming: '<span class="sp-status-badge sp-status-upcoming">◌ Upcoming</span>',
    inactive: '<span class="sp-status-badge sp-status-inactive">○ Off</span>',
    expired:  '<span class="sp-status-badge sp-status-expired">✕ Expired</span>',
  };

  grid.innerHTML = sorted.map(sp => {
    const st   = specialStatus(sp);
    const label = specialLabel(sp);
    const col  = sp.colour || 'gold';
    let dateStr = 'Ongoing';
    if (sp.startDate && sp.endDate) dateStr = `${spFmtDate(sp.startDate)} – ${spFmtDate(sp.endDate)}`;
    else if (sp.startDate) dateStr = `From ${spFmtDate(sp.startDate)}`;
    else if (sp.endDate)   dateStr = `Until ${spFmtDate(sp.endDate)}`;

    return `<div class="sp-card ${st !== 'active' ? 'sp-inactive' : ''}" data-spid="${sp.id}">
      <div class="sp-card-banner sp-banner-${col}">
        <div>
          <div class="sp-discount-label">${label}</div>
          <div class="sp-applies-label">${appliesToLabel(sp.applies)}</div>
        </div>
        <label class="sp-toggle-wrap" title="Toggle active">
          <input type="checkbox" class="sp-toggle-input" ${sp.active?'checked':''} data-toggle="${sp.id}"/>
          <span class="sp-toggle-track"></span>
        </label>
      </div>
      <div class="sp-card-body">
        <div class="sp-card-header">
          <h4 class="sp-name">${spEsc(sp.name)}</h4>
          ${statusBadge[st]||''}
        </div>
        ${sp.desc ? `<p class="sp-desc">${spEsc(sp.desc)}</p>` : ''}
        <div class="sp-meta">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${dateStr}
        </div>
      </div>
      <div class="sp-card-foot">
        <button class="tbl-btn tbl-edit" data-spedit="${sp.id}">Edit</button>
        <button class="tbl-btn tbl-delete" data-spdel="${sp.id}">Delete</button>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('[data-toggle]').forEach(inp => {
    inp.addEventListener('change', () => {
      const list = getSpecials();
      const i = list.findIndex(s => s.id === inp.dataset.toggle);
      if (i > -1) { list[i].active = inp.checked; saveSpecials(list); renderSpecials(); renderSpecialsBanner(); }
    });
  });
  grid.querySelectorAll('[data-spedit]').forEach(b => b.addEventListener('click', () => openSpecialModal(b.dataset.spedit)));
  grid.querySelectorAll('[data-spdel]').forEach(b => b.addEventListener('click', () => {
    if (confirm('Delete this special?')) {
      saveSpecials(getSpecials().filter(s => s.id !== b.dataset.spdel));
      renderSpecials(); renderSpecialsBanner();
    }
  }));
}

function updateSpValueVis() {
  const type = document.getElementById('spTypeSelect');
  const wrap = document.getElementById('spValueWrap');
  const hint = document.getElementById('spValueHint');
  if (!type || !wrap) return;
  const inp = wrap.querySelector('input');
  if (type.value === 'custom') {
    wrap.style.opacity = '0.4';
    inp.required = false; inp.disabled = true;
  } else {
    wrap.style.opacity = '1';
    inp.required = true; inp.disabled = false;
    if (hint) hint.textContent = type.value === 'percent' ? 'e.g. 20 for 20% off' : 'TTD amount off (e.g. 200)';
  }
}

function openSpecialModal(id = null) {
  const modal = document.getElementById('specialModal');
  const form  = document.getElementById('specialForm');
  if (!modal || !form) return;
  form.reset();
  document.getElementById('specialModalTitle').textContent = id ? 'Edit Special' : 'Create Special';
  if (id) {
    const sp = getSpecials().find(s => s.id === id);
    if (!sp) return;
    form.elements['spId'].value      = sp.id;
    form.elements['spName'].value    = sp.name  || '';
    form.elements['spDesc'].value    = sp.desc  || '';
    form.elements['spType'].value    = sp.type  || 'percent';
    form.elements['spValue'].value   = sp.value || '';
    form.elements['spApplies'].value = sp.applies || 'all';
    form.elements['spStart'].value   = sp.startDate || '';
    form.elements['spEnd'].value     = sp.endDate   || '';
    const c = form.querySelector(`[name="spColour"][value="${sp.colour||'gold'}"]`);
    if (c) c.checked = true;
  }
  updateSpValueVis();
  modal.classList.add('open');
}

function initSpecials() {
  const addBtn  = document.getElementById('addSpecialBtn');
  const closeBtn = document.getElementById('specialModalClose');
  const form    = document.getElementById('specialForm');
  const typeSel = document.getElementById('spTypeSelect');

  if (addBtn)   addBtn.addEventListener('click', () => openSpecialModal());
  if (closeBtn) closeBtn.addEventListener('click', () => document.getElementById('specialModal').classList.remove('open'));
  if (typeSel)  typeSel.addEventListener('change', updateSpValueVis);

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd   = new FormData(form);
      const existing = getSpecials();
      const id   = fd.get('spId') || ('sp_' + Date.now());
      const idx  = existing.findIndex(s => s.id === id);
      const sp   = {
        id,
        name:      fd.get('spName'),
        desc:      fd.get('spDesc'),
        type:      fd.get('spType'),
        value:     parseFloat(fd.get('spValue')) || 0,
        applies:   fd.get('spApplies'),
        startDate: fd.get('spStart') || '',
        endDate:   fd.get('spEnd')   || '',
        colour:    fd.get('spColour') || 'gold',
        active:    idx > -1 ? existing[idx].active : true,
        createdAt: idx > -1 ? existing[idx].createdAt : Date.now(),
      };
      if (idx > -1) existing[idx] = sp; else existing.push(sp);
      saveSpecials(existing);
      document.getElementById('specialModal').classList.remove('open');
      renderSpecials();
      renderSpecialsBanner();
    });
  }

  renderSpecials();
  renderSpecialsBanner();
  onSyncReady(() => renderSpecialsBanner());
}

/* ── Public-facing specials banner ── */
function renderSpecialsBanner() {
  const banner = document.getElementById('specialsBanner');
  if (!banner) return;

  let live = getSpecials().filter(s => specialStatus(s) === 'active');
  const _bToday = new Date().toISOString().split('T')[0];
  if (!live.length && _bToday >= LAUNCH_DATE && _bToday <= LAUNCH_END) {
    live = [{ id:'launch_2026', name:'Grand Opening — 10% Off July Bookings',
      desc:'Book any service for a July appointment and save 10%. Excludes all waxing services.',
      type:'percent', value:10, applies:'All Services excl. Waxing',
      startDate:LAUNCH_DATE, endDate:LAUNCH_END, colour:'gold', active:true }];
  }
  if (!live.length) { banner.classList.remove('has-specials'); return; }
  banner.classList.add('has-specials');

  const head = banner.querySelector('.sb-head-count');
  if (head) head.textContent = `${live.length} deal${live.length > 1 ? 's' : ''} available`;

  const list = banner.querySelector('.sb-cards');
  if (!list) return;
  list.innerHTML = live.map(sp => {
    const col = sp.colour || 'gold';
    const expires = sp.endDate ? `<div class="sb-expires">Ends ${spFmtDate(sp.endDate)}</div>` : '';
    return `<div class="sb-card">
      <div class="sb-badge sb-badge-${col}">
        <div class="sb-badge-val">${specialLabel(sp)}</div>
        <div class="sb-badge-sub">${sp.type === 'custom' ? 'DEAL' : 'SAVE'}</div>
      </div>
      <div class="sb-info">
        <div class="sb-name">${spEsc(sp.name)}</div>
        ${sp.desc ? `<div class="sb-desc">${spEsc(sp.desc)}</div>` : ''}
        <div class="sb-applies">${appliesToLabel(sp.applies)}</div>
        ${expires}
      </div>
    </div>`;
  }).join('');
}

initSpecials();
initServicesMgr();
initCoursesMgr();

/* ── Courses Public Page — Dynamic Rendering ── */
(function initPublicCoursesPage() {
  const mgtList = document.getElementById('mgtList');
  if (!mgtList) return;

  const DEFAULT_IDS = new Set([1,2,3,4,5,6,7,8,9,10]);
  const LEVEL_BADGE = { Beginner:'level-beginner', Intermediate:'level-intermediate', Advanced:'level-advanced', Bundle:'level-bundle', 'Master Bundle':'level-master', 'Signature Program':'level-signature' };

  function getCourses() {
    return JSON.parse(localStorage.getItem('lunas_courses') || 'null') || [
      { id:1, name:'Full Body Waxing Course',          level:'Beginner',         duration:'4 Days',   price:'TTD 3,500', status:'active' },
      { id:2, name:'Basic Vajacial Training',           level:'Intermediate',     duration:'2 Days',   price:'TTD 1,500', status:'active' },
      { id:3, name:'Advanced Vajacial Training',        level:'Advanced',         duration:'2 Days',   price:'TTD 1,500', status:'active' },
      { id:4, name:'Complete Vajacial Package',         level:'Bundle',           duration:'3 Days',   price:'TTD 2,500', status:'active' },
      { id:5, name:'Basic Facial Certification',        level:'Beginner',         duration:'8 Weeks',  price:'TTD 4,500', status:'active' },
      { id:6, name:'Advanced Facial Certification',     level:'Advanced',         duration:'8 Weeks',  price:'TTD 5,000', status:'active' },
      { id:7, name:'Facial Master Certification',       level:'Master Bundle',    duration:'14 Weeks', price:'TTD 8,500', status:'active' },
      { id:8, name:'Body Contouring Certification',     level:'Advanced',         duration:'4 Days',   price:'TTD 3,000', status:'active' },
      { id:9, name:'Eyebrow Tint, Lamination & Sculpt', level:'Beginner',        duration:'3 Days',   price:'TTD 3,000', status:'active' },
      { id:10, name:'The Pink Print Empire™',           level:'Signature Program',duration:'4 Weeks',  price:'TTD 10,000',status:'upcoming'},
    ];
  }

  function renderList() {
    const courses = getCourses().filter(c => c.status !== 'inactive');
    mgtList.innerHTML = courses.map((c, i) => {
      const priceStr = c.price ? (String(c.price).startsWith('TTD') ? c.price : 'TTD ' + c.price) : '';
      return `<div class="mgt-row">
        <span class="mgt-row-num">${String(i+1).padStart(2,'0')}</span>
        <span class="mgt-row-name">${c.name}</span>
        <span class="mgt-row-tag">${c.level} · ${c.duration}</span>
        <span class="mgt-row-price">${priceStr}</span>
      </div>`;
    }).join('');
  }

  function renderExtras() {
    const extras = getCourses().filter(c => !DEFAULT_IDS.has(Number(c.id)) && c.status !== 'inactive');
    const container = document.getElementById('extraCourseCards');
    const grid = document.getElementById('extraCourseGrid');
    if (!container || !grid) return;
    if (!extras.length) { container.style.display = 'none'; return; }
    container.style.display = '';
    grid.innerHTML = extras.map((c, i) => {
      const priceStr = c.price ? (String(c.price).startsWith('TTD') ? c.price : 'TTD ' + c.price) : '';
      const badge = LEVEL_BADGE[c.level] || 'level-beginner';
      const num = String(11 + i).padStart(2, '0');
      const imgSection = c.image
        ? `<div class="course-img course-img--photo">
            <img src="${c.image}" alt="${safe(c.name)}" loading="lazy" style="object-fit:cover;width:100%;height:100%;"/>
            <span class="crd-num">${num}</span>
            <span class="course-level-badge ${badge}">${c.level || 'Course'}</span>
          </div>`
        : `<div class="course-img course-img--intermediate">
            <span class="crd-num">${num}</span>
            <span class="course-level-badge ${badge}">${c.level || 'Course'}</span>
          </div>`;
      const depositHtml = c.deposit
        ? `<div class="course-deposit-note">Deposit: ${String(c.deposit).startsWith('TTD') ? c.deposit : 'TTD ' + c.deposit}</div>`
        : '';
      const durationHtml = c.duration
        ? `<div class="course-meta"><span class="course-meta-tag">${c.duration}</span></div>`
        : '';
      return `<div class="course-card">
        ${imgSection}
        <div class="course-body">
          <h3>${safe(c.name)}</h3>
          <p>${c.desc || ''}</p>
          ${durationHtml}
        </div>
        <div class="course-foot">
          <div class="course-price-block">
            <small>Course Fee</small>
            <div class="price">${priceStr}</div>
            ${depositHtml}
          </div>
          <a href="contact.html?course=${encodeURIComponent(c.name)}" class="btn btn-primary crd-btn">Enrol Now</a>
        </div>
      </div>`;
    }).join('');
  }

  renderList();
  renderExtras();
  onSyncReady(() => { renderList(); renderExtras(); });
})();

/* ── Services Public Page — Dynamic Price/Listing Sync ── */
(function initPublicServicesPage() {
  if (!document.querySelector('.service-cat-section')) return;

  const CAT_MAP = {
    'Spa Packages':           'packages',
    'Pedicures':              'pedicures',
    'Eyebrow Services':       'brows',
    'Advanced Facials':       'facials',
    'Waxing':                 'waxing',
    'Laser Hair Removal':     'laser',
    'Body Contouring':        'contouring',
    'Intimate Brightening':   'brightening',
    'Weight Loss & Lipo Shots': 'lipo',
    'The Lunas Collection':   'lunas-collection',
  };

  function applyServices() {
    const raw = localStorage.getItem('lunas_services');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data['Spa Packages']) data['Spa Packages'] = data['Spa Packages'].filter(s => s.name !== 'The Ultimate Beauty Package');

    Object.entries(CAT_MAP).forEach(([catName, slug]) => {
      const section = document.querySelector(`.service-cat-section[data-cat="${slug}"]`);
      if (!section) return;
      const grid = section.querySelector('.pricing-grid');
      if (!grid) return;
      const adminSvcs = data[catName];
      if (!adminSvcs || !adminSvcs.length) return;

      const existingItems = Array.from(grid.querySelectorAll('.pricing-item'));
      const existingNames = existingItems.map(el => el.querySelector('.pricing-name')?.textContent.trim());

      existingItems.forEach(item => {
        const nameEl = item.querySelector('.pricing-name');
        if (!nameEl) return;
        const match = adminSvcs.find(s => s.name === nameEl.textContent.trim());
        if (match) {
          const priceEl = item.querySelector('.pricing-price');
          if (priceEl) {
            const badge = priceEl.querySelector('small');
            priceEl.textContent = match.price || '';
            if (badge) priceEl.appendChild(badge);
          }
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });

      adminSvcs.forEach(svc => {
        if (existingNames.includes(svc.name)) return;
        const div = document.createElement('div');
        div.className = 'pricing-item';
        div.innerHTML = `<div><div class="pricing-name">${svc.name}</div><div class="pricing-desc">${svc.duration || ''}</div></div><div class="pricing-price">${svc.price || ''}</div>`;
        grid.appendChild(div);
      });
    });
  }

  applyServices();
  onSyncReady(applyServices);
})();

/* ── Services Page — Quick Book Sheet ── */
(function () {
  if (!document.querySelector('.pricing-item')) return;

  // Maps services.html data-cat → booking form category name
  const catMap = {
    packages:    'Spa Packages',
    pedicures:   'Pedicures',
    brows:       'Eyebrow Services',
    facials:     'Advanced Facials',
    waxing:      'Waxing',
    laser:       'Laser Hair Removal',
    contouring:  'Body Contouring',
    brightening: 'Intimate Brightening',
    lipo:        'Weight Loss & Lipo Shots',
    'lunas-collection': 'The Lunas Collection',
  };

  // Inject bottom sheet markup
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="qb-backdrop" id="qbBackdrop" role="dialog" aria-modal="true" aria-labelledby="qbName">
      <div class="qb-sheet" id="qbSheet">
        <div class="qb-handle"></div>
        <div class="qb-body">
          <p class="qb-cat" id="qbCat"></p>
          <h3 class="qb-name" id="qbName"></h3>
          <div class="qb-meta-row">
            <span class="qb-price" id="qbPrice"></span>
          </div>
          <p class="qb-desc" id="qbDesc"></p>
          <div class="qb-actions">
            <a href="#" class="btn btn-gold qb-book-btn" id="qbBookBtn" style="width:100%;text-align:center;min-height:50px;display:flex;align-items:center;justify-content:center;">Book This Service</a>
            <button class="qb-dismiss" id="qbDismiss">Not right now</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(wrap);

  const backdrop = document.getElementById('qbBackdrop');
  const sheet    = document.getElementById('qbSheet');
  const bookBtn  = document.getElementById('qbBookBtn');

  function openQB(name, price, desc, catKey) {
    document.getElementById('qbCat').textContent   = catMap[catKey] || '';
    document.getElementById('qbName').textContent  = name;
    document.getElementById('qbPrice').textContent = price;
    const descEl = document.getElementById('qbDesc');
    descEl.textContent = desc || '';
    descEl.style.display = desc ? '' : 'none';
    const url = `book.html?cat=${encodeURIComponent(catMap[catKey] || '')}&svc=${encodeURIComponent(name)}`;
    bookBtn.setAttribute('href', url);
    backdrop.classList.add('open');
    requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('open')));
    lockScroll();
    document.getElementById('qbDismiss').focus();
  }

  function closeQB() {
    sheet.classList.remove('open');
    backdrop.classList.remove('open');
    unlockScroll();
  }

  document.getElementById('qbDismiss').addEventListener('click', closeQB);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeQB(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeQB(); });

  // Attach click handler to a single pricing item (safe to call multiple times)
  function attachPricingItem(item) {
    if (item.dataset.qbAttached) return;
    item.dataset.qbAttached = '1';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    const handler = () => {
      const name   = item.querySelector('.pricing-name')?.textContent?.trim() || '';
      const price  = item.querySelector('.pricing-price')?.textContent?.trim() || '';
      const desc   = item.querySelector('.pricing-desc')?.textContent?.trim()  || '';
      const catKey = item.closest('.service-cat-section')?.dataset?.cat || '';
      if (name) openQB(name, price, desc, catKey);
    };
    item.addEventListener('click', handler);
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
  }

  // Attach to items already in the static HTML (skip categories disabled for online booking)
  document.querySelectorAll('.pricing-item:not([data-book-disabled])').forEach(attachPricingItem);

  // Watch for admin-added services injected after Firestore sync
  const _qbObs = new MutationObserver(() => {
    document.querySelectorAll('.pricing-item:not([data-qb-attached]):not([data-book-disabled])').forEach(attachPricingItem);
  });
  document.querySelectorAll('.pricing-grid').forEach(grid => _qbObs.observe(grid, { childList: true }));
})();

/* ── Course page: waxing addon checkbox ── */
(function () {
  const addonCheck = document.getElementById('waxingAddonCheck');
  const addonBox   = document.getElementById('waxAddonBox');
  const waxBtn     = document.getElementById('waxEnrolBtn');
  const waxPrice   = document.getElementById('waxPrice');
  const waxDeposit = document.getElementById('waxDeposit');

  if (addonCheck && waxBtn) {
    addonCheck.addEventListener('change', function () {
      if (this.checked) {
        waxBtn.href     = 'contact.html?course=' + encodeURIComponent('Full Body Waxing Course + Basic Vajacial Certification Add-On');
        if (waxPrice)   waxPrice.textContent   = 'TTD 4,500';
        if (waxDeposit) waxDeposit.textContent = '50% deposit (TTD 2,250) required';
        if (addonBox)   addonBox.classList.add('is-selected');
      } else {
        waxBtn.href     = 'contact.html?course=' + encodeURIComponent('Full Body Waxing Course');
        if (waxPrice)   waxPrice.textContent   = 'TTD 3,500';
        if (waxDeposit) waxDeposit.textContent = '50% deposit (TTD 1,750) required';
        if (addonBox)   addonBox.classList.remove('is-selected');
      }
    });
  }
})();

/* ── Contact page: pre-fill form from ?course= URL param ── */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const course = params.get('course');
  if (!course) return;

  const subjectEl = form.querySelector('[name="subject"]');
  const msgEl     = form.querySelector('[name="message"]');

  if (subjectEl) subjectEl.value = 'Course Enrollment';
  if (msgEl && !msgEl.value) {
    msgEl.value = 'I am interested in enrolling in:\n' + course + '\n\nPlease contact me with more information about availability, upcoming dates, and payment options.';
  }
  const courseRefEl = form.querySelector('[name="courseRef"]');
  if (courseRefEl) courseRefEl.value = course;

  const panel = form.closest('.contact-form-panel');
  if (panel && !panel.querySelector('.course-enrol-banner')) {
    const banner = document.createElement('div');
    banner.className = 'course-enrol-banner';
    banner.innerHTML = '<strong>Course Enquiry:</strong> ' + course;
    panel.insertBefore(banner, form);
  }

  setTimeout(() => form.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
})();

/* ── Services Manager (Admin) ── */
function initServicesMgr() {
  const panel = document.getElementById('panel-services-mgr');
  if (!panel) return;

  const DEFAULT_SERVICES = {
    'The Lunas Collection': [
      { name: 'Laser Hair Removal Bundle', price: 'TTD 1,000', duration: '1h 30m' },
      { name: 'Waxing Package', price: 'TTD 400', duration: '1 hr' },
      { name: 'Facial Package', price: 'TTD 300', duration: '2 hrs' },
      { name: 'The Lunas Effect Weight Loss Bundle', price: 'TTD 1,800', duration: '' },
      { name: 'Body Contouring Bundle', price: 'TTD 1,000', duration: '2 hrs' },
    ],
    'Spa Packages': [
      { name: 'The Goddess Glow Package', price: 'TTD 900', duration: '3h 30m' },
      { name: 'The It Girl Package', price: 'TTD 600', duration: '2h 5m' },
      { name: 'Lunas Platinum Experience', price: 'TTD 1,500', duration: '6 hrs' },
      { name: 'Double Birthday Package', price: 'TTD 1,000', duration: '4h 10m' },
      { name: 'Spa Escape', price: 'TTD 600', duration: '2 hrs' },
    ],
    'Pedicures': [
      { name: 'Classic Pedicure', price: 'TTD 180', duration: '1 hr' },
      { name: 'Jelly Pedicure', price: 'TTD 250', duration: '1h 30m' },
      { name: 'Luxury Pedicure', price: 'TTD 320', duration: '2 hrs' },
      { name: 'Luxury Milk Pedicure', price: 'TTD 300', duration: '1h 30m' },
    ],
    'Eyebrow Services': [
      { name: 'Brow Lamination + Sculpt', price: 'TTD 250', duration: '1 hr' },
      { name: 'Eyebrow Tint + Lift and Sculpt', price: 'TTD 450', duration: '2 hrs' },
      { name: 'Eyebrow Tint and Sculpt', price: 'TTD 250', duration: '1 hr' },
    ],
    'Advanced Facials': [
      { name: 'KRX Green Sea Peel', price: 'TTD 800', duration: '2 hrs' },
      { name: 'Signature Hydrafacial', price: 'TTD 800', duration: '1 hr' },
      { name: 'Micro-needling Exosome Infusion', price: 'TTD 1,400', duration: '1h 30m' },
      { name: 'Dermaplane + Peel', price: 'TTD 700', duration: '1h 30m' },
      { name: 'Microdermabrasion Facial', price: 'TTD 500', duration: '1 hr' },
      { name: 'Anti-Aging Facial', price: 'TTD 550', duration: '1 hr' },
      { name: "Vampire Facial / PRP", price: 'TTD 750', duration: '2 hrs' },
      { name: 'Microneedling + Salmon DNA', price: 'TTD 900', duration: '2 hrs' },
      { name: "Signature Men's Facial", price: 'TTD 450', duration: '1h 30m' },
      { name: 'Alpha Beard Facial', price: 'TTD 500', duration: '1h 30m' },
      { name: "Luna's Signature Reset", price: 'TTD 600', duration: '2 hrs' },
      { name: 'Anti Acne Facial', price: 'TTD 500', duration: '2 hrs' },
      { name: 'Dermaplaning Facial', price: 'TTD 450', duration: '1h 30m' },
    ],
    'Waxing': [
      { name: 'Hollywood Wax', price: 'TTD 300', duration: '30 mins' },
      { name: 'Hollywood Wax + Vajacial', price: 'TTD 550', duration: '1 hr' },
      { name: 'Full Body Wax', price: 'TTD 1,650', duration: '2h 30m' },
      { name: 'Full Leg Wax', price: 'TTD 280', duration: '50 mins' },
      { name: 'Half Arm Wax', price: 'TTD 130', duration: '50 mins' },
      { name: 'Full Face Wax', price: 'TTD 150', duration: '25 mins' },
      { name: 'Brow/Lip/Chin/Sideburn/Nose Wax', price: 'TTD 30', duration: '15 mins' },
      { name: 'Underarm Wax (Female)', price: 'TTD 60', duration: '15 mins' },
      { name: 'Underarm Wax (Male)', price: 'TTD 70', duration: '15 mins' },
      { name: 'Manzalian Wax (Male)', price: 'TTD 350', duration: '45 mins' },
      { name: 'Lunas Deluxe Wax Package', price: 'TTD 700', duration: '1h 50m' },
    ],
    'Laser Hair Removal': [
      { name: 'Full Body Platinum', price: 'TTD 2,500', duration: '3h 20m' },
      { name: "Luna's Glow Package (Face + Neck)", price: 'TTD 1,500', duration: '2 hrs' },
      { name: 'Lunas Starter (Bikini + Underarms)', price: 'TTD 550', duration: '50 mins' },
      { name: 'Half Leg + Bikini Line', price: 'TTD 750', duration: '1h 30m' },
      { name: 'Extended Bikini / Regular Bikini Line', price: 'from TTD 400', duration: '30 mins' },
      { name: 'Full Legs', price: 'from TTD 900', duration: '1 hr' },
      { name: 'Half Legs', price: 'from TTD 600', duration: '1 hr' },
      { name: 'Full Face', price: 'from TTD 400', duration: '30 mins' },
      { name: 'Chin', price: 'from TTD 200', duration: '30 mins' },
      { name: 'Jawline', price: 'from TTD 350', duration: '30 mins' },
      { name: 'Toes and Fingers', price: 'from TTD 150', duration: '15 mins' },
    ],
    'Body Contouring': [
      { name: 'Anti-Cellulite Treatment', price: 'TTD 500', duration: '1h 45m' },
      { name: 'Ultrasonic Fat Cavitation + Laser Lipo 360', price: 'TTD 550', duration: '2 hrs' },
      { name: 'Cavitation + Laser Lipo + RF Skin Tightening', price: 'TTD 350', duration: '1h 30m' },
      { name: 'Luna\'s Sculpt Package — 4 Sessions', price: 'TTD 1,000', duration: '4 sessions' },
      { name: 'Luna\'s Sculpt Package — 6 Sessions', price: 'TTD 1,700', duration: '6 sessions' },
      { name: 'Luna\'s Sculpt Package — 8 Sessions', price: 'TTD 2,400', duration: '8 sessions' },
      { name: 'Luna\'s Sculpt Package — 12 Sessions', price: 'TTD 3,800', duration: '12 sessions' },
    ],
    'Intimate Brightening': [
      { name: 'Brazilian Intimate Brightening', price: 'TTD 600', duration: '1 hr' },
      { name: 'Full Butt Brightening', price: 'TTD 600', duration: '1 hr' },
      { name: 'Underarm Brightening', price: 'TTD 500', duration: '1 hr' },
      { name: 'Elbows or Knees Brightening', price: 'TTD 350', duration: '1 hr' },
    ],
    'Weight Loss & Lipo Shots': [
      { name: 'Consultation (Virtual/In Person)', price: 'TTD 100', duration: '30 mins' },
      { name: 'Body Lipo Shots + Cavitation', price: 'TTD 900', duration: '1h 10m' },
      { name: 'Body Sculpt Shots (1 Month Supply)', price: 'TTD 2,800', duration: '10 mins' },
      { name: 'Soft Girl Reset', price: 'TTD 2,000', duration: '1h 30m' },
      { name: 'Back Lipo Shots', price: 'TTD 550', duration: '40 mins' },
      { name: 'Arms Lipo Shots', price: 'TTD 500', duration: '30 mins' },
      { name: 'Inner Thigh Lipo Shots', price: 'TTD 500', duration: '30 mins' },
      { name: 'Full Stomach Lipo Shots + Back', price: 'TTD 900', duration: '1h 30m' },
    ],
  };

  function loadServices() {
    const data = JSON.parse(localStorage.getItem('lunas_services') || 'null') || DEFAULT_SERVICES;
    if (data['Spa Packages']) {
      data['Spa Packages'] = data['Spa Packages'].filter(s => s.name !== 'The Ultimate Beauty Package');
    }
    return data;
  }
  function saveServices(data) {
    localStorage.setItem('lunas_services', JSON.stringify(data));
    _fsSet('services', data);
  }

  const tbody = document.getElementById('servicesBody');
  const catFilter = document.getElementById('svcCatFilter');

  function populateCatFilter(data) {
    const current = catFilter.value;
    catFilter.innerHTML = '<option value="">All Categories</option>';
    Object.keys(data).forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat;
      catFilter.appendChild(opt);
    });
    catFilter.value = current;
  }

  function renderServices() {
    const data = loadServices();
    populateCatFilter(data);
    const filter = catFilter.value;
    tbody.innerHTML = '';
    let count = 0;
    Object.entries(data).forEach(([cat, svcs]) => {
      if (filter && cat !== filter) return;
      svcs.forEach((svc, idx) => {
        count++;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><span class="admin-tag">${safe(cat)}</span></td>
          <td>${safe(svc.name)}</td>
          <td>${safe(svc.price)}</td>
          <td>${safe(svc.duration)}</td>
          <td>
            <button class="btn-admin btn-admin-ghost" style="padding:4px 10px;font-size:0.78rem;" data-edit-cat="${safe(cat)}" data-edit-idx="${idx}">Edit</button>
            <button class="btn-admin" style="padding:4px 10px;font-size:0.78rem;background:#DC2626;color:white;border-color:#DC2626;" data-del-cat="${safe(cat)}" data-del-idx="${idx}">Delete</button>
          </td>`;
        tbody.appendChild(tr);
      });
    });
    if (count === 0) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#9CA3AF;">No services found.</td></tr>';
  }

  catFilter.addEventListener('change', renderServices);

  // Modal helpers
  const modal = document.getElementById('serviceModal');
  const form  = document.getElementById('serviceForm');
  function openModal(title, vals = {}) {
    document.getElementById('serviceModalTitle').textContent = title;
    form.reset();
    form.svcId.value = vals.id || '';
    if (vals.cat) form.svcCat.value = vals.cat;
    if (vals.name) form.svcName.value = vals.name;
    if (vals.price) form.svcPrice.value = vals.price;
    if (vals.duration) form.svcDuration.value = vals.duration;
    modal.classList.add('open');
  }
  document.getElementById('serviceModalClose').onclick = () => modal.classList.remove('open');
  document.getElementById('addServiceBtn').onclick = () => openModal('Add Service');

  // Edit / Delete via delegation
  tbody.addEventListener('click', e => {
    const data = loadServices();
    const editBtn = e.target.closest('[data-edit-cat]');
    const delBtn  = e.target.closest('[data-del-cat]');
    if (editBtn) {
      const cat = editBtn.dataset.editCat;
      const idx = parseInt(editBtn.dataset.editIdx);
      const svc = data[cat][idx];
      openModal('Edit Service', { id: `${cat}||${idx}`, cat, ...svc });
    }
    if (delBtn) {
      const cat = delBtn.dataset.delCat;
      const idx = parseInt(delBtn.dataset.delIdx);
      if (!confirm(`Delete "${data[cat][idx].name}"?`)) return;
      data[cat].splice(idx, 1);
      if (!data[cat].length) delete data[cat];
      saveServices(data);
      renderServices();
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd   = new FormData(form);
    const data = loadServices();
    const cat  = fd.get('svcCat');
    const svc  = { name: fd.get('svcName'), price: fd.get('svcPrice'), duration: fd.get('svcDuration') };
    const id   = fd.get('svcId');
    if (id && id.includes('||')) {
      const [oldCat, oldIdx] = id.split('||');
      const oldIdxNum = parseInt(oldIdx);
      if (oldCat === cat) {
        data[oldCat].splice(oldIdxNum, 1, svc);
      } else {
        data[oldCat].splice(oldIdxNum, 1);
        if (!data[oldCat].length) delete data[oldCat];
        if (!data[cat]) data[cat] = [];
        data[cat].push(svc);
      }
    } else {
      if (!data[cat]) data[cat] = [];
      data[cat].push(svc);
    }
    saveServices(data);
    modal.classList.remove('open');
    renderServices();
  });

  document.getElementById('resetServicesBtn').onclick = () => {
    if (!confirm('Reset all services to defaults? This cannot be undone.')) return;
    localStorage.removeItem('lunas_services');
    fetch(`${_FS_BASE}/services?key=${_FS_KEY}`, { method: 'DELETE' }).catch(() => {});
    renderServices();
  };

  renderServices();
  onSyncReady(renderServices);
}

/* ── Courses Manager (Admin) ── */
function initCoursesMgr() {
  const panel = document.getElementById('panel-courses-mgr');
  if (!panel) return;

  const DEFAULT_COURSES = [
    { id: 1, name: 'Full Body Waxing Course', level: 'Beginner', duration: '4 Days', price: 'TTD 3,500', deposit: 'TTD 1,750', desc: 'Internationally accredited IPHM full body waxing certification.', status: 'active' },
    { id: 2, name: 'Basic Vajacial Training', level: 'Intermediate', duration: '2 Days', price: 'TTD 1,500', deposit: 'TTD 750', desc: 'Professional vajacial technique certification.', status: 'active' },
    { id: 3, name: 'Advanced Vajacial Training', level: 'Advanced', duration: '2 Days', price: 'TTD 1,500', deposit: 'TTD 750', desc: 'Advanced vajacial techniques and protocols.', status: 'active' },
    { id: 4, name: 'Complete Vajacial Certification Package', level: 'Bundle', duration: '3 Days', price: 'TTD 2,500', deposit: 'TTD 1,250', desc: 'Basic + Advanced vajacial combined bundle.', status: 'active' },
    { id: 5, name: 'Basic Facial Certification Program', level: 'Beginner', duration: '8 Weeks', price: 'TTD 4,500', deposit: 'TTD 2,250', desc: 'Comprehensive basic facial skills certification.', status: 'active' },
    { id: 6, name: 'Advanced Facial Certification Program', level: 'Advanced', duration: '8 Weeks', price: 'TTD 5,000', deposit: 'TTD 2,500', desc: 'Advanced facial techniques and protocols.', status: 'active' },
    { id: 7, name: 'Facial Master Certification Program', level: 'Master Bundle', duration: '14 Weeks', price: 'TTD 8,500', deposit: 'TTD 4,250', desc: 'Complete facial mastery — Basic + Advanced bundle.', status: 'active' },
    { id: 8, name: 'Body Contouring Certification Course', level: 'Advanced', duration: '4 Days', price: 'TTD 3,000', deposit: 'TTD 1,500', desc: 'Professional body contouring and sculpting certification.', status: 'active' },
    { id: 9, name: 'Eyebrow Tint, Lamination & Sculpt Certification', level: 'Beginner', duration: '3 Days', price: 'TTD 3,000', deposit: 'TTD 1,500', desc: 'Full brow tinting, lamination, and sculpting with Brow Daddy kit.', status: 'active' },
    { id: 10, name: 'The Pink Print Empire™', level: 'Signature Program', duration: '4 Weeks', price: 'TTD 10,000', deposit: 'TTD 3,000', desc: "Luna's all-inclusive signature training experience.", status: 'upcoming' },
  ];

  function loadCourses() {
    return JSON.parse(localStorage.getItem('lunas_courses') || 'null') || DEFAULT_COURSES;
  }
  function saveCourses(data) {
    localStorage.setItem('lunas_courses', JSON.stringify(data));
    _fsSet('courses', data);
  }

  const tbody  = document.getElementById('coursesBody');
  const search = document.getElementById('courseSearch');

  const STATUS_LABELS = { active: '🟢 Active', full: '🔴 Full', upcoming: '🟡 Upcoming', inactive: '⚫ Inactive' };

  function renderCourses() {
    const data = loadCourses();
    const q = (search.value || '').toLowerCase();
    tbody.innerHTML = '';
    const filtered = data.filter(c => !q || c.name.toLowerCase().includes(q) || c.level.toLowerCase().includes(q));
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9CA3AF;">No courses found.</td></tr>';
      return;
    }
    filtered.forEach(course => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${safe(course.name)}</strong>${course.desc ? `<br><span style="font-size:0.78rem;color:#9CA3AF;">${safe(course.desc)}</span>` : ''}</td>
        <td><span class="admin-tag">${safe(course.level)}</span></td>
        <td>${safe(course.duration)}</td>
        <td>${safe(course.price)}</td>
        <td>${course.deposit ? safe(course.deposit) : '—'}</td>
        <td>${STATUS_LABELS[course.status] || safe(course.status)}</td>
        <td>
          <button class="btn-admin btn-admin-ghost" style="padding:4px 10px;font-size:0.78rem;" data-edit-id="${safe(course.id)}">Edit</button>
          <button class="btn-admin" style="padding:4px 10px;font-size:0.78rem;background:#DC2626;color:white;border-color:#DC2626;" data-del-id="${safe(course.id)}">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  search.addEventListener('input', renderCourses);

  // Modal helpers
  const modal = document.getElementById('courseModal');
  const form  = document.getElementById('courseForm');
  function openModal(title, course = {}) {
    document.getElementById('courseModalTitle').textContent = title;
    form.reset();
    form.courseId.value       = course.id || '';
    form.courseName.value     = course.name || '';
    form.courseLevel.value    = course.level || '';
    form.courseDuration.value = course.duration || '';
    form.coursePrice.value    = course.price || '';
    form.courseDeposit.value  = course.deposit || '';
    form.courseDesc.value     = course.desc || '';
    form.courseStatus.value   = course.status || 'active';
    form.courseImage.value    = course.image || '';
    modal.classList.add('open');
  }
  document.getElementById('courseModalClose').onclick = () => modal.classList.remove('open');
  document.getElementById('addCourseBtn').onclick = () => openModal('Add Course');

  tbody.addEventListener('click', e => {
    const data = loadCourses();
    const editBtn = e.target.closest('[data-edit-id]');
    const delBtn  = e.target.closest('[data-del-id]');
    if (editBtn) {
      const course = data.find(c => c.id == editBtn.dataset.editId);
      if (course) openModal('Edit Course', course);
    }
    if (delBtn) {
      const course = data.find(c => c.id == delBtn.dataset.delId);
      if (!course || !confirm(`Delete "${course.name}"?`)) return;
      saveCourses(data.filter(c => c.id != delBtn.dataset.delId));
      renderCourses();
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd   = new FormData(form);
    const data = loadCourses();
    const id   = fd.get('courseId');
    const course = {
      id:       id ? parseInt(id) : Date.now(),
      name:     fd.get('courseName'),
      level:    fd.get('courseLevel'),
      duration: fd.get('courseDuration'),
      price:    fd.get('coursePrice'),
      deposit:  fd.get('courseDeposit'),
      desc:     fd.get('courseDesc'),
      image:    fd.get('courseImage') || '',
      status:   fd.get('courseStatus'),
    };
    if (id) {
      const idx = data.findIndex(c => c.id == id);
      if (idx >= 0) data[idx] = course; else data.push(course);
    } else {
      data.push(course);
    }
    saveCourses(data);
    modal.classList.remove('open');
    renderCourses();
  });

  document.getElementById('resetCoursesBtn').onclick = () => {
    if (!confirm('Reset all courses to defaults? This cannot be undone.')) return;
    localStorage.removeItem('lunas_courses');
    renderCourses();
  };

  renderCourses();
  onSyncReady(renderCourses);
}

/* ── Consent Modal ── */
(function () {
  const POLICIES = {
    'Waxing': {
      title: 'Full Body Waxing Policy',
      html: `
        <h4>Appointment Requirements</h4>
        <p>Hair should be approximately ¼ inch long (grain of rice). Do not shave for at least 2–3 weeks prior. Clients must arrive clean and freshly showered. For intimate waxing, please use the restroom beforehand. The service may be refused if hygiene standards are not met.</p>
        <h4>Contraindications — When We Cannot Wax</h4>
        <p>Please inform your therapist if you use any of the following, as they may prevent waxing on affected areas:</p>
        <ul>
          <li>Accutane / Isotretinoin (within last 6 months), Retin-A, Tretinoin, Differin, Adapalene</li>
          <li>Retinol products, chemical exfoliants, salicylic or glycolic acid</li>
          <li>Blood thinners, steroid medications, certain antibiotics</li>
        </ul>
        <p>Waxing may be refused for: open wounds, sunburn, active rashes, psoriasis/eczema flare-ups, active infections, cold sores, genital warts, recent surgery in treatment area, or severe varicose veins.</p>
        <h4>Pregnancy</h4>
        <p>Waxing is generally safe during pregnancy; however skin may be more sensitive. Please notify us if pregnant. Medical clearance may be requested.</p>
        <h4>Intimate (Brazilian) Waxing</h4>
        <p>All Brazilian services are conducted professionally and strictly for cosmetic purposes. Inappropriate behaviour will result in immediate termination, full service charges, and permanent refusal of future bookings. Clients under 18 require written parental consent.</p>
        <h4>Expected Reactions & Aftercare</h4>
        <p>Normal reactions include mild redness, tenderness, temporary bumps, and sensitivity — typically resolving within 24–48 hours.</p>
        <p><strong>For 24–48 hours after waxing avoid:</strong> hot baths, saunas, intense exercise, swimming, tanning, direct sun, sexual activity (Brazilian), perfumed products, and deodorants on freshly waxed underarms.</p>
        <h4>Late Arrivals & Cancellations</h4>
        <p>Clients arriving more than 10 minutes late may be rescheduled. A minimum of 24 hours' notice is required to cancel. No-shows may forfeit their deposit.</p>
        <h4>Client Disclosure Responsibility</h4>
        <p>Clients are responsible for disclosing all medical conditions, allergies, pregnancy, medications, recent cosmetic procedures, and previous adverse reactions to waxing. Failure to disclose may result in adverse reactions for which the salon cannot be held responsible.</p>
        <h4>Refund Policy</h4>
        <p>All waxing services are non-refundable. Concerns must be reported within 48 hours.</p>
      `
    },
    'Laser Hair Removal': {
      title: 'Laser Hair Removal Policy',
      html: `
        <h4>Before Your Appointment</h4>
        <p>Treatment areas must be clean-shaven 12–24 hours before your appointment. Do <strong>not</strong> wax, thread, tweeze, or use depilatory creams for at least 4 weeks prior — the hair follicle must remain intact. If shaving is required at your appointment, an additional fee may apply.</p>
        <p>Avoid direct sun exposure, tanning beds, spray tanning, and self-tanners for at least 2 weeks before and after treatment. Recently tanned skin increases the risk of burns, blistering, and pigmentation changes.</p>
        <h4>Skincare Products to Discontinue</h4>
        <ul>
          <li>Retinol, retinoids, tretinoin, Accutane (must be stopped at least 6 months prior unless physician-cleared)</li>
          <li>Strong exfoliants and chemical peels on the treatment area</li>
        </ul>
        <h4>Medical Disclosure</h4>
        <p>Clients must disclose: pregnancy, breastfeeding, medical conditions, skin disorders, allergies, current medications, recent surgeries, hormonal disorders, and previous laser treatments.</p>
        <h4>Contraindications</h4>
        <p>Treatment may not be performed if you have active skin infections, open wounds, sunburn, unexplained lesions, certain autoimmune disorders, active herpes outbreaks in the treatment area, or are using photosensitising medications.</p>
        <h4>Pregnancy</h4>
        <p>Luna's Esthetics does <strong>not</strong> perform laser hair removal on clients who are pregnant. Breastfeeding clients should notify their practitioner prior to treatment.</p>
        <h4>Expected Results & Treatment Plan</h4>
        <p>Laser hair removal provides <strong>permanent hair reduction</strong>, not guaranteed permanent hair removal. Results vary based on hormones, genetics, hair colour, skin type, and treatment compliance. Most clients require 6–12 sessions spaced 4–8 weeks apart. Maintenance treatments may be required. Missed sessions can affect overall results.</p>
        <h4>Aftercare (24–72 hrs)</h4>
        <p>Avoid: hot showers, saunas, steam rooms, swimming, intense exercise, direct sun, exfoliation, retinol, harsh skincare. Use SPF 50 daily on exposed areas. Follow all practitioner recommendations.</p>
        <h4>Possible Side Effects</h4>
        <p>Temporary: mild redness, swelling around follicles, sensitivity, warmth. Less common: hyperpigmentation, hypopigmentation, blistering, burns, scarring. Following all pre- and post-care instructions reduces these risks.</p>
        <h4>Package Policy</h4>
        <p>Packages are non-refundable, non-transferable, must be used within the validity period, and expired sessions will not be replaced.</p>
        <h4>Cancellation & No-Show</h4>
        <p>24 hours' notice required for cancellations. Deposits are non-refundable. No-shows forfeit their deposit; future bookings may require full prepayment.</p>
      `
    },
    'Body Contouring': {
      title: 'Body Contouring Policy',
      html: `
        <h4>Important Disclaimer</h4>
        <p>Our services are designed to support body contouring, inch loss, and lymphatic drainage. <strong>We do not guarantee weight loss results.</strong> Results vary based on diet, exercise, hydration, hormonal factors, medical conditions, and individual body composition. Our services are not intended to diagnose, treat, cure, or prevent any disease.</p>
        <h4>Consultation Requirement</h4>
        <p>A consultation may be required before beginning treatment. Clients must provide accurate information regarding medical history, current medications, previous surgeries, pregnancy status, existing medical conditions, implanted medical devices, and weight loss medications.</p>
        <h4>Contraindications</h4>
        <ul>
          <li>Pregnancy, active cancer, severe liver or kidney disease, uncontrolled diabetes</li>
          <li>Active infections, deep vein thrombosis (DVT), pacemakers, certain implanted electronic devices</li>
          <li>Recent major surgery, uncontrolled hypertension, certain cardiovascular conditions</li>
        </ul>
        <h4>Body Contouring Expectations</h4>
        <p>Treatments may assist with temporary reduction in bloating, improved body appearance, lymphatic drainage, reduction in fluid retention, and circumference reduction. Multiple sessions are typically required. Results require a healthy lifestyle to maintain. No specific number of pounds or inches lost can be guaranteed.</p>
        <h4>Client Responsibilities</h4>
        <p>Clients agree to: maintain adequate hydration, follow recommended dietary guidelines, engage in regular physical activity where appropriate, attend sessions consistently, and follow all pre- and post-treatment instructions.</p>
        <h4>Package Policy</h4>
        <p>Treatment packages are non-refundable, non-transferable, must be used within the validity period, and cannot be shared between clients.</p>
        <h4>Cancellation & No-Show</h4>
        <p>24 hours' notice required for cancellations. Deposits are non-refundable and non-transferable. No-shows forfeit their deposit.</p>
        <h4>Aftercare</h4>
        <p>Following treatment, clients may be advised to increase water intake, engage in light physical activity, follow dietary guidelines, and avoid excessive alcohol consumption.</p>
      `
    },
    'Weight Loss & Lipo Shots': {
      title: 'Weight Loss & Lipo Shots Policy',
      html: `
        <h4>Important Disclaimer</h4>
        <p>Our services support body contouring, inch loss, and wellness goals. <strong>We do not guarantee weight loss results.</strong> Results vary based on diet, exercise, hydration, hormonal factors, medical conditions, and individual body composition. Our services are not intended to diagnose, treat, cure, or prevent any disease.</p>
        <h4>Medical Supervision</h4>
        <p>Any injectable weight loss treatments, prescription medications, laboratory testing, or medical consultations are provided solely under the supervision and authority of a licensed medical practitioner. Luna's Esthetics does not independently prescribe medications. Medical eligibility is determined by the supervising healthcare provider.</p>
        <h4>Contraindications</h4>
        <ul>
          <li>Pregnancy, active cancer, severe liver or kidney disease, uncontrolled diabetes</li>
          <li>Active infections, deep vein thrombosis (DVT), pacemakers or certain implanted electronic devices</li>
          <li>Recent major surgery, uncontrolled hypertension, certain cardiovascular conditions</li>
        </ul>
        <h4>Consultation Requirement</h4>
        <p>Clients must disclose all medical history, current medications, previous surgeries, pregnancy status, existing conditions, implanted devices, and any weight loss medications or injections in use.</p>
        <h4>Client Responsibilities</h4>
        <p>Clients agree to: maintain adequate hydration, follow dietary guidelines, engage in regular physical activity where appropriate, attend sessions consistently, and follow all pre- and post-treatment instructions.</p>
        <h4>Cancellation & No-Show</h4>
        <p>24 hours' notice required for cancellations. Deposits are non-refundable. No-shows forfeit their deposit; future bookings may require full prepayment.</p>
        <h4>Results Disclaimer</h4>
        <p>Luna's Esthetics makes no guarantee regarding weight loss amounts, inches lost, timeframe, or duration of results. Marketing photos and testimonials are examples only and do not guarantee similar outcomes.</p>
      `
    },
    'Advanced Facials': {
      title: 'Advanced Facial Treatments Policy',
      html: `
        <h4>Consultation Requirement</h4>
        <p>A consultation and skin assessment may be required before treatment. Clients must disclose: medical conditions, allergies, pregnancy or breastfeeding, current medications, recent cosmetic procedures, skin sensitivities, prescription skincare products, and history of cold sores.</p>
        <h4>Contraindications</h4>
        <p>Treatment may not be performed if you have: active skin infections, open wounds, sunburn, active cold sores, severe eczema or psoriasis flare-ups, recent facial surgery, recent cosmetic injectables without clearance, certain autoimmune conditions, or uncontrolled diabetes affecting wound healing.</p>
        <h4>Retinol & Active Products</h4>
        <p>Please inform your practitioner if you use retinol, retinoids, tretinoin, Accutane, glycolic acid, salicylic acid, benzoyl peroxide, or prescription acne medications. Treatment may need to be postponed or modified.</p>
        <h4>Pregnancy & Breastfeeding</h4>
        <p>Certain treatments may not be suitable during pregnancy or breastfeeding. Please notify your practitioner so treatment options can be adjusted accordingly.</p>
        <h4>Pre-Treatment (5–7 days before)</h4>
        <p>Avoid: excessive sun exposure, tanning beds, waxing on the treatment area, aggressive exfoliation, chemical peels, and new potentially irritating skincare products.</p>
        <h4>Expected Reactions</h4>
        <p>Normal reactions may include redness, dryness, flaking, mild swelling, tightness, temporary sensitivity, and temporary breakouts (purging). These are generally temporary and part of the skin renewal process.</p>
        <h4>Aftercare (24–72 hrs)</h4>
        <p><strong>Avoid:</strong> direct sun, excessive heat, saunas, steam rooms, swimming pools, intense exercise, harsh skincare, and picking or scratching the skin. <strong>Daily:</strong> wear SPF 30–50 and keep skin moisturised. Do not manually remove peeling skin after chemical peels or microneedling.</p>
        <h4>Cancellation & No-Show</h4>
        <p>24 hours' notice required for cancellations. Deposits are non-refundable. No-shows forfeit their deposit.</p>
        <h4>Photography Consent</h4>
        <p>Clinical photographs may be taken before and after treatment for progress tracking. Photos remain confidential unless separate written consent is provided for marketing or educational purposes.</p>
        <h4>Refund Policy</h4>
        <p>All facial treatments are non-refundable. Individual skin responses vary and results cannot be guaranteed.</p>
      `
    },
    'Luxury Spa Packages': {
      title: 'Luxury Spa Package Policy',
      html: `
        <h4>Booking Policy</h4>
        <p>A deposit is required to secure all spa package reservations. Spa packages must be booked in advance. Same-day appointments are subject to availability.</p>
        <h4>Arrival Policy</h4>
        <p>Clients are encouraged to arrive 15 minutes early. Late arrivals may result in shortened treatment times without a reduction in price.</p>
        <h4>Food & Beverage Policy</h4>
        <p>Clients must disclose food allergies or dietary restrictions before their appointment. Luna's Esthetics & Academy Ltd. is not responsible for allergic reactions resulting from undisclosed allergies.</p>
        <h4>Cancellation Policy</h4>
        <p>48 hours' notice is required for cancellations or rescheduling. Deposits are non-refundable and non-transferable.</p>
        <h4>Conduct Policy</h4>
        <p>Respectful behaviour toward staff and other guests is required at all times. Inappropriate conduct will result in immediate termination of services.</p>
        <h4>Refund Policy</h4>
        <p>Spa packages are non-refundable once booked. Gift certificates and promotional packages are non-refundable.</p>
      `
    },
    'Spa Packages': {
      title: 'Luxury Spa Package Policy',
      html: `
        <h4>Booking Policy</h4>
        <p>A deposit is required to secure all spa package reservations. Spa packages must be booked in advance. Same-day appointments are subject to availability.</p>
        <h4>Arrival Policy</h4>
        <p>Clients are encouraged to arrive 15 minutes early. Late arrivals may result in shortened treatment times without a reduction in price.</p>
        <h4>Food & Beverage Policy</h4>
        <p>Clients must disclose food allergies or dietary restrictions before their appointment. Luna's Esthetics & Academy Ltd. is not responsible for allergic reactions resulting from undisclosed allergies.</p>
        <h4>Cancellation Policy</h4>
        <p>48 hours' notice is required for cancellations or rescheduling. Deposits are non-refundable and non-transferable.</p>
        <h4>Conduct Policy</h4>
        <p>Respectful behaviour toward staff and other guests is required at all times. Inappropriate conduct will result in immediate termination of services.</p>
        <h4>Refund Policy</h4>
        <p>Spa packages are non-refundable once booked. Gift certificates and promotional packages are non-refundable.</p>
      `
    },
    'Pedicures': {
      title: 'Pedicure Service Policy',
      html: `
        <h4>Health & Safety</h4>
        <p>Pedicure services may be refused if you have: open wounds, active fungal infections, severe athlete's foot, unexplained skin conditions, or active infections affecting the feet. Clients with diabetes, circulatory disorders, or other medical concerns should inform their practitioner before treatment.</p>
        <h4>Nail Conditions</h4>
        <p>We do not diagnose nail diseases or medical conditions. Clients requiring medical evaluation may be referred to a healthcare provider.</p>
        <h4>Gel Polish Removal</h4>
        <p>Removal of product applied by another salon may incur an additional fee.</p>
        <h4>Service Guarantee</h4>
        <p>Traditional polish concerns must be reported within 48 hours. Gel polish concerns must be reported within 5 days.</p>
        <h4>Cancellation Policy</h4>
        <p>24 hours' notice is required for cancellations or rescheduling. Deposits are non-refundable.</p>
        <h4>Refund Policy</h4>
        <p>Pedicure services are non-refundable.</p>
      `
    },
    'Eyebrow Services': {
      title: 'Eyebrow Tint & Lamination Policy',
      html: `
        <h4>Patch Testing</h4>
        <p>A patch test is required at least 24–48 hours before your first appointment, if you have not received the service within the last 6 months, or if there have been changes to your medical history.</p>
        <h4>Contraindications</h4>
        <p>Treatment may not be performed if you have: active eye infections, conjunctivitis, open cuts around the brow area, severe skin irritation, or recent eye surgery without medical clearance.</p>
        <h4>Results Disclaimer</h4>
        <p>Results vary based on hair texture, existing brow condition, skin type, and home care.</p>
        <h4>Aftercare (24 hours)</h4>
        <p>Avoid water on the brows, steam, saunas, excessive sweating, oils, and makeup on the brow area for 24 hours after treatment.</p>
        <h4>Cancellation Policy</h4>
        <p>24 hours' notice is required for cancellations or rescheduling. Deposits are non-refundable.</p>
        <h4>Refund Policy</h4>
        <p>All brow services are non-refundable.</p>
      `
    },
    'Intimate Brightening': {
      title: 'Intimate Brightening Treatment Policy',
      html: `
        <h4>About This Treatment</h4>
        <p>Intimate brightening treatments are cosmetic procedures designed to improve the appearance of pigmentation in intimate areas including: bikini line, Brazilian area, inner thighs, underarms, buttocks, and anal area.</p>
        <h4>Consultation Requirement</h4>
        <p>Clients must disclose: pregnancy status, current medications, skin conditions, allergies, and previous reactions to skincare products.</p>
        <h4>Contraindications</h4>
        <p>Treatment may not be performed if you have: active infections, open wounds, active herpes outbreaks, recent waxing irritation, severe skin inflammation, or recent chemical peels in the treatment area.</p>
        <h4>Expectations</h4>
        <p>Multiple sessions are required. Results vary between individuals. Complete lightening cannot be guaranteed. Hormonal factors may affect outcomes. Factors affecting results include hormones, friction, shaving habits, medical conditions, and genetics.</p>
        <h4>Aftercare (48–72 hrs)</h4>
        <p>Avoid: sexual activity, swimming, hot tubs, excessive sweating, fragranced products, and harsh exfoliation.</p>
        <h4>Professional Conduct</h4>
        <p>All intimate services are performed professionally for cosmetic purposes only. Any inappropriate comments, requests, gestures, or behaviour will result in <strong>immediate termination of services and refusal of future appointments.</strong></p>
        <h4>Cancellation Policy</h4>
        <p>24 hours' notice is required for cancellations. Deposits are non-refundable.</p>
        <h4>Refund Policy</h4>
        <p>All intimate brightening treatments are non-refundable.</p>
      `
    },
  };

  // Default fallback policy for any unmapped category
  const DEFAULT_POLICY = {
    title: 'Booking Policy & Consent',
    html: `
      <h4>General Policies</h4>
      <p>By proceeding with this booking you confirm that you have disclosed all relevant medical information and understand that results vary between individuals.</p>
      <h4>Cancellation Policy</h4>
      <p>A minimum of 24 hours' notice is required to cancel or reschedule. Deposits are non-refundable and non-transferable.</p>
      <h4>No-Show Policy</h4>
      <p>Clients who fail to attend without notice may forfeit their deposit. Repeated no-shows may require full prepayment for future bookings.</p>
      <h4>Refund Policy</h4>
      <p>Due to the nature of personal care services, all services are final sale. No refunds will be issued for completed treatments.</p>
      <h4>Right to Refuse Service</h4>
      <p>Luna's Esthetics & Academy Ltd. reserves the right to refuse or discontinue services if contraindications are present, health and safety standards cannot be maintained, or professional boundaries are violated.</p>
    `
  };

  window.showConsentModal = function (category, onConfirm) {
    const modal     = document.getElementById('consentModal');
    const titleEl   = document.getElementById('consentTitle');
    const bodyEl    = document.getElementById('consentBody');
    const check     = document.getElementById('consentCheck');
    const confirmBtn = document.getElementById('consentConfirm');
    const backBtn   = document.getElementById('consentBack');
    if (!modal) { onConfirm(); return; }

    const policy = POLICIES[category] || DEFAULT_POLICY;
    titleEl.textContent = policy.title;
    bodyEl.innerHTML = policy.html;

    // Reset state
    check.checked = false;
    confirmBtn.disabled = true;
    bodyEl.scrollTop = 0;
    modal.classList.add('open');
    lockScroll();

    // Enable confirm only when checkbox ticked
    const onCheck = () => { confirmBtn.disabled = !check.checked; };
    check.addEventListener('change', onCheck);

    function closeModal() {
      modal.classList.remove('open');
      unlockScroll();
      check.removeEventListener('change', onCheck);
    }

    backBtn.onclick = closeModal;

    confirmBtn.onclick = () => {
      if (!check.checked) return;
      closeModal();
      onConfirm();
    };
  };
})();


/* ── iCal / Add to Calendar ── */
function downloadICS(booking) {
  const dp = (booking.date || '').split('-');
  if (dp.length < 3) return;
  const rawTime = booking.time || '10:00 AM';
  const isPM = /pm/i.test(rawTime);
  const isAM = /am/i.test(rawTime);
  const timePart = rawTime.replace(/[apm\s]/gi, '').trim();
  const [hRaw, mRaw] = timePart.split(':');
  let h = parseInt(hRaw, 10);
  const m = parseInt(mRaw || '0', 10);
  if (isPM && h !== 12) h += 12;
  if (isAM && h === 12) h = 0;
  const pad = n => String(n).padStart(2, '0');
  const dtStart = `${dp[0]}${dp[1]}${dp[2]}T${pad(h)}${pad(m)}00`;
  const dtEnd   = `${dp[0]}${dp[1]}${dp[2]}T${pad(h + 1)}${pad(m)}00`;
  const stamp   = new Date().toISOString().replace(/[-:.]/g,'').slice(0,15) + 'Z';
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lunas Esthetics//Booking//EN',
    'BEGIN:VEVENT',
    `UID:booking-${Date.now()}@lunas-esthetics.tt`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${(booking.service || 'Appointment')} @ Luna's Esthetics`,
    `DESCRIPTION:Appointment at Luna's Esthetics & Academy Ltd.\\nLp#19 Xavier Street\\, Chaguanas\\, Trinidad.\\nCall: 1(868) 463-9306`,
    `LOCATION:Lp#19 Xavier Street\\, Chaguanas\\, Trinidad`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  a.download = 'lunas-booking.ics';
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ── Export Bookings to CSV ── */
function exportBookingsCSV() {
  const bookings = getDB('lunas_bookings');
  if (!bookings.length) { alert('No bookings to export.'); return; }
  const cols = ['ID','Name','Phone','Email','Service','Category','Price','Date','Time','Status','Notes','Cancel Reason'];
  const rows = bookings.map(b => [
    b.id, b.name, b.phone, b.email || '',
    b.service, b.category || '', b.price,
    b.date, b.time, b.status,
    (b.notes || '').replace(/"/g, '""'),
    (b.cancelReason || '').replace(/"/g, '""')
  ].map(v => `"${v ?? ''}"`).join(','));
  const csv = [cols.join(','), ...rows].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `lunas-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ── Data Backup & Restore ── */
function exportAllData() {
  const keys = ['lunas_bookings','lunas_clients','lunas_inventory','lunas_services','lunas_courses'];
  const data = { _exported: new Date().toISOString(), _version: '1' };
  keys.forEach(k => {
    const raw = localStorage.getItem(k);
    data[k] = raw ? JSON.parse(raw) : (k === 'lunas_services' ? null : []);
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = `lunas-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importAllData(file) {
  if (!file) return;
  const msgEl = document.getElementById('restoreMsg');
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      const _restoreFsKeys = { 'lunas_bookings': 'bookings', 'lunas_clients': 'clients', 'lunas_inventory': 'inventory', 'lunas_services': 'services', 'lunas_courses': 'courses' };
      const keys = Object.keys(_restoreFsKeys);
      let count = 0;
      keys.forEach(k => {
        if (data[k] !== undefined) {
          localStorage.setItem(k, JSON.stringify(data[k]));
          _fsSet(_restoreFsKeys[k], data[k]);
          count++;
        }
      });
      if (msgEl) {
        msgEl.textContent = `Restored ${count} data set${count !== 1 ? 's' : ''} successfully. Syncing to cloud... Refreshing.`;
        msgEl.style.cssText = 'display:block;background:#DCFCE7;color:#15803D;padding:0.75rem 1rem;border-radius:6px;font-size:0.85rem;font-weight:600;margin-top:1rem;';
      }
      setTimeout(() => location.reload(), 2000);
    } catch(err) {
      if (msgEl) {
        msgEl.textContent = 'Invalid backup file. Please use a file exported from this admin.';
        msgEl.style.cssText = 'display:block;background:#FEE2E2;color:#DC2626;padding:0.75rem 1rem;border-radius:6px;font-size:0.85rem;font-weight:600;margin-top:1rem;';
      }
    }
  };
  reader.readAsText(file);
}

/* ── Admin Settings Panel ── */
function initSettings() {
  const pwForm = document.getElementById('changePwForm');
  if (pwForm && !pwForm._bound) {
    pwForm._bound = true;
    pwForm.addEventListener('submit', async e => {
      e.preventDefault();
      const msgEl   = document.getElementById('cpwMsg');
      const current = document.getElementById('cpwCurrent').value;
      const newPw   = document.getElementById('cpwNew').value;
      const confirm = document.getElementById('cpwConfirm').value;
      function showMsg(text, ok) {
        msgEl.textContent = text;
        msgEl.style.cssText = `display:block;padding:0.75rem 1rem;border-radius:6px;font-size:0.85rem;font-weight:600;background:${ok ? '#DCFCE7' : '#FEE2E2'};color:${ok ? '#15803D' : '#DC2626'};`;
      }
      if (newPw !== confirm) { showMsg('New passwords do not match.', false); return; }
      if (newPw.length < 8)  { showMsg('New password must be at least 8 characters.', false); return; }
      const currentHash = await hashPw(current);
      if (currentHash !== getAdminHash()) { showMsg('Current password is incorrect.', false); return; }
      localStorage.setItem('lunas_pw_hash', await hashPw(newPw));
      showMsg('Password updated successfully!', true);
      pwForm.reset();
      setTimeout(() => { msgEl.style.display = 'none'; }, 4000);
    });
  }
  const backupBtn = document.getElementById('backupBtn');
  if (backupBtn && !backupBtn._bound) {
    backupBtn._bound = true;
    backupBtn.addEventListener('click', exportAllData);
  }
  const restoreInput = document.getElementById('restoreInput');
  if (restoreInput && !restoreInput._bound) {
    restoreInput._bound = true;
    restoreInput.addEventListener('change', e => importAllData(e.target.files[0]));
  }
}


/* ── Cookie Notice ── */
(function() {
  if (/admin/i.test(window.location.pathname)) return;
  if (localStorage.getItem('lunas_cookie_ok')) return;
  const bar = document.createElement('div');
  bar.className = 'cookie-bar';
  bar.innerHTML = "<p>Luna\'s Esthetics uses cookies to improve your browsing experience. By continuing to use this site, you accept our use of cookies.</p><button class=\"cookie-bar-btn\" id=\"cookieAccept\">Got It</button>";
  document.body.appendChild(bar);
  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('lunas_cookie_ok', '1');
    bar.remove();
  });
})();
