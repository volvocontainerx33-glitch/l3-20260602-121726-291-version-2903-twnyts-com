(function () {
  var menuButton = document.querySelector(".menu-button");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === activeIndex);
    });
  }

  function startSlider() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      if (timer) {
        window.clearInterval(timer);
      }
      showSlide(dotIndex);
      startSlider();
    });
  });

  showSlide(0);
  startSlider();

  var panel = document.querySelector("[data-filter-panel]");
  if (panel) {
    var input = panel.querySelector(".filter-input");
    var select = panel.querySelector(".filter-select");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-list .movie-card, .filter-list .rank-card"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (input && initial) {
      input.value = initial;
    }

    function applyFilter() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var year = select ? select.value : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var matchedText = !q || text.indexOf(q) !== -1;
        var matchedYear = !year || cardYear === year;
        card.classList.toggle("is-hidden", !(matchedText && matchedYear));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (select) {
      select.addEventListener("change", applyFilter);
    }
    applyFilter();
  }
})();

function initMoviePlayer(src) {
  var shell = document.querySelector("[data-player]");
  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var overlay = shell.querySelector(".player-overlay");
  var hlsInstance = null;
  var ready = false;

  function attachSource() {
    if (ready || !video) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
    } else {
      video.src = src;
    }

    ready = true;
  }

  function playVideo() {
    attachSource();
    shell.classList.add("is-playing");
    if (overlay) {
      overlay.setAttribute("hidden", "hidden");
    }
    video.setAttribute("controls", "controls");
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (!ready || video.paused) {
        playVideo();
      }
    });
  }

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
