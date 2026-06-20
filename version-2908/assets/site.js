document.addEventListener("DOMContentLoaded", function() {
  initializeMenu();
  initializeHero();
  initializeFilters();
  initializePlayer();
});

function initializeMenu() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", function() {
    panel.classList.toggle("open");
  });
}

function initializeHero() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

  if (slides.length === 0) {
    return;
  }

  var current = 0;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener("click", function() {
      showSlide(index);
    });
  });

  window.setInterval(function() {
    showSlide(current + 1);
  }, 5200);
}

function initializeFilters() {
  var filterRoot = document.querySelector("[data-filter-root]");

  if (!filterRoot) {
    return;
  }

  var input = filterRoot.querySelector("[data-search-input]");
  var yearSelect = filterRoot.querySelector("[data-year-filter]");
  var regionSelect = filterRoot.querySelector("[data-region-filter]");
  var typeSelect = filterRoot.querySelector("[data-type-filter]");
  var items = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-title]"));
  var count = filterRoot.querySelector("[data-result-count]");

  function valueOf(node) {
    return node ? node.value.trim().toLowerCase() : "";
  }

  function applyFilter() {
    var keyword = valueOf(input);
    var year = valueOf(yearSelect);
    var region = valueOf(regionSelect);
    var type = valueOf(typeSelect);
    var visible = 0;

    items.forEach(function(item) {
      var text = [
        item.dataset.title,
        item.dataset.year,
        item.dataset.region,
        item.dataset.type,
        item.dataset.genre
      ].join(" ").toLowerCase();

      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || String(item.dataset.year).toLowerCase() === year;
      var matchRegion = !region || String(item.dataset.region).toLowerCase() === region;
      var matchType = !type || String(item.dataset.type).toLowerCase() === type;
      var matched = matchKeyword && matchYear && matchRegion && matchType;

      item.classList.toggle("hidden-by-filter", !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = "当前显示 " + visible + " 部影片";
    }
  }

  [input, yearSelect, regionSelect, typeSelect].forEach(function(node) {
    if (node) {
      node.addEventListener("input", applyFilter);
      node.addEventListener("change", applyFilter);
    }
  });

  applyFilter();
}

function initializePlayer() {
  var player = document.querySelector("[data-player]");

  if (!player) {
    return;
  }

  var video = player.querySelector("video");
  var button = player.querySelector("[data-play-button]");
  var sourceUrl = player.getAttribute("data-src");
  var prepared = false;
  var hlsInstance = null;

  function prepareVideo() {
    if (prepared || !video || !sourceUrl) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }

    prepared = true;
  }

  function playVideo(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    prepareVideo();

    if (!video) {
      return;
    }

    video.controls = true;
    player.classList.add("is-playing");

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function() {
        player.classList.remove("is-playing");
      });
    }
  }

  if (button) {
    button.addEventListener("click", playVideo);
  }

  player.addEventListener("click", function(event) {
    if (event.target === video) {
      return;
    }

    playVideo(event);
  });

  window.addEventListener("beforeunload", function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
