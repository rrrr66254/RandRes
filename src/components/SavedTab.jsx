import React, { useMemo, useRef, useState } from 'react';
import classNames from 'classnames';

const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
};

const SORT_OPTIONS = {
  recent: (a, b) => new Date(b.savedAt) - new Date(a.savedAt),
  oldest: (a, b) => new Date(a.savedAt) - new Date(b.savedAt),
  name: (a, b) => a.name.localeCompare(b.name),
  rating: (a, b) => (b.userRating ?? 0) - (a.userRating ?? 0),
};

export default function SavedTab({
  language,
  t,
  savedRestaurants,
  onDelete,
  onUpdate,
  onFocusOnMap,
  onImport,
}) {
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [search, setSearch] = useState('');
  const [editingMemo, setEditingMemo] = useState({});
  const fileInputRef = useRef(null);

  const filtered = useMemo(() => {
    const filteredList = savedRestaurants.filter((restaurant) => {
      const matchesCategory = filter === 'all' || resolveCategoryKey(restaurant.category) === filter;
      const matchesSearch = restaurant.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    const sorter = SORT_OPTIONS[sortBy] ?? SORT_OPTIONS.recent;
    return [...filteredList].sort(sorter);
  }, [filter, savedRestaurants, search, sortBy]);

  const stats = useMemo(() => computeStats(savedRestaurants), [savedRestaurants]);

  const handleMemoChange = (id, value) => {
    setEditingMemo((prev) => ({ ...prev, [id]: value }));
  };

  const handleMemoSave = (restaurant) => {
    onUpdate({ ...restaurant, memo: editingMemo[restaurant.id] ?? restaurant.memo });
  };

  const handleRatingChange = (restaurant, rating) => {
    onUpdate({ ...restaurant, userRating: rating });
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      onImport?.(data);
    } catch (error) {
      console.error(error);
      alert(language === 'ko' ? '데이터를 불러오지 못했습니다.' : 'Failed to import data.');
    } finally {
      event.target.value = '';
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(savedRestaurants, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `randres-saved-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="saved-tab">
      <div className="panel">
        <div className="saved-header">
          <div>
            <h2>{t.saved.title}</h2>
            <p className="panel__description">{t.saved.description}</p>
          </div>
          <div className="saved-controls">
            <button
              type="button"
              className={classNames('btn', viewMode === VIEW_MODES.GRID ? 'btn-primary' : 'btn-outline')}
              onClick={() => setViewMode(VIEW_MODES.GRID)}
            >
              {t.saved.grid}
            </button>
            <button
              type="button"
              className={classNames('btn', viewMode === VIEW_MODES.LIST ? 'btn-primary' : 'btn-outline')}
              onClick={() => setViewMode(VIEW_MODES.LIST)}
            >
              {t.saved.list}
            </button>
          </div>
        </div>

        <div className="saved-stats">
          <div>
            <span className="stat-label">{t.saved.stats.total}</span>
            <strong>{stats.total}</strong>
          </div>
          <div>
            <span className="stat-label">{t.saved.stats.monthly}</span>
            <strong>{stats.monthly}</strong>
          </div>
          <div>
            <span className="stat-label">{t.saved.stats.topCategory}</span>
            <strong>{stats.topCategory ?? '-'}</strong>
          </div>
        </div>

        <div className="saved-filters">
          <div className="form-group">
            <label className="form-label" htmlFor="saved-search">
              🔎 {t.saved.searchPlaceholder}
            </label>
            <input
              id="saved-search"
              type="search"
              className="input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="saved-filter">
              {t.saved.filterLabel}
            </label>
            <select
              id="saved-filter"
              className="select"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">{t.main.categoryOptions.all}</option>
              <option value="korean">{t.main.categoryOptions.korean}</option>
              <option value="chinese">{t.main.categoryOptions.chinese}</option>
              <option value="japanese">{t.main.categoryOptions.japanese}</option>
              <option value="western">{t.main.categoryOptions.western}</option>
              <option value="asian">{t.main.categoryOptions.asian}</option>
              <option value="cafe">{t.main.categoryOptions.cafe}</option>
              <option value="dessert">{t.main.categoryOptions.dessert}</option>
              <option value="pub">{t.main.categoryOptions.pub}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="saved-sort">
              {t.saved.sortLabel}
            </label>
            <select
              id="saved-sort"
              className="select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="recent">{t.saved.sortOptions.recent}</option>
              <option value="oldest">{t.saved.sortOptions.oldest}</option>
              <option value="name">{t.saved.sortOptions.name}</option>
              <option value="rating">{t.saved.sortOptions.rating}</option>
            </select>
          </div>

          <div className="form-group buttons">
            <button type="button" className="btn btn-secondary" onClick={handleExport}>
              {t.saved.export}
            </button>
            <button type="button" className="btn btn-outline" onClick={triggerImport}>
              {t.saved.import}
            </button>
            <input
              type="file"
              accept="application/json"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{t.saved.empty}</p>
          <p>
            <em>{t.common.goFindRestaurant}</em>
          </p>
        </div>
      ) : (
        <div className={classNames('saved-list', viewMode)}>
          {filtered.map((restaurant) => (
            <article key={restaurant.id} className="saved-card">
              <header>
                <div>
                  <h3>{restaurant.name}</h3>
                  <p className="saved-card__address">{restaurant.address}</p>
                </div>
                <span className="saved-card__tag">{restaurant.category}</span>
              </header>

              <dl className="saved-card__meta">
                <div>
                  <dt>{t.saved.card.savedAt}</dt>
                  <dd>{formatDate(restaurant.savedAt)}</dd>
                </div>
                <div>
                  <dt>{t.saved.card.ratingLabel}</dt>
                  <dd>
                    <Rating
                      value={restaurant.userRating ?? 0}
                      onChange={(value) => handleRatingChange(restaurant, value)}
                    />
                  </dd>
                </div>
              </dl>

              <textarea
                className="textarea"
                placeholder={t.saved.card.memoPlaceholder}
                value={editingMemo[restaurant.id] ?? restaurant.memo ?? ''}
                onChange={(event) => handleMemoChange(restaurant.id, event.target.value)}
              />

              <div className="saved-card__actions">
                <button type="button" className="btn btn-secondary" onClick={() => handleMemoSave(restaurant)}>
                  {t.saved.card.saveMemo}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => onFocusOnMap(restaurant)}>
                  {t.saved.card.openMap}
                </button>
                <button type="button" className="btn btn-danger" onClick={() => onDelete(restaurant)}>
                  {t.saved.card.delete}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Rating({ value, onChange }) {
  return (
    <div className="rating" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          className={classNames('rating__star', { active: score <= value })}
          onClick={() => onChange(score)}
          aria-checked={score === value}
          role="radio"
        >
          {score <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}

function resolveCategoryKey(category = '') {
  const lower = category.toLowerCase();
  if (lower.includes('한식') || lower.includes('korean')) return 'korean';
  if (lower.includes('중식') || lower.includes('chinese')) return 'chinese';
  if (lower.includes('일식') || lower.includes('japanese') || lower.includes('sushi')) return 'japanese';
  if (lower.includes('양식') || lower.includes('western') || lower.includes('italian')) return 'western';
  if (lower.includes('아시안') || lower.includes('asian') || lower.includes('태국') || lower.includes('베트남')) return 'asian';
  if (lower.includes('카페') || lower.includes('cafe')) return 'cafe';
  if (lower.includes('디저트') || lower.includes('dessert')) return 'dessert';
  if (lower.includes('술집') || lower.includes('bar') || lower.includes('pub')) return 'pub';
  return 'all';
}

function computeStats(savedRestaurants) {
  const total = savedRestaurants.length;
  const now = new Date();
  const monthly = savedRestaurants.filter((restaurant) => {
    const savedAt = new Date(restaurant.savedAt);
    return savedAt.getMonth() === now.getMonth() && savedAt.getFullYear() === now.getFullYear();
  }).length;

  const categoryCount = savedRestaurants.reduce((acc, restaurant) => {
    const key = resolveCategoryKey(restaurant.category);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const topCategoryEntry = Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0];

  return {
    total,
    monthly,
    topCategory: topCategoryEntry ? topCategoryEntry[0] : null,
  };
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}
