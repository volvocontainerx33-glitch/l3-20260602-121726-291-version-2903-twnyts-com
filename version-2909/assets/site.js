(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-menu]");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }

        function autoHero() {
            if (slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                if (timer) {
                    window.clearInterval(timer);
                    autoHero();
                }
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
            });
        }

        autoHero();

        var search = document.querySelector("[data-filter-search]");
        var category = document.querySelector("[data-filter-category]");
        var year = document.querySelector("[data-filter-year]");
        var list = document.querySelector("[data-filter-list]");
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];

        function matchYear(cardYear, filterYear) {
            if (!filterYear) {
                return true;
            }
            if (filterYear === "older") {
                var parsed = parseInt(cardYear, 10);
                return parsed && parsed < 2022;
            }
            return cardYear === filterYear;
        }

        function applyFilters() {
            var q = search ? search.value.trim().toLowerCase() : "";
            var c = category ? category.value : "";
            var y = year ? year.value : "";
            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title || "",
                    card.dataset.region || "",
                    card.dataset.type || "",
                    card.dataset.category || "",
                    card.dataset.keywords || ""
                ].join(" ").toLowerCase();
                var okSearch = !q || haystack.indexOf(q) !== -1;
                var okCategory = !c || card.dataset.category === c;
                var okYear = matchYear(card.dataset.year || "", y);
                card.style.display = okSearch && okCategory && okYear ? "" : "none";
            });
        }

        [search, category, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    });
})();
