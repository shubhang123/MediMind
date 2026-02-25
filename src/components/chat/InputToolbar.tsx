'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, Image as ImageIcon } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import type { UseAudioRecorder } from '@/hooks/use-audio-recorder';

/* ── Types ── */
export interface InputToolbarProps {
    /** Called with the text message when send is clicked */
    onSubmit: (value: string) => void;
    /** Called with a file (audio) */
    onFileSubmit: (file: File) => void;
    /** Called with an image file */
    onImageSubmit?: (file: File) => void;
    /** Whether a message is currently being processed */
    isLoading: boolean;
    /** Audio recorder hook instance */
    audioRecorder: UseAudioRecorder;
}

/**
 * Premium input toolbar pinned to the bottom of the chat.
 * Features:
 * - Frosted glass backdrop-blur effect
 * - Pill-shaped textarea that expands vertically (max 6 lines)
 * - File + image attachment buttons on the left
 * - Send (teal) + microphone buttons on the right
 * - Transforms into VoiceRecorder waveform during recording
 */
export function InputToolbar({
    onSubmit,
    onFileSubmit,
    onImageSubmit,
    isLoading,
    audioRecorder,
}: InputToolbarProps) {
    const [inputValue, setInputValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const { isRecording, startRecording, stopRecording, analyserNode } = audioRecorder;

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            // Max 6 lines (~144px with line-height ~24px)
            textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
        }
    }, [inputValue]);

    const handleSubmit = useCallback(() => {
        const trimmed = inputValue.trim();
        if (trimmed && !isLoading) {
            onSubmit(trimmed);
            setInputValue('');
        }
    }, [inputValue, isLoading, onSubmit]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            setInputValue('');
            startRecording();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFileSubmit(file);
        e.target.value = '';
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImageSubmit) onImageSubmit(file);
        e.target.value = '';
    };

    return (
        <div className="absolute bottom-6 inset-x-0 px-4 flex justify-center z-50 pointer-events-none">
            <div className="w-full max-w-3xl pointer-events-auto">
                <AnimatePresence mode="wait">
                    {isRecording ? (
                        <motion.div
                            key="recorder"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-black/60 backdrop-blur-2xl border border-med-critical/30 rounded-[2rem] p-2 shadow-[0_0_40px_rgba(255,60,60,0.15)] ring-1 ring-white/5"
                        >
                            <VoiceRecorder
                                isRecording={isRecording}
                                onStop={stopRecording}
                                analyserNode={analyserNode}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="flex items-end gap-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 pr-3 shadow-2xl ring-1 ring-white/5"
                        >
                            {/* Hidden file inputs */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="audio/mp3,audio/wav,audio/webm,audio/ogg,audio/flac,audio/m4a,.pdf,.dicom"
                                disabled={isLoading}
                            />
                            <input
                                type="file"
                                ref={imageInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                disabled={isLoading}
                            />

                            {/* Attachment buttons */}
                            <div className="flex items-center gap-1 flex-shrink-0 pb-1 pl-1">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isLoading}
                                    className="h-10 w-10 flex items-center justify-center rounded-full text-foreground/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
                                    aria-label="Attach file"
                                >
                                    <Paperclip className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => imageInputRef.current?.click()}
                                    disabled={isLoading}
                                    className="h-10 w-10 flex items-center justify-center rounded-full text-foreground/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
                                    aria-label="Attach image"
                                >
                                    <ImageIcon className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Pill-shaped textarea */}
                            <div className="flex-1 relative">
                                <textarea
                                    ref={textareaRef}
                                    placeholder="Consult with MediMind AI..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isLoading}
                                    rows={1}
                                    className="w-full resize-none bg-transparent border-none px-4 py-3.5 text-[15px] font-medium text-foreground placeholder:text-foreground/40 focus:outline-none transition-colors disabled:opacity-40"
                                    style={{ minHeight: '48px' }}
                                />
                            </div>

                            {/* Send + Mic buttons */}
                            <div className="flex items-center gap-1.5 flex-shrink-0 pb-1.5">
                                {inputValue.trim() && (
                                    <motion.button
                                        initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                        exit={{ scale: 0.5, opacity: 0, rotate: -45 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-med-teal to-sky-400 text-med-dark shadow-lg shadow-med-teal/20 hover:shadow-med-teal/40 hover:scale-105 transition-all disabled:opacity-40"
                                        aria-label="Send message"
                                    >
                                        <Send className="h-4 w-4 -ml-0.5" />
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleRecording}
                                    disabled={isLoading}
                                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-foreground hover:bg-white/15 hover:text-med-teal transition-all disabled:opacity-40 border border-white/5"
                                    aria-label="Voice input"
                                >
                                    <Mic className="h-4 w-4" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
