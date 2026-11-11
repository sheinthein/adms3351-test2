(() => {
  const board = document.getElementById('snack-queue-storyboard');
  const play = board.querySelector('[data-play]');
  const step = board.querySelector('[data-step]');
  const replay = board.querySelector('[data-replay]');
  const scenes = [...board.querySelectorAll('[data-scene]')];
  const clock = board.querySelector('[data-clock]');
  const kind = board.querySelector('[data-kind]');
  const note = board.querySelector('[data-note]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const lanes = [...board.querySelectorAll('[data-lane]')].map((lane, index) => ({
    sketch: lane.querySelector('.lane-drawing'),
    status: lane.querySelector('[data-status]'),
    result: lane.querySelector('.result'),
    counter: lane.querySelector('.counter path'),
    customerA: lane.querySelector('[data-person=a]'),
    customerB: lane.querySelector('[data-person=b]'),
    serviceEnd: index === 0 ? 6 : 4
  }));
  const frames = [
    { minute: 0, scene: 0, statuses: ['A starts a 6-minute transaction.', 'A starts a 4-minute transaction.'], note: 'Think of a coffee shop. A custom order can take longer than a standard pickup.' },
    { minute: 3, scene: 1, statuses: ['B arrives. A is still at the teller.', 'B arrives. A is still at the machine.'], note: 'Both copies of customer B arrive at minute 3. Start the two wait clocks.' },
    { minute: 4, scene: 2, statuses: ['B has waited 1 min and is still in line.', 'B starts service after a 1 min wait.'], note: 'The machine is free. The teller still has two minutes left with A.' },
    { minute: 6, scene: 2, statuses: ['B starts service after a 3 min wait.', 'B is already 2 min into service.'], note: 'B waited 3 minutes with the teller and 1 minute with the machine in this example.' },
    { scene: 4, note: 'The worksheet models give the long-run averages. The four-minute average service time is the same in both.' }
  ];
  const lastFrame = frames.length - 1;
  const lineOffsets = [0, 0.95, 2.05];
  let current = 0;
  let playing = false;
  let timeline;

  function updateControls() {
    const finished = current === lastFrame && (!timeline || timeline.progress() === 1);
    play.textContent = playing ? 'Pause' : finished ? 'Play again' : 'Play';
    step.disabled = current === lastFrame;
  }

  function setCustomers(lane, minute) {
    const serviceComplete = minute >= lane.serviceEnd;
    gsap.set(lane.customerA, { left: serviceComplete ? '94%' : '61%', opacity: serviceComplete ? 0 : 1 });
    gsap.set(lane.customerB, { left: serviceComplete ? '61%' : minute > 0 ? '32%' : '12%', opacity: minute > 0 ? 1 : 0 });
  }

  function trace(paths, at, duration, stagger = 0) {
    gsap.set(paths, { strokeDasharray: 100, strokeDashoffset: 100 });
    timeline.to(paths, { strokeDashoffset: 0, duration, stagger, ease: 'none' }, at);
  }

  function animateLane(lane, minute) {
    const previousMinute = frames[Math.max(0, current - 1)].minute;
    setCustomers(lane, previousMinute);
    if (minute === 0) {
      trace(lane.counter, 0, 0.95);
      trace(lane.customerA.querySelector('path'), 0.3, 0.7);
    } else if (minute === 3) {
      timeline.to(lane.customerB, { left: '32%', opacity: 1, duration: 0.68, ease: 'power2.out' }, 0);
      trace(lane.customerB.querySelector('path'), 0, 0.65);
    } else if (previousMinute < lane.serviceEnd && minute >= lane.serviceEnd) {
      timeline.to(lane.customerA, { left: '94%', opacity: 0, duration: 0.5, ease: 'power1.in' }, 0);
      timeline.to(lane.customerB, { left: '61%', duration: 0.64, ease: 'power2.out' }, 0.12);
    }
  }

  function showFrame(index, animate = true) {
    timeline?.kill();
    timeline = null;
    current = index;
    const frame = frames[current];
    const results = current === lastFrame;
    clock.textContent = results ? 'Compare the two models' : 'Minute ' + frame.minute;
    kind.textContent = results ? 'Worksheet calculation' : 'Illustrated example';
    note.textContent = frame.note;
    scenes.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.scene) === frame.scene)));

    if (animate) {
      timeline = gsap.timeline({ paused: true, onComplete: finishFrame });
      timeline.to({}, { duration: results ? 3.25 : 2.5 }, 0);
    }

    for (const lane of lanes) {
      lane.sketch.hidden = results;
      lane.status.hidden = results;
      lane.result.hidden = !results;
      gsap.set(lane.sketch.querySelectorAll('path'), { strokeDashoffset: 0 });

      if (results) {
        const rows = lane.result.querySelectorAll('.equation');
        const bar = lane.result.querySelector('.wait-bar');
        gsap.set(lane.result.querySelectorAll('.equation path'), { strokeDashoffset: 0 });
        gsap.set(bar, { scaleX: 1 });
        if (animate && !reducedMotion.matches) {
          rows.forEach((row, rowIndex) => trace(row.querySelectorAll('path'), lineOffsets[rowIndex], 0.23, 0.043));
          gsap.set(bar, { scaleX: 0 });
          timeline.to(bar, { scaleX: 1, duration: 0.62, ease: 'power2.out' }, 2.55);
        }
      } else {
        lane.status.textContent = frame.statuses[lanes.indexOf(lane)];
        if (animate && !reducedMotion.matches) animateLane(lane, frame.minute);
        else setCustomers(lane, frame.minute);
      }
    }

    updateControls();
    timeline?.play();
  }

  function finishFrame() {
    if (playing && current < lastFrame) {
      showFrame(current + 1);
      return;
    }
    playing = false;
    updateControls();
  }

  play.addEventListener('click', () => {
    if (playing) {
      playing = false;
      timeline.pause();
      updateControls();
      return;
    }

    playing = true;
    if (!timeline || (current === lastFrame && timeline.progress() === 1)) showFrame(0);
    else if (timeline.progress() === 1) showFrame(current + 1);
    else {
      timeline.resume();
      updateControls();
    }
  });

  step.addEventListener('click', () => {
    playing = false;
    showFrame(Math.min(current + 1, lastFrame));
  });

  replay.addEventListener('click', () => {
    playing = true;
    showFrame(0);
  });

  scenes.forEach(button => button.addEventListener('click', () => {
    playing = false;
    showFrame(Number(button.dataset.scene));
  }));

  showFrame(0, false);
})();
