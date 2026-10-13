import React, { useState } from 'react';
import { Modal } from '../common/Modal.js';
import { api } from '../../services/api.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { Sparkles, Wand2, Copy, Check, FileText, Tag, Heading, RefreshCw } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  category: string;
  onApply: (field: 'title' | 'shortDescription' | 'content' | 'tags', value: any) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  category,
  onApply,
}) => {
  const [selectedAction, setSelectedAction] = useState<'headline' | 'summary' | 'tags' | 'improve' | 'seo'>('headline');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [source, setSource] = useState('');
  const [copied, setCopied] = useState(false);
  const { showToast } = useNotifications();

  const handleGenerate = async (action: 'headline' | 'summary' | 'tags' | 'improve' | 'seo') => {
    setSelectedAction(action);
    setLoading(true);
    setResult('');
    setCopied(false);

    try {
      const res = await api.callAIEditorial({
        action,
        title,
        content,
        category,
      });

      setResult(res.data.result);
      setSource(res.source);
    } catch (err: any) {
      showToast(err.message || 'AI request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard!', 'info');
  };

  const handleApplyField = () => {
    if (!result) return;

    if (selectedAction === 'headline') {
      // Pick first headline if multiple
      const first = result.split('\n')[0].replace(/^\d+[\.\)]\s*/, '').replace(/^"|"$/g, '').trim();
      onApply('title', first);
      showToast('Applied title to article form!', 'success');
    } else if (selectedAction === 'summary' || selectedAction === 'seo') {
      onApply('shortDescription', result);
      showToast('Applied summary to article form!', 'success');
    } else if (selectedAction === 'improve') {
      onApply('content', result);
      showToast('Applied improved content to article!', 'success');
    } else if (selectedAction === 'tags') {
      const tagsArray = result
        .split(/[,,\n]/)
        .map(t => t.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);
      onApply('tags', tagsArray);
      showToast('Applied tags to article form!', 'success');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Editorial Assistant" maxWidth="2xl">
      <div className="space-y-5">
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">
              Powered by Google Gemini 3.8 Flash Engine
            </span>
          </div>
          {source && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {source}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
            Select Editorial Capability
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleGenerate('headline')}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex flex-col gap-1 cursor-pointer ${
                selectedAction === 'headline'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Heading className="w-4 h-4 text-blue-600" />
              <span>Generate Headline</span>
            </button>

            <button
              type="button"
              onClick={() => handleGenerate('summary')}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex flex-col gap-1 cursor-pointer ${
                selectedAction === 'summary'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Generate Summary</span>
            </button>

            <button
              type="button"
              onClick={() => handleGenerate('tags')}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex flex-col gap-1 cursor-pointer ${
                selectedAction === 'tags'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Tag className="w-4 h-4 text-amber-600" />
              <span>Generate Tags</span>
            </button>

            <button
              type="button"
              onClick={() => handleGenerate('improve')}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex flex-col gap-1 cursor-pointer ${
                selectedAction === 'improve'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Wand2 className="w-4 h-4 text-purple-600" />
              <span>Improve Article</span>
            </button>

            <button
              type="button"
              onClick={() => handleGenerate('seo')}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex flex-col gap-1 cursor-pointer col-span-2 sm:col-span-1 ${
                selectedAction === 'seo'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Generate SEO Meta</span>
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              AI Generated Output
            </label>
            {result && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="min-h-[140px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Gemini 3.8 Flash is analyzing your story...</span>
              </div>
            ) : result ? (
              result
            ) : (
              <span className="text-slate-400 text-xs italic">
                Click any action above to generate headlines, summary, tags, or proofread your draft content.
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!result || loading}
            onClick={handleApplyField}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            Apply to Story
          </button>
        </div>
      </div>
    </Modal>
  );
};
