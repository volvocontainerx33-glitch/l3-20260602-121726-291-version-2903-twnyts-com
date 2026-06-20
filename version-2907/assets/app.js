(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === activeIndex);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === activeIndex);
            });
        }

        function startHero() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        var input = form.querySelector('[data-search-input]');
        var scope = form.closest('main') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

        function applySearch() {
            var query = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-title') || '').toLowerCase();
                var type = card.getAttribute('data-type') || '';
                var activeFilter = scope.getAttribute('data-active-filter') || 'all';
                var typeMatched = activeFilter === 'all' || type === activeFilter;
                var textMatched = !query || text.indexOf(query) !== -1;
                card.classList.toggle('is-hidden', !(typeMatched && textMatched));
            });
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applySearch();
        });

        if (input) {
            input.addEventListener('input', applySearch);
        }
    });

    document.querySelectorAll('[data-filter-bar]').forEach(function (bar) {
        var scope = bar.closest('main') || document;
        var buttons = Array.prototype.slice.call(bar.querySelectorAll('[data-filter]'));
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var input = scope.querySelector('[data-search-input]');

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var filter = button.getAttribute('data-filter') || 'all';
                scope.setAttribute('data-active-filter', filter);
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                var query = input ? input.value.trim().toLowerCase() : '';
                cards.forEach(function (card) {
                    var type = card.getAttribute('data-type') || '';
                    var text = (card.getAttribute('data-title') || '').toLowerCase();
                    var typeMatched = filter === 'all' || type === filter;
                    var textMatched = !query || text.indexOf(query) !== -1;
                    card.classList.toggle('is-hidden', !(typeMatched && textMatched));
                });
            });
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var stream = player.getAttribute('data-stream');
        var hlsInstance = null;

        function attachStream() {
            if (!video || !stream || player.getAttribute('data-ready') === 'true') {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
            player.setAttribute('data-ready', 'true');
        }

        function playVideo() {
            attachStream();
            if (button) {
                button.classList.add('is-hidden');
            }
            if (video) {
                var playAttempt = video.play();
                if (playAttempt && typeof playAttempt.catch === 'function') {
                    playAttempt.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                playVideo();
            });
        }

        player.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            if (button && button.classList.contains('is-hidden')) {
                return;
            }
            playVideo();
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
