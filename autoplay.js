(function () {
  function armVideo(video) {
    video.muted = true;
    video.defaultMuted = true;
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
})();
