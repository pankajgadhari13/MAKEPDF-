import React from 'react';
import { UploadCloud, SlidersHorizontal, FileCheck } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface HowItWorksProps {
  lang?: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang = 'en' }) => {
  const t = translations[lang];

  const steps = [
    {
      num: '01',
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
      icon: UploadCloud,
    },
    {
      num: '02',
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
      icon: SlidersHorizontal,
    },
    {
      num: '03',
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
      icon: FileCheck,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#08080b] border-t border-[#171720]">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-[#ff5722] tracking-widest uppercase block mb-2">
            {t.howItWorks.tagline}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            {t.howItWorks.title}
          </h2>
          <p className="mt-3 text-neutral-400 text-sm sm:text-base">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="rounded-2xl bg-[#0f0f15] border border-[#1f1f2c] hover:border-[#ff5722]/50 p-8 transition-all duration-200 hover:-translate-y-1 relative group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#ff5722]/10 border border-[#ff5722]/30 text-[#ff5722] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#ff5722]/20 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-mono font-bold text-neutral-600 group-hover:text-[#ff5722] transition-colors">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 font-display">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
