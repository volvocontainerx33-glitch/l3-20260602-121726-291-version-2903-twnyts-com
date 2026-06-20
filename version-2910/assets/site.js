(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-missing');
      img.removeAttribute('src');
    }, { once: true });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var setSlide = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');
  var yearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]'));
  var chosenYear = '';
  var applyFilter = function () {
    if (!filterList) {
      return;
    }
    var q = filterInput ? filterInput.value.trim().toLowerCase() : '';
    Array.prototype.slice.call(filterList.children).forEach(function (item) {
      var haystack = [
        item.getAttribute('data-title'),
        item.getAttribute('data-year'),
        item.getAttribute('data-region'),
        item.getAttribute('data-genre'),
        item.textContent
      ].join(' ').toLowerCase();
      var yearMatch = !chosenYear || item.getAttribute('data-year') === chosenYear;
      var textMatch = !q || haystack.indexOf(q) !== -1;
      item.style.display = yearMatch && textMatch ? '' : 'none';
    });
  };
  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }
  yearButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      chosenYear = chosenYear === button.dataset.filterYear ? '' : button.dataset.filterYear;
      yearButtons.forEach(function (b) {
        b.classList.toggle('active', b.dataset.filterYear === chosenYear);
      });
      applyFilter();
    });
  });
})();
