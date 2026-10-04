'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  Code2,
  HelpCircle,
  Clock,
  Target,
  ChevronRight,
  BookOpen,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import { tokenize } from './engine/lexer.js';
import { parse } from './engine/parser.js';
import { execute } from './engine/interpreter.js';
import { analyzeComplexity } from './engine/analyzer.js';
import { CONCEPTS, CONCEPT_CATEGORIES } from './concepts/conceptRegistry.js';

import CodeEditor from './editor/CodeEditor.jsx';
import VariablesVisualizer from './visualizers/VariablesVisualizer.jsx';
import ArrayVisualizer from './visualizers/ArrayVisualizer.jsx';
import ConditionVisualizer from './visualizers/ConditionVisualizer.jsx';
import LoopVisualizer from './visualizers/LoopVisualizer.jsx';
import CallStackVisualizer from './visualizers/CallStackVisualizer.jsx';
import StackQueueVisualizer from './visualizers/StackQueueVisualizer.jsx';
import SortingVisualizer from './visualizers/SortingVisualizer.jsx';
import LinkedListVisualizer from './visualizers/LinkedListVisualizer.jsx';
import TreeVisualizer from './visualizers/TreeVisualizer.jsx';
import GraphVisualizer from './visualizers/GraphVisualizer.jsx';
import WhyExplanation from './visualizers/WhyExplanation.jsx';
import ComplexityCard from './visualizers/ComplexityCard.jsx';
import PracticeChallenge from './PracticeChallenge.jsx';

import { soundFX } from '../../utils/soundEffects';
import { saveUser } from '../../utils/storage';

