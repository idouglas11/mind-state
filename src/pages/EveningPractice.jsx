import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Moon, Settings, Check, Plus, X, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export default function EveningPractice() {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [responses, setResponses] = useState({
    gratitude: ['', '', '', '', ''],
    values: ['', '', '', '', ''],
    intention_achieved: ['', '', ''],
    day_run_through: '',
    went_well: ['', '', ''],
    reflection: [],
    goals: [],
    moments: []
  });
  const hasInitialized = useRef(false);
  const { data: templates = [] } = useQuery({
    queryKey: ['evening-template'],
    queryFn: () => base44.entities.EveningPracticeTemplate.list()
  });
  const template = templates[0] || {
    reflection_prompts: ["How did today go?", "What did I learn today?", "What would I do differently?"],
    goals_prompts: ["What progress did I make on my goals?", "What's my priority for tomorrow?"],
    moments_prompts: ["What was the best moment of my day?", "What made me feel proud today?", "What brought me joy?"]
  };
  const { data: valuesData = [] } = useQuery({
    queryKey: ['values'],
    queryFn: () => base44.entities.Values.list('-created_date', 1)
  });
  const valuesRecord = valuesData[0] || null;
  const savedValues = valuesRecord?.values || ['', '', '', '', ''];
  const { data: morningPractices = [] } = useQuery({
    queryKey: ['morning-practice', today],
    queryFn: () => base44.entities.MorningPractice.filter({ date: today })
  });
  const morningIntention = morningPractices[0]?.custom_responses?.[0] || '';
  const { data: practices = [], isLoading } = useQuery({
    queryKey: ['evening-practice', today],
    queryFn: () => base44.entities.EveningPractice.filter({ date: today })
  });
  const todayPractice = practices[0];
  useEffect(() => {
    if (!isLoading) {
      const reflectionLength = template.reflection_prompts?.length || 0;
      const goalsLength = template.goals_prompts?.length || 0;
      const momentsLength = template.moments_prompts?.length || 0;
      if (todayPractice) {
        setResponses({
          gratitude: todayPractice.gratitude_responses || ['', '', '', '', ''],
          values: todayPractice.values_responses || ['', '', '', '', ''],
          intention_achieved: todayPractice.intention_achieved || ['', '', ''],
          day_run_through: todayPractice.day_run_through || '',
          went_well: todayPractice.went_well || ['', '', ''],
          reflection: todayPractice.reflection_responses || Array(reflectionLength).fill(''),
          goals: todayPractice.goals_responses || Array(goalsLength).fill(''),
          moments: todayPractice.moments_responses || Array(momentsLength).fill('')
        });
      } else {
        setResponses({
          gratitude: ['', '', '', '', ''],
          values: ['', '', '', '', ''],
          intention_achieved: ['', '', ''],
          day_run_through: '',
          went_well: ['', '', ''],
          reflection: Array(reflectionLength).fill(''),
          goals: Array(goalsLength).fill(''),
          moments: Array(momentsLength).fill('')
        });
      }
    }
  }, [isLoading, todayPractice?.id]);
  const savePractice = useMutation({
    mutationFn: async (data) => {
      if (todayPractice) {
        return base44.entities.EveningPractice.update(todayPractice.id, data);
      } else {
        return base44.entities.EveningPractice.create({ ...data, date: today });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['evening-practice', today]);
    }
  });
  const saveTemplate = useMutation({
    mutationFn: async (data) => {
      if (templates[0]) {
        return base44.entities.EveningPracticeTemplate.update(templates[0].id, data);
      } else {
        return base44.entities.EveningPracticeTemplate.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['evening-template']);
      setIsEditingTemplate(false);
    }
  });
  const handleResponseChange = (type, index, value) => {
    setResponses(prev => ({
      ...prev,
      [type]: prev[type].map((r, i) => i === index ? value : r)
    }));
  };
  const handleSave = () => {
    savePractice.mutate({
      gratitude_responses: responses.gratitude,
      values_responses: responses.values,
      intention_achieved: responses.intention_achieved,
      day_run_through: responses.day_run_through,
      went_well: responses.went_well,
      reflection_responses: responses.reflection,
      goals_responses: responses.goals,
      moments_responses: responses.moments,
      completed: true
    });
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-stone-100 py-8 md:py-12 px-4">
      {/* Top bar */}
      <div className="max-w-[794px] mx-auto flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-stone-500">
          <Moon className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-medium">Evening Practice</span>
        </div>
        <div className="flex items-center gap-3">
          {todayPractice?.completed && (
            <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
              <Check className="w-4 h-4" /> Completed
            </span>
          )}
          <Dialog open={isEditingTemplate} onOpenChange={setIsEditingTemplate}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full">
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Customize Your Evening Practice</DialogTitle>
                <DialogDescription>
                  Edit your daily prompts. Changes apply to future practices.
                </DialogDescription>
              </DialogHeader>
              <TemplateEditor
                template={template}
                onSave={(data) => saveTemplate.mutate(data)}
                isSaving={saveTemplate.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* A4 Document */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[794px] mx-auto bg-white shadow-xl"
        style={{ minHeight: '1123px' }}
      >
        <div className="p-10 md:p-14 flex flex-col min-h-[1123px]">
          {/* Document Header */}
          <div className="text-center border-b border-stone-200 pb-8 mb-10">
            <h1 className="text-3xl font-light tracking-wide text-stone-800 mb-2">Evening Practice</h1>
            <p className="text-stone-400 text-sm tracking-widest uppercase">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          {/* Gratitude Section */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-stone-700 uppercase tracking-widest mb-2 flex items
-center gap-2">
              <span className="w-6 h-0.5 bg-amber-400 inline-block"></span>
              Gratitude
            </h2>
            <p className="text-sm text-stone-500 mb-5">What am I grateful for today?</p>
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-stone-400 text-lg leading-none shrink-0">â¢</span>
                  <Input
                    value={responses.gratitude[i] || ''}
                    onChange={(e) => handleResponseChange('gratitude', i, e.target.value)}
                    placeholder="Write here..."
                    className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focu
s:border-amber-400 bg-transparent px-0 text-stone-700 h-auto py-1.5"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-stone-100 mb-10" />
          {/* Values Section */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-stone-700 uppercase tracking-widest mb-5 flex items
-center gap-2">
              <span className="w-6 h-0.5 bg-rose-400 inline-block"></span>
              Values
            </h2>
            <div className="space-y-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-stone-400 text-sm w-4 shrink-0">{i + 1}.</span>
                    <span className="text-stone-700 font-medium py-2 border-b border-stone-200 flex-1">
                      {savedValues[i] || <span className="text-stone-300 font-normal">Value {i + 1}</span
>}
                    </span>
                  </div>
                  <Textarea
                    value={responses.values[i] || ''}
                    onChange={(e) => handleResponseChange('values', i, e.target.value)}
                    placeholder="How did this value go for me today?"
                    className="ml-7 border-0 border-b border-stone-100 rounded-none focus-visible:ring-0
focus:border-rose-300 resize-none bg-stone-50/50 px-2 text-stone-600 text-sm"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-stone-100 mb-10" />
          {/* Intention Section */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-stone-700 uppercase tracking-widest mb-5 flex items
-center gap-2">
              <span className="w-6 h-0.5 bg-purple-400 inline-block"></span>
              Intention
            </h2>
            <div className="bg-stone-50 border border-stone-100 rounded px-4 py-3 mb-5">
              <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">This morning's intenti
on</p>
              <p className="text-stone-700 text-sm italic">
                {morningIntention || <span className="text-stone-300">No intention set this morning</span
>}
              </p>
            </div>
            <p className="text-sm text-stone-500 mb-3">How did I live this intention today?</p>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-stone-400 text-lg leading-none shrink-0">â¢</span>
                  <Input
                    value={responses.intention_achieved[i] || ''}
                    onChange={(e) => handleResponseChange('intention_achieved', i, e.target.value)}
                    placeholder="Write here..."
                    className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focu
s:border-purple-400 bg-transparent px-0 text-stone-700 h-auto py-1.5"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-stone-100 mb-10" />
          {/* Day Run Through */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-stone-700 uppercase tracking-widest mb-5 flex items
-center gap-2">
              <span className="w-6 h-0.5 bg-sky-400 inline-block"></span>
              Day Run Through
            </h2>
            <p className="text-sm text-stone-500 mb-3">Walk through your day from start to finish...</p>
            <Textarea
              value={responses.day_run_through || ''}
              onChange={(e) => setResponses(prev => ({ ...prev, day_run_through: e.target.value }))}
              placeholder="Write here..."
              className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focus:borde
r-sky-400 resize-none bg-transparent px-0 text-stone-700"
              rows={5}
            />
          </div>
          <div className="border-t border-stone-100 mb-10" />
          {/* Things That Went Well */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-stone-700 uppercase tracking-widest mb-5 flex items
-center gap-2">
              <span className="w-6 h-0.5 bg-emerald-400 inline-block"></span>
              Things That Went Really Well
            </h2>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-stone-400 text-sm font-medium shrink-0 w-4">{i + 1}.</span>
                  <Input
                    value={responses.went_well[i] || ''}
                    onChange={(e) => handleResponseChange('went_well', i, e.target.value)}
                    placeholder="Write here..."
                    className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focu
s:border-emerald-400 bg-transparent px-0 text-stone-700 h-auto py-1.5"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-auto">
            <div className="mt-10 pt-6 border-t border-stone-100">
              <Button
                onClick={handleSave}
                disabled={savePractice.isPending}
                className="w-full py-5 bg-stone-800 hover:bg-stone-900 text-white rounded-none tracking-w
idest text-sm uppercase"
              >
                {savePractice.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Complete Evening Practice
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
function TemplateEditor({ template, onSave, isSaving }) {
  const [editedTemplate, setEditedTemplate] = useState({
    reflection_prompts: template.reflection_prompts || [],
    goals_prompts: template.goals_prompts || [],
    moments_prompts: template.moments_prompts || []
  });
  const addPrompt = (type) => {
    setEditedTemplate(prev => ({ ...prev, [type]: [...prev[type], ''] }));
  };
  const updatePrompt = (type, index, value) => {
    setEditedTemplate(prev => ({ ...prev, [type]: prev[type].map((p, i) => i === index ? value : p) }));
  };
  const removePrompt = (type, index) => {
    setEditedTemplate(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
  };
  const sections = [
    { label: 'Goals Progress Prompts', key: 'goals_prompts' },
    { label: 'Favourite Moments Prompts', key: 'moments_prompts' },
  ];
  return (
    <div className="space-y-6 py-4">
      {sections.map(({ label, key }) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">{label}</h3>
            <Button size="sm" variant="outline" onClick={() => addPrompt(key)}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {editedTemplate[key].map((prompt, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={prompt}
                  onChange={(e) => updatePrompt(key, index, e.target.value)}
                  placeholder="Enter prompt..."
                  className="flex-1"
                />
                <Button size="icon" variant="ghost" onClick={() => removePrompt(key, index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button
        onClick={() => onSave(editedTemplate)}
        disabled={isSaving}
        className="w-full bg-stone-800 hover:bg-stone-900"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Template'}
      </Button>
    </div>
  );
}
