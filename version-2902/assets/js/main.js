(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function htmlEscape(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMobileMenu() {
        var button = qs("[data-mobile-toggle]");
        var menu = qs("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = qsa("[data-hero-slide]");
        if (!slides.length) {
            return;
        }
        var dots = qsa("[data-hero-dot]");
        var prev = qs("[data-hero-prev]");
        var next = qs("[data-hero-next]");
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function initCardFilters() {
        var list = qs("[data-card-list]");
        if (!list) {
            return;
        }
        var cards = qsa(".movie-card", list);
        var input = qs("[data-card-filter]");
        var type = qs("[data-type-filter]");
        var year = qs("[data-year-filter]");
        var region = qs("[data-region-filter]");
        var empty = qs("[data-empty-state]");

        function apply() {
            var term = normalize(input && input.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);
            var regionValue = normalize(region && region.value);
            var shown = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta"));
                var ok = true;
                if (term && text.indexOf(term) === -1) {
                    ok = false;
                }
                if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
                    ok = false;
                }
                if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
                    ok = false;
                }
                if (regionValue && normalize(card.getAttribute("data-region")) !== regionValue) {
                    ok = false;
                }
                card.hidden = !ok;
                if (ok) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        [input, type, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function buildCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + htmlEscape(tag) + "</span>";
        }).join("");
        return "<article class="movie-card">" +
            "<a class="poster-link" href="" + htmlEscape(item.url) + "">" +
            "<img src="" + htmlEscape(item.cover) + "" alt="" + htmlEscape(item.title) + "">" +
            "<span class="poster-year">" + htmlEscape(item.year) + "</span>" +
            "<span class="poster-score">" + htmlEscape(item.rating) + "</span>" +
            "</a>" +
            "<div class="card-body">" +
            "<a href="" + htmlEscape(item.url) + "" class="card-title">" + htmlEscape(item.title) + "</a>" +
            "<p>" + htmlEscape(item.desc) + "</p>" +
            "<div class="card-meta">" + htmlEscape(item.region) + " · " + htmlEscape(item.type) + "</div>" +
            "<div class="card-tags">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function initSearchPage() {
        var results = qs("[data-search-results]");
        if (!results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var input = qs("[data-search-input]");
        var title = qs("[data-search-title]");
        var subtitle = qs("[data-search-subtitle]");
        var term = normalize(query);

        if (input) {
            input.value = query;
        }

        var items = window.SEARCH_INDEX.filter(function (item) {
            if (!term) {
                return item.featured;
            }
            return normalize(item.title + " " + item.desc + " " + item.genre + " " + item.tagsText + " " + item.region + " " + item.type).indexOf(term) !== -1;
        }).slice(0, term ? 96 : 36);

        if (title) {
            title.textContent = term ? "搜索结果" : "推荐内容";
        }

        if (subtitle) {
            subtitle.textContent = term ? "以下为匹配关键词的影片内容。" : "可通过上方搜索框查找更多影片。";
        }

        if (!items.length) {
            results.innerHTML = "<p class="empty-state">暂无匹配内容</p>";
            return;
        }

        results.innerHTML = items.map(buildCard).join("");
    }

    function bindMoviePlayer(videoId, buttonId, coverId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var cover = document.getElementById(coverId);
        var hlsInstance = null;
        var loaded = false;

        if (!video || !button || !cover || !streamUrl) {
            return;
        }

        function requestPlay() {
            var playing = video.play();
            if (playing && typeof playing.catch === "function") {
                playing.catch(function () {
                    cover.classList.remove("is-hidden");
                });
            }
        }

        function load() {
            if (loaded) {
                requestPlay();
                return;
            }
            loaded = true;
            video.controls = true;
            video.setAttribute("playsinline", "");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.load();
                requestPlay();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                    hlsInstance.loadSource(streamUrl);
                    requestPlay();
                });
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    requestPlay();
                });
                return;
            }
            video.src = streamUrl;
            video.load();
            requestPlay();
        }

        function start() {
            cover.classList.add("is-hidden");
            load();
        }

        button.addEventListener("click", function (event) {
            event.stopPropagation();
            start();
        });

        cover.addEventListener("click", start);

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            cover.classList.add("is-hidden");
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.bindMoviePlayer = bindMoviePlayer;

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initHero();
        initCardFilters();
        initSearchPage();
    });
})();
