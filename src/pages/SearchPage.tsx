import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { Article, Category } from '../types/index.js';
import { ArticleCard } from '../components/news/ArticleCard.js';
import { Pagination } from '../components/common/Pagination.js';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const initialCat = searchParams.get('category') || 'all';
  const initialSort = searchParams.get('sort') || 'latest';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(q);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [authorFilter, setAuthorFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        const res = await api.getArticles({
          search: q.trim() || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          author: authorFilter.trim() || undefined,
          sort: selectedSort,
          page: currentPage,
          limit: 9,
          status: 'published',
        });

        setArticles(res.data.articles);
        setTotalPages(res.data.pagination.totalPages);
        setTotalCount(res.data.pagination.total);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [q, selectedCategory, selectedSort, authorFilter, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('q', searchInput.trim());
    } else {
      newParams.delete('q');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(page));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif">
          Search Campus News & Archives
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Instant multi-field indexing across news reports, headlines, author profiles, and topics.
        </p>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
        <input
          type="text"
          placeholder="Search by keywords, article title, reporter name, topic..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="w-full pl-12 pr-28 py-3.5 text-sm sm:text-base rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 shadow-md focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
        <button
          type="submit"
          className="absolute right-2 top-2 px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Multi-Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Author filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Author:</span>
            <input
              type="text"
              placeholder="e.g. Dr. Rajesh Sharma"
              value={authorFilter}
              onChange={e => {
                setAuthorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200 focus:outline-hidden max-w-[160px]"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Sort by:</span>
          <select
            value={selectedSort}
            onChange={e => {
              setSelectedSort(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="latest">Latest Dispatches</option>
            <option value="oldest">Oldest Dispatches</option>
            <option value="most_viewed">Most Viewed</option>
            <option value="most_liked">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
        <span>
          Found <strong>{totalCount}</strong> articles {q ? `matching "${q}"` : ''}
        </span>
        {(q || selectedCategory !== 'all' || authorFilter) && (
          <button
            onClick={() => {
              setSearchInput('');
              setSelectedCategory('all');
              setAuthorFilter('');
              setSearchParams({});
            }}
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear all filters</span>
          </button>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-base font-bold text-slate-900 dark:text-white">
            No matching articles found
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for broader keywords like "Tech", "Placement", "Cricket", or "Robotics".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(art => (
            <ArticleCard key={art.id} article={art} variant="standard" />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
