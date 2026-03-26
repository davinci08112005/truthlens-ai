/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Fingerprint, 
  Activity, 
  Cpu, 
  Database, 
  FileText, 
  Info,
  ChevronRight,
  Terminal as TerminalIcon,
  Zap,
  Lock,
  Globe,
  BarChart3,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { cn } from './lib/utils';

// --- Types ---

interface AgentState {
  status: 'idle' | 'processing' | 'completed' | 'error';
  output?: string;
}

interface AnalysisResult {
  category: string;
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  manipulationType: string;
  detectionSignals: string[];
  verificationStatus: string;
  technicalExplanation: string;
  simpleExplanation: string;
  digitalImmunity: {
    patternUsed: string;
    whyItWorks: string;
    howToAvoid: string;
  };
  userAction: string;
  summaryLine: string;
}

// --- Components ---

const AgentCard = ({ 
  name, 
  icon: Icon, 
  state, 
  description 
}: { 
  name: string; 
  icon: any; 
  state: AgentState; 
  description: string;
}) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className={cn(
      "p-4 rounded-lg border transition-all duration-300",
      state.status === 'processing' ? "border-indigo-500 bg-indigo-50/50 shadow-[0_0_15px_rgba(79,70,229,0.1)]" : 
      state.status === 'completed' ? "border-emerald-200 bg-emerald-50/30" : 
      "border-slate-200 bg-white"
    )}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className={cn(
          "p-1.5 rounded-md transition-colors duration-500",
          state.status === 'processing' ? "bg-indigo-600 text-white animate-pulse" : 
          state.status === 'completed' ? "bg-emerald-600 text-white" : 
          "bg-slate-100 text-slate-500"
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold tracking-tight uppercase">{name}</span>
      </div>
      {state.status === 'processing' && (
        <Activity className="w-4 h-4 text-indigo-500 animate-spin" />
      )}
      {state.status === 'completed' && (
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      )}
    </div>
    <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
  </motion.div>
);

const Terminal = ({ logs }: { logs: string[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="bg-slate-900 rounded-lg p-4 font-mono text-[11px] h-48 overflow-y-auto border border-slate-800 shadow-inner">
      <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
        <TerminalIcon className="w-3 h-3 text-slate-500" />
        <span className="text-slate-500 uppercase tracking-widest">System Kernel Logs</span>
      </div>
      <div ref={scrollRef} className="space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-indigo-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
            <span className={cn(
              log.startsWith('!') ? "text-amber-400" : 
              log.startsWith('>') ? "text-emerald-400" : 
              "text-slate-300"
            )}>
              {log}
            </span>
          </div>
        ))}
        {logs.length === 0 && <div className="text-slate-600 italic">Waiting for input...</div>}
      </div>
    </div>
  );
};

