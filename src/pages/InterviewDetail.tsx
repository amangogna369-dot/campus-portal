import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Interview } from '../types/index.js';
import { ArrowLeft, Calendar, User, Quote, Mic, ChevronRight, Share2, Copy, Check } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.js';

export const InterviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { showToast } = useNotifications();

  useEffect(() => {
    const fetchInterview = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.getInterviewById(id);
        setInterview(res.data);
      } catch (err: any) {
        showToast(err.message || 'Interview not found', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Interview link copied to clipboard!', 'info');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Loading interview transcript...</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Interview Not Found</h2>
        <Link to="/interviews" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Interviews</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/interviews" className="hover:text-indigo-600">Interviews</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-medium truncate">{interview.interviewee}</span>
      </nav>

      {/* Hero Profile Header */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={interview.profileImage}
            alt={interview.interviewee}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-xl shrink-0"
          />
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-600/60 text-indigo-200 border border-indigo-500/30">
              <Mic className="w-3.5 h-3.5" />
              <span>Campus Spotlight Series</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif">{interview.interviewee}</h1>
            <p className="text-base text-indigo-200 font-medium">{interview.designation}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-2">
              <span>{interview.department}</span>
              {interview.batchOrTenure && (
                <>
                  <span>•</span>
                  <span>{interview.batchOrTenure}</span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {interview.interviewDate}
              </span>
            </div>
          </div>
        </div>

        {/* Pull Quote */}
        <div className="mt-8 pt-6 border-t border-white/10 relative">
          <Quote className="w-8 h-8 text-indigo-400/40 absolute -top-4 left-0" />
          <blockquote className="text-lg sm:text-xl font-serif italic text-indigo-100 pl-8 leading-snug">
            "{interview.quote}"
          </blockquote>
        </div>
      </div>

      {/* Editor's Introduction */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Editorial Introduction
        </span>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          {interview.introduction}
        </p>
        <div className="pt-2 text-xs text-slate-400 font-medium">
          Conducted and recorded by: <strong className="text-slate-700 dark:text-slate-200">{interview.authorName}</strong>
        </div>
      </div>

      {/* Question & Answer Transcript */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
          Interview Transcript
        </h2>

        {interview.questionsAndAnswers.map((qa, index) => (
          <div
            key={index}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                Q{index + 1}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-serif leading-snug">
                {qa.question}
              </h3>
            </div>

            <div className="pl-10 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans border-l-2 border-indigo-200 dark:border-indigo-900 ml-3.5">
              <p>{qa.answer}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Share / Back Bar */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Link
          to="/interviews"
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Interviews</span>
        </Link>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied Link' : 'Share Interview'}</span>
        </button>
      </div>
    </div>
  );
};
