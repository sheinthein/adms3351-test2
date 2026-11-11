const chalkGlyphs = {
  W: [23, 'M1 3 5 20 11 9 15 20 21 2'],
  q: [9, 'M7 11C1 8 0 16 4 17Q6 17 7 14M7 10 7 23'],
  '=': [14, 'M2 9 12 8M2 14 12 13'],
  λ: [13, 'M1 3Q4 1 6 8L12 20M7 10 2 20'],
  '÷': [15, 'M7 5 7.5 5M2 11 13 11M7 17 7.5 17'],
  '[': [8, 'M7 2 3 2 2 22 7 22'],
  μ: [13, 'M3 8 2 24M3 11C2 23 10 20 10 10L10 19'],
  '(': [7, 'M6 2Q-1 12 5 22'],
  '−': [14, 'M2 11 12 11'],
  ')': [7, 'M2 2Q9 13 2 22'],
  ']': [8, 'M1 2 6 2 6 22 1 22'],
  '1': [10, 'M1 7 5 3 5 20M2 20 9 20'],
  '2': [13, 'M2 7C2 1 11 1 11 6 11 10 4 14 2 20L12 19'],
  '5': [12, 'M11 3 3 3 2 11C7 7 12 10 11 15 10 20 5 21 2 18'],
  '6': [13, 'M10 3C5 2 2 8 2 14 2 23 13 21 11 14 10 10 6 11 2 14'],
  '0': [13, 'M7 2C0 2 0 20 6 20 13 21 14 2 7 2Z'],
  '8': [13, 'M7 2C0 2 1 8 6 11 12 14 14 20 6 20-2 20 1 14 6 11 13 8 13 2 7 2Z'],
  '×': [13, 'M2 7 11 17M11 7 2 17'],
  m: [16, 'M2 19 2 10M2 14Q7 6 8 13L8 19M8 14Q14 6 14 13L14 19'],
  i: [6, 'M3 10 3 19M3 5 3.3 5'],
  n: [12, 'M2 19 2 10M2 14Q9 5 10 14L10 19'],
  ' ': [7, '']
};

for (const equation of document.querySelectorAll('[data-chalk]')) {
  const namespace = 'http://www.w3.org/2000/svg';
  const drawing = document.createElementNS(namespace, 'svg');
  drawing.setAttribute('aria-hidden', 'true');
  let width = 2;

  for (const letter of equation.dataset.chalk) {
    const [advance, stroke] = chalkGlyphs[letter];
    if (stroke) {
      const path = document.createElementNS(namespace, 'path');
      path.setAttribute('d', stroke);
      path.setAttribute('pathLength', '100');
      path.setAttribute('transform', `translate(${width} ${letter === 'q' ? 4 : 0})`);
      drawing.append(path);
    }
    width += advance + 2;
  }

  drawing.setAttribute('viewBox', `0 0 ${width} 29`);
  drawing.setAttribute('width', width);
  drawing.setAttribute('height', '29');
  equation.append(drawing);
}
