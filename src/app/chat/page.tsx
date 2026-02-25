'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  Trash2,
  MessageCircle,
  ChevronRight,
  PanelRightOpen,
  PanelRightClose,
  Activity,
  Stethoscope,
} from 'lucide-react';
import { useChatHistory } from '@/hooks/use-chat-history';
import { useConversation } from '@/hooks/useConversation';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useToast } from '@/hooks/use-toast';
import { ConversationThread } from '@/components/chat/ConversationThread';
import { InputToolbar } from '@/components/chat/InputToolbar';
import { ProcessingStatusPanel } from '@/components/chat/ProcessingStatusPanel';
import { Logo } from '@/components/logo';
import { ReportPreviewModal } from '@/components/report/ReportPreviewModal';
import { useReportGenerator } from '@/hooks/useReportGenerator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message } from '@/lib/types';

// Reusing the Floating Orbs from the landing page
const FloatingOrbs = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <motion.div
      animate={{ y: [0, -40, 0], x: [0, 20, 0], rotate: [0, 90, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] rounded-full bg-med-teal/5 blur-[100px]"
    />
    <motion.div
      animate={{ y: [0, 60, 0], x: [0, -30, 0], rotate: [0, -45, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-[20%] right-[5%] w-[40vw] h-[40vw] min-w-[400px] min-h-[400px] rounded-full bg-sky-500/5 blur-[120px]"
    />
  </div>
);
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
} from '@/components/ui/alert-dialog';
import { motionPresets } from '@/lib/design-tokens';

export default function ChatPage() {
  const { conversations, deleteConversation, saveConversation } = useChatHistory();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const { toast } = useToast();

  const conversation = useConversation();
  const audioRecorder = useAudioRecorder();
  const reportGenerator = useReportGenerator();

  // Handle audio submission when recording stops
  useEffect(() => {
    if (audioRecorder.audioDataUri && !audioRecorder.isRecording) {
      conversation.submitAudio(audioRecorder.audioDataUri);
      audioRecorder.clearAudioData();
    }
  }, [audioRecorder.audioDataUri, audioRecorder.isRecording]);

  // Synchronize conversation thread with selected history
  useEffect(() => {
    if (selectedConversationId) {
      if (selectedConversationId.startsWith('new_')) {
        conversation.clearMessages();
      } else {
        const hc = conversations.find((c) => c.id === selectedConversationId);
        if (hc && hc.messages.length > 0) {
          conversation.setMessages(hc.messages as any);
        }
      }
    }
  }, [selectedConversationId, conversations]);

  const handleStartNewChat = () => {
    setSelectedConversationId(`new_${Date.now()}`);
  };

  const handleLoadDemo = () => {
    const demoId = `demo_${Date.now()}`;

    // Create rich dummy data that explicitly triggers the cool visualizers
    const demoMessages: Message[] = [
      {
        id: 'msg-1',
        sender: 'bot',
        text: "Welcome to MediMind. Describe the patient's symptoms, upload medical images, or use voice input to begin a clinical consultation.",
        timestamp: new Date()
      },
      {
        id: 'msg-2',
        sender: 'user',
        text: "Patient presents with chronic temporal headaches radiating to the occipital region, accompanied by a visual aura, photophobia, and mild cognitive fog.",
        timestamp: new Date()
      },
      {
        id: 'msg-3',
        sender: 'bot',
        timestamp: new Date(),
        diagnosisData: {
          patient_problem: "Chronic temporal headaches radiating to the occipital region, accompanied by visual aura and mild cognitive fog.",
          diagnosis: ["Migraine with Aura", "Tension Headache", "Occipital Neuralgia", "Cluster Headache"],
          diagnosis_simplified: ["Severe Migraine", "Stress Headache", "Nerve Pain"],
          metadata: {
            severity: "critical", // Triggers RED glowing rings on brain
            confidence: "85%",
            "Primary Symptom": "Throbbing pain",
            "Secondary Symptoms": ["Photophobia", "Nausea", "Visual aura"]
          },
          treatment_plan: {
            medications: ["Sumatriptan 50mg PRN", "Propranolol 40mg daily (preventative)", "Naproxen 500mg"],
            lifestyle_modifications: ["Dark room rest during attacks", "Consistent sleep schedule", "Reduce screen time", "Hydration 2.5L/day"]
          }
        }
      }
    ];

    saveConversation(demoId, demoMessages, {});
    setSelectedConversationId(demoId);
    toast({
      title: 'Demo Case Loaded',
      description: 'Showing advanced visualizations with mocked backend data.',
    });
  };

  const handleDelete = (id: string) => {
    deleteConversation(id);
    if (selectedConversationId === id) {
      setSelectedConversationId(null);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      conversation.submitAudio(reader.result as string, file.name);
    };
    reader.onerror = () => {
      toast({
        title: 'Error',
        description: 'Could not read the uploaded file.',
        variant: 'destructive',
      });
    };
  };

  const handleImageUpload = (file: File) => {
    conversation.submitImage(file);
  };

  // Extract latest DiagnosisData from messages for the report modal
  const handleOpenReport = () => {
    const lastBotMsg = [...conversation.messages]
      .reverse()
      .find((m) => m.sender === 'bot' && m.diagnosisData);
    if (lastBotMsg?.diagnosisData) {
      reportGenerator.openReport(lastBotMsg.diagnosisData);
    }
  };

  // If no conversation selected, show welcome screen
  if (!selectedConversationId) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center bg-med-dark overflow-hidden relative p-4 md:p-8">
        {/* ── Ambient Background ── */}
        <FloatingOrbs />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center relative z-10"
        >
          <Logo className="mb-6 h-20 w-20 text-med-teal opacity-80" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Welcome, Doctor
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Start a new consultation or review a previous case.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 w-full max-w-lg relative z-10"
        >
          {/* Recent cases */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm font-medium text-foreground">
                Recent Cases
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartNewChat}
                className="text-med-teal hover:text-med-teal hover:bg-med-teal/10 text-xs"
              >
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                New Case
              </Button>
            </div>

            <ScrollArea className="max-h-[300px]">
              {conversations.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground/40">
                  <div className="text-center space-y-2">
                    <MessageCircle className="h-8 w-8 mx-auto opacity-30" />
                    <p className="text-xs">No recent cases</p>
                  </div>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {conversations.map((convo) => (
                    <div
                      key={convo.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04] group"
                    >
                      <button
                        onClick={() =>
                          setSelectedConversationId(convo.id)
                        }
                        className="flex-1 text-left min-w-0"
                      >
                        <p className="text-sm font-medium text-foreground/90 truncate">
                          {convo.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                          {new Date(
                            convo.lastModified
                          ).toLocaleDateString()}
                        </p>
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground/30 hover:text-med-critical opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-med-surface border-white/[0.08]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete this case?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-white/[0.1]">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(convo.id)}
                              className="bg-med-critical hover:bg-med-critical/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Start new case CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="space-y-3 mt-4">
            <button
              onClick={handleStartNewChat}
              className="btn-shimmer w-full py-3.5 rounded-2xl bg-gradient-to-r from-med-teal to-sky-500 text-med-dark font-bold tracking-wide text-sm hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(0,212,184,0.2)]"
            >
              <div className="flex items-center justify-center gap-2 relative z-10">
                <Stethoscope className="h-4 w-4" />
                Start New Consultation
              </div>
            </button>

            <button
              onClick={handleLoadDemo}
              className="w-full py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-foreground font-medium tracking-wide text-sm hover:bg-white/[0.08] hover:scale-[1.02] transition-all"
            >
              <div className="flex items-center justify-center gap-2 relative z-10">
                <Activity className="h-4 w-4 text-med-teal" />
                Load Demo Case (Visualizer Demo)
              </div>
            </button>

            <p className="mt-4 text-[10px] text-muted-foreground/40 text-center">
              MediMind is a decision support tool — not a substitute for
              clinical judgment.
            </p>
          </motion.div>
        </motion.div>
      </main>
    );
  }

  // ── 3-Column Chat Layout ──
  return (
    <>
      <main className="h-screen w-full flex bg-med-dark overflow-hidden">
        {/* ── Left Sidebar (240px) ── */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-full border-r border-white/[0.06] bg-med-navy flex flex-col overflow-hidden flex-shrink-0"
            >
              {/* Sidebar header */}
              <div className="p-3 border-b border-white/[0.06]">
                <button
                  onClick={handleStartNewChat}
                  className="w-full py-2 rounded-lg bg-med-teal text-med-dark font-medium text-sm flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  New Consultation
                </button>
              </div>

              {/* Session list */}
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
                  {conversations.map((convo) => (
                    <button
                      key={convo.id}
                      onClick={() =>
                        setSelectedConversationId(convo.id)
                      }
                      className={`w-full text-left rounded-lg px-3 py-2 transition-colors group ${selectedConversationId === convo.id
                        ? 'bg-white/[0.06]'
                        : 'hover:bg-white/[0.03]'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* Severity dot */}
                        <span className="h-1.5 w-1.5 rounded-full bg-med-safe flex-shrink-0" />
                        <p className="text-xs font-medium text-foreground/80 truncate flex-1">
                          {convo.title}
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground/40 mt-0.5 pl-3.5">
                        {new Date(convo.lastModified).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </ScrollArea>

              {/* Sidebar footer — user profile area */}
              <div className="p-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-med-teal/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-med-teal">
                      DR
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground/80 truncate">
                      Clinician
                    </p>
                    <p className="text-[10px] text-muted-foreground/40">
                      MediMind Pro
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Main Content Area ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-med-navy/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${showSidebar ? 'rotate-180' : ''
                    }`}
                />
              </button>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-med-teal" />
                <h2 className="text-sm font-medium text-foreground/90">
                  Diagnostic Session
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedConversationId(null)}
                className="h-8 px-3 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
              >
                All Cases
              </button>
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
              >
                {showRightPanel ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRightOpen className="h-4 w-4" />
                )}
              </button>
            </div>
          </header>

          {/* Conversation Thread */}
          <ConversationThread
            messages={conversation.messages}
            isLoading={conversation.isLoading}
            onDownloadReport={handleOpenReport}
          />

          {/* Input Toolbar */}
          <InputToolbar
            onSubmit={conversation.submitText}
            onFileSubmit={handleFileUpload}
            onImageSubmit={handleImageUpload}
            isLoading={conversation.isLoading}
            audioRecorder={audioRecorder}
          />
        </div>

        {/* ── Right Panel (320px, togglable) ── */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-full border-l border-white/[0.06] bg-med-navy flex flex-col overflow-hidden flex-shrink-0"
            >
              <div className="p-4 border-b border-white/[0.06]">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Session Context
                </p>
              </div>

              <ScrollArea className="flex-1 p-4 space-y-4">
                {/* Processing status */}
                <ProcessingStatusPanel
                  isActive={conversation.isLoading}
                  currentStepIndex={conversation.processingStepIndex}
                />

                {/* Session summary */}
                <div className="glass-card p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Current Session
                  </p>
                  <p className="text-xs text-foreground/70">
                    {conversation.messages.length - 1} messages •{' '}
                    {conversation.latestResponse
                      ? 'Diagnosis available'
                      : 'Awaiting input'}
                  </p>
                </div>

                {/* Quick summary of latest diagnosis */}
                {conversation.latestResponse && (
                  <div className="glass-card p-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Latest Diagnosis
                    </p>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {
                        conversation.latestResponse.final_diagnosis
                          .patient_problem
                      }
                    </p>
                    {conversation.latestResponse.final_diagnosis
                      .diagnosis && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {conversation.latestResponse.final_diagnosis.diagnosis
                            .slice(0, 3)
                            .map((d, i) => (
                              <span
                                key={i}
                                className="badge-ai text-[10px]"
                              >
                                {d}
                              </span>
                            ))}
                        </div>
                      )}
                  </div>
                )}

                {/* Detected symptoms placeholder */}
                <div className="glass-card p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Detected Symptoms
                  </p>
                  {conversation.latestResponse ? (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(
                        conversation.latestResponse.final_diagnosis
                          .metadata || {}
                      )
                        .slice(0, 5)
                        .map(([key, val], i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-foreground/60 border border-white/[0.06]"
                          >
                            {key}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground/40 italic">
                      Submit symptoms to begin analysis
                    </p>
                  )}
                </div>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* Report Preview Modal */}
      {reportGenerator.diagnosisData && (
        <ReportPreviewModal
          isOpen={reportGenerator.isOpen}
          onClose={reportGenerator.closeReport}
          diagnosisData={reportGenerator.diagnosisData}
          config={reportGenerator.config}
          onUpdateConfig={reportGenerator.updateConfig}
          onToggleSection={reportGenerator.toggleSection}
          onGenerate={reportGenerator.generateReport}
          isGenerating={reportGenerator.isGenerating}
          error={reportGenerator.error}
        />
      )}
    </>
  );
}
