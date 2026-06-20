(function () {
  var video = document.getElementById('mainPlayer');
  if (!video) {
    return;
  }
  var source = video.getAttribute('data-hls');
  var started = false;
  var attach = function () {
    if (started || !source) {
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }
    var boot = function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };
    if (window.Hls) {
      boot();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.onload = boot;
    script.onerror = function () {
      video.src = source;
    };
    document.head.appendChild(script);
  };
  var play = function () {
    attach();
    var run = function () {
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {});
      }
    };
    if (video.readyState > 0) {
      run();
    } else {
      video.addEventListener('loadedmetadata', run, { once: true });
      video.load();
    }
  };
  video.addEventListener('click', attach, { once: true });
  video.addEventListener('play', attach, { once: true });
  var button = document.querySelector('[data-play-button]');
  if (button) {
    button.addEventListener('click', play);
  }
  attach();
})();
