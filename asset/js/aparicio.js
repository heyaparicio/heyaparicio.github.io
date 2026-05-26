document.addEventListener("DOMContentLoaded", () => {
	  initCursor();
	  initStickyHeader();
	  initRotatingText();
});


/* 1. Cursor */
function initCursor() {
	  const cursor = document.querySelector('#cursor');
	  if (!cursor) return;

	  // Ocultar en touch
	  if (window.matchMedia('(pointer: coarse)').matches) {
	      cursor.style.display = 'none';
	      return;
	  }

	  cursor.style.opacity = '0';
	  let isMagnet = false;

	  document.addEventListener('pointermove', (e) => {
	  const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
	  const last = events[events.length - 1];
	  cursor.style.opacity = '1';
	  cursor.style.setProperty('--cx', `${last.clientX}px`);
	  cursor.style.setProperty('--cy', `${last.clientY}px`);
}, { passive: true });

	  // Efecto click
	  document.addEventListener('pointerdown', () => {
	      cursor.style.setProperty('--scale', isMagnet ? '1.1' : '1.5');
	  });
	  document.addEventListener('pointerup', () => {
	      cursor.style.setProperty('--scale', '1');
	  });

	  // Efecto magnético
	  document.querySelectorAll('.magnetic').forEach((el) => {
	      el.addEventListener('mouseenter', () => {
	          isMagnet = true;
	          cursor.classList.add('magnet');
	          cursor.style.setProperty('--scale', '1');
	      });
	      el.addEventListener('mouseleave', () => {
	          isMagnet = false;
	          cursor.classList.remove('magnet');
	          cursor.style.setProperty('--scale', '1');
	      });
	  });
}

/* 2. Sticky header */
function initStickyHeader() {
  const header = document.querySelector("header");
  const body   = document.body;
  let lastScroll  = 0;
  let isVisible   = false;
  let isReturning = false;

  function resetHeader() {
    // Frame 1: quita el paddingTop mientras el header aún es fixed
    //          → el contenido no se mueve porque el header sigue fuera del flujo
    body.style.paddingTop = "0";

    requestAnimationFrame(() => {
      // Frame 2: ahora sí entra al flujo, pero paddingTop ya es 0
      //          → no hay reflow perceptible
      header.classList.remove("fixed-top", "scrolled", "nav-hide", "returning");
      header.style.transform = "";
      isVisible   = false;
      isReturning = false;

      requestAnimationFrame(() => {
        // Frame 3: revela el header estático ya en su posición natural
        header.style.opacity = "";
      });
    });
  }

  function showHeader(headerHeight) {
    if (isVisible) return;

    isReturning = false;
    header.classList.remove("returning");
    header.style.opacity   = "";
    header.style.transform = "";

    header.classList.add("fixed-top");
    body.style.paddingTop = `${headerHeight}px`;

    requestAnimationFrame(() => {
      header.classList.add("scrolled");
      header.classList.remove("nav-hide");
      isVisible = true;
    });
  }

  function hideHeader() {
    if (!isVisible) return;
    header.classList.add("nav-hide");
    header.classList.remove("scrolled");
    isVisible = false;
  }

  function updateNavbar() {
    const currentScroll  = window.scrollY;
    const headerHeight   = header.offsetHeight;
    const resetThreshold = headerHeight * 0.8;

    // ── 1. Dentro del umbral → reset secuenciado ─────────────────
    if (currentScroll <= resetThreshold) {
      resetHeader();
      lastScroll = currentScroll;
      return;
    }

    // ── 2. Zona de fusión (solo si el sticky era visible) ─────────
    if (header.classList.contains("fixed-top") && currentScroll < headerHeight) {
      if (!isVisible && !isReturning) {
        resetHeader();
        lastScroll = currentScroll;
        return;
      }

      const range    = headerHeight - resetThreshold;
      const progress = (currentScroll - resetThreshold) / range; // 0 → 1

      if (!isReturning) {
        isReturning = true;
        header.classList.add("returning");
        header.classList.remove("nav-hide");
        header.classList.add("scrolled");
      }

      header.style.opacity   = progress;
      header.style.transform = `translateY(0)`;
      body.style.paddingTop  = `${headerHeight * progress}px`;

      lastScroll = currentScroll;
      return;
    }

    // ── 3. Zona sticky normal ─────────────────────────────────────
    if (currentScroll >= headerHeight) {
      if (isReturning) {
        isReturning = false;
        header.classList.remove("returning");
        header.style.opacity   = "";
        header.style.transform = "";
        body.style.paddingTop  = `${headerHeight}px`;
      }

      if (lastScroll - currentScroll > 20)      showHeader(headerHeight);
      else if (currentScroll - lastScroll > 20) hideHeader();
    }

    lastScroll = currentScroll;
  }

  window.addEventListener("scroll", updateNavbar, { passive: true });
  updateNavbar();
}

/* 3. Rotating text */
function initRotatingText() {
	  const words = document.querySelectorAll(".word");
	  if (!words.length) return;

	  words.forEach(word => {
	      const letters = word.textContent.split("");
	      word.textContent = "";
	      letters.forEach(letter => {
	          const span = document.createElement("span");
	          span.textContent = letter;
	          span.className = "letter";
	          word.append(span);
	      });
	  });

	  let currentWordIndex = 0;
	  const maxWordIndex = words.length - 1;
	  words[currentWordIndex].style.opacity = "1";

	  function rotateText() {
	      const currentWord = words[currentWordIndex];
	      const nextWord = currentWordIndex === maxWordIndex ? words[0] : words[currentWordIndex + 1];

	      Array.from(currentWord.children).forEach((letter, i) => {
	          setTimeout(() => { letter.className = "letter out"; }, i * 80);
	      });

	      nextWord.style.opacity = "1";
	      Array.from(nextWord.children).forEach((letter, i) => {
	          letter.className = "letter behind";
	          setTimeout(() => { letter.className = "letter in"; }, 340 + i * 80);
	      });

	      currentWordIndex = currentWordIndex === maxWordIndex ? 0 : currentWordIndex + 1;
	  }

	  rotateText();
	  setInterval(rotateText, 4000);
}