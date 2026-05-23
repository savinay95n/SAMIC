(function () {
  const deck = document.getElementById('results-deck');
  if (!deck) return;

  const stack = document.getElementById('flashcard-stack');
  const cards = Array.from(stack.querySelectorAll('.flashcard'));
  const prevBtn = document.getElementById('flashcard-prev');
  const nextBtn = document.getElementById('flashcard-next');
  const counter = document.getElementById('flashcard-counter');
  const dotsContainer = document.getElementById('flashcard-dots');
  const total = cards.length;

  let current = 0;
  let animating = false;
  let deckVisible = false;

  cards.forEach(function (card) {
    const video = card.querySelector('video');
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.preload = 'auto';

    video.addEventListener('ended', function () {
      video.currentTime = 0;
      tryPlay(video, false);
    });
  });

  function tryPlay(video, restart) {
    if (!video || !deckVisible) return;
    video.muted = true;
    video.loop = true;
    if (restart) video.currentTime = 0;

    const play = function () {
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(function () {
          /* retry once media is ready */
        });
      }
    };

    if (video.readyState >= 2) {
      play();
    } else {
      video.addEventListener('canplay', play, { once: true });
    }
  }

  function pauseAllExcept(activeIndex) {
    cards.forEach(function (card, i) {
      const video = card.querySelector('video');
      if (video && i !== activeIndex) {
        video.pause();
      }
    });
  }

  function playActive(restart) {
    pauseAllExcept(current);
    const video = cards[current].querySelector('video');
    tryPlay(video, restart);
  }

  function updateStack() {
    cards.forEach(function (card, i) {
      card.className = 'flashcard';

      if (i === current) {
        card.classList.add('is-active');
      } else if (i === (current + 1) % total) {
        card.classList.add('is-behind-1');
      } else if (i === (current + 2) % total) {
        card.classList.add('is-behind-2');
      } else {
        card.classList.add('is-hidden');
      }
    });

    counter.textContent = (current + 1) + ' / ' + total;
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
      dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });

    playActive(false);
  }

  cards.forEach(function (_, i) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'flashcard-dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Result ' + (i + 1));
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', function () {
      goTo(i);
    });
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.flashcard-dot'));

  function goTo(index, direction) {
    if (animating || index === current) return;
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;

    animating = true;
    const activeCard = cards[current];
    const dir = direction || (index > current || (current === total - 1 && index === 0) ? 'next' : 'prev');

    activeCard.classList.remove('is-active');
    activeCard.classList.add(dir === 'next' ? 'is-exit-next' : 'is-exit-prev');

    const prevVideo = activeCard.querySelector('video');
    if (prevVideo) prevVideo.pause();

    current = index;
    const incoming = cards[current];
    incoming.classList.remove('is-hidden', 'is-behind-1', 'is-behind-2');
    incoming.classList.add('is-enter');

    setTimeout(function () {
      incoming.classList.remove('is-enter');
      updateStack();
      playActive(true);
      animating = false;
    }, 480);
  }

  function step(delta) {
    goTo((current + delta + total) % total, delta > 0 ? 'next' : 'prev');
  }

  prevBtn.addEventListener('click', function () {
    step(-1);
  });

  nextBtn.addEventListener('click', function () {
    step(1);
  });

  document.addEventListener('keydown', function (e) {
    if (e.target.closest('input, textarea')) return;

    const rect = deck.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;

  stack.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    stack.classList.add('is-dragging');
  }, { passive: true });

  stack.addEventListener('touchend', function (e) {
    stack.classList.remove('is-dragging');
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      step(dx < 0 ? 1 : -1);
    }
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      function (entries) {
        deckVisible = entries[0].isIntersecting;
        if (deckVisible) {
          playActive(false);
        } else {
          pauseAllExcept(-1);
        }
      },
      { threshold: 0.2 }
    ).observe(deck);
  } else {
    deckVisible = true;
  }

  updateStack();
})();
