(function () {
  var videos = document.querySelectorAll('video:not(.flashcard-video)');

  videos.forEach(function (video) {
    video.muted = true;
    video.playsInline = true;

    var play = function () {
      video.play().catch(function () {});
    };

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              play();
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.35 }
      );
      observer.observe(video);
    } else {
      play();
    }
  });
})();
