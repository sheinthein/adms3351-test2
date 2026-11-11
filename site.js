// Entrance reveals and self-check questions shared by every page.
document.documentElement.classList.add('js');

(() => {
  const items = [...document.querySelectorAll('.reveal')];
  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(item => observer.observe(item));
})();

for (const quiz of document.querySelectorAll('[data-quiz]')) {
  const options = [...quiz.querySelectorAll('.quiz-options button')];
  const feedback = quiz.querySelector('.quiz-feedback');
  options.forEach(option => option.addEventListener('click', () => {
    options.forEach(other => other.setAttribute('aria-pressed', String(other === option)));
    const correct = option.hasAttribute('data-correct');
    feedback.classList.toggle('is-correct', correct);
    feedback.replaceChildren();
    const verdict = document.createElement('strong');
    verdict.textContent = correct ? 'Correct. ' : 'Not quite. ';
    feedback.append(verdict, option.dataset.why);
  }));
}
