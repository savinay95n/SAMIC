(function () {
  function armVideo(video) {
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');

    video.addEventListener('ended', function () {
      video.currentTime = 0;
      video.play().catch(function () {});
    });
  }

  function keepPlaying(video) {
    if (video.paused && !video.ended) {
      video.play().catch(function () {});
    }
  }

  // Demo videos: autoplay when visible, keep playing (no pause on scroll away)
  document.querySelectorAll('.demo-video').forEach(function (video) {
    armVideo(video);

    var start = function () {
      video.play().catch(function () {});
    };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) start();
          });
        },
        { threshold: 0.2 }
      ).observe(video);
    } else {
      start();
    }
  });

  // Flashcard videos: loop + restart; play/pause handled by results.js
  document.querySelectorAll('.flashcard-video').forEach(function (video) {
    armVideo(video);
  });

  // Retry play if the browser stalls autoplay
  document.querySelectorAll('video').forEach(function (video) {
    video.addEventListener('loadeddata', function () {
      if (video.classList.contains('flashcard-video')) {
        var card = video.closest('.flashcard');
        if (card && card.classList.contains('is-active')) {
          video.play().catch(function () {});
        }
      } else {
        keepPlaying(video);
      }
    });
  });
})();
