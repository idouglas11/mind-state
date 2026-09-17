import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Heart, Save } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
export default function Values() {
  const [values, setValues] = useState(['', '', '', '', '']);
  const [journals, setJournals] = useState(['', '', '', '', '']);
  const [initialized, setInitialized] = useState(false);
  const queryClient = useQueryClient();
  const { data: valuesData } = useQuery({
    queryKey: ['values'],
    queryFn: async () => {
      const result = await base44.entities.Values.list('-created_date', 1);
      return result[0] || null;
    }
  });
  useEffect(() => {
    if (valuesData && !initialized) {
      setValues(valuesData.values || ['', '', '', '', '']);
      setInitialized(true);
    }
  }, [valuesData, initialized]);
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Save to archive
      await base44.entities.Archive.create({
        entry_type: 'values',
        content: { values: data.values, journals: data.journals },
        date: new Date().toISOString().split('T')[0]
      });
      // Update current values
      if (valuesData?.id) {
        return base44.entities.Values.update(valuesData.id, { values: data.values, journals: ['', '', '',
'', ''] });
      } else {
        return base44.entities.Values.create({ values: data.values, journals: ['', '', '', '', ''] });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['values'] });
      setJournals(['', '', '', '', '']);
    }
  });
  const handleSave = () => {
    saveMutation.mutate({ values, journals });
  };
  const updateValue = (index, value) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };
  const updateJournal = (index, value) => {
    const newJournals = [...journals];
    newJournals[index] = value;
    setJournals(newJournals);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50/30">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-3">
            My Values
          </h1>
          <p className="text-gray-500">
            Define your core values and how you'll live them out
          </p>
        </motion.div>
        {/* Values List */}
        <div className="space-y-8">
          {[0, 1, 2, 3, 4].map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-5 h-5 text-rose-500" />
                <Input
                  value={values[index]}
                  onChange={(e) => updateValue(index, e.target.value)}
                  placeholder={`Value ${index + 1}`}
                  className="text-lg font-medium border-0 focus-visible:ring-0 px-0"
                />
              </div>
              <Textarea
                value={journals[index]}
                onChange={(e) => updateJournal(index, e.target.value)}
                placeholder="How did you live this value out recently? How will you live this value out?
What actions will you take? How do you want to feel?"
                className="min-h-[120px] resize-none border-gray-200 focus:border-rose-300"
              />
            </motion.div>
          ))}
        </div>
        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full py-6 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:
to-amber-700 text-white rounded-2xl shadow-lg shadow-rose-200 transition-all duration-300 hover:shadow-xl
hover:-translate-y-0.5"
          >
            <Save className="w-5 h-5 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save My Values'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
