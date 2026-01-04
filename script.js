const deliverySlide = document.getElementById("delivery-slide");
const deliveryBtn = document.querySelector(".delivery-btn");
const packageSlide = document.getElementById("package-slide");
const packageImg = document.getElementById("box-img");
const openBtn = document.querySelector(".open-btn");
const glow = document.querySelector(".glow");
const openSound = document.getElementById("open-sound");
const bouquetSlide = document.getElementById("bouquet-slide");

// Background music (looping). Tries to autoplay, and will start on first user interaction if blocked.
const bgm = document.getElementById("bgm");
const bgmToggle = document.getElementById('bgm-toggle');
if (bgm) {
  bgm.volume = 0.35; // comfortable default level

  const isPlaying = () => !bgm.paused && !bgm.ended && bgm.currentTime > 0;

  const updateBgmUI = () => {
    if (!bgmToggle) return;
    if (isPlaying()) {
      bgmToggle.textContent = '🔊';
      bgmToggle.setAttribute('aria-pressed', 'true');
    } else {
      bgmToggle.textContent = '🔈';
      bgmToggle.setAttribute('aria-pressed', 'false');
    }
    bgmToggle.style.display = 'flex';
  };

  const showBgmToggle = () => {
    if (!bgmToggle) return;
    bgmToggle.style.display = 'flex';
  };

  const hideBgmToggle = () => {
    if (!bgmToggle) return;
    bgmToggle.style.display = 'none';
  };

  const tryStart = async () => {
    try {
      await bgm.play();
      updateBgmUI();
      return true;
    } catch (err) {
      // autoplay prevented or load error — show toggle so user can start manually
      console.warn('BGM autoplay blocked or failed to start:', err);
      showBgmToggle();
      return false;
    }
  };

  const startOnGesture = () => {
    tryStart();
    removeGestureListeners();
  };

  const removeGestureListeners = () => {
    window.removeEventListener('click', startOnGesture);
    window.removeEventListener('keydown', startOnGesture);
    window.removeEventListener('touchstart', startOnGesture);
    window.removeEventListener('pointerdown', startOnGesture);
  };

  // Toggle button behavior
  if (bgmToggle) {
    bgmToggle.style.display = 'none';
    bgmToggle.addEventListener('click', () => {
      if (isPlaying()) {
        bgm.pause();
        updateBgmUI();
      } else {
        bgm.play().then(updateBgmUI).catch(err => {
          console.warn('Failed to play BGM on toggle:', err);
          showBgmToggle();
        });
      }
    });
  }

  // Try to start immediately
  tryStart();

  // Listen for several kinds of first-user gesture to comply with autoplay policies
  window.addEventListener('click', startOnGesture, { once: true });
  window.addEventListener('keydown', startOnGesture, { once: true });
  window.addEventListener('touchstart', startOnGesture, { once: true });
  window.addEventListener('pointerdown', startOnGesture, { once: true });

  // keep UI in sync if playback state changes later
  bgm.addEventListener('play', updateBgmUI);
  bgm.addEventListener('pause', updateBgmUI);
  bgm.addEventListener('ended', updateBgmUI);
} else {
  console.warn('No #bgm element found — place your BGM file at assets/bgm.mp3 or update the audio src in index.html');
}

// STATE 1 → 2
deliveryBtn.addEventListener("click", () => {
  exitDelivery();
});

function exitDelivery() {
  deliverySlide.classList.add("fade-out");

  setTimeout(() => {
    deliverySlide.classList.add("hidden");
    packageSlide.classList.remove("hidden");
    packageSlide.classList.add("active");
  }, 800);
}

// STATE 3: OPEN PACKAGE
packageImg.addEventListener("click", openPackage);
openBtn.addEventListener("click", openPackage);

function openPackage() {
  openBtn.disabled = true;

  if (openSound) openSound.play();

  glow.classList.add("active");
  packageImg.classList.add("opening");

  setTimeout(() => {
    packageImg.src = "assets/open-package.png";
    // spawn fun floating emojis from the box area (confetti removed)
    const rect = packageImg.getBoundingClientRect();
    spawnFloatingEmojis(10, rect, ['🌸','💖','✨','🎀']);
  }, 200);

  setTimeout(() => {
    packageSlide.classList.add("exit");

    setTimeout(() => {
      packageSlide.classList.add("hidden");
      showBouquet();
    }, 800);
  }, 1000);
}

// STATE 4: FINAL REVEAL
function showBouquet() {
  bouquetSlide.classList.remove("hidden");
  bouquetSlide.classList.add("active");

  // remove any lingering confetti so the bouquet state stays clean
  document.querySelectorAll('.confetti').forEach(el => el.remove());

  // celebration: floating emojis only (no confetti)
  spawnFloatingEmojis(18, null, ['🌸','💐','💖','✨','🌷']);
  
  // hide message until after the greeting is typed
  const bouquetMessage = document.querySelector('.bouquet-message');
  if (bouquetMessage) {
    bouquetMessage.style.visibility = 'hidden';
    bouquetMessage.textContent = '';
  }

  // Start typing the greeting; when it finishes, reveal and type the message
  // "Good morning ☀️" = 13 chars × 50ms = 650ms + 400ms delay = 1050ms + 500ms cursor = 1550ms total
  typeText('.bouquet-text', "Good morning!", 50, 400, () => {
    if (bouquetMessage) bouquetMessage.style.visibility = 'visible';
    typeText('.bouquet-message', "sending you some 'just because' roses to brighten your day. may today bring you little moments of joy and calm.", 30, 100);
  });
}

// Typing animation function
function typeText(selector, text, speed = 50, delay = 0, onComplete = null) {
  setTimeout(() => {
    const element = document.querySelector(selector);
    if (!element) return;
    
    element.textContent = '';
    // ensure element is visible (in case it was hidden by showBouquet)
    element.style.visibility = 'visible';
    
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text[index];
        index++;
      } else {
        clearInterval(typeInterval);
        if (typeof onComplete === 'function') onComplete();
      }
    }, speed);
  }, delay);
}

/* --- helpers for floating emojis & confetti --- */
function spawnFloatingEmojis(count = 8, rect = null, palette = ['💖','✨','🌸']) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'floating-emoji';
    s.innerText = palette[Math.floor(Math.random() * palette.length)];
    const dur = 2400 + Math.floor(Math.random() * 1800);
    s.style.setProperty('--dur', dur + 'ms');

    let x, y;
    if (rect) {
      x = rect.left + Math.random() * rect.width;
      y = rect.top + Math.random() * rect.height;
    } else {
      x = window.innerWidth / 2 + (Math.random() - 0.5) * 240;
      y = window.innerHeight / 2 + (Math.random() - 0.5) * 120;
    }

    s.style.left = x + 'px';
    s.style.top = y + 'px';

    document.body.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
    // slight stagger
    s.style.animationDelay = (Math.random() * 400) + 'ms';
  }
}

