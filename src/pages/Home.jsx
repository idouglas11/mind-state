import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, BookOpen, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AffirmationCard from '@/components/journal/AffirmationCard';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
export default function Home() {
  const queryClient = useQueryClient();
  const [weeklyPlan, setWeeklyPlan] = useState({
    monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: ''
  });
  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date', 6)
  });
  const { data: affirmations = [] } = useQuery({
    queryKey: ['affirmations'],
    queryFn: () => base44.entities.Affirmation.list()
  });
  const { data: planData } = useQuery({
    queryKey: ['weekly-plan'],
    queryFn: async () => {
      const result = await base44.entities.WeeklyPlan.list('-created_date', 1);
      return result[0] || null;
    }
  });
  React.useEffect(() => {
    if (planData) {
      setWeeklyPlan({
        monday: planData.monday || '',
        tuesday: planData.tuesday || '',
        wednesday: planData.wednesday || '',
        thursday: planData.thursday || '',
        friday: planData.friday || '',
        saturday: planData.saturday || '',
        sunday: planData.sunday || ''
      });
    }
  }, [planData]);
  const savePlan = useMutation({
    mutationFn: async (data) => {
      if (planData?.id) {
        return base44.entities.WeeklyPlan.update(planData.id, data);
      } else {
        return base44.entities.WeeklyPlan.create(data);
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['weekly-plan'])
  });
  const createAffirmation = useMutation({
    mutationFn: (text) => base44.entities.Affirmation.create({ text, is_favorite: true }),
    onSuccess: () => queryClient.invalidateQueries(['affirmations'])
  });
  const handleSaveAffirmation = (text) => {
    createAffirmation.mutate(text);
  };
  const handleSavePlan = () => {
    savePlan.mutate(weeklyPlan);
  };
  // Calculate streak
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].date || entries[i].created_date);
      entryDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };
  const streak = calculateStreak();
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = daysOfWeek[new Date().getDay()];
  const todayIndex = new Date().getDay();
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-purple-50/30">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-purple-400 mb-3">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
            Your Mindful Space
          </h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Take a moment to reflect, express gratitude, and nurture your inner peace.
          </p>
        </motion.div>
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10"
        >
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-800">{entries.length}</p>
                <p className="text-sm text-gray-500">Journal Entries</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-800">{streak}</p>
                <p className="text-sm text-gray-500">Day Streak</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-xl">
                <Sparkles className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-800">{affirmations.filter(a => a.is_favorite).length}</p>
                <p className="text-sm text-gray-500">Saved Affirmations</p>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Weekly Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Weekly Plan</h2>
            </div>
            {/* Today's Plan Highlight */}
            {weeklyPlan[today] && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-100">
                <p className="text-sm font-medium text-blue-600 mb-1">Today's Plan</p>
                <p className="text-gray-800">{weeklyPlan[today]}</p>
              </div>
            )}
            {/* Weekly Plan Inputs */}
            <div className="space-y-4">
              {daysOfWeek.map((day, index) => (
                <div key={day} className={index === todayIndex ? 'bg-blue-50/50 rounded-lg p-3' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {dayNames[index]}
                    {index === todayIndex && <span className="ml-2 text-blue-600">(Today)</span>}
                  </label>
                  <Textarea
                    value={weeklyPlan[day]}
                    onChange={(e) => setWeeklyPlan({ ...weeklyPlan, [day]: e.target.value })}
                    placeholder={`What's your plan for ${dayNames[index]}?`}
                    className="min-h-[60px]"
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={handleSavePlan}
              disabled={savePlan.isPending}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
            >
              {savePlan.isPending ? 'Saving...' : 'Save Weekly Plan'}
            </Button>
          </div>
        </motion.div>
        {/* Affirmation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <AffirmationCard
            customAffirmations={affirmations}
            onFavorite={handleSaveAffirmation}
          />
        </motion.div>
        {/* Recent Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent Entries</h2>
            <Link
              to={createPageUrl('Journal')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View All
            </Link>
          </div>
          {entriesLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No journal entries yet</p>
              <p className="text-sm text-gray-400">Start your mindfulness journey today</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {entries.map((entry, index) => (
                <JournalEntryCard key={entry.id} entry={entry} index={index} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
