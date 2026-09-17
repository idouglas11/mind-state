import React from 'react';
import { motion } from 'framer-motion';
import LifeTimelineWorksheet from '@/components/worksheets/LifeTimelineWorksheet';
export default function LifeTimeline() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-purple-50/30">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-3">Life Timeline</h1>
          <p className="text-gray-500">Map the chapters, turning points, and lessons that shaped you</p>
        </motion.div>
        <LifeTimelineWorksheet />
      </div>
    </div>
  );
}
