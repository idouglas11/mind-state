import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
export default function DRT() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [description, setDescription] = useState('');
  const [existingRecord, setExistingRecord] = useState(null);
  const queryClient = useQueryClient();
  const { data: records = [] } = useQuery({
    queryKey: ['daily-records'],
    queryFn: () => base44.entities.DailyRecord.list('-date', 30)
  });
  useEffect(() => {
    const todayRecord = records.find(r => r.date === today);
    if (todayRecord) {
      setExistingRecord(todayRecord);
      setDescription(todayRecord.description);
    }
  }, [records, today]);
  const saveRecord = useMutation({
    mutationFn: (data) => {
      if (existingRecord) {
        return base44.entities.DailyRecord.update(existingRecord.id, data);
      }
      return base44.entities.DailyRecord.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['daily-records']);
    }
  });
  const handleSave = () => {
    saveRecord.mutate({ date: today, description });
  };
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-gray-800" />
            <h1 className="text-3xl font-semibold text-gray-800">Daily Record</h1>
          </div>
          <p className="text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-8"
        >
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What did you do today?
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your day..."
            className="min-h-[200px] text-base"
          />
          <Button
            onClick={handleSave}
            disabled={!description.trim() || saveRecord.isPending}
            className="mt-4 w-full md:w-auto bg-gray-900 hover:bg-gray-800"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveRecord.isPending ? 'Saving...' : existingRecord ? 'Update Record' : 'Save Record'}
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Previous Records</h2>
          <div className="space-y-3">
            {records
              .filter(r => r.date !== today)
              .map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                >
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {format(new Date(record.date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-gray-700">{record.description}</p>
                </motion.div>
              ))}
            {records.filter(r => r.date !== today).length === 0 && (
              <p className="text-center text-gray-400 py-8">No previous records</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
