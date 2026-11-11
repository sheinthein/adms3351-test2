// Poster cover, chapter navigation, and chapter progress for the lesson video.
(() => {
  const video = document.getElementById('lesson-video');
  if (!video) return;
  const cover = document.getElementById('video-cover');
  const errorMessage = document.getElementById('video-error');
  const chapters = [...document.querySelectorAll('.chapters [data-start]')];
  const starts = chapters.map(chapter => Number(chapter.dataset.start));
  let active = 0;

  video.hidden = true;
  cover.hidden = false;

  function showError() {
    errorMessage.hidden = false;
  }

  video.addEventListener('error', showError);
  video.querySelector('source').addEventListener('error', showError);
  video.addEventListener('playing', () => { errorMessage.hidden = true; });

  function markCurrent(index) {
    if (index === active) return;
    chapters[active].removeAttribute('aria-current');
    chapters[active].style.removeProperty('--progress');
    chapters[index].setAttribute('aria-current', 'true');
    active = index;
  }

  function startVideo(start, focusPlayer = false) {
    cover.hidden = true;
    video.hidden = false;
    if (start !== undefined) video.currentTime = start;
    if (focusPlayer) video.focus();
    const bounds = video.getBoundingClientRect();
    if (bounds.top < 0 || bounds.bottom > window.innerHeight) {
      video.scrollIntoView({ block: 'nearest' });
    }
    video.play().catch(error => {
      if (error.name !== 'AbortError') showError();
    });
  }

  cover.addEventListener('click', () => startVideo(undefined, true));

  chapters.forEach((chapter, index) => {
    chapter.addEventListener('click', () => {
      markCurrent(index);
      startVideo(starts[index]);
    });
  });

  video.addEventListener('timeupdate', () => {
    const index = Math.max(0, starts.findLastIndex(start => start <= video.currentTime));
    markCurrent(index);
    const end = starts[index + 1] ?? video.duration;
    const progress = (video.currentTime - starts[index]) / (end - starts[index]);
    if (Number.isFinite(progress)) chapters[index].style.setProperty('--progress', Math.min(1, Math.max(0, progress)).toFixed(3));
  });
})();
