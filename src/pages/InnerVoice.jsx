import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Plus, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
const PROMPTS = [
  "I am proud of myself for...",
  "Something I love about myself is...",
  "I forgive myself for...",
  "I am becoming someone who...",
  "The way I want to speak to myself is...",
  "When I make a mistake, I tell myself...",
  "I deserve...",
  "My relationship with myself feels...",
  "I say to myself...",
];
export default function InnerVoice() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [activePrompt, setActivePrompt] = useState(null);
  const { data: entries = [] } = useQuery({
    queryKey: ['inner-voice'],
    queryFn: () => base44.entities.SelfConcept.filter({ section: 'inner_voice' }, '-created_date'),
  });
  const createMutation = useMutation({
    mutationFn: (content) => base44.entities.SelfConcept.create({ section: 'inner_voice', content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inner-voice'] });
      setInput('');
      setActivePrompt(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SelfConcept.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inner-voice'] }),
  });
  const handlePromptClick = (prompt) => {
    setActivePrompt(prompt);
    setInput(prompt + ' ');
  };
  const handleSubmit = () => {
    if (!input.trim()) return;
    createMutation.mutate(input.trim());
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/40 via-white to-rose-50/20">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-cente
r mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-100 rounded-2xl mb-
4">
            <MessageCircle className="w-7 h-7 text-violet-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">Inner Voice</h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">This is the way I speak to myself. I prac
tise it here so that it transfers into how I speak in my head to myself throughout the day.</p>
        </motion.div>
        {/* Prompts */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} classNa
me="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Prompts to ge
t started</p>
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handlePromptClick(prompt)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  activePrompt === prompt
                    ? 'bg-violet-100 border-violet-300 text-violet-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-violet-200 hover:text-violet-600'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </motion.div>
        {/* Input */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} classN
ame="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
          <Textarea
            placeholder="Write to yourself here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="rounded-xl border-gray-200 resize-none min-h-[100px] text-gray-700 text-sm focus-v
isible:ring-violet-300"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
            }}
          />
          <div className="flex justify-end mt-3">
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || createMutation.isPending}
              className="bg-gray-900 hover:bg-gray-800 rounded-xl text-sm gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Save
            </Button>
          </div>
        </motion.div>
        {/* Saved Entries */}
        {entries.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Your inner
voice</p>
            <div className="space-y-3">
              <AnimatePresence>
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex
items-start justify-between gap-3"
                  >
                    <p className="text-gray-700 text-sm leading-relaxed">{entry.content}</p>
                    <button
                      onClick={() => deleteMutation.mutate(entry.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hove
r:text-red-400 mt-0.5 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
        {entries.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nothing saved yet. Start by writing something kind to yourself.</p>
          </div>
        )}
      </div>
    </div>
  );
}
