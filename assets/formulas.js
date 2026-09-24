// Keep formula navigation separate from the hash used by shared settings.
document.querySelector('.formula-guide')?.addEventListener('click', event => {
  const link = event.target.closest('a[data-formula-target]');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const target = document.getElementById(link.dataset.formulaTarget);
  if (!target) return;
  event.preventDefault();
  const details = target.closest('details');
  if (details) details.open = true;
  target.focus({preventScroll:true});
  target.scrollIntoView({
    behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block:'start'
  });
});
