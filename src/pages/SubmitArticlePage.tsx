import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { api } from '../services/api.js';
import { Category } from '../types/index.js';
import { AIAssistantModal } from '../components/ai/AIAssistantModal.js';
import {
  PenTool,
  Sparkles,
  Send,
  Save,
  Tag,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const SubmitArticlePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState(
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80'
  );
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please sign in to submit news stories.', 'info');
      navigate('/login');
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await api.getCategories();
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategory(res.data[0].name);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    fetchCategories();
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (targetStatus: 'pending' | 'draft' | 'published') => {
    if (!title.trim() || !shortDescription.trim() || !content.trim() || !category) {
      showToast('Please complete title, summary, content, and category.', 'warning');
      return;
    }

    const tagsArray = tagsInput
      .split(/[,,\n]/)
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      const res = await api.createArticle({
        title,
        shortDescription,
        content,
        featuredImage,
        category,
        tags: tagsArray,
        status: targetStatus,
        isFeatured: user?.role === 'admin' ? isFeatured : false,
        isBreaking: user?.role === 'admin' ? isBreaking : false,
      });

      showToast(res.message, 'success');
      navigate('/my-submissions');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit article.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyAI = (field: 'title' | 'shortDescription' | 'content' | 'tags', value: any) => {
    if (field === 'title') setTitle(value);
    if (field === 'shortDescription') setShortDescription(value);
    if (field === 'content') setContent(value);
    if (field === 'tags') {
      if (Array.isArray(value)) {
        setTagsInput(value.join(', '));
      } else {
        setTagsInput(value);
      }
    }
  };

  const presetImages = [
    { label: 'Campus & Tech', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Placements & Hall', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Sports Ground', url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Coding & Lab', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Cultural & Stage', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <PenTool className="w-4 h-4" />
            <span>Campus Newsroom Submissions</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
            Submit News Story or Article
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Author: <strong className="text-slate-700 dark:text-slate-300">{user?.name}</strong> ({user?.role} • {user?.department})
          </p>
        </div>

        {/* AI Assistant Launch Button */}
        <button
          type="button"
          onClick={() => setIsAIModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span>Launch AI Editorial Assistant</span>
        </button>
      </div>

      {/* Submission Form */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Title */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Headline / Story Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Annual Tech Symposium Technovate 2026 Concludes with 1,200 Delegates"
            className="w-full p-3 text-sm sm:text-base font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {/* Category & Tags Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Category Beat *
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
            >
              {categories.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Story Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g. Hackathon, Coding, BCA, Trophy"
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {/* Short Summary */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Executive Summary / Short Teaser *
          </label>
          <textarea
            rows={2}
            required
            value={shortDescription}
            onChange={e => setShortDescription(e.target.value)}
            placeholder="A concise 2-sentence synopsis highlighting key dates, winners, or policy changes..."
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 resize-y"
          />
        </div>

        {/* Full Story Content */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Complete Article Content * (Markdown formatted: ### for headers, - for bullets)
          </label>
          <textarea
            rows={10}
            required
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write the full report here. Include paragraphs, direct quotes from organizers, and detailed results..."
            className="w-full p-3 text-sm font-sans leading-relaxed rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 resize-y font-mono"
          />
        </div>

        {/* Featured Image & Quick Presets */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Featured Image URL *
          </label>
          <input
            type="text"
            required
            value={featuredImage}
            onChange={e => setFeaturedImage(e.target.value)}
            className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
          />
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400">Quick Presets:</span>
            {presetImages.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFeaturedImage(preset.url)}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Admin only controls */}
        {user?.role === 'admin' && (
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex flex-wrap items-center gap-6 text-xs font-bold text-slate-700 dark:text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Mark as Homepage Featured Article</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={e => setIsBreaking(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span>Mark as Breaking News / Alert</span>
            </label>
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-400" />
            <span>Save as Draft</span>
          </button>

          <div className="flex items-center gap-2">
            {user?.role === 'admin' ? (
              <button
                type="button"
                onClick={() => handleSubmit('published')}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Immediately</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit('pending')}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Submit for Editorial Approval</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        title={title}
        content={content}
        category={category}
        onApply={handleApplyAI}
      />
    </div>
  );
};
