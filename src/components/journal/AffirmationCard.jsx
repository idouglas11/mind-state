import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
const defaultAffirmations = [
  "I am worthy of love and respect.",
  "I trust the journey of my life.",
  "I am growing stronger every day.",
  "I choose peace over worry.",
  "I am enough, just as I am.",
  "My potential is limitless.",
  "I embrace the beauty of this moment.",
  "I am creating a life I love.",
  "I release what no longer serves me.",
  "I am open to wonderful possibilities."
];
export default function AffirmationCard({ customAffirmations = [], onFavorite }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const allAffirmations = customAffirmations.length > 0
    ? customAffirmations.map(a => a.text)
    : defaultAffirmations;
  const nextAffirmation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % allAffirmations.length);
    setTimeout(() => setIsAnimating(false), 500);
  };
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) nextAffirmation();
    }, 10000);
    return () => clearInterval(interval);
  }, [isAnimating, allAffirmations.length]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-8 md:p-12 border border-purple-100/50 shadow-xl shadow-purple-100/20"
    >
      <div className="absolute top-4 right-4">
        <Sparkles className="w-6 h-6 text-purple-300" />
      </div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-violet-200/30 to-indigo-200/30 rounded-full blur-3xl" />
      <p className="text-xs uppercase tracking-[0.2em] text-purple-400 mb-6 font-medium">
        Today's Affirmation
      </p>
      <div className="min-h-[100px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-2xl md:text-3xl font-light text-gray-800 text-center leading-relaxed"
          >
            "{allAffirmations[currentIndex]}"
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="flex justify-center gap-3 mt-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={nextAffirmation}
          className="text-purple-500 hover:text-purple-700 hover:bg-purple-100/50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          New affirmation
        </Button>
        {onFavorite && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFavorite(allAffirmations[currentIndex])}
            className="text-pink-500 hover:text-pink-700 hover:bg-pink-100/50"
          >
            <Heart className="w-4 h-4 mr-2" />
            Save
          </Button>
        )}
      </div>
    </motion.div>
  );
}
