(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showHero(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showHero(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showHero((current + 1) % slides.length);
            }, 5000);
        }
    }

    var searchInput = document.querySelector('[data-search-input]');
    var clearFilter = document.querySelector('[data-clear-filter]');
    var regionButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-region]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);

    function normalize(value) {
        return (value || '').toString().toLowerCase();
    }

    function applyCards() {
        if (!cards.length) {
            return;
        }

        var query = searchInput ? normalize(searchInput.value) : '';
        var region = document.body.getAttribute('data-filter-region') || '';

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-genre')
            ].join(' '));
            var category = card.querySelector('.card-badge') ? card.querySelector('.card-badge').textContent : '';
            var matchText = !query || text.indexOf(query) !== -1;
            var matchRegion = !region || category === region;
            card.classList.toggle('hide-card', !(matchText && matchRegion));
        });
    }

    if (searchInput) {
        var initialQuery = params.get('q');
        if (initialQuery) {
            searchInput.value = initialQuery;
        }
        searchInput.addEventListener('input', applyCards);
        applyCards();
    }

    if (clearFilter) {
        clearFilter.addEventListener('click', function () {
            document.body.removeAttribute('data-filter-region');
            if (searchInput) {
                searchInput.value = '';
            }
            applyCards();
        });
    }

    regionButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            document.body.setAttribute('data-filter-region', button.getAttribute('data-filter-region'));
            applyCards();
        });
    });

    var playerShell = document.querySelector('.player-shell');

    if (playerShell) {
        var video = playerShell.querySelector('video');
        var overlay = playerShell.querySelector('.player-overlay');
        var stream = playerShell.getAttribute('data-stream');
        var ready = false;

        function bindStream() {
            if (ready || !video || !stream) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function startPlay() {
            bindStream();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.setAttribute('controls', 'controls');
            var playAction = video.play();
            if (playAction && typeof playAction.catch === 'function') {
                playAction.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlay);
        }
        playerShell.addEventListener('click', function (event) {
            if (event.target === video && !ready) {
                startPlay();
            }
        });
    }
})();
