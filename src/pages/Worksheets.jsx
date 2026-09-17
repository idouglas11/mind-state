import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { User, Brain } from 'lucide-react';
import ValuesIdentityWorksheet from '@/components/worksheets/ValuesIdentityWorksheet';
import LimitingBeliefsWorksheet from '@/components/worksheets/LimitingBeliefsWorksheet';
const worksheets = [
  { id: 'values_identity', label: 'Values & Identity', icon: User, color: 'from-purple-50 to-violet-50 border-purple-100', activeColor: 'bg-purple-600', accent: 'text-purple-600' },
  { id: 'limiting_beliefs', label: 'Limiting Beliefs', icon: Brain, color: 'from-amber-50 to-orange-50 border-amber-100', activeColor: 'bg-amber-500', accent: 'text-amber-600' },
];
export default function Worksheets() {
  const [activeId, setActiveId] = useState('values_identity');
  const queryClient = useQueryClient();
  const { data: allResponses = [] } = useQuery({
    queryKey: ['worksheet-responses'],
    queryFn: () => base44.entities.WorksheetResponse.list('-created_date', 50),
  });
  const getLatest = (worksheetId) => {
    return allResponses.find(r => r.worksheet_id === worksheetId) || null;
  };
  const saveMutation = useMutation({
    mutationFn: async ({ worksheetId, responses }) => {
      const existing = getLatest(worksheetId);
      const today = format(new Date(), 'yyyy-MM-dd');
      if (existing) {
        return base44.entities.WorksheetResponse.update(existing.id, { responses, date: today });
      } else {
        return base44.entities.WorksheetResponse.create({ worksheet_id: worksheetId, responses, date: today });
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['worksheet-responses']),
  });
  const handleSave = (worksheetId, responses) => {
    saveMutation.mutate({ worksheetId, responses });
  };
  const formatSavedAt = (worksheetId) => {
    const record = getLatest(worksheetId);
    if (!record) return null;
    return format(new Date(record.updated_date || record.created_date), 'MMM d, h:mm a');
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-purple-50/30">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-3">Worksheets</h1>
          <p className="text-gray-500">Deep-dive exercises to understand yourself and grow your mindset</
p>
        </motion.div>
        {/* Worksheet Selector */}
        <div className="flex gap-3 mb-8">
          {worksheets.map((w) => (
            <button
              key={w.id}
              onClick={() => setActiveId(w.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeId === w.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <w.icon className="w-4 h-4" />
              {w.label}
            </button>
          ))}
        </div>
        {/* Active Worksheet */}
        {activeId === 'values_identity' && (
          <ValuesIdentityWorksheet
            initialResponses={getLatest('values_identity')?.responses || {}}
            onSave={(r) => handleSave('values_identity', r)}
            isSaving={saveMutation.isPending}
            savedAt={formatSavedAt('values_identity')}
          />
        )}
        {activeId === 'limiting_beliefs' && (
          <LimitingBeliefsWorksheet
            initialResponses={getLatest('limiting_beliefs')?.responses || {}}
            onSave={(r) => handleSave('limiting_beliefs', r)}
            isSaving={saveMutation.isPending}
            savedAt={formatSavedAt('limiting_beliefs')}
          />
        )}
      </div>
    </div>
  );
}
