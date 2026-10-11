import React, { useState } from 'react';
import { ChevronDown, ArrowLeft, HelpCircle } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface FAQProps {
  lang?: Language;
  onBack?: () => void;
  isStandalone?: boolean;
}

export const FAQ: React.FC<FAQProps> = ({ lang = 'en', onBack, isStandalone }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = translations[lang];

  return (
    <section id="faq" className={`py-12 sm:py-20 bg-[#0a0a0e] ${isStandalone ? 'min-h-[80vh]' : 'border-t border-[#171720]'}`}>
      <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
        {isStandalone && onBack && (
          <div className="mb-6">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 p-2 px-3 rounded-lg bg-[#14141d] hover:bg-[#1f1f2b] border border-[#262635] text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'hi' ? 'वापस जाएँ' : 'Back to Home'}</span>
            </button>
          </div>
        )}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5722]/10 border border-[#ff5722]/30 text-xs font-mono font-bold text-[#ff5722] tracking-wider uppercase mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.faq.tagline}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            {t.faq.title}
          </h2>
          <p className="mt-2.5 text-neutral-400 text-xs sm:text-base leading-relaxed">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="space-y-3">
          {t.faq.items.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-xl bg-[#101016] border border-[#20202d] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-semibold text-white hover:text-[#ff5722] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen ? 'rotate-180 text-[#ff5722]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-[#1a1a24]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
