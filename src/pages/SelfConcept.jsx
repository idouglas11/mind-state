import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Sparkles, BookHeart, Compass, Star,
  Gem, ListOrdered, Target, UserCheck, Zap
} from 'lucide-react';
import SelfConceptWheel from '@/components/self-concept/SelfConceptWheel';
import SectionPanel from '@/components/self-concept/SectionPanel';
const SECTIONS = [
  {
    key: 'philosophy',
    label: 'My Life Philosophy',
    icon: Compass,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    placeholder: 'A principle, belief, or thing you live by...',
    titlePlaceholder: 'e.g. Progress over perfection',
    description: 'The principles, beliefs and truths you choose to live by.',
  },
  {
    key: 'identity',
    label: 'I Am A Person Who...',
    icon: UserCheck,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    placeholder: 'Complete the sentence: I am a person who...',
    titlePlaceholder: 'e.g. Shows up for others, Keeps going...',
    description: 'Identity statements that define who you are and who you are becoming.',
  },
  {
    key: 'qualities',
    label: 'My Favourite Things About Myself',
    icon: Heart,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
    placeholder: 'A quality, strength, or thing you love about yourself...',
    titlePlaceholder: 'e.g. My resilience',
    description: 'Celebrate who you are. The traits, qualities and things that make you, you.',
  },
  {
    key: 'feelings',
    label: 'My Favourite Feelings',
    icon: Sparkles,
    color: 'text-pink-400',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
    placeholder: 'Describe a feeling you love and when you feel it...',
    titlePlaceholder: 'e.g. Flow state',
    description: 'The feelings that light you up, make you feel alive, or bring you deep peace.',
  },
  {
    key: 'favourites',
    label: 'My Favourite Things About My Life',
    icon: Star,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    placeholder: 'Describe what you love about it and why it matters to you...',
    titlePlaceholder: 'e.g. My favourite café, My morning walk...',
    description: 'Favourite cafés, moments of the day, people, places, rituals — the things that make your life beautiful.',
  },
  {
    key: 'important',
    label: 'What Is Important To Me',
    icon: Gem,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    placeholder: 'Something that truly matters to you and why...',
    titlePlaceholder: 'e.g. Family, Freedom, Integrity...',
    description: 'The things, people, and values that sit at the core of what matters most to you.',
  },
  {
    key: 'memories',
    label: 'Memories, Experiences & Lessons',
    icon: BookHeart,
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    placeholder: 'Describe a memory or experience and what you learned from it...',
    titlePlaceholder: 'e.g. My first solo trip',
    description: 'Moments that shaped you and the wisdom you carry from them.',
  },
  {
    key: 'versions_of_me',
    label: 'Versions Of Me',
    icon: Zap,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    placeholder: 'Describe what this version of you is like and how they show up...',
    titlePlaceholder: 'e.g. The cutie, The strong one, The footballer...',
    description: 'The different facets of who you are. The building blocks that create you.',
  },
  {
    key: 'goals',
    label: 'My Goals',
    icon: Target,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    placeholder: 'Describe this goal and what achieving it means to you...',
    titlePlaceholder: 'e.g. Run a marathon, Launch my business...',
    description: 'The dreams and goals you are working towards and why they matter.',
  },
  {
    key: 'priorities',
    label: 'My Priorities',
    icon: ListOrdered,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    placeholder: 'Describe this priority and why it deserves your focus...',
    titlePlaceholder: 'e.g. My health, My creative work...',
    description: 'What you are choosing to focus on and invest your time and energy into right now.',
  },
];
const sectionMap = Object.fromEntries(SECTIONS.map(s => [s.key, s]));
export default function SelfConcept() {
  const [activeSection, setActiveSection] = useState(null);
  const handleSelect = (key) => {
    setActiveSection(prev => prev === key ? null : key);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-violet-50/30">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-3">Self Concept</h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            A living portrait of who you are. Tap a segment to explore and build that part of yourself.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <SelfConceptWheel
            activeSection={activeSection}
            onSelect={handleSelect}
          />
        </motion.div>
        {!activeSection && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-gray-400 mb-6"
          >
            Tap a segment to explore its section
          </motion.p>
        )}
        <AnimatePresence mode="wait">
          {activeSection && sectionMap[activeSection] && (
            <SectionPanel
              key={activeSection}
              section={sectionMap[activeSection]}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
