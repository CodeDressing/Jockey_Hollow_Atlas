(() => {
  const preference = window.matchMedia('(any-pointer: fine) and (prefers-reduced-motion: no-preference)');
  const listenerOptions = { capture: true, passive: true };
  let disable;

  function enable() {
    const layer = document.createElement('div');
    layer.className = 'atlas-pointer-effects';
    layer.setAttribute('aria-hidden', 'true');

    const follower = document.createElement('div');
    follower.className = 'atlas-pointer-follower';
    follower.hidden = true;
    layer.append(follower);
    document.body.append(layer);

    const listeners = new AbortController();
    const options = { ...listenerOptions, signal: listeners.signal };
    let frame = 0;
    let lastFrame = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let lastPointerType = '';
    let pressX = 0;
    let pressY = 0;
    let dragged = false;

    function hideFollower() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      follower.hidden = true;
    }

    function drawFollower(now) {
      const smoothing = 1 - Math.exp(-(lastFrame ? now - lastFrame : 16) / 38);
      lastFrame = now;
      x += (targetX - x) * smoothing;
      y += (targetY - y) * smoothing;

      if (Math.hypot(targetX - x, targetY - y) < 0.5) {
        x = targetX;
        y = targetY;
        frame = 0;
        lastFrame = 0;
      } else {
        frame = requestAnimationFrame(drawFollower);
      }

      follower.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      follower.hidden = false;
    }

    function moveFollower(event) {
      if (event.pointerType === 'mouse' && (event.buttons & 1) &&
          Math.hypot(event.clientX - pressX, event.clientY - pressY) > 5) {
        dragged = true;
      }

      if (event.pointerType !== 'mouse' || event.buttons ||
          event.target.closest?.('img, canvas, #viewerStage, .glossary-popover, [role="tooltip"]')) {
        hideFollower();
        return;
      }

      targetX = event.clientX;
      targetY = event.clientY;
      if (follower.hidden) {
        x = targetX;
        y = targetY;
      }
      if (!frame) frame = requestAnimationFrame(drawFollower);
    }

    function showRipple(event) {
      // Older browsers expose click as a MouseEvent, without pointerType.
      const pointerType = event.pointerType ?? lastPointerType;
      if (pointerType !== 'mouse' || !event.isTrusted || !event.detail || dragged) return;

      const ripple = document.createElement('div');
      ripple.className = 'atlas-click-ripple';
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      if (layer.childElementCount > 12) follower.nextElementSibling.remove();
      layer.append(ripple);

      const animation = ripple.animate([
        { transform: 'scale(0.22)', opacity: 0.65 },
        { transform: 'scale(1)', opacity: 0 }
      ], {
        duration: 420,
        easing: 'cubic-bezier(0.18, 0.7, 0.32, 1)'
      });
      animation.onfinish = () => ripple.remove();
    }

    window.addEventListener('pointermove', moveFollower, options);
    window.addEventListener('pointerdown', event => {
      lastPointerType = event.pointerType;
      pressX = event.clientX;
      pressY = event.clientY;
      dragged = false;
      hideFollower();
    }, options);
    window.addEventListener('pointerout', event => {
      if (!event.relatedTarget) hideFollower();
    }, options);
    window.addEventListener('pointercancel', hideFollower, options);
    window.addEventListener('blur', hideFollower, options);
    window.addEventListener('keydown', hideFollower, options);
    window.addEventListener('click', showRipple, options);

    return () => {
      listeners.abort();
      hideFollower();
      layer.remove();
    };
  }

  function syncPreference() {
    if (preference.matches) {
      disable ??= enable();
    } else {
      disable?.();
      disable = undefined;
    }
  }

  preference.addEventListener('change', syncPreference);
  syncPreference();
})();
