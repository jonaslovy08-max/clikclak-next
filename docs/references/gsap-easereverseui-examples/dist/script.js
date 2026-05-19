const erToggle = document.querySelector('#erToggle');
const exitSlider = document.querySelector('#exitSlider');
const exitVal = document.querySelector('#exitVal');
let exitTs = 2.5;

exitSlider.addEventListener('input', () => {
  exitTs = parseFloat(exitSlider.value);
  exitVal.textContent = exitTs + '×';
});

function er(val) {
  return erToggle.checked ? (val || true) : false;
}

// ══════════════════════════════════════
// Button — big elastic scale
// ══════════════════════════════════════
let btnTl;
function initBtn() {
  if (btnTl) { btnTl.kill(); }
  gsap.set('#hoverBtn', { clearProps: 'all' });

  btnTl = gsap.timeline({ paused: true })
    .to('#hoverBtn', {
      scale: 1.35, duration: 1.2,
      ease: 'elastic.out(1.2, 0.3)',
      easeReverse: er('power2.out')
    }, 0);
}
initBtn();

document.querySelector('#hoverBtn').addEventListener('mouseenter', () => {
  btnTl.timeScale(1).play();
});
document.querySelector('#hoverBtn').addEventListener('mouseleave', () => {
  btnTl.timeScale(erToggle.checked ? exitTs : 1).reverse();
});

// ══════════════════════════════════════
// Dropdown — elastic panel, elastic arrow, stagger
// ══════════════════════════════════════
let ddOpen = false;
let ddTl;
const ddMenu = document.querySelector('#dropdownMenu');
const ddTrigger = document.querySelector('#dropdownTrigger');
const ddArrow = document.querySelector('.dd-arrow');

function initDD() {
  if (ddTl) { ddTl.kill(); }
  gsap.set(ddMenu, { autoAlpha: 0, yPercent: -30, scale: 0.7 });
  gsap.set(ddArrow, { rotation: 0 });
  gsap.set('.dropdown-item', { opacity: 1, x: 0 });
  ddMenu.classList.remove('open');
  ddOpen = false;

  ddTl = gsap.timeline({ paused: true })
    .to(ddArrow, {
      rotation: 180, duration: 0.9,
      ease: 'elastic.out(1.2, 0.3)',
      easeReverse: er('power2.inOut')
    }, 0)
    .to(ddMenu, {
      autoAlpha: 1, yPercent: 0, scale: 1, duration: 1,
      ease: 'elastic.out(1.2, 0.3)',
      easeReverse: er('power3.out')
    }, 0)
    .from('.dropdown-item', {
      opacity: 0, x: -20, duration: 0.5,
      ease: 'back.out(3)',
      easeReverse: er('power2.out'),
      stagger: 0.07
    }, 0.1);
}
initDD();

ddTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  ddOpen = !ddOpen;
  if (ddOpen) {
    ddMenu.classList.add('open');
    ddTl.timeScale(1).play();
  } else {
    ddTl.eventCallback('onReverseComplete', () => ddMenu.classList.remove('open'));
    ddTl.timeScale(erToggle.checked ? exitTs : 1).reverse();
  }
});
document.addEventListener('click', () => {
  if (ddOpen) {
    ddOpen = false;
    ddTl.eventCallback('onReverseComplete', () => ddMenu.classList.remove('open'));
    ddTl.timeScale(erToggle.checked ? exitTs : 1).reverse();
  }
});

// ══════════════════════════════════════
// Tooltip — elastic pop, circle pulse
// ══════════════════════════════════════
let tipTl;
const tipBubble = document.querySelector('#tooltipBubble');
const tipWrap = document.querySelector('#tooltipWrap');
const tipTarget = document.querySelector('.tooltip-target');

function initTip() {
  if (tipTl) { tipTl.kill(); }
  gsap.set(tipBubble, { autoAlpha: 0, y: 14, scale: 0.4 });
  gsap.set(tipTarget, { scale: 1 });

  tipTl = gsap.timeline({ paused: true })
    .to(tipBubble, {
      autoAlpha: 1, y: 0, scale: 1, duration: 1,
      ease: 'elastic.out(1.2, 0.3)',
      easeReverse: er('power3.in')
    }, 0)
    .to(tipTarget, {
      scale: 1.3, duration: 0.8,
      ease: 'elastic.out(1.2, 0.3)',
      easeReverse: er('power3.in')
    }, 0);
}
initTip();

tipWrap.addEventListener('mouseenter', () => {
  tipTl.timeScale(1).play();
});
tipWrap.addEventListener('mouseleave', () => {
  tipTl.timeScale(erToggle.checked ? exitTs : 1).reverse();
});

// ══════════════════════════════════════
// Reinit on toggle
// ══════════════════════════════════════
erToggle.addEventListener('change', () => {
  initBtn();
  initDD();
  initTip();
});