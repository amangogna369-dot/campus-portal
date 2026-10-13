import { Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { AuthRequest } from '../middleware/auth.js';
import { config } from '../config/env.js';

export const handleAIEditorial = async (req: AuthRequest, res: Response): Promise<void> => {
  const { action, title, content, category } = req.body;

  if (!content && !title) {
    res.status(400).json({ success: false, message: 'Content or title is required for AI processing.' });
    return;
  }

  // Attempt to call Gemini API if key is present
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      let prompt = '';
      switch (action) {
        case 'headline':
          prompt = `You are a chief news editor at a prestigious university news publication. Based on the following draft article content, generate 3 catchy, journalistic, academic-standard headlines. Return them as a JSON array of strings under the key "headlines". Do not wrap in markdown quotes if possible or return valid JSON.\n\nCategory: ${category || 'Campus News'}\nDraft Content:\n${(content || title).slice(0, 2000)}`;
          break;

        case 'summary':
          prompt = `You are an academic news copywriter. Write a concise, 2-3 sentence executive summary for this campus news article.\n\nTitle: ${title || ''}\nContent:\n${(content || '').slice(0, 2500)}`;
          break;

        case 'tags':
          prompt = `Generate 5-8 relevant, comma-separated single or two-word tags for this collegiate news article.\n\nTitle: ${title || ''}\nContent:\n${(content || '').slice(0, 2000)}`;
          break;

        case 'improve':
          prompt = `You are an editorial proofreader for a university newspaper. Rewrite and polish this draft article to improve clarity, journalistic tone, active voice, and flow while retaining all factual campus details. Keep paragraphs well-structured.\n\nDraft Content:\n${content.slice(0, 3000)}`;
          break;

        case 'seo':
          prompt = `Generate an SEO meta description (under 160 characters) and a social media share caption with emojis for this campus news story.\n\nTitle: ${title || ''}\nContent:\n${(content || '').slice(0, 1500)}`;
          break;

        default:
          prompt = `Summarize and provide editorial tips for this campus article: ${content.slice(0, 2000)}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text || '';

      res.json({
        success: true,
        source: 'gemini-3.8-flash',
        data: {
          result: text.trim(),
          action,
        },
      });
      return;
    } catch (err: any) {
      console.warn('Gemini API call failed or timed out, using intelligent local editorial fallback:', err?.message || err);
    }
  }

  // Intelligent local fallback if API key is not configured or network error occurs
  let fallbackResult = '';
  const textSample = (content || title || '').trim();

  switch (action) {
    case 'headline':
      fallbackResult = `1. Campus Spotlight: ${title || 'Major Campus Development'}\n2. New Milestones Achieved: ${title || 'Varsity Update'}\n3. Students and Faculty Celebrate: ${title || 'Key Achievements'}`;
      break;

    case 'summary': {
      const sentences = textSample.split(/[.?!]\s+/);
      fallbackResult = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '');
      if (fallbackResult.length < 20) {
        fallbackResult = `Campus community members gathered this week as details were officially unveiled regarding recent developments in ${category || 'academic affairs'}.`;
      }
      break;
    }

    case 'tags': {
      const defaultTags = ['Campus', 'University', category || 'Academics', 'Student Life', 'Innovation'];
      fallbackResult = defaultTags.join(', ');
      break;
    }

    case 'improve': {
      fallbackResult = `In a prominent campus announcement, the institution highlighted significant progress in ${category || 'student initiatives'}.\n\n${textSample}\n\nFaculty coordinators and student representatives noted that ongoing community engagement remains central to these educational objectives.`;
      break;
    }

    case 'seo':
      fallbackResult = `Explore the latest updates on ${title || 'campus events and student milestones'} at the University News Portal. Stay informed with official campus announcements.`;
      break;

    default:
      fallbackResult = textSample.slice(0, 150);
  }

  res.json({
    success: true,
    source: 'editorial-fallback-engine',
    data: {
      result: fallbackResult,
      action,
    },
  });
};
