import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Loader2 } from 'lucide-react';
import { useAppContext } from '@/store';
import { supabase } from '@/lib/supabaseClient';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for exploring aerodynamics.',
    features: [
      { name: '1 Import Quota', included: true },
      { name: 'Low Power Mode only', included: true },
      { name: 'Standard Flow Analytics', included: true },
      { name: 'NeuralFoil ML', included: false },
      { name: 'Fast Tune', included: false },
      { name: 'Deep Tune', included: false },
      { name: 'Heatmap', included: false },
    ],
    buttonText: 'Current Plan',
    tierId: 'free',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    description: 'For students and hobbyists.',
    features: [
      { name: '10 Imports Quota', included: true },
      { name: 'Low Power Mode only', included: true },
      { name: 'Standard Flow Analytics', included: true },
      { name: 'NeuralFoil ML', included: true },
      { name: 'Fast Tune unlocked', included: true },
      { name: 'Deep Tune', included: false },
      { name: 'Heatmap', included: false },
    ],
    buttonText: 'Upgrade to Pro',
    tierId: 'pro',
    popular: true,
  },
  {
    name: 'Ultra',
    price: '$49',
    period: '/mo',
    description: 'For professional aerospace engineers.',
    features: [
      { name: 'Unlimited Imports', included: true },
      { name: 'Disable Low Power Mode', included: true },
      { name: 'Advanced Flow Analytics', included: true },
      { name: 'NeuralFoil ML', included: true },
      { name: 'Fast Tune unlocked', included: true },
      { name: 'Deep Tune unlocked', included: true },
      { name: 'Heatmap unlocked', included: true },
    ],
    buttonText: 'Upgrade to Ultra',
    tierId: 'pro_max',
  },
];

const Pricing = () => {
  const { subscriptionTier, user } = useAppContext();
  const [loadingTier, setLoadingTier] = useState(null);

  const handleSubscribe = async (tierId) => {
    if (tierId === 'free' || tierId === subscriptionTier) return;
    setLoadingTier(tierId);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ tier: tierId }),
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        alert('Failed to initialize checkout: ' + data.error);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('An error occurred during checkout.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="w-full h-full premium-glass overflow-y-auto custom-scrollbar p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400 mb-4"
          >
            Upgrade your Aerodynamics
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto"
          >
            Choose the tier that fits your simulation needs. Unlock the power of NeuralFoil machine learning and advanced parameter tuning.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => {
            const isCurrentTier = subscriptionTier === tier.tierId;
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl border ${tier.popular ? 'border-sky-500 shadow-[0_0_30px_rgba(14,165,233,0.15)]' : 'border-zinc-800'} p-8 flex flex-col`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1">
                    <Zap size={14} /> Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-zinc-400 text-sm mb-6 h-10">{tier.description}</p>
                
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  {tier.period && <span className="text-zinc-500">{tier.period}</span>}
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-sky-400 shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-zinc-600 shrink-0" />
                      )}
                      <span className={feature.included ? 'text-zinc-200' : 'text-zinc-500'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleSubscribe(tier.tierId)}
                  disabled={isCurrentTier || loadingTier === tier.tierId}
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex justify-center items-center ${
                    isCurrentTier
                      ? 'bg-zinc-800 text-zinc-400 cursor-default'
                      : tier.popular
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg hover:shadow-sky-500/25'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                  }`}
                >
                  {loadingTier === tier.tierId ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isCurrentTier ? (
                    'Current Plan'
                  ) : (
                    tier.buttonText
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
