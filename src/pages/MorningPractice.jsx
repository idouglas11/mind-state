import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Sunrise, Settings, Check, Plus, X, Loader2, Edit2, Star } from 'lucide-react';
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
export default function MorningPractice() {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [responses, setResponses] = useState({
    gratitude: [],
    affirmations: [],
    custom: [],
    excited: ['', '', ''],
  });
  const hasInitialized = useRef(false);
  // Fetch or create template
  const { data: templates = [] } = useQuery({
    queryKey: ['morning-template'],
    queryFn: () => base44.entities.MorningPracticeTemplate.list()
  });
  const template = templates[0] || {
    gratitude_prompts: ["What am I grateful for today?", "Who made me smile recently?", "What opportunities do I have today?"],
    affirmation_prompts: ["I am...", "Today I will...", "I deserve..."],
    custom_prompts: []
  };
  // Fetch persisted values
  const { data: valuesData = [] } = useQuery({
    queryKey: ['values'],
    queryFn: () => base44.entities.Values.list('-created_date', 1)
  });
  const valuesRecord = valuesData[0] || null;
  const saveValuesMutation = useMutation({
    mutationFn: async (newValues) => {
      if (valuesRecord?.id) {
        return base44.entities.Values.update(valuesRecord.id, { values: newValues });
      } else {
        return base44.entities.Values.create({ values: newValues });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['values'] })
  });
  const [editableValues, setEditableValues] = useState(['', '', '', '', '']);
  const valuesInitialized = useRef(false);
  useEffect(() => {
    if (valuesRecord && !valuesInitialized.current) {
      setEditableValues(valuesRecord.values || ['', '', '', '', '']);
      valuesInitialized.current = true;
    }
  }, [valuesRecord]);
  // Persistent intentions for current chapter
  const [intentions, setIntentions] = useState('');
  const intentionsInitialized = useRef(false);
  const saveIntentionsMutation = useMutation({
    mutationFn: async (text) => {
      if (valuesRecord?.id) {
        return base44.entities.Values.update(valuesRecord.id, { intentions: text });
      } else {
        return base44.entities.Values.create({ intentions: text });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['values'] })
  });
  useEffect(() => {
    if (valuesRecord && !intentionsInitialized.current) {
      setIntentions(valuesRecord.intentions || '');
      intentionsInitialized.current = true;
    }
  }, [valuesRecord?.id]);
  // Fetch today's practice
  const { data: practices = [], isLoading } = useQuery({
    queryKey: ['morning-practice', today],
    queryFn: () => base44.entities.MorningPractice.filter({ date: today })
  });
  const todayPractice = practices[0];
  // Initialize responses from today's practice - only run once when data is loaded
  useEffect(() => {
    if (!isLoading) {
      const gratitudeLength = template.gratitude_prompts?.length || 0;
      const affirmationLength = template.affirmation_prompts?.length || 0;
      const customLength = template.custom_prompts?.length || 0;
      if (todayPractice) {
        const savedGratitude = todayPractice.gratitude_responses || [];
        const
              paddedGratitude
                              = [...savedGratitude,
                                                    ...Array(Math.max(0, 5 - savedGratitude.length)).fill('')];
        const savedAffirmations = todayPractice.affirmation_responses || [];
        const paddedAffirmations = [...savedAffirmations, ...Array(Math.max(0, 5 - savedAffirmations.length)).fill('')];
        const savedCustom = todayPractice.custom_responses || [];
        const neededCustom = template.custom_prompts?.length || 1;
        const paddedCustom = [...savedCustom, ...Array(Math.max(0, neededCustom - savedCustom.length)).fill('')];
        const savedExcited = todayPractice.excited_responses || [];
        const paddedExcited = [...savedExcited, ...Array(Math.max(0, 3 - savedExcited.length)).fill('')];setResponses({
          gratitude: paddedGratitude,
          affirmations: paddedAffirmations,
          custom: Array(5).fill('').map((_, i) => (todayPractice.goal_titles || [])[i] || ''),
          excited: paddedExcited,
        });
      } else {
        setResponses({
          gratitude: Array(5).fill(''),
          affirmations: Array(5).fill(''),
          custom: Array(5).fill(''),
          excited: ['', '', ''],
        });
      }
    }
  }, [isLoading, todayPractice?.id]);
  const savePractice = useMutation({
    mutationFn: async (data) => {
      if (todayPractice) {
        return base44.entities.MorningPractice.update(todayPractice.id, data);
      } else {
        return base44.entities.MorningPractice.create({ ...data, date: today });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['morning-practice', today]);
    }
  });
  const saveTemplate = useMutation({
    mutationFn: async (data) => {
      if (templates[0]) {
        return base44.entities.MorningPracticeTemplate.update(templates[0].id, data);
      } else {
        return base44.entities.MorningPracticeTemplate.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['morning-template']);
      setIsEditingTemplate(false);
    }
  });
  const handleResponseChange = (type, index, value) => {
    setResponses(prev => ({
      ...prev,
      [type]: prev[type].map((r, i) => i === index ? value : r)
    }));
  };
  // DPJ state & data
  const [dpjJournal, setDpjJournal] = useState('');
  const [futureVision, setFutureVision] = useState('');
  const dpjInitialized = useRef(false);
  const visionInitialized = useRef(false);
  // Today's daily DPJ entry
  const { data: dpjEntries = [] } = useQuery({
    queryKey: ['dpj-entry', today],
    queryFn: () => base44.entities.DPJEntry.filter({ date: today })
  });
  const todayDpj = dpjEntries[0];
  // Persistent future vision record
  const { data: visionRecords = [] } = useQuery({
    queryKey: ['dpj-vision'],
    queryFn: () => base44.entities.DPJEntry.filter({ is_vision: true })
  });
  const visionRecord = visionRecords[0];
  useEffect(() => {
    if (todayDpj && !dpjInitialized.current) {
      setDpjJournal(todayDpj.journal_content || '');
      dpjInitialized.current = true;
    }
  }, [todayDpj]);
  useEffect(() => {
    if (visionRecord && !visionInitialized.current) {
      setFutureVision(visionRecord.manifestation || '');
      visionInitialized.current = true;
    }
  }, [visionRecord]);
  const saveDpjJournal = useMutation({
    mutationFn: (journal_content) => todayDpj
      ? base44.entities.DPJEntry.update(todayDpj.id, { journal_content })
      : base44.entities.DPJEntry.create({ journal_content, date: today }),
    onSuccess: () => queryClient.invalidateQueries(['dpj-entry', today])
  });
  const saveVision = useMutation({
    mutationFn: (manifestation) => visionRecord
      ? base44.entities.DPJEntry.update(visionRecord.id, { manifestation })
      : base44.entities.DPJEntry.create({ manifestation, is_vision: true, date: 'vision' }),
    onSuccess: () => queryClient.invalidateQueries(['dpj-vision'])
  });
  const handleSave = () => {
    saveDpjJournal.mutate(dpjJournal);
    savePractice.mutate({
      gratitude_responses: responses.gratitude,
      affirmation_responses: responses.affirmations,
      goal_titles: responses.custom,
      excited_responses: responses.excited,
      completed: true
    });
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-stone-100 py-8 md:py-12 px-4">
      {/* Top bar */}
      <div className="max-w-[794px] mx-auto flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-stone-500">
          <Sunrise className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium">Morning Practice</span>
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
                <DialogTitle>Customize Your Morning Practice</DialogTitle>
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
        className="max-w-[794px]
                                                  shadow-xl"
                                 mx-auto bg-white
        style={{ minHeight: '1123px' }}
      >
        <div className="p-10 md:p-14 flex flex-col min-h-[1123px]">
          {/* Document Header */}
          <div className="text-center border-b border-stone-200 pb-8 mb-10">
            <h1 className="text-3xl font-light tracking-wide text-stone-800 mb-2">Morning Practice</h1>
            <p className="text-stone-400 text-sm tracking-widest uppercase">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          {/* Gratitude Section */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-stone-700 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-amber-400 inline-block"></span>
              Gratitude
            </h2>
            <p className="text-sm text-stone-500 mb-5">What am I grateful for today?</p>
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-stone-400 text-lg leading-none shrink-0">•</span>
                  <Input
                    value={responses.gratitude[i] || ''}
                    onChange={(e) => handleResponseChange('gratitude', i, e.target.value)}
                    placeholder="Write here..."
                    className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focus:border-amber-400 bg-transparent px-0 text-stone-700 h-auto py-1.5"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-stone-100 mb-10" />
          {/* Values Section */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-stone-700 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-rose-400 inline-block"></span>
              Values
            </h2>
            <div className="space-y-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-stone-400 text-sm w-4 shrink-0">{i + 1}.</span>
                    <Input
                      value={editableValues[i] || ''}
                      onChange={(e) => {
                        const updated = [...editableValues];
                        updated[i] = e.target.value;
                        setEditableValues(updated);
                      }}
                      onBlur={() => saveValuesMutation.mutate(editableValues)}
                      placeholder={`Value
                                          ${i + 1}`}
                      className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focus:border-rose-400 bg-transparent px-0 text-stone-700 h-auto py-2 font-medium"
                    />
                  </div>
                  <Textarea
                    value={responses.affirmations[i] || ''}
                    onChange={(e) => handleResponseChange('affirmations', i, e.target.value)}
                    placeholder="Define this value to you..."
                    className="ml-7 border-0 border-b border-stone-100 rounded-none focus-visible:ring-0focus:border-rose-300 resize-none bg-stone-50/50 px-2 text-stone-600 text-sm"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-stone-100 mb-10" />
          {/* Today I Am Excited For Section */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-stone-700 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-amber-400 inline-block"></span>
              Today
            </h2>
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <Textarea
                  key={i}
                  value={responses.excited[i] || ''}
                  onChange={(e) => {
                    const newExcited = [...responses.excited];
                    newExcited[i] = e.target.value;
                    setResponses(prev => ({ ...prev, excited: newExcited }));
                  }}
                  placeholder={`${i + 1}.`}
                  className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focus:border-amber-400 resize-none bg-transparent px-0 text-stone-700"
                  rows={2}
                />
              ))}
            </div>
          </div>
          <div className="border-t border-stone-100 mb-10 mt-10" />
          {/* Intentions for Current Chapter Section */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-stone-700 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-teal-400 inline-block"></span>
              Intentions for Current Chapter
            </h2>
            <Textarea
              value={intentions}
              onChange={(e) => setIntentions(e.target.value)}
              onBlur={() =>
                            saveIntentionsMutation.mutate(intentions)}
              placeholder="What do I intend for this chapter of my life..."
              className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focus:border-teal-400 resize-none bg-transparent px-0 text-stone-700"
              rows={4}
            />
          </div>
          <div className="border-t border-stone-100 mb-10 mt-10" />
          {/* Dream Practice Journal Section */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-stone-700 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-violet-400 inline-block"></span>
              DPJ
            </h2>
            <p className="text-xs text-stone-400 -mt-4 mb-5 ml-8">Directed Perspective Journalling</p>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm text-stone-500">A future me I can be excited about becoming</label>
                <Input
                  value={futureVision}
                  onChange={(e) => setFutureVision(e.target.value)}
                  onBlur={() => saveVision.mutate(futureVision)}
                  placeholder="I am manifesting..."
                  className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focus:border-violet-400 bg-transparent px-0 text-stone-700 h-auto py-2"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-stone-500">Mental Rehearsal — write as if it's already happening</label>
                <Textarea
                  value={dpjJournal}
                  onChange={(e) => setDpjJournal(e.target.value)}
                  placeholder="I feel so grateful now that... I can see myself... It feels amazing to..."
                  className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focus:border-violet-400 resize-none bg-transparent px-0 text-stone-700"
                  rows={5}
                />
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <div className="mt-10 pt-6 border-t border-stone-100">
              <Button
                onClick={handleSave}
                disabled={savePractice.isPending}
                className="w-full py-5 bg-stone-800 hover:bg-stone-900 text-white rounded-none tracking-widest text-sm uppercase"
              >
                {savePractice.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Complete Morning Practice
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
    gratitude_prompts: template.gratitude_prompts || [],
    affirmation_prompts: template.affirmation_prompts || [],
    custom_prompts: template.custom_prompts || []
  });
  const addPrompt = (type) => {
    setEditedTemplate(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }));
  };
  const updatePrompt = (type, index, value) => {
    setEditedTemplate(prev => ({
      ...prev,
      [type]: prev[type].map((p, i) => i === index ? value : p)
    }));
  };
  const removePrompt = (type, index) => {
    setEditedTemplate(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };
  return (
    <div className="space-y-6 py-4">
      {/* Gratitude Prompts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Gratitude Prompts</h3>
          <Button size="sm" variant="outline" onClick={() => addPrompt('gratitude_prompts')}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {editedTemplate.gratitude_prompts.map((prompt, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={prompt}
                onChange={(e) => updatePrompt('gratitude_prompts', index, e.target.value)}
                placeholder="Enter
                                   prompt..."
                className="flex-1"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removePrompt('gratitude_prompts', index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      {/* Affirmation Prompts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Affirmation Prompts</h3>
          <Button size="sm" variant="outline" onClick={() => addPrompt('affirmation_prompts')}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {editedTemplate.affirmation_prompts.map((prompt, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={prompt}
                onChange={(e) => updatePrompt('affirmation_prompts', index, e.target.value)}
                placeholder="Enter prompt..."
                className="flex-1"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removePrompt('affirmation_prompts', index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      {/* Custom Prompts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Custom Reflection Prompts</h3>
          <Button size="sm" variant="outline" onClick={() => addPrompt('custom_prompts')}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {editedTemplate.custom_prompts.map((prompt, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={prompt}
                onChange={(e) => updatePrompt('custom_prompts', index, e.target.value)}
                placeholder="Enter prompt..."
                className="flex-1"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removePrompt('custom_prompts', index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <Button
        onClick={() => onSave(editedTemplate)}
        disabled={isSaving}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Template'}
      </Button>
    </div>
  );
}