export default function ExecutionLabView({ user, onUpdateUser, initialConceptId = 'variables' }) {
  // Concept & Mode State
  const [selectedCategory, setSelectedCategory] = useState('javascript-basics');
  const [selectedConcept, setSelectedConcept] = useState(
    CONCEPTS.find(c => c.id === initialConceptId) || CONCEPTS[0]
  );
  const [activeMode, setActiveMode] = useState('visualize'); // 'visualize' | 'practice'
  const [searchFilter, setSearchFilter] = useState('');

  // Code & Execution Engine State
  const [code, setCode] = useState(selectedConcept?.starterCode || '');
  const [trace, setTrace] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.25, 0.5, 1, 2, 4
  const [complexity, setComplexity] = useState(null);
  const [executionError, setExecutionError] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState([]);

  // Auto-play timer ref
  const playTimerRef = useRef(null);

  // When concept changes, reset code and execute trace
  useEffect(() => {
    if (selectedConcept) {
      setCode(selectedConcept.starterCode);
      runCode(selectedConcept.starterCode);
    }
  }, [selectedConcept]);

  // Run and generate trace
  const runCode = (sourceCode) => {
    setIsPlaying(false);
    setExecutionError(null);

    try {
      const tokens = tokenize(sourceCode);
      const ast = parse(tokens);
      const execResult = execute(ast);
      const compAnalysis = analyzeComplexity(ast, sourceCode);

      setTrace(execResult.trace);
      setCurrentStepIndex(0);
      setComplexity(compAnalysis);
      setConsoleLogs(execResult.consoleOutput || []);
      soundFX.playClick();
    } catch (err) {
      setTrace([]);
      setCurrentStepIndex(0);
      setExecutionError(err.message || 'Execution error');
      console.warn('Execution engine error:', err);
    }
  };

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(150, Math.round(1000 / playbackSpeed));
      playTimerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= trace.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, playbackSpeed, trace.length]);

  // Step controls
  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < trace.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      soundFX.playClick();
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      soundFX.playClick();
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    soundFX.playClick();
  };

  const handleTogglePlay = () => {
    soundFX.playClick();
    if (currentStepIndex >= trace.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(prev => !prev);
  };

  // Challenge XP Completion
  const handleCompleteChallenge = (xpEarned) => {
    if (!onUpdateUser || !user) return;

    const newXp = (user.xp || 0) + xpEarned;
    const completedConcepts = user.completedConcepts || [];
    const updatedConcepts = completedConcepts.includes(selectedConcept.id)
      ? completedConcepts
      : [...completedConcepts, selectedConcept.id];

    const updatedUser = {
      ...user,
      xp: newXp,
      completedConcepts: updatedConcepts
    };

    onUpdateUser(updatedUser);
    saveUser(updatedUser);
    soundFX.playXPEarned();
  };

  // Current execution step data
  const activeStep = trace[currentStepIndex] || null;
  const currentLine = activeStep?.line || (executionError ? 1 : null);
  const currentVars = activeStep?.variables || {};
  const currentStack = activeStep?.callStack || [];
  const currentConsole = activeStep?.consoleOutput || [];

  // Filter concepts
  const filteredConcepts = CONCEPTS.filter(c => {
    const matchCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchSearch = !searchFilter || c.title.toLowerCase().includes(searchFilter.toLowerCase()) || c.summary.toLowerCase().includes(searchFilter.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      paddingBottom: '40px'
    }}>
      {/* ── 1. Top Header Banner ────────────────────────────── */}
      <div className="glass-panel" style={{
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'linear-gradient(135deg, rgba(22, 28, 45, 0.9) 0%, rgba(15, 20, 34, 0.95) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--accent-glow)'
          }}>
            <Cpu size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                Universal Code Execution Lab
              </h1>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '20px',
                background: 'rgba(52, 211, 153, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(52, 211, 153, 0.4)'
              }}>
                STEP-BY-STEP TRACER
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px', margin: 0 }}>
              See what actually happens inside computer memory at every line of code.
            </p>
          </div>
        </div>

        {/* Mode Toggle: Visualizer vs Predict & Practice */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveMode('visualize')}
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: activeMode === 'visualize' ? 'var(--accent-primary)' : 'transparent',
              color: activeMode === 'visualize' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Cpu size={14} />
            <span>Visualizer Mode</span>
          </button>

          <button
            onClick={() => setActiveMode('practice')}
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: activeMode === 'practice' ? '#f59e0b' : 'transparent',
              color: activeMode === 'practice' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Target size={14} />
            <span>Predict & Practice</span>
          </button>
        </div>
      </div>

      {/* ── 2. Concept Category Navigation Bar ──────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {CONCEPT_CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundFX.playClick();
                setSelectedCategory(cat.id);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? '1px solid var(--border-glow)' : '1px solid var(--border-subtle)',
                color: isSelected ? '#fff' : 'var(--text-muted)',
                fontWeight: isSelected ? '700' : '500',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}

        <div style={{ marginLeft: 'auto', position: 'relative', minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search concepts..."
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.78rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Concept Select Pills Carousel */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '6px'
      }}>
        {filteredConcepts.map(c => {
          const isSelected = selectedConcept?.id === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                soundFX.playClick();
                setSelectedConcept(c);
              }}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                background: isSelected ? 'var(--accent-gradient)' : 'rgba(15, 20, 34, 0.7)',
                border: isSelected ? '1px solid transparent' : '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: isSelected ? '700' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                boxShadow: isSelected ? 'var(--accent-glow)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{c.title}</span>
              <span style={{
                fontSize: '0.65rem',
                padding: '1px 5px',
                borderRadius: '4px',
                background: isSelected ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                color: isSelected ? '#fff' : 'var(--text-dim)'
              }}>
                {c.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 3. Concept Explanation Banner ───────────────────── */}
      {selectedConcept && (
        <div style={{
          background: 'rgba(18, 24, 38, 0.75)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <BookOpen size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>
              {selectedConcept.title}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px', lineHeight: 1.45, margin: 0 }}>
              {selectedConcept.explanation}
            </p>
          </div>
        </div>
      )}

      {/* ── 4. Main Playground Workspace ────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 1fr) minmax(360px, 1.25fr)',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        {/* Left Column: Code Editor & Complexity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <CodeEditor
            code={code}
            onChange={(newCode) => setCode(newCode)}
            currentLine={currentLine}
            errorLine={executionError ? 1 : null}
            onReset={() => {
              setCode(selectedConcept?.starterCode || '');
              runCode(selectedConcept?.starterCode || '');
            }}
          />

          {/* Run Code / Re-execute Button */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => runCode(code)}
              className="glow-btn"
              style={{
                flex: 1,
                padding: '10px 16px',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Play size={14} />
              <span>Analyze & Trace Code</span>
            </button>
          </div>

          {executionError && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid #f43f5e',
              color: '#f43f5e',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span><strong>Execution Error:</strong> {executionError}</span>
            </div>
          )}

          {/* Complexity Card */}
          <ComplexityCard complexity={complexity} />
        </div>

        {/* Right Column: Interactive Concept Visualizers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Dynamic Visualizer Switch based on Concept */}
          {selectedConcept?.visualizationType === 'array' ? (
            <ArrayVisualizer variables={currentVars} activeStep={activeStep} />
          ) : selectedConcept?.visualizationType === 'condition' ? (
            <ConditionVisualizer activeStep={activeStep} />
          ) : selectedConcept?.visualizationType === 'loop' || selectedConcept?.visualizationType === 'nested-loop' ? (
            <LoopVisualizer variables={currentVars} activeStep={activeStep} />
          ) : selectedConcept?.visualizationType === 'recursion' ? (
            <CallStackVisualizer callStack={currentStack} activeStep={activeStep} />
          ) : selectedConcept?.visualizationType === 'stack' || selectedConcept?.visualizationType === 'queue' ? (
            <StackQueueVisualizer variables={currentVars} activeStep={activeStep} />
          ) : selectedConcept?.visualizationType === 'sorting' ? (
            <SortingVisualizer variables={currentVars} activeStep={activeStep} />
          ) : selectedConcept?.visualizationType === 'linked-list' ? (
            <LinkedListVisualizer variables={currentVars} activeStep={activeStep} />
          ) : selectedConcept?.visualizationType === 'tree' ? (
            <TreeVisualizer variables={currentVars} activeStep={activeStep} />
          ) : selectedConcept?.visualizationType === 'graph' ? (
            <GraphVisualizer variables={currentVars} activeStep={activeStep} />
          ) : (
            <VariablesVisualizer variables={currentVars} activeStep={activeStep} />
          )}

          {/* Active Memory Variables Box */}
          <VariablesVisualizer variables={currentVars} activeStep={activeStep} />
        </div>
      </div>

      {/* ── 5. Execution Timeline & Controls ────────────────── */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleRestart}
              className="ghost-btn"
              style={{ padding: '8px', borderRadius: '8px' }}
              title="Restart execution from beginning"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={handleStepBackward}
              disabled={currentStepIndex <= 0}
              className="ghost-btn"
              style={{ padding: '8px', borderRadius: '8px', opacity: currentStepIndex <= 0 ? 0.4 : 1 }}
              title="Step Backward (Previous Line)"
            >
              <SkipBack size={16} />
            </button>

            <button
              onClick={handleTogglePlay}
              className="glow-btn"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title={isPlaying ? 'Pause execution' : 'Play through execution trace'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={handleStepForward}
              disabled={currentStepIndex >= trace.length - 1}
              className="ghost-btn"
              style={{ padding: '8px', borderRadius: '8px', opacity: currentStepIndex >= trace.length - 1 ? 0.4 : 1 }}
              title="Step Forward (Next Line)"
            >
              <SkipForward size={16} />
            </button>
          </div>

          {/* Speed Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: '600' }}>
              Speed:
            </span>
            {[0.5, 1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: playbackSpeed === s ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  background: playbackSpeed === s ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: playbackSpeed === s ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Step Count Badge */}
          <div style={{
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)'
          }}>
            Step <strong style={{ color: '#fff' }}>{currentStepIndex + 1}</strong> of <strong style={{ color: '#fff' }}>{trace.length || 1}</strong>
          </div>
        </div>

        {/* Step Slider */}
        <input
          type="range"
          min={0}
          max={Math.max(0, trace.length - 1)}
          value={currentStepIndex}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentStepIndex(Number(e.target.value));
          }}
          style={{
            width: '100%',
            accentColor: 'var(--accent-primary)',
            cursor: 'pointer'
          }}
        />
      </div>

      {/* ── 6. "Why Did This Happen?" Educational Card ──────── */}
      <WhyExplanation
        activeStep={activeStep}
        stepIndex={currentStepIndex}
        totalSteps={trace.length}
      />

      {/* ── 7. Console Output Panel ─────────────────────────── */}
      <div style={{
        background: 'rgba(10, 14, 26, 0.95)',
        borderRadius: '14px',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <Terminal size={14} color="#34d399" />
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff', letterSpacing: '0.04em' }}>
            CONSOLE OUTPUT
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
            Synchronized to current execution step
          </span>
        </div>

        <div style={{
          padding: '14px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.84rem',
          minHeight: '60px',
          maxHeight: '140px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {currentConsole.length === 0 ? (
            <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
              (no console output at this step)
            </span>
          ) : (
            currentConsole.map((line, idx) => (
              <div key={idx} style={{ color: '#34d399', display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--text-dim)', userSelect: 'none' }}>&gt;</span>
                <span>{line}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── 8. Practice Mode / Challenges ───────────────────── */}
      {activeMode === 'practice' && selectedConcept?.challenges && (
        <PracticeChallenge
          challenge={selectedConcept.challenges[0]}
          onRunChallenge={(testCode) => {
            setCode(testCode);
            runCode(testCode);
          }}
          onCompleteChallenge={handleCompleteChallenge}
          user={user}
        />
      )}
    </div>
  );
}
