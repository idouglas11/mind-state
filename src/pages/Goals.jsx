import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Target, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
export default function Goals() {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  // Persistent goals from Values entity
  const [editableGoals, setEditableGoals] = useState(['', '', '', '', '']);
  const [relationshipGoals, setRelationshipGoals] = useState(['', '', '', '', '']);
  const goalsInitialized = useRef(false);
  const { data: valuesData = [] } = useQuery({
    queryKey: ['values'],
    queryFn: () => base44.entities.Values.list('-created_date', 1),
  });
  const valuesRecord = valuesData[0] || null;
  useEffect(() => {
    if (valuesRecord && !goalsInitialized.current) {
      setEditableGoals(valuesRecord.goals || ['', '', '', '', '']);
      setRelationshipGoals(valuesRecord.relationship_goals || ['', '', '', '', '']);
      goalsInitialized.current = true;
    }
  }, [valuesRecord]);
  const saveGoalsMutation = useMutation({
    mutationFn: async (newGoals) => {
      if (valuesRecord?.id) {
        return base44.entities.Values.update(valuesRecord.id, { goals: newGoals });
      } else {
        return base44.entities.Values.create({ goals: newGoals });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['values'] }),
  });
  const saveRelationshipGoalsMutation = useMutation({
    mutationFn: async (newGoals) => {
      if (valuesRecord?.id) {
        return base44.entities.Values.update(valuesRecord.id, { relationship_goals: newGoals });
      } else {
        return base44.entities.Values.create({ relationship_goals: newGoals });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['values'] }),
  });
  // Daily goal actions from MorningPractice
  const [goalActions, setGoalActions] = useState(Array(5).fill(''));
  const actionsInitialized = useRef(false);
  const { data: practices = [], isLoading } = useQuery({
    queryKey: ['morning-practice', today],
    queryFn: () => base44.entities.MorningPractice.filter({ date: today }),
  });
  const todayPractice = practices[0];
  useEffect(() => {
    if (!isLoading && !actionsInitialized.current) {
      const saved = todayPractice?.goal_actions || [];
      setGoalActions([...saved, ...Array(Math.max(0, 5 - saved.length)).fill('')]);
      actionsInitialized.current = true;
    }
  }, [isLoading, todayPractice?.id]);
  const saveActionsMutation = useMutation({
    mutationFn: async (actions) => {
      if (todayPractice) {
        return base44.entities.MorningPractice.update(todayPractice.id, { goal_actions: actions });
      } else {
        return base44.entities.MorningPractice.create({ date: today, goal_actions: actions });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['morning-practice', today] }),
  });
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-stone-100 py-8 md:py-12 px-4">
      {/* Top bar */}
      <div className="max-w-[794px] mx-auto flex items-center gap-2 mb-4 text-stone-500">
        <Target className="w-5 h-5 text-purple-500" />
        <span className="text-sm font-medium">Goals</span>
      </div>
      {/* A4 Document */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[794px] mx-auto bg-white shadow-xl"
        style={{ minHeight: '800px' }}
      >
        <div className="p-10 md:p-14">
          {/* Document Header */}
          <div className="text-center border-b border-stone-200 pb-8 mb-10">
            <h1 className="text-3xl font-light tracking-wide text-stone-800 mb-2">Goals</h1>
            <p className="text-stone-400 text-sm tracking-widest uppercase">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          {/* Goals Section */}
          <div>
            <h2 className="text-lg font-semibold text-stone-700 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-purple-400 inline-block"></span>
              My Goals
            </h2>
            <p className="text-sm text-stone-500 mb-8">What am I working towards, and how will I show up today?</p>
            <div className="space-y-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-stone-400 text-sm w-4 shrink-0">{i + 1}.</span>
                    <Input
                      value={editableGoals[i] || ''}
                      onChange={(e) => {
                        const updated = [...editableGoals];
                        updated[i] = e.target.value;
                        setEditableGoals(updated);
                      }}
                      onBlur={() => saveGoalsMutation.mutate(editableGoals)}
                      placeholder={`Goal ${i + 1}`}
                      className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focus:border-purple-400 bg-transparent px-0 text-stone-700 h-auto py-2 font-medium text-base"
                    />
                  </div>
                  <Textarea
                    value={goalActions[i] || ''}
                    onChange={(e) => {
                      const updated = [...goalActions];
                      updated[i] = e.target.value;
                      setGoalActions(updated);
                    }}
                    onBlur={() => saveActionsMutation.mutate(goalActions)}
                    placeholder="How will I work towards this today..."
                    className="ml-7 border-0 border-b border-stone-100 rounded-none focus-visible:ring-0 focus:border-purple-300 resize-none bg-stone-50/50 px-2 text-stone-600 text-sm"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-stone-100 my-12" />
          {/* Relationship Goals Section */}
          <div>
            <h2 className="text-lg font-semibold text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-orange-400 inline-block"></span>
              Relationship Goals
            </h2>
            <p className="text-sm text-orange-400 mb-8">How do I want to show up for the people in my life?</p>
            <div className="space-y-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-orange-300 text-sm w-4 shrink-0">{i + 1}.</span>
                  <Input
                    value={relationshipGoals[i] || ''}
                    onChange={(e) => {
                      const updated = [...relationshipGoals];
                      updated[i] = e.target.value;
                      setRelationshipGoals(updated);
                    }}
                    onBlur={() => saveRelationshipGoalsMutation.mutate(relationshipGoals)}
                    placeholder={`Relationship goal ${i + 1}`}
                    className="border-0 border-b border-orange-100 rounded-none focus-visible:ring-0 focus:border-orange-400 bg-transparent px-0 text-stone-700 h-auto py-2 font-medium text-base"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
