import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Save, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
const EMPTY_ENTRY = { situation: '', howIWillShowUp: '', selfEncouragement: '' };
export default function Priming() {
  const [columns, setColumns] = useState(Array(5).fill(null).map(() => ({ ...EMPTY_ENTRY })));
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.PrimingEntry.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['priming-entries'] }),
  });
  const updateColumn = (index, field, value) => {
    setColumns(prev => prev.map((col, i) => i === index ? { ...col, [field]: value } : col));
  };
  const handleSave = (index) => {
    const col = columns[index];
    if (!col.situation.trim()) return;
    saveMutation.mutate({
      situation: col.situation,
      how_i_will_show_up: col.howIWillShowUp,
      self_encouragement: col.selfEncouragement,
      date: today,
    });
  };
  const handleClear = (index) => {
    setColumns(prev => prev.map((col, i) => i === index ? { ...EMPTY_ENTRY } : col));
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50/40 via-white to-orange-50/20">
      <div className="px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-100 rounded-2xl mb-
4">
            <Zap className="w-7 h-7 text-yellow-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">Priming</h1>
          <p className="text-gray-500 text-sm">Intentionally choose how you show up.</p>
        </motion.div>
        {/* 5 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {columns.map((col, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-
col"
            >
              <div className="px-4 pt-4 pb-2 border-b border-gray-50">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-300">#{index +
1}</span>
              </div>
              {/* The Situation */}
              <div className="p-4 border-b border-gray-100">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-
2">
                  The Situation
                </label>
                <Textarea
                  value={col.situation}
                  onChange={(e) => updateColumn(index, 'situation', e.target.value)}
                  placeholder="What task or situation are you preparing for?..."
                  className="min-h-[90px] border-0 bg-gray-50 focus-visible:ring-1 resize-none text-gray-
700 placeholder:text-gray-400 rounded-xl text-sm"
                />
              </div>
              {/* How I Will Show Up */}
              <div className="p-4 border-b border-gray-100">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-
2">
                  How I Will Show Up
                </label>
                <Textarea
                  value={col.howIWillShowUp}
                  onChange={(e) => updateColumn(index, 'howIWillShowUp', e.target.value)}
                  placeholder="The qualities, energy, and intention you want to bring..."
                  className="min-h-[90px] border-0 bg-gray-50 focus-visible:ring-1 resize-none text-gray-
700 placeholder:text-gray-400 rounded-xl text-sm"
                />
              </div>
              {/* I Am In Process */}
              <div className="p-4 flex-1">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-
2">
                  I Am In Process
                </label>
                <Textarea
                  value={col.selfEncouragement}
                  onChange={(e) => updateColumn(index, 'selfEncouragement', e.target.value)}
                  placeholder="I am a person who shows up this way. This is me growing..."
                  className="min-h-[90px] border-0 bg-gray-50 focus-visible:ring-1 resize-none text-gray-
700 placeholder:text-gray-400 rounded-xl text-sm"
                />
              </div>
              {/* Actions */}
              <div className="px-4 pb-4 flex items-center gap-2">
                <Button
                  onClick={() => handleSave(index)}
                  disabled={!col.situation.trim() || saveMutation.isPending}
                  size="sm"
                  className="gap-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs"
                >
                  <Save className="w-3 h-3" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClear(index)}
                  className="gap-1.5 text-gray-400 hover:text-gray-600 rounded-xl text-xs"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
