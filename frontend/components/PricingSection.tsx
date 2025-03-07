'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  monthlyPrice: string;
  annualPrice?: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  highlighted: boolean;
  features: PricingFeature[];
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Basic Plan",
    monthlyPrice: "$0",
    annualPrice: "$0",
    description: "Perfect for individuals and small projects",
    buttonText: "Get Started",
    buttonLink: "/auth/signup",
    highlighted: false,
    features: [
      { text: "10 images per month", included: true },
      { text: "Up to 2x upscaling", included: true },
      { text: "Basic image enhancement", included: true },
      { text: "Email support", included: true },
      { text: "Advanced AI models", included: false },
      { text: "Batch processing", included: false },
      { text: "API access", included: false },
    ]
  },
  {
    name: "Professional Plan",
    monthlyPrice: "$15",
    annualPrice: "$144", // $15 * 12 months * 0.8 (20% discount) = $144
    description: "Ideal for professionals and businesses",
    buttonText: "Get Started",
    buttonLink: "/auth/signup?plan=pro",
    highlighted: true,
    features: [
      { text: "Unlimited images", included: true },
      { text: "Up to 16x upscaling", included: true },
      { text: "Advanced image enhancement", included: true },
      { text: "Priority email support", included: true },
      { text: "All AI models", included: true },
      { text: "Batch processing", included: true },
      { text: "API access", included: false },
    ]
  },
  {
    name: "Enterprise Plan",
    monthlyPrice: "$30",
    annualPrice: "$288", // $30 * 12 months * 0.8 (20% discount) = $288
    description: "For teams and large-scale projects",
    buttonText: "Contact Sales",
    buttonLink: "/contact",
    highlighted: false,
    features: [
      { text: "Unlimited images", included: true },
      { text: "Up to 16x upscaling", included: true },
      { text: "Advanced image enhancement", included: true },
      { text: "24/7 priority support", included: true },
      { text: "All AI models", included: true },
      { text: "Batch processing", included: true },
      { text: "API access", included: true },
    ]
  }
];

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleBillingToggle = (cycle: 'monthly' | 'annual') => {
    setBillingCycle(cycle);
  };

  return (
    <section className="relative bg-[#0D0D0D] overflow-hidden py-16 md:py-24">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
        
        {/* Diagonal glowing lines */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-0 left-0 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent transform -rotate-[30deg] translate-y-[30vh]"></div>
          <div className="absolute top-0 left-0 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent transform -rotate-[30deg] translate-y-[60vh]"></div>
          <div className="absolute top-0 left-0 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent transform -rotate-[30deg] translate-y-[90vh]"></div>
        </div>
      </div>
      
      {/* Content container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-white bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-300 text-lg md:text-xl mb-8">
            Select the perfect plan for your image upscaling needs
          </p>
          
          {/* Billing toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800/60 backdrop-blur-sm p-1 rounded-full inline-flex">
              <button
                onClick={() => handleBillingToggle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-gray-700 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly billing
              </button>
              <button
                onClick={() => handleBillingToggle('annual')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  billingCycle === 'annual'
                    ? 'bg-gray-700 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly billing
                <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index}
              className={`
                relative rounded-2xl p-6 md:p-8 bg-gray-900/60 backdrop-blur-sm border border-gray-800 
                shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                ${plan.highlighted ? 'md:scale-105 md:-translate-y-2 z-10' : 'z-0'}
              `}
            >
              {/* Highlight border for Professional plan */}
              {plan.highlighted && (
                <div className="absolute inset-0 rounded-2xl border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] -z-10"></div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-3xl md:text-4xl font-extrabold text-orange-500 mb-2">
                  {billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                  <span className="text-lg font-normal text-gray-400">
                    {billingCycle === 'monthly' ? '/month' : '/year'}
                  </span>
                </div>
                {billingCycle === 'annual' && plan.monthlyPrice !== "$0" && (
                  <div className="text-sm text-gray-400 mb-2">
                    ${Math.round(parseInt(plan.annualPrice!.replace('$', '')) / 12)} per month, billed annually
                  </div>
                )}
                <p className="text-gray-400">{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <span className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${feature.included ? 'text-orange-500' : 'text-gray-600'}`}>
                      <Check className="h-4 w-4" />
                    </span>
                    <span className={`ml-3 text-sm ${feature.included ? 'text-gray-300' : 'text-gray-500 line-through'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto">
                <Link
                  href={`${plan.buttonLink}${plan.buttonLink.includes('?') ? '&' : '?'}billing=${billingCycle}`}
                  className={`
                    block w-full py-3 px-4 rounded-full text-center text-sm font-semibold transition-all duration-300
                    ${plan.highlighted 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:from-orange-400 hover:to-orange-600 hover:scale-[1.03]' 
                      : 'border border-gray-400 text-white hover:bg-orange-500 hover:border-orange-500 hover:text-white hover:scale-[1.03]'
                    }
                  `}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 