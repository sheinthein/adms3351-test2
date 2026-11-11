// Exponential smoothing lab: change alpha and the demand pattern, watch MAD and the tracking signal.
(() => {
  const lab = document.getElementById('forecast-lab');
  if (!lab) return;
  const patterns = {
    trend: { sales: [48, 52, 56, 60, 64, 68, 72, 76], first: 40 },
    steady: { sales: [50, 46, 53, 47, 52, 45, 54, 49], first: 50 }
  };
  const slider = lab.querySelector('input[type=range]');
  const toggles = [...lab.querySelectorAll('[data-pattern]')];
  const chart = lab.querySelector('[data-chart]');
  const out = name => lab.querySelector(`[data-out="${name}"]`);
  const marker = lab.querySelector('.marker');
  const verdict = lab.querySelector('.lab-verdict');
  const ns = 'http://www.w3.org/2000/svg';
  let pattern = 'trend';

  function make(tag, attributes, text) {
    const node = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function render() {
    const alpha = Number(slider.value);
    const { sales, first } = patterns[pattern];
    const forecasts = [first];
    for (let week = 1; week < sales.length; week++) {
      forecasts.push(forecasts[week - 1] + alpha * (sales[week - 1] - forecasts[week - 1]));
    }
    const errors = sales.map((actual, week) => actual - forecasts[week]);
    const sum = errors.reduce((total, error) => total + error, 0);
    const mad = errors.reduce((total, error) => total + Math.abs(error), 0) / errors.length;
    const signal = mad === 0 ? 0 : sum / mad;

    const low = Math.min(...sales, ...forecasts) - 4;
    const high = Math.max(...sales, ...forecasts) + 4;
    const x = week => 56 + week * 76;
    const y = value => 232 - (value - low) / (high - low) * 204;
    const points = values => values.map((value, week) => `${x(week)},${y(value).toFixed(1)}`).join(' ');

    chart.replaceChildren(
      make('path', { class: 'axis', d: 'M40 20V232H620' }),
      ...sales.map((_, week) => make('text', { class: 'tick', x: x(week), y: 252, 'text-anchor': 'middle' }, `Wk ${week + 1}`)),
      ...errors.map((error, week) => make('line', {
        x1: x(week), x2: x(week), y1: y(sales[week]), y2: y(forecasts[week]),
        stroke: '#ff9e8f', 'stroke-width': 2, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round'
      })),
      make('polyline', { points: points(sales), fill: 'none', stroke: '#ffe17d', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
      make('polyline', { points: points(forecasts), fill: 'none', stroke: '#91e7e5', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
      ...sales.map((value, week) => make('circle', { cx: x(week), cy: y(value), r: 5, fill: '#ffe17d' })),
      ...forecasts.map((value, week) => make('circle', { cx: x(week), cy: y(value), r: 5, fill: '#91e7e5' })),
      make('text', { x: 612, y: y(sales.at(-1)) - 10, 'text-anchor': 'end', 'font-size': 17, style: 'fill:#ffe17d' }, 'sales'),
      make('text', { x: 612, y: y(forecasts.at(-1)) + 24, 'text-anchor': 'end', 'font-size': 17, style: 'fill:#91e7e5' }, 'forecast')
    );
    chart.setAttribute('aria-label', `Sales and forecast over eight weeks with alpha ${alpha.toFixed(1)}. MAD ${mad.toFixed(2)}, tracking signal ${signal.toFixed(2)}.`);

    const signed = value => (value > 0 ? '+' : value < 0 ? '−' : '') + Math.abs(value).toFixed(2);
    out('alpha').textContent = alpha.toFixed(1);
    out('mad').textContent = mad.toFixed(2);
    out('sum').textContent = signed(sum);
    out('signal').textContent = signed(signal);
    const outside = Math.abs(signal) > 4;
    marker.style.left = `${(Math.max(-6, Math.min(6, signal)) + 6) / 12 * 100}%`;
    marker.classList.toggle('is-out', outside);
    verdict.dataset.state = outside ? 'bad' : 'good';
    verdict.textContent = outside
      ? pattern === 'trend'
        ? 'Out of bounds. A higher alpha shrinks each error, but every error is still positive. The bias needs a trend model.'
        : 'Out of bounds. The errors lean one way.'
      : 'In control. The errors fall on both sides, so they cancel out.';
  }

  slider.addEventListener('input', render);
  toggles.forEach(toggle => toggle.addEventListener('click', () => {
    pattern = toggle.dataset.pattern;
    toggles.forEach(other => other.setAttribute('aria-pressed', String(other === toggle)));
    render();
  }));
  render();
})();
