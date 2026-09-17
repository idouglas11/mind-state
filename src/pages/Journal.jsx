import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReflectionsTab from '@/components/journal/ReflectionsTab';
import LittleMemoriesTab from '@/components/journal/LittleMemoriesTab';
const TABS = ['Little Memories', 'Reflections'];
export default function Journal() {
  const [activeTab, setActiveTab] = useState('Little Memories');
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-purple-50/30">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-3">
            Memories & Processing
          </h1>
          <p className="text-gray-500">
            Capture little memories and process your reflections
          </p>
        </motion.div>
        {/* Tabs */}
        <div className="flex gap-1 mb-10 bg-gray-100 rounded-xl p-1 w-fit mx-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === 'Little Memories' && <LittleMemoriesTab />}
        {activeTab === 'Reflections' && <ReflectionsTab />}
      </div>
    </div>
  );
}
