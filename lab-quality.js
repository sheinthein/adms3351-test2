// Process capability lab: move the mean and the spread between fixed spec limits.
(() => {
  const lab = document.getElementById('capability-lab');
  if (!lab) return;
  const lsl = 94;
  const usl = 106;
  const mean = lab.querySelector('[data-input="mean"]');
  const sigma = lab.querySelector('[data-input="sigma"]');
  const curve = lab.querySelector('[data-curve]');
  const tails = lab.querySelector('[data-tails]');
  const meanLine = lab.querySelector('[data-mean-line]');
  const out = name => lab.querySelector(`[data-out="${name}"]`);
  const verdict = lab.querySelector('.lab-verdict');
  const chart = lab.querySelector('svg');
  const x = grams => 40 + (grams - 88) * 23.75;
  const base = 232;

  // Standard normal cumulative probability (Abramowitz and Stegun 7.1.26).
  function cdf(z) {
    const t = 1 / (1 + .3275911 * Math.abs(z) / Math.SQRT2);
    const erf = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-z * z / 2);
    return z >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
  }

  function render() {
    const mu = Number(mean.value);
    const sd = Number(sigma.value);
    const height = grams => base - Math.min(205, 150 / sd) * Math.exp(-(((grams - mu) / sd) ** 2) / 2);
    const trace = (from, to) => {
      const steps = [];
      for (let grams = from; grams <= to + 1e-9; grams += .1) steps.push(`${x(grams).toFixed(1)} ${height(grams).toFixed(1)}`);
      return steps;
    };
    curve.setAttribute('d', 'M' + trace(88, 112).join('L'));
    tails.setAttribute('d',
      `M${x(88)} ${base}L${trace(88, lsl).join('L')}L${x(lsl)} ${base}Z` +
      `M${x(usl)} ${base}L${trace(usl, 112).join('L')}L${x(112)} ${base}Z`);
    meanLine.setAttribute('x1', x(mu));
    meanLine.setAttribute('x2', x(mu));

    const cp = (usl - lsl) / (6 * sd);
    const cpk = Math.min(usl - mu, mu - lsl) / (3 * sd);
    const outside = (cdf((lsl - mu) / sd) + 1 - cdf((usl - mu) / sd)) * 100;
    out('mean').textContent = `${mu.toFixed(1)} g`;
    out('sigma').textContent = `${sd.toFixed(1)} g`;
    out('cp').textContent = cp.toFixed(2);
    out('cpk').textContent = cpk.toFixed(2);
    out('outside').textContent = outside < .01 ? '< 0.01%' : `${outside.toFixed(2)}%`;
    chart.setAttribute('aria-label', `Cookie weights with mean ${mu.toFixed(1)} grams and standard deviation ${sd.toFixed(1)} grams between limits of 94 and 106 grams. Cp ${cp.toFixed(2)}, Cpk ${cpk.toFixed(2)}.`);

    if (cpk >= 1.33) {
      verdict.dataset.state = 'good';
      verdict.textContent = 'Capable. The spread fits and the process is centred well enough.';
    } else if (cp >= 1.33) {
      verdict.dataset.state = 'warn';
      verdict.textContent = 'Not capable yet. The spread would fit, so move the mean back toward 100 g.';
    } else {
      verdict.dataset.state = 'bad';
      verdict.textContent = 'Not capable. The spread is too wide for these limits, so centring alone will not fix it.';
    }
  }

  mean.addEventListener('input', render);
  sigma.addEventListener('input', render);
  render();
})();
