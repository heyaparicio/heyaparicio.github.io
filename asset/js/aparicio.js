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
  const header = document.querySelector("header#main, header#mainNavbar");
  if (!header) return;
 
  // home → fixed (dentro del hero oscuro con margen)
  // resto → sticky (en el flujo del documento)
  const isFixed   = header.id === "mainNavbar";
  const threshold = header.offsetHeight;
  let lastScroll  = 0;
 
  // Para el header fixed del home:
  // el hero compensa el espacio que el header deja de ocupar
  if (isFixed) {
    const hero = header.closest(".header-bg-gris");
    if (hero) hero.style.paddingTop = `${threshold}px`;
  }
 
  function updateNavbar() {
    const currentScroll = window.scrollY;
 
    // ── Fondo: aparece al pasar el threshold ─────────────
    if (currentScroll > threshold) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
 
    // ── Visibilidad: hide al bajar, show al subir ─────────
    if (currentScroll <= 0) {
      header.classList.remove("nav-hide");
    } else if (currentScroll > lastScroll && currentScroll > threshold) {
      // Bajando y pasado el threshold → ocultar
      header.classList.add("nav-hide");
    } else if (lastScroll - currentScroll > 10) {
      // Subiendo > 10px → mostrar
      header.classList.remove("nav-hide");
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