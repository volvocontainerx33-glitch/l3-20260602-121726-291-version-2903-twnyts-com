(function () {
  var navButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (navButton && mobilePanel) {
    navButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('form[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      if (query) {
        window.location.href = './search.html?q=' + encodeURIComponent(query);
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  function initVideo(video) {
    if (!video || video.dataset.ready === '1') {
      return;
    }
    var url = video.dataset.m3u8;
    if (!url) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video.dataset.ready = '1';
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.dataset.ready = '1';
    } else {
      video.src = url;
      video.dataset.ready = '1';
    }
  }

  document.querySelectorAll('.js-play-button').forEach(function (button) {
    button.addEventListener('click', function () {
      var targetId = button.getAttribute('data-target');
      var video = targetId ? document.getElementById(targetId) : document.querySelector('video[data-m3u8]');
      initVideo(video);
      if (video) {
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
    });
  });

  var searchResults = document.getElementById('searchResults');
  var searchInput = document.getElementById('siteSearchInput');
  var typeSelect = document.getElementById('typeFilter');
  var countNode = document.getElementById('resultCount');

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function renderResults() {
    if (!searchResults || !window.siteMovieIndex) {
      return;
    }
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var typeValue = typeSelect ? typeSelect.value : '';
    var list = window.siteMovieIndex.filter(function (movie) {
      var text = [movie.title, movie.year, movie.genre, movie.region, movie.type, movie.tags].join(' ').toLowerCase();
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchType = !typeValue || movie.type === typeValue;
      return matchQuery && matchType;
    }).slice(0, 120);

    if (countNode) {
      countNode.textContent = '找到 ' + list.length + ' 条相关内容';
    }

    searchResults.innerHTML = list.map(function (movie) {
      return [
        '<a class="card" href="' + movie.url + '">',
        '  <div class="card-media">',
        '    <img src="' + movie.img + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
        '    <span class="card-badge">' + movie.year + '</span>',
        '  </div>',
        '  <div class="card-body">',
        '    <div class="meta-line"><span class="pill">' + movie.type + '</span><span class="pill">' + movie.region + '</span></div>',
        '    <div class="card-title">' + movie.title + '</div>',
        '    <p class="card-text">' + movie.genre + '</p>',
        '  </div>',
        '</a>'
      ].join('');
    }).join('');
  }

  if (searchInput && searchResults) {
    var initialQuery = getQueryParam('q');
    if (initialQuery) {
      searchInput.value = initialQuery;
    }
    searchInput.addEventListener('input', renderResults);
    if (typeSelect) {
      typeSelect.addEventListener('change', renderResults);
    }
    renderResults();
  }
})();
