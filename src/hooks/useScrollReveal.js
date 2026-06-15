import { useEffect } from 'react';

const useScrollReveal = () => {
  useEffect(() => {
    const observed = new Set();

    const animateCount = (el) => {
      const target = +el.dataset.target;
      const duration = 1800;
      const start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !observed.has(e.target)) {
          observed.add(e.target);
          setTimeout(() => {
            e.target.classList.add('visible');
            e.target.querySelectorAll('.hero-bar-fill').forEach((b) => b.classList.add('animate'));
            e.target.querySelectorAll('.count-num').forEach((c) => animateCount(c));
          }, 80);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document
      .querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale,.stagger-children')
      .forEach((el) => io.observe(el));

    setTimeout(() => {
      document.querySelectorAll('.hero-bar-fill').forEach((b) => b.classList.add('animate'));
    }, 1500);

    return () => io.disconnect();
  }, []);
};

export default useScrollReveal;
