import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Edit2, Trash2, Save, X, Heart, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MoodSelector from '@/components/journal/MoodSelector';
import GratitudeInput from '@/components/journal/GratitudeInput';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
const moodEmojis = {
  amazing: '🤩',
  good: '🙂',
  neutral: '😐',
  low: '😔',
  difficult: '😣'
};
const moodLabels = {
  amazing: 'Amazing',
  good: 'Good',
  neutral: 'Neutral',
  low: 'Low',
  difficult: 'Difficult'
};
export default function JournalEntry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const entryId = urlParams.get('id');
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState(null);
  const { data: entry, isLoading } = useQuery({
    queryKey: ['journal-entry', entryId],
    queryFn: async () => {
      const entries = await base44.entities.JournalEntry.filter({ id: entryId });
      return entries[0];
    },
    enabled: !!entryId
  });
  const updateEntry = useMutation({
    mutationFn: (data) => base44.entities.JournalEntry.update(entryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['journal-entry', entryId]);
      queryClient.invalidateQueries(['journal-entries']);
      setIsEditing(false);
    }
  });
  const deleteEntry = useMutation({
    mutationFn: () => base44.entities.JournalEntry.delete(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries(['journal-entries']);
      navigate(createPageUrl('Journal'));
    }
  });
  const startEditing = () => {
    setEditedEntry({
      title: entry.title || '',
      content: entry.content || '',
      mood: entry.mood || '',
      gratitude: entry.gratitude || []
    });
    setIsEditing(true);
  };
  const handleSave = () => {
    updateEntry.mutate(editedEntry);
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-purple-50/30 flex items-ce
nter justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }
  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-purple-50/30 flex items-ce
nter justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Entry not found</p>
          <Link to={createPageUrl('Journal')}>
            <Button variant="outline">Back to Journal</Button>
          </Link>
        </div>
      </div>
    );
  }
  const formattedDate = entry.date
    ? format(new Date(entry.date), 'EEEE, MMMM d, yyyy')
    : format(new Date(entry.created_date), 'EEEE, MMMM d, yyyy');
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
            to={createPageUrl('Journal')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          {!isEditing && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={startEditing}
                className="text-gray-500 hover:text-purple-600"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your journal entry.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteEntry.mutate()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </motion.div>
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <Input
              value={editedEntry.title}
              onChange={(e) => setEditedEntry({ ...editedEntry, title: e.target.value })}
              placeholder="Entry title"
              className="text-2xl font-light border-0 border-b border-gray-200 rounded-none px-0 py-3"
            />
            <MoodSelector
              value={editedEntry.mood}
              onChange={(mood) => setEditedEntry({ ...editedEntry, mood })}
            />
            <Textarea
              value={editedEntry.content}
              onChange={(e) => setEditedEntry({ ...editedEntry, content: e.target.value })}
              className="min-h-[250px] text-lg border-gray-200 rounded-2xl p-6 resize-none"
            />
            <GratitudeInput
              value={editedEntry.gratitude}
              onChange={(gratitude) => setEditedEntry({ ...editedEntry, gratitude })}
            />
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={updateEntry.isPending}
                className="flex-1 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700
hover:to-pink-700 text-white rounded-2xl"
              >
                {updateEntry.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="py-6 px-6 rounded-2xl"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Date and Mood */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">{formattedDate}</p>
              {entry.mood && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                  <span className="text-sm">{moodLabels[entry.mood]}</span>
                </div>
              )}
            </div>
            {/* Title */}
            {entry.title && (
              <h1 className="text-3xl font-light text-gray-800">{entry.title}</h1>
            )}
            {/* Content */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
            {/* Gratitude */}
            {entry.gratitude?.length > 0 && (
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-100
p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-rose-400" />
                  <h3 className="font-medium text-gray-700">Gratitude</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.gratitude.map((item, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-white rounded-full text-sm text-rose-700 border border-rose
-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
