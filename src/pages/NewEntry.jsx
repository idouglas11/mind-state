import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MoodSelector from '@/components/journal/MoodSelector';
import GratitudeInput from '@/components/journal/GratitudeInput';
export default function NewEntry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [entry, setEntry] = useState({
    title: '',
    content: '',
    mood: '',
    gratitude: [],
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const createEntry = useMutation({
    mutationFn: (data) => base44.entities.JournalEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['journal-entries']);
      navigate(createPageUrl('Home'));
    }
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!entry.content.trim()) return;
    createEntry.mutate(entry);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-purple-50/30">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link
            to={createPageUrl('Home')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <p className="text-sm text-gray-400">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </motion.div>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Title */}
          <div className="space-y-2">
            <Input
              value={entry.title}
              onChange={(e) => setEntry({ ...entry, title: e.target.value })}
              placeholder="Give this entry a title (optional)"
              className="text-2xl font-light border-0 border-b border-gray-200 rounded-none px-0 py-3 foc
us:ring-0 focus:border-purple-400 placeholder:text-gray-300"
            />
          </div>
          {/* Mood Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MoodSelector
              value={entry.mood}
              onChange={(mood) => setEntry({ ...entry, mood })}
            />
          </motion.div>
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-600">
              What's on your mind?
            </label>
            <Textarea
              value={entry.content}
              onChange={(e) => setEntry({ ...entry, content: e.target.value })}
              placeholder="Let your thoughts flow freely..."
              className="min-h-[250px] text-lg border-gray-200 focus:border-purple-300 focus:ring-purple-
200 rounded-2xl p-6 resize-none leading-relaxed"
            />
          </motion.div>
          {/* Gratitude */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GratitudeInput
              value={entry.gratitude}
              onChange={(gratitude) => setEntry({ ...entry, gratitude })}
            />
          </motion.div>
          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              type="submit"
              disabled={!entry.content.trim() || createEntry.isPending}
              className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 h
over:to-pink-700 text-white rounded-2xl shadow-lg shadow-purple-200 transition-all duration-300 hover:sha
dow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createEntry.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Entry
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}
