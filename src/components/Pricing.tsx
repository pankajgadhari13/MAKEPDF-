import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { ActiveView } from '../types';
import { Language, translations } from '../utils/translations';

interface PricingProps {
  onNavigate: (view: ActiveView) => void;
  lang?: Language;
}

export const Pricing: React.FC<PricingProps> = ({ onNavigate, lang = 'en' }) => {
  const t = translations[lang];

  const plans = [
    {
      name: t.pricing.starter.name,
      subtitle: t.pricing.starter.desc,
      price: '$0',
      period: t.pricing.starter.period,
      highlight: false,
      features: t.pricing.starter.features,
      cta: t.pricing.starter.cta,
      ctaStyle: 'bg-[#181824] hover:bg-[#222232] text-white border border-[#2c2c3d]',
    },
    {
      name: t.pricing.pro.name,
      subtitle: t.pricing.pro.desc,
      price: '$9',
      period: t.pricing.pro.period,
      highlight: true,
      features: t.pricing.pro.features,
      cta: t.pricing.pro.cta,
      ctaStyle: 'bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9933] hover:to-[#ff661a] text-black font-bold shadow-[0_0_20px_rgba(255,107,0,0.35)]',
    },
    {
      name: t.pricing.enterprise.name,
      subtitle: t.pricing.enterprise.desc,
      price: '$49',
      period: t.pricing.enterprise.period,
      highlight: false,
      features: t.pricing.enterprise.features,
      cta: t.pricing.enterprise.cta,
      ctaStyle: 'bg-[#181824] hover:bg-[#222232] text-white border border-[#2c2c3d]',
    },
  ];

  return (
    <div className="py-16 sm:py-24 bg-[#0a0a0f] border-t border-[#181822]">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-[#ff851a] tracking-widest uppercase block mb-3">
            TIERED RESOURCE SUBSCRIPTIONS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            {t.pricing.title}
          </h2>
          <p className="mt-4 text-neutral-400 text-sm sm:text-lg">
            {t.pricing.subtitle}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 relative ${
                plan.highlight
                  ? 'bg-[#12121c] border-2 border-[#ff851a] shadow-[0_0_40px_rgba(255,107,0,0.18)] md:-translate-y-2'
                  : 'bg-[#0e0e14] border border-[#222230] hover:border-[#333346]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#ff851a] text-black font-extrabold text-[11px] uppercase tracking-wider shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white font-display mb-1">
                  {plan.name}
                </h3>
                <p className="text-xs text-neutral-400 mb-6 min-h-[32px]">
                  {plan.subtitle}
                </p>

                <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-[#20202e]">
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    / {plan.period}
                  </span>
                </div>

                {/* Feature checklist */}
                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300">
                      <div className="w-4 h-4 rounded-full bg-[#ff5722]/15 text-[#ff851a] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onNavigate('tools')}
                className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${plan.ctaStyle}`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
