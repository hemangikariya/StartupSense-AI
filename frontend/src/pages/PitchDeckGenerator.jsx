import React, { useState } from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { Presentation, ChevronLeft, ChevronRight, Layout } from 'lucide-react';

export const PitchDeckGenerator = () => {
  const { analysis, loading, error, activeIdeaId, reload } = useActiveAnalysis();
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  if (loading) {
    return <div className="p-8"><div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></div>;
  }
  if (error === 'NOT_ANALYZED') {
    return <EmptyState type="NOT_ANALYZED" activeIdeaId={activeIdeaId} onValidateComplete={reload} />;
  }
  if (!activeIdeaId || !analysis) {
    return <EmptyState type="NO_STARTUPS" />;
  }

  const slides = analysis.pitch_deck.slides;
  const currentSlide = slides[activeSlideIdx] || slides[0];

  const handleNext = () => {
    if (activeSlideIdx < slides.length - 1) {
      setActiveSlideIdx(activeSlideIdx + 1);
    }
  };

  const handlePrev = () => {
    if (activeSlideIdx > 0) {
      setActiveSlideIdx(activeSlideIdx - 1);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Pitch Deck Outline <Presentation className="h-7 w-7 text-sky-500" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Professional 5-slide structure optimized for VC fundraising.
          </p>
        </div>
      </div>

      {/* Slide Visual Presentation */}
      {currentSlide && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-slate-100 shadow-2xl space-y-6 aspect-video flex flex-col justify-between max-w-3xl mx-auto">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <span className="text-xs font-extrabold text-sky-400 uppercase tracking-widest">
              SLIDE {currentSlide.slide_number} OF {slides.length}
            </span>
            <Layout className="h-5 w-5 text-slate-600" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">{currentSlide.title}</h2>
            <ul className="space-y-3 pl-2">
              {currentSlide.bullets.map((b, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2 leading-relaxed">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-800/80">
            <button
              onClick={handlePrev}
              disabled={activeSlideIdx === 0}
              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white disabled:text-slate-700 transition"
            >
              <ChevronLeft className="h-4 w-4" /> Previous Slide
            </button>
            <button
              onClick={handleNext}
              disabled={activeSlideIdx === slides.length - 1}
              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white disabled:text-slate-700 transition"
            >
              Next Slide <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
