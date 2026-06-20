(function () {
  var form = document.querySelector('[data-search-form]');
  var box = document.querySelector('[data-search-box]');
  var results = document.querySelector('[data-search-results]');
  var count = document.querySelector('[data-search-count]');
  var entries = globalThis.catalogEntries || [];
  if (!form || !box || !results) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var firstQuery = params.get('q') || '';
  box.value = firstQuery;
  var render = function (query) {
    var q = query.trim().toLowerCase();
    var list = entries.filter(function (item) {
      var haystack = [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(' '), item.line].join(' ').toLowerCase();
      return !q || haystack.indexOf(q) !== -1;
    }).slice(0, 120);
    results.innerHTML = list.map(function (item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">'
        + '<a class="poster-link" href="' + item.url + '">'
        + '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
        + '<span class="poster-badge">' + escapeHtml(item.year) + '</span>'
        + '</a>'
        + '<div class="movie-info">'
        + '<a class="movie-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>'
        + '<p class="movie-meta">' + escapeHtml(item.region + ' · ' + item.type + ' · ' + item.genre) + '</p>'
        + '<p class="movie-line">' + escapeHtml(item.line || '') + '</p>'
        + '<div class="tag-row">' + tags + '</div>'
        + '</div>'
        + '</article>';
    }).join('');
    if (count) {
      count.textContent = q ? '已匹配到相关影片，点击卡片进入详情。' : '展示部分精选影片，输入关键词可继续缩小范围。';
    }
  };
  var escapeHtml = function (value) {
    return String(value).replace(/[&<>"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
  };
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = box.value.trim();
    var url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    history.replaceState(null, '', url.toString());
    render(query);
  });
  box.addEventListener('input', function () {
    render(box.value);
  });
  render(firstQuery);
})();
