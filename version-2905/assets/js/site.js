(function() {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.getElementById("mainNav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function() {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }

    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
      });
    });

    window.setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    var filterRoot = document.querySelector("[data-filter-root]");
    if (!filterRoot) {
      return;
    }

    var keywordInput = filterRoot.querySelector("[data-filter-keyword]");
    var yearSelect = filterRoot.querySelector("[data-filter-year]");
    var regionSelect = filterRoot.querySelector("[data-filter-region]");
    var sortSelect = filterRoot.querySelector("[data-filter-sort]");
    var grid = filterRoot.querySelector("[data-filter-grid]");
    var countNode = filterRoot.querySelector("[data-filter-count]");
    var emptyNode = filterRoot.querySelector("[data-filter-empty]");

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function apply() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = yearSelect ? yearSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";

      var visibleCount = 0;

      cards.forEach(function(card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.category,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.dataset.year === year;
        var matchRegion = !region || card.dataset.region === region;
        var visible = matchKeyword && matchYear && matchRegion;

        card.style.display = visible ? "" : "none";
        if (visible) {
          visibleCount += 1;
        }
      });

      if (countNode) {
        countNode.textContent = visibleCount.toString();
      }
      if (emptyNode) {
        emptyNode.style.display = visibleCount === 0 ? "block" : "none";
      }
    }

    function sortCards() {
      if (!sortSelect) {
        return;
      }

      var mode = sortSelect.value;
      var sorted = cards.slice().sort(function(a, b) {
        var ay = parseInt(a.dataset.year || "0", 10);
        var by = parseInt(b.dataset.year || "0", 10);
        var at = normalize(a.dataset.title);
        var bt = normalize(b.dataset.title);

        if (mode === "year-asc") {
          return ay - by || at.localeCompare(bt, "zh-CN");
        }

        if (mode === "title") {
          return at.localeCompare(bt, "zh-CN");
        }

        return by - ay || at.localeCompare(bt, "zh-CN");
      });

      sorted.forEach(function(card) {
        grid.appendChild(card);
      });
      cards = sorted;
      apply();
    }

    if (keywordInput) {
      keywordInput.addEventListener("input", apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", apply);
    }
    if (regionSelect) {
      regionSelect.addEventListener("change", apply);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", sortCards);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && keywordInput) {
      keywordInput.value = query;
    }

    sortCards();
    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function(player) {
      var video = player.querySelector("video");
      var start = player.querySelector("[data-player-start]");
      var src = player.getAttribute("data-src");

      if (!video || !src) {
        return;
      }

      function startVideo() {
        if (window.Hls && window.Hls.isSupported()) {
          if (!video._hlsInstance) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hlsInstance = hls;
          }
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else {
          video.src = src;
        }

        if (start) {
          start.classList.add("hidden");
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function() {
            if (start) {
              start.classList.remove("hidden");
            }
          });
        }
      }

      if (start) {
        start.addEventListener("click", startVideo);
      }
      player.addEventListener("dblclick", function() {
        if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    });
  }

  ready(function() {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
