export type BrainRegion = 'frontal' | 'temporal' | 'parietal' | 'occipital' | 'cerebellum';

export interface DiagnosticHotspot {
    region: BrainRegion;
    severity: number; // 0 to 1
    confidence: number; // 0 to 1
    label?: string;
    description?: string;
}

export type BrainMode = 'idle' | 'listening' | 'analyzing' | 'diagnostic' | 'focused' | 'report_ready';
export type BrainSize = 'sm' | 'md' | 'lg' | 'xl';
export type BrainTheme = 'dark' | 'light';

export interface BrainHologramProps {
    mode?: BrainMode;
    hotspots?: DiagnosticHotspot[];
    region?: BrainRegion;
    size?: BrainSize;
    theme?: BrainTheme;
    className?: string;
    interactive?: boolean;
}