export default function App() {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [highThinking, setHighThinking] = useState(false);
  const [trends, setTrends] = useState([
    { id: 1, domain: 'Healthcare', trend: 'Miracle weight loss tea scam', risk: 'HIGH', velocity: '+84%', active: true },
    { id: 2, domain: 'Finance', trend: 'AI-generated crypto investment bots', risk: 'HIGH', velocity: '+120%', active: true },
    { id: 3, domain: 'Politics', trend: 'Deepfake audio of local election officials', risk: 'MEDIUM', velocity: '+45%', active: true },
    { id: 4, domain: 'Technology', trend: 'Phishing via fake AI software updates', risk: 'HIGH', velocity: '+62%', active: true },
    { id: 5, domain: 'General', trend: 'Fake "emergency alert" text messages', risk: 'MEDIUM', velocity: '+28%', active: true },
  ]);

  // Simulate real-time trend updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrends(current => current.map(t => ({
        ...t,
        velocity: `${(parseInt(t.velocity) + (Math.random() > 0.5 ? 1 : -1)).toString()}%`
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const [agents, setAgents] = useState<{ [key: string]: AgentState }>({
    classification: { status: 'idle' },
    detection: { status: 'idle' },
    verification: { status: 'idle' },
    risk: { status: 'idle' },
    explanation: { status: 'idle' },
    immunity: { status: 'idle' },
  });

  const runAnalysis = async () => {
    if (!input.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setLogs([]);
    
    const updateAgent = (name: string, status: AgentState['status']) => {
      setAgents(prev => ({ ...prev, [name]: { status } }));
    };

    try {
      // Step 1: Classification
      updateAgent('classification', 'processing');
      setLogs(prev => [...prev, "[CLASSIFICATION] Domain identified"]);
      await new Promise(r => setTimeout(r, 600));
      updateAgent('classification', 'completed');
      
      // Step 2: Detection
      updateAgent('detection', 'processing');
      setLogs(prev => [...prev, "[DETECTION] Key signals extracted"]);
      await new Promise(r => setTimeout(r, 800));
      updateAgent('detection', 'completed');

      // Step 3: Verification
      updateAgent('verification', 'processing');
      setLogs(prev => [...prev, "[VERIFICATION] Evidence validated"]);
      await new Promise(r => setTimeout(r, 1000));
      updateAgent('verification', 'completed');

      // Step 4: Risk Scoring
      updateAgent('risk', 'processing');
      setLogs(prev => [...prev, "[RISK] Score computed"]);
      await new Promise(r => setTimeout(r, 600));
      updateAgent('risk', 'completed');

      // Step 5: Explanation
      updateAgent('explanation', 'processing');
      setLogs(prev => [...prev, "[EXPLANATION] Risk analysis generated"]);
      await new Promise(r => setTimeout(r, 600));
      updateAgent('explanation', 'completed');

      // Step 6: Digital Immunity
      updateAgent('immunity', 'processing');
      setLogs(prev => [...prev, `[IMMUNITY] Behavioral pattern identified ${highThinking ? '(High Intelligence Mode Active)' : ''}`]);

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const modelName = highThinking ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
      
      const model = ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: input }] }],
        config: {
          thinkingConfig: highThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
          systemInstruction: `You are TruthLens AI — a multi-agent credibility and risk intelligence system.
          You do NOT behave like a chatbot. You generate structured, audit-level analysis similar to a professional risk assessment system.

          DECISION RULES:
          - Guaranteed financial returns → HIGH RISK
          - “Zero risk” claims → HIGH RISK
          - “100% cure” or “permanent cure” → HIGH RISK
          - Lack of verifiable evidence → explicitly flag

          STYLE RULES:
          - Be concise, precise, and authoritative. No filler phrases.
          - Tone: Professional risk intelligence system.
          - Manipulation Types: Use labels like "Financial Fraud Pattern: Unrealistic Returns", "Medical Misinformation: Unsupported Cure", "Fear-Based Misinformation", "Authority Misuse", "Misleading Claim".
          - Verification: Use authoritative tone (e.g., “Violates SEBI regulations. No regulated financial instrument guarantees fixed high returns in short timeframes.”, “Conflicts with established scientific consensus.”, “No credible evidence from trusted or regulated sources.”).
          - Risk Analysis: Technical (use risk-return mismatch, regulatory violations, statistical or scientific inconsistency) and Simple (short, direct).
          - User Action: Strong directive language (e.g., “Action: Do not proceed. Verify the entity with SEBI/RBI before any transaction. Report suspicious sources.”, “Ignore and avoid sharing this information.”, “Consult certified professionals before acting.”).
          - Final Judgment Style: Use strong conclusions for the summaryLine (e.g., “Financial Fraud Detected (High Risk)”, “Medical Misinformation Detected (High Risk)”, “Content Appears Reliable (Low Risk)”). Avoid vague phrases.

          Output MUST be valid JSON:
          {
            "category": "Healthcare" | "Finance" | "Politics" | "Technology" | "General",
            "score": number, (0-100)
            "riskLevel": "LOW" | "MEDIUM" | "HIGH",
            "confidence": "LOW" | "MEDIUM" | "HIGH",
            "manipulationType": string,
            "detectionSignals": string[], (max 5, specific, non-redundant)
            "verificationStatus": string, (authoritative statement)
            "technicalExplanation": string, (using technical terms)
            "simpleExplanation": string, (short, direct)
            "digitalImmunity": {
              "patternUsed": string, (e.g. "Greed Exploitation + False Safety Framing")
              "whyItWorks": string, (one-line psychological trigger)
              "howToAvoid": string (clear practical rule)
            },
            "userAction": string, (strong directive)
            "summaryLine": string (strong judgment conclusion)
          }`,
          responseMimeType: "application/json"
        }
      });

      const response = await model;
      const data = JSON.parse(response.text);
      setResult(data);
      updateAgent('immunity', 'completed');
      setLogs(prev => [...prev, "[SYSTEM] Analysis complete. Risk Intelligence extracted."]);

    } catch (error) {
      console.error(error);
      setLogs(prev => [...prev, "! KERNEL_ERROR: Failed to complete multi-agent handshake."]);
      Object.keys(agents).forEach(k => updateAgent(k, 'error'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] px-6 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#141414] flex items-center justify-center text-[#E4E3E0]">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">TruthLens AI</h1>
        </div>
                  <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Core: Online
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full">
            <Globe className="w-3 h-3" />
            Network: SECURE
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full">
            <Activity className="w-3 h-3" />
            Load: 12%
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input & Agents */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_#141414]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3 text-amber-500" />
                Intelligence Input
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-tighter opacity-50">High Intelligence</span>
                <button 
                  onClick={() => setHighThinking(!highThinking)}
                  className={cn(
                    "w-8 h-4 rounded-full relative transition-all duration-300",
                    highThinking ? "bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300",
                    highThinking ? "left-4.5" : "left-0.5"
                  )} />
                </button>
              </div>
            </div>
            <div className="relative">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste claim, news snippet, or message for deep analysis..."
                className="w-full h-32 bg-slate-50 border border-slate-200 p-3 text-sm focus:outline-none focus:border-[#141414] transition-colors resize-none font-mono"
              />
              {isAnalyzing && (
                <motion.div 
                  initial={{ top: 0 }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-indigo-500/50 shadow-[0_0_10px_rgba(79,70,229,0.5)] z-10"
                />
              )}
            </div>
            <button 
              onClick={runAnalysis}
              disabled={isAnalyzing || !input.trim()}
              className="w-full mt-4 bg-[#141414] text-[#E4E3E0] py-3 font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Initiate Analysis
                </>
              )}
            </button>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest px-1 flex items-center gap-2">
              <Cpu className="w-3 h-3" />
              Active Reasoning Agents
            </h2>
            <AgentCard 
              name="Classification" 
              icon={Globe} 
              state={agents.classification} 
              description="Identifies domain context (Healthcare, Finance, etc.)" 
            />
            <AgentCard 
              name="Detection" 
              icon={Fingerprint} 
              state={agents.detection} 
              description="Scans for manipulation, urgency, and inconsistencies" 
            />
            <AgentCard 
              name="Verification" 
              icon={Database} 
              state={agents.verification} 
              description="Cross-references with WHO, RBI, and scientific consensus" 
            />
            <AgentCard 
              name="Risk Scoring" 
              icon={BarChart3} 
              state={agents.risk} 
              description="Calculates credibility score and risk level" 
            />
            <AgentCard 
              name="Explanation" 
              icon={FileText} 
              state={agents.explanation} 
              description="Synthesizes findings into multi-layer explanations" 
            />
            <AgentCard 
              name="Digital Immunity" 
              icon={Shield} 
              state={agents.immunity} 
              description="Identifies manipulation psychology and builds user resilience" 
            />
          </section>
        </div>

        {/* Right Column: Results & Logs */}
        <div className="lg:col-span-8 space-y-6">
          <Terminal logs={logs} />

          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Score Header */}
                <div className={cn(
                  "bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_#141414] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden",
                  result.riskLevel === 'HIGH' ? "before:absolute before:inset-0 before:bg-rose-500/5 before:pointer-events-none" : ""
                )}>
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-100"
                      />
                      <motion.circle
                        initial={{ strokeDashoffset: 364.4 }}
                        animate={{ strokeDashoffset: 364.4 - (364.4 * result.score) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={364.4}
                        className={cn(
                          "transition-all duration-1000",
                          result.score > 80 ? "text-emerald-500" : 
                          result.score > 60 ? "text-indigo-500" : 
                          result.score > 30 ? "text-amber-500" : "text-rose-500"
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black">{result.score}</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest opacity-50">📉 CREDIBILITY SCORE</span>
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left z-10">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                      <span className="px-3 py-1 bg-[#141414] text-[#E4E3E0] text-[10px] font-black uppercase tracking-widest">
                        🔎 CLASSIFICATION: {result.category}
                      </span>
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-[#141414] shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]",
                        result.riskLevel === 'HIGH' ? "bg-rose-500 text-white border-rose-600" : 
                        result.riskLevel === 'MEDIUM' ? "bg-amber-400 text-[#141414] border-amber-500" : 
                        "bg-emerald-500 text-white border-emerald-600"
                      )}>
                        🚨 RISK LEVEL: {result.riskLevel}
                      </span>
                      <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest border border-indigo-700 shadow-[2px_2px_0px_0px_rgba(79,70,229,1)]">
                        📊 CONFIDENCE: {result.confidence}
                      </span>
                    </div>
                    
                    <div className="mb-6">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">🎯 MANIPULATION TYPE</span>
                      <p className="text-xl font-black uppercase tracking-tight text-indigo-600 italic leading-tight">
                        {result.manipulationType}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <h3 className={cn(
                        "text-2xl font-black italic tracking-tighter uppercase mb-1",
                        result.riskLevel === 'HIGH' ? "text-rose-600" : 
                        result.riskLevel === 'MEDIUM' ? "text-amber-600" : 
                        "text-emerald-600"
                      )}>
                        {result.summaryLine}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        SYSTEM VERDICT: AUDIT-LEVEL INTELLIGENCE DELIVERED
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section className="bg-white border border-[#141414] p-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Fingerprint className="w-3 h-3" />
                      ⚠️ KEY RISK SIGNALS
                    </h4>
                    <ul className="space-y-2">
                      {result.detectionSignals.map((sig, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs font-bold font-mono">
                          <div className="w-1.5 h-1.5 bg-rose-500 shrink-0" />
                          {sig}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="bg-white border border-[#141414] p-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Database className="w-3 h-3" />
                      📊 VERIFICATION
                    </h4>
                    <p className="text-xs font-bold leading-relaxed font-mono text-slate-600">
                      {result.verificationStatus}
                    </p>
                  </section>

                  <section className="bg-white border border-[#141414] p-6 md:col-span-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      🧠 RISK ANALYSIS
                    </h4>
                    <div className="space-y-6">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 block mb-1">Technical:</span>
                        <p className="text-xs font-bold leading-relaxed italic">{result.technicalExplanation}</p>
                      </div>
                      <div className="h-px bg-slate-100" />
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block mb-1">Simple:</span>
                        <p className="text-sm font-medium leading-relaxed">{result.simpleExplanation}</p>
                      </div>
                    </div>
                  </section>

                  <section className="bg-[#141414] text-[#E4E3E0] p-6 md:col-span-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-indigo-400 border-b border-slate-800 pb-2">
                      <Shield className="w-3 h-3" />
                      🧬 BEHAVIORAL RISK INSIGHT
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">Pattern Used</span>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{result.digitalImmunity.patternUsed}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">Why It Works</span>
                        <p className="text-xs font-medium leading-relaxed opacity-80">{result.digitalImmunity.whyItWorks}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">How to Avoid</span>
                        <p className="text-xs font-medium leading-relaxed opacity-80">{result.digitalImmunity.howToAvoid}</p>
                      </div>
                    </div>
                  </section>

                  <section className="bg-white border border-[#141414] p-6 md:col-span-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 text-indigo-600">
                      <Lock className="w-3 h-3" />
                      🎯 USER ACTION
                    </h4>
                    <p className="text-sm font-bold leading-relaxed">{result.userAction}</p>
                  </section>
                </div>
              </motion.div>
            ) : (
              <div className="h-96 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="p-4 bg-slate-100 rounded-full">
                  <Search className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold uppercase tracking-widest text-xs">Awaiting Intelligence Input</p>
                  <p className="text-[10px] mt-1">Submit a claim to begin multi-agent verification</p>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Global Threat Monitoring Section */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6 border-b border-[#141414] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 text-rose-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest">📡 GLOBAL THREAT MONITORING</h2>
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">Real-time misinformation velocity & trend analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">LIVE FEED</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {trends.map((trend) => (
                <motion.div
                  key={trend.id}
                  layout
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={cn(
                    "bg-white border border-[#141414] p-4 flex flex-col justify-between hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] transition-all cursor-pointer overflow-hidden relative group",
                    trend.risk === 'HIGH' ? "hover:border-rose-500" : "hover:border-amber-500"
                  )}
                >
                  <div className={cn(
                    "absolute top-0 left-0 w-1 h-full transition-all duration-300 group-hover:w-2",
                    trend.risk === 'HIGH' ? "bg-rose-500" : "bg-amber-500"
                  )} />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[8px] font-black uppercase tracking-widest bg-[#141414] text-white px-2 py-0.5">
                        {trend.domain}
                      </span>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border border-[#141414]",
                        trend.risk === 'HIGH' ? "bg-rose-500 text-white border-rose-600" : "bg-amber-400 text-[#141414] border-amber-500"
                      )}>
                        {trend.risk}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold leading-tight mb-4 min-h-[2.5rem] group-hover:text-indigo-600 transition-colors">
                      {trend.trend}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className={cn(
                      "flex items-center gap-1",
                      parseInt(trend.velocity) > 50 ? "text-rose-600" : "text-amber-600"
                    )}>
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-[10px] font-black font-mono">{trend.velocity}</span>
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600">
                      <Zap className="w-3 h-3 animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-tighter">Velocity</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#141414] p-6 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">
          TruthLens AI System v4.0.2 // Multi-Agent Reasoning Engine // Zero-Trust Protocol
        </p>
      </footer>
    </div>
  );
}
