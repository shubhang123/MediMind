'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { MessageBlockProps } from '@/components/chat/MessageBlock';
import type { DiagnosisData } from '@/components/chat/DiagnosticResponseCard';
import {
    createCase,
    analyzeImage,
    type DiagnosisResponse,
} from '@/services/api-service';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';

/* ── Types ── */

export interface UseConversationReturn {
    messages: MessageBlockProps[];
    isLoading: boolean;
    processingStepIndex: number;
    /** Submit a text symptom description */
    submitText: (text: string) => Promise<void>;
    /** Submit an audio recording for transcription + diagnosis */
    submitAudio: (audioDataUri: string, fileName?: string) => Promise<void>;
    /** Submit an image for analysis */
    submitImage: (file: File) => Promise<void>;
    /** Latest backend response (for download/report) */
    latestResponse: DiagnosisResponse | null;
    /** Add a raw message to the thread */
    addMessage: (msg: Omit<MessageBlockProps, 'id'>) => void;
    /** Replace all messages in the thread (for loading history) */
    setMessages: (messages: MessageBlockProps[]) => void;
    /** Clear the thread back to default */
    clearMessages: () => void;
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Hook that manages the conversation state for a single chat session.
 * Handles text submission, audio transcription, image analysis,
 * and maps backend responses to structured DiagnosticResponseCard data.
 */
export function useConversation(): UseConversationReturn {
    const [messages, setMessages] = useState<MessageBlockProps[]>([
        {
            id: 'welcome',
            sender: 'bot',
            text: 'Welcome to MediMind. Describe the patient\'s symptoms, upload medical images, or use voice input to begin a clinical consultation.',
            timestamp: new Date(),
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [processingStepIndex, setProcessingStepIndex] = useState(0);
    const [latestResponse, setLatestResponse] =
        useState<DiagnosisResponse | null>(null);

    const addMessage = useCallback(
        (msg: Omit<MessageBlockProps, 'id'>) => {
            setMessages((prev) => [
                ...prev,
                { id: generateId(), ...msg },
            ]);
        },
        []
    );

    const clearMessages = useCallback(() => {
        setMessages([
            {
                id: 'welcome',
                sender: 'bot',
                text: 'Welcome to MediMind. Describe the patient\'s symptoms, upload medical images, or use voice input to begin a clinical consultation.',
                timestamp: new Date(),
            },
        ]);
        setLatestResponse(null);
    }, []);

    /** Map backend diagnosis response to structured card data */
    const mapToDiagnosisData = useCallback(
        (response: DiagnosisResponse): DiagnosisData => {
            const fd = response.final_diagnosis;
            return {
                patient_problem: fd.patient_problem,
                diagnosis: fd.diagnosis,
                diagnosis_simplified: fd.diagnosis_simplified,
                metadata: fd.metadata,
                treatment_plan: fd.treatment_plan,
            };
        },
        []
    );

    /** Submit a text symptom description */
    const submitText = useCallback(
        async (text: string) => {
            // Add user message
            addMessage({ sender: 'user', text, timestamp: new Date() });

            setIsLoading(true);
            setProcessingStepIndex(0);

            try {
                // Step 1: Analyzing
                setProcessingStepIndex(1);
                const response = await createCase(text);
                setLatestResponse(response);

                // Step 2: Generating Report
                setProcessingStepIndex(2);

                // Add bot response
                const diagnosisData = mapToDiagnosisData(response);
                addMessage({
                    sender: 'bot',
                    diagnosisData,
                    timestamp: new Date(),
                });
            } catch (error) {
                console.error('Error submitting text:', error);
                addMessage({
                    sender: 'bot',
                    text: `Error: ${error instanceof Error ? error.message : 'Could not process your request. Please try again.'}`,
                    timestamp: new Date(),
                });
            } finally {
                setIsLoading(false);
                setProcessingStepIndex(0);
            }
        },
        [addMessage, mapToDiagnosisData]
    );

    /** Submit audio for transcription + diagnosis */
    const submitAudio = useCallback(
        async (audioDataUri: string, fileName?: string) => {
            addMessage({
                sender: 'ui',
                text: fileName ? `Uploaded: ${fileName}` : 'Voice recording submitted',
            });

            setIsLoading(true);
            setProcessingStepIndex(0);

            try {
                // Step 0: Transcribing
                const match = audioDataUri.match(/^data:(.*);base64,(.*)$/);
                if (!match) throw new Error('Invalid audio data URI format.');

                const [, mimeType, audioData] = match;
                const { transcription } = await transcribeAudio({
                    audioData,
                    mimeType,
                    language: 'en',
                });

                if (!transcription?.trim()) {
                    addMessage({
                        sender: 'bot',
                        text: 'Transcription was empty. Please try again with clearer audio.',
                        timestamp: new Date(),
                    });
                    return;
                }

                // Show transcription as user message
                addMessage({ sender: 'user', text: transcription, timestamp: new Date() });

                // Step 1: Analyzing
                setProcessingStepIndex(1);
                const response = await createCase(transcription);
                setLatestResponse(response);

                // Step 2: Generating
                setProcessingStepIndex(2);

                const diagnosisData = mapToDiagnosisData(response);
                addMessage({
                    sender: 'bot',
                    diagnosisData,
                    timestamp: new Date(),
                });
            } catch (error) {
                console.error('Error processing audio:', error);
                addMessage({
                    sender: 'bot',
                    text: `Error: ${error instanceof Error ? error.message : 'Could not process audio. Please try again.'}`,
                    timestamp: new Date(),
                });
            } finally {
                setIsLoading(false);
                setProcessingStepIndex(0);
            }
        },
        [addMessage, mapToDiagnosisData]
    );

    /** Submit an image for analysis */
    const submitImage = useCallback(
        async (file: File) => {
            addMessage({
                sender: 'ui',
                text: `Uploaded image: ${file.name}`,
            });

            setIsLoading(true);
            setProcessingStepIndex(1); // Skip transcription step for images

            try {
                const reader = new FileReader();
                const base64 = await new Promise<string>((resolve, reject) => {
                    reader.onloadend = () => {
                        const result = reader.result as string;
                        resolve(result.split(',')[1]);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                const response = await analyzeImage(base64);

                setProcessingStepIndex(2);

                addMessage({
                    sender: 'bot',
                    text: response.analysis,
                    timestamp: new Date(),
                });
            } catch (error) {
                console.error('Error analyzing image:', error);
                addMessage({
                    sender: 'bot',
                    text: `Error: ${error instanceof Error ? error.message : 'Could not analyze image. Please try again.'}`,
                    timestamp: new Date(),
                });
            } finally {
                setIsLoading(false);
                setProcessingStepIndex(0);
            }
        },
        [addMessage]
    );

    return {
        messages,
        isLoading,
        processingStepIndex,
        submitText,
        submitAudio,
        submitImage,
        latestResponse,
        addMessage,
        setMessages,
        clearMessages,
    };
}
