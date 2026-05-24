document.addEventListener("DOMContentLoaded", () => {
	  initCursor();
	  initStickyHeader();
	  initNoiseEffect();
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
	  const body = document.body;
	  let lastScroll = 0;
	  let isVisible = false;
	  let headerHeight = header.offsetHeight;

	  window.addEventListener("resize", () => {
	      headerHeight = header.offsetHeight;
	  }, { passive: true });

	  function showHeader() {
	  if (!isVisible) {
	      header.classList.add("fixed-top");
	      body.style.paddingTop = `${headerHeight}px`;
	      // Forzar reflow antes de añadir scrolled
	      header.offsetHeight; // <-- esto fuerza que el navegador pinte fixed-top primero
	      header.classList.add("scrolled");
	      header.classList.remove("nav-hide");
	      isVisible = true;
	  }
}

	  function hideHeader() {
	      if (isVisible) {
	          header.classList.add("nav-hide");
	          header.classList.remove("scrolled");
	          isVisible = false;
	      }
	  }

	  function resetHeader() {
	      header.classList.remove("scrolled", "fixed-top", "nav-hide", "navbar-transitioning");
	      body.style.paddingTop = "0";
	      isVisible = false;
	  }

	  function updateNavbar() {
	      const currentScroll = window.scrollY;

	      if (currentScroll <= 0) {
	          resetHeader();
	          lastScroll = currentScroll;
	          return;
	      }

	      if (currentScroll > headerHeight) {
	          if (lastScroll - currentScroll > 5) showHeader();
	          else if (currentScroll - lastScroll > 5) hideHeader();
	      } else {
	          resetHeader();
	      }

	      lastScroll = currentScroll;
	  }

	  window.addEventListener("scroll", updateNavbar, { passive: true });
	  updateNavbar();
}

/* 3. Noise effect */
function initNoiseEffect() {
	  const images = document.querySelectorAll('.main-image');
	  const canvases = document.querySelectorAll('.noise-overlay');

	  if (images.length !== canvases.length) {
	      console.warn("Las cantidades de imágenes y canvas no coinciden.");
	      return;
	  }

	  images.forEach((image, index) => {
	      const canvas = canvases[index];
	      if (!canvas) return;
	      const ctx = canvas.getContext('2d');
	      let offsetX = 0, offsetY = 0;
	      const movementSpeed = 0.2;

	      function generateNoise() {
	          const imageData = ctx.createImageData(canvas.width, canvas.height);
	          const data = imageData.data;
	          for (let i = 0; i < data.length; i += 4) {
	              const value = Math.random() * 255;
	              data[i] = data[i + 1] = data[i + 2] = value;
	              data[i + 3] = 30;
	          }
	          ctx.putImageData(imageData, 0, 0);
	      }

	      function updateNoisePosition() {
	          offsetX += (Math.random() - 0.5) * movementSpeed;
	          offsetY += (Math.random() - 0.5) * movementSpeed;
	          offsetX = Math.max(-2, Math.min(2, offsetX));
	          offsetY = Math.max(-2, Math.min(2, offsetY));
	          canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
	      }

	      function startNoise() {
	          if (image.clientWidth === 0 || image.clientHeight === 0) return;
	          canvas.width = image.clientWidth;
	          canvas.height = image.clientHeight;

	          let lastTime = 0;
	          const INTERVAL = 100;

	          function animateLoop(timestamp) {
	              if (timestamp - lastTime >= INTERVAL) {
	                  lastTime = timestamp;
	                  ctx.clearRect(0, 0, canvas.width, canvas.height);
	                  generateNoise();
	                  updateNoisePosition();
	              }
	              requestAnimationFrame(animateLoop);
	          }
	          requestAnimationFrame(animateLoop);
	      }

	      if (image.complete) startNoise();
	      else image.addEventListener('load', startNoise);
	  });
}

/* 4. Rotating text */
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