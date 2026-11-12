// The walk from the lecture hall to the board, and back.
// Home page: a GSAP timeline dollies the camera into the board, then the lesson page opens.
// Lesson pages: links marked data-transit erase the board or step back out before navigating.
// A sessionStorage flag tells the next page how it was reached; an inline script in each <head>
// turns that flag into html[data-arrive], which hall.css animates. Without JavaScript, or with
// reduced motion, every link is an ordinary link.
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plainClick = event => !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button);
  const flag = value => { try { sessionStorage.setItem('snack-transit', value); } catch { /* private mode: arrive without motion */ } };
  const hall = document.getElementById('hall');

  if (!hall) {
    const leaving = { wipe: ['leaving-wipe', 220], 'pull-out': ['leaving-hall', 240] };
    for (const link of document.querySelectorAll('a[data-transit]')) {
      link.addEventListener('click', event => {
        const [name, wait] = leaving[link.dataset.transit] || [];
        if (!name || reduced || !plainClick(event) || link.hasAttribute('aria-current')) return;
        event.preventDefault();
        flag(link.dataset.transit);
        root.classList.add(name);
        setTimeout(() => { location.href = link.href; }, wait);
      });
    }
    // Returning with the browser's Back button restores the page as it was left.
    addEventListener('pageshow', event => { if (event.persisted) root.classList.remove('leaving-wipe', 'leaving-hall'); });
    return;
  }

  if (!window.gsap || reduced) {
    delete root.dataset.arrive;
    return;
  }

  const camera = document.getElementById('camera');
  const board = document.getElementById('board');
  const content = document.getElementById('board-content');
  const curtain = document.getElementById('board-curtain');
  const rows = [...hall.querySelectorAll('.row')];
  let timeline;

  function build() {
    const progress = timeline ? timeline.progress() : 0;
    if (timeline) timeline.kill();
    gsap.set([camera, content, curtain, '#vignette'], { clearProps: 'all' });
    gsap.set(rows, { clearProps: 'transform' });
    const room = hall.getBoundingClientRect();
    const box = board.getBoundingClientRect();
    const centreX = box.left - room.left + box.width / 2;
    const centreY = box.top - room.top + box.height / 2;
    const scale = Math.max(room.width / box.width, room.height / box.height) * 1.04;
    gsap.set(camera, { transformOrigin: `${centreX}px ${centreY}px` });
    timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })
      .to(camera, { x: room.width / 2 - centreX, y: room.height / 2 - centreY, scale, duration: 1.7 }, 0)
      .to('#vignette', { opacity: 0, duration: 1.1 }, 0);
    // Nearer tiers travel further and leave sooner, so the hall has depth as you walk down it.
    rows.forEach((row, index) => {
      const near = index / (rows.length - 1);
      timeline.to(row, { y: room.height * (.2 + near * .62), scale: 1.12 + near * .95, duration: 1.55 - near * .5 }, 0);
    });
    timeline
      .to(content, { opacity: 0, duration: .4, ease: 'power1.in' }, .8)
      .to(curtain, { autoAlpha: 1, duration: .45, ease: 'power1.inOut' }, 1.25);
    timeline.progress(progress);
  }

  function pullOut() {
    // Clear the CSS cover first, so the curtain tween records "uncovered" as its start;
    // both happen before the next paint, so nothing flashes.
    delete root.dataset.arrive;
    timeline.progress(1);
    timeline.timeScale(1.35).reverse();
    // If frames stall (a background tab, a slow device), never leave the board curtain over the hall.
    setTimeout(() => { if (timeline.progress() > 0 && !timeline.isActive()) timeline.progress(0); }, 2600);
    setTimeout(() => { if (timeline.progress() > 0) timeline.pause().progress(0); }, 4000);
  }

  for (const link of hall.querySelectorAll('.picks a')) {
    link.addEventListener('click', event => {
      if (!plainClick(event)) return;
      event.preventDefault();
      if (timeline.isActive()) return;
      hall.scrollIntoView({ block: 'nearest' });
      flag('dolly');
      let gone = false;
      const go = () => { if (!gone) { gone = true; location.href = link.href; } };
      timeline.timeScale(1).play().then(go);
      setTimeout(go, 2400); // the link still works if frames stall
    });
  }

  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (!timeline.isActive() && timeline.progress() === 0) build(); }, 120);
  });
  // Back from a lesson with the browser's Back button: the page is restored at the board, so step back out.
  addEventListener('pageshow', event => { if (event.persisted && timeline.progress() > 0) pullOut(); });

  build();
  if (root.dataset.arrive === 'pull-out') {
    pullOut();
  } else {
    delete root.dataset.arrive;
    // Arrival: the house lights come up and the underline is chalked in.
    gsap.fromTo('#lights', { opacity: .7 }, { opacity: 0, duration: 1.1, ease: 'power2.out' });
    gsap.fromTo('.lamps', { opacity: .35 }, { opacity: 1, duration: .5, ease: 'power1.out' });
    gsap.fromTo('#underline', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .6, delay: .45, ease: 'power2.out' });
  }
})();
