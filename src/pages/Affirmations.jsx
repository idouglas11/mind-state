import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, Trash2, Sparkles, Loader2, Volume2, Square } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AffirmationCard from '@/components/journal/AffirmationCard';
const categories = [
  { value: 'self-love', label: 'Self-Love', color: 'from-pink-100 to-rose-100 border-pink-200' },
  { value: 'confidence', label: 'Confidence', color: 'from-amber-100 to-orange-100 border-amber-200' },
  { value: 'peace', label: 'Peace', color: 'from-blue-100 to-cyan-100 border-blue-200' },
  { value: 'growth', label: 'Growth', color: 'from-green-100 to-emerald-100 border-green-200' },
  { value: 'gratitude', label: 'Gratitude', color: 'from-purple-100 to-violet-100 border-purple-200' },
  { value: 'strength', label: 'Strength', color: 'from-red-100 to-rose-100 border-red-200' },
];
export default function Affirmations() {
  const queryClient = useQueryClient();
  const [newAffirmation, setNewAffirmation] = useState('');
  const [newCategory, setNewCategory] = useState('self-love');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const speechRef = useRef(null);
  const { data: affirmations = [], isLoading } = useQuery({
    queryKey: ['affirmations'],
    queryFn: () => base44.entities.Affirmation.list('-created_date')
  });
  const createAffirmation = useMutation({
    mutationFn: (data) => base44.entities.Affirmation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['affirmations']);
      setNewAffirmation('');
    }
  });
  const deleteAffirmation = useMutation({
    mutationFn: (id) => base44.entities.Affirmation.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['affirmations'])
  });
  const toggleFavorite = useMutation({
    mutationFn: ({ id, is_favorite }) => base44.entities.Affirmation.update(id, { is_favorite: !is_favorite }),
    onSuccess: () => queryClient.invalidateQueries(['affirmations'])
  });
  const handleAdd = (e) => {
    e.preventDefault();
    if (!newAffirmation.trim()) return;
    createAffirmation.mutate({
      text: newAffirmation.trim(),
      category: newCategory,
      is_favorite: false
    });
  };
  const filteredAffirmations = affirmations.filter(a =>
    filterCategory === 'all' || a.category === filterCategory
  );
  const getCategoryColor = (category) => {
    return categories.find(c => c.value === category)?.color || 'from-gray-100 to-gray-100 border-gray-200';
  };
  const speakAffirmation = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onend = () => {
        if (isPlaying) {
          setCurrentIndex((prev) => (prev + 1) % filteredAffirmations.length);
        }
      };
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };
  const handlePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      setCurrentIndex(0);
    }
  };
  useEffect(() => {
    if (isPlaying && filteredAffirmations.length > 0) {
      speakAffirmation(filteredAffirmations[currentIndex].text);
    }
  }, [isPlaying, currentIndex, filteredAffirmations]);
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-purple-50/30">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-3">
            Positive Affirmations
          </h1>
          <p className="text-gray-500">
            Nurture your mind with empowering thoughts
          </p>
        </motion.div>
        {/* Daily Affirmation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <AffirmationCard customAffirmations={affirmations} />
        </motion.div>
        {/* Play Affirmations */}
        {filteredAffirmations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <Button
              onClick={handlePlayPause}
              className={`w-full py-6 rounded-2xl text-white shadow-lg transition-all ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-5 h-5 mr-2" />
                  Stop Reading
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 mr-2" />
                  Play Affirmations Out Loud
                </>
              )}
            </Button>
            {isPlaying && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Reading {currentIndex + 1} of {filteredAffirmations.length}
              </p>
            )}
          </motion.div>
        )}
        {/* Add New Affirmation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm"
        >
          <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-500" />
            Add Your Own Affirmation
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <Input
              value={newAffirmation}
              onChange={(e) => setNewAffirmation(e.target.value)}
              placeholder="I am worthy of all good things..."
              className="py-6 rounded-xl border-gray-200 focus:border-purple-300"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="submit"
                disabled={!newAffirmation.trim() || createAffirmation.isPending}
                className="flex-1 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700hover:to-pink-700 text-white rounded-xl"
              >
                {createAffirmation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Add Affirmation
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          <Button
            variant={filterCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory('all')}
            className={`rounded-full ${filterCategory === 'all' ? 'bg-purple-600' : ''}`}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={filterCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(cat.value)}
              className={`rounded-full ${filterCategory === cat.value ? 'bg-purple-600' : ''}`}
            >
              {cat.label}
            </Button>
          ))}
        </motion.div>
        {/* Affirmations Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredAffirmations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl border border-gray-100"
          >
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No affirmations yet</p>
            <p className="text-sm text-gray-400">Add your first one above</p>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {filteredAffirmations.map((affirmation, index) => (
                <motion.div
                  key={affirmation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative p-6 rounded-2xl bg-gradient-to-br ${getCategoryColor(affirmation.category)} border transition-all duration-300 hover:shadow-md`}
                >
                  <p className="text-gray-800 text-lg leading-relaxed pr-8">
                    "{affirmation.text}"
                  </p>
                  {affirmation.category && (
                    <p className="text-xs uppercase tracking-wider text-gray-500 mt-4">
                      {affirmation.category.replace('-', ' ')}
                    </p>
                  )}
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite.mutate({ id: affirmation.id, is_favorite: affirmation.is_favorite })}
                      className={`h-8 w-8 ${affirmation.is_favorite ? 'text-pink-500' : 'text-gray-400'}`}
                    >
                      <Heart className={`w-4 h-4 ${affirmation.is_favorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAffirmation.mutate(affirmation.id)}
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
