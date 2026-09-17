import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Heart, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
const moodEmojis = {
  amazing: '🤩',
  good: '🙂',
  neutral: '😐',
  low: '😔',
  difficult: '😣'
};
const moodColors = {
  amazing: 'bg-amber-50 border-amber-200',
  good: 'bg-green-50 border-green-200',
  neutral: 'bg-slate-50 border-slate-200',
  low: 'bg-blue-50 border-blue-200',
  difficult: 'bg-purple-50 border-purple-200'
};
export default function JournalEntryCard({ entry, index }) {
  const formattedDate = entry.date
    ? format(new Date(entry.date), 'MMMM d, yyyy')
    : format(new Date(entry.created_date), 'MMMM d, yyyy');
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={createPageUrl(`JournalEntry?id=${entry.id}`)}>
        <div className={`group p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${moodColors[entry.mood] || 'bg-white border-gray-100'}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </div>
            {entry.mood && (
              <span className="text-2xl">{moodEmojis[entry.mood]}</span>
            )}
          </div>
          {entry.title && (
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{entry.title}</h3>
          )}
          <p className="text-gray-600 line-clamp-3 mb-4">
            {entry.content?.replace(/<[^>]*>/g, '').substring(0, 150)}
            {entry.content?.length > 150 && '...'}
          </p>
          {entry.gratitude?.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-rose-500">
              <Heart className="w-4 h-4" />
              <span>{entry.gratitude.length} gratitude{entry.gratitude.length > 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="flex items-center justify-end mt-4 text-gray-400 group-hover:text-gray-600 transition-colors">
            <span className="text-sm">Read more</span>
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
