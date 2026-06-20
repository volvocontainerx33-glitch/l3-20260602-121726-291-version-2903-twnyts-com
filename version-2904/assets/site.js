(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = parseInt(dot.getAttribute('data-hero-dot'), 10) || 0;
      showSlide(index);
      if (timer) {
        window.clearInterval(timer);
        startHero();
      }
    });
  });

  startHero();

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  var searchInput = document.querySelector('[data-search-input]');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var items = Array.prototype.slice.call(document.querySelectorAll('.js-filter-item'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeChip = '';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    if (!items.length) {
      return;
    }
    var query = normalize(searchInput ? searchInput.value : '');
    var visible = 0;
    items.forEach(function (item) {
      var haystack = normalize([
        item.getAttribute('data-title'),
        item.getAttribute('data-region'),
        item.getAttribute('data-tags'),
        item.getAttribute('data-year'),
        item.getAttribute('data-genre'),
        item.textContent
      ].join(' '));
      var chipMatch = !activeChip || haystack.indexOf(normalize(activeChip)) !== -1;
      var queryMatch = !query || haystack.indexOf(query) !== -1;
      var show = chipMatch && queryMatch;
      item.classList.toggle('is-hidden', !show);
      if (show) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  if (searchInput) {
    if (initialQuery) {
      searchInput.value = initialQuery;
    }
    searchInput.addEventListener('input', applyFilter);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeChip = chip.getAttribute('data-filter-chip') || '';
      chips.forEach(function (item) {
        item.classList.toggle('active', item === chip);
      });
      applyFilter();
    });
  });

  applyFilter();

  function startVideo(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var streamUrl = player.getAttribute('data-stream');

    if (!video || !streamUrl) {
      return;
    }

    player.classList.add('is-playing');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = streamUrl;
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!player._hlsInstance) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        player._hlsInstance = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
      return;
    }

    if (!video.src) {
      video.src = streamUrl;
    }
    video.play().catch(function () {});

    if (button) {
      button.setAttribute('aria-hidden', 'true');
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var button = player.querySelector('[data-play-button]');
    var video = player.querySelector('video');

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        startVideo(player);
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target === player) {
        startVideo(player);
      }
    });

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
    }
  });
})();
