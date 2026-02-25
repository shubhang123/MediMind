export type Severity = 'low' | 'moderate' | 'critical';

export interface SymptomNode {
    id: string;
    name: string;
    severity: Severity;
    correlations: string[];
}

export interface SymptomNetworkGraphProps {
    symptoms: SymptomNode[];
    activeSymptom?: string;
    width?: number;
    height?: number;
}

export interface NeuralProcessingIndicatorProps {
    step: 'listening' | 'transcribing' | 'analyzing' | 'diagnosing' | 'generating';
    progress: number;
}

export interface LiveWaveformProps {
    isRecording: boolean;
    audioData?: Float32Array;
    sensitivity?: number;
}

export interface SeverityPulseRingProps {
    severity: Severity;
    label?: string;
    className?: string;
}

export interface PipelineStep {
    name: string;
    status: 'pending' | 'active' | 'complete' | 'error';
}

export interface PipelineStatusFlowProps {
    steps: PipelineStep[];
}
