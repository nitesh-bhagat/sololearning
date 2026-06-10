import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronLeft,
  Clock,
  Award,
  Info,
  Terminal,
  CheckCircle2,
  X,
  Check,
  Star,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@sololearning/ui';
import {
  TextBlock,
  MCQBlock,
  InfoCardBlock,
  WarningCardBlock,
  ErrorCardBlock,
  ImageBlock,
  CodeBlock,
  DivideBlock,
  BulletsBlock,
  TableBlock,
  NotesBlock,
  GraphsBlock,
  MatchPairBlock,
  PutInOrderBlock,
  FillBlanksBlock,
  AIShortQuestionBlock,
} from '@sololearning/ui';

export interface RenderLessonProps {
  topic: any;
  onExit: () => void;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
  onComplete?: () => void;
}

export function RenderLesson({
  topic,
  onExit,
  onNextLesson,
  hasNextLesson = false,
  onComplete,
}: RenderLessonProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [validationState, setValidationState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isAnswerComplete, setIsAnswerComplete] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  const totalSteps = 1 + (topic?.excercise?.length || 0);

  useEffect(() => {
    setIsAnswerComplete(false);
    setIsAnswerCorrect(false);
  }, [currentStep]);

  if (!topic) return null;

  const isContentStep = currentStep === 0;
  const isVictoryStep = currentStep === totalSteps;
  const currentExercise =
    !isContentStep && !isVictoryStep ? topic.excercise?.[currentStep - 1] : null;

  const handleCheck = () => {
    setValidationState(isAnswerCorrect ? 'correct' : 'wrong');
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setValidationState('idle');

      // If we just reached victory step
      if (nextStep === totalSteps) {
        if (onComplete) onComplete();

        // Play victory sound
        try {
          const audio = new Audio('/sounds/prize_won.mp3');
          audio.volume = 0.5;
          audio.play().catch((e) => console.log('Audio play failed:', e));
        } catch (e) {
          console.error('Audio initialization failed', e);
        }
      }
    }
  };

  const renderBlock = (blockData: any, idx: number, interactive: boolean = false) => {
    const commonProps = {
      key: idx,
      ...blockData,
      readOnly: !interactive,
      isInteractive: interactive,
      validationState: validationState,
      onAnswerReady: (isComplete: boolean, isCorrect: boolean) => {
        setIsAnswerComplete(isComplete);
        setIsAnswerCorrect(isCorrect);
      },
      onShowExplanation: () => setShowExplanationModal(true),
    };

    switch (blockData.type) {
      case 'text':
        return <TextBlock {...commonProps} />;
      case 'mcq':
        return <MCQBlock {...commonProps} />;
      case 'info-card':
        return <InfoCardBlock {...commonProps} />;
      case 'warning-card':
        return <WarningCardBlock {...commonProps} />;
      case 'error-card':
        return <ErrorCardBlock {...commonProps} />;
      case 'image':
        return <ImageBlock {...commonProps} />;
      case 'code-block':
        return <CodeBlock {...commonProps} />;
      case 'divide':
        return <DivideBlock key={idx} />;
      case 'bullets':
        return <BulletsBlock {...commonProps} />;
      case 'table':
        return <TableBlock {...commonProps} />;
      case 'notes':
        return <NotesBlock {...commonProps} />;
      case 'graphs':
        return <GraphsBlock {...commonProps} />;
      case 'match-pair':
        return <MatchPairBlock {...commonProps} />;
      case 'put-in-order':
        return <PutInOrderBlock {...commonProps} />;
      case 'fill-blanks':
        return <FillBlanksBlock {...commonProps} />;
      case 'ai-short-question':
        return <AIShortQuestionBlock {...commonProps} />;
      default:
        return null;
    }
  };

  if (isVictoryStep) {
    return (
      <div className="w-full min-h-dvh flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
        {/* Victory Confetti / Background Effects */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-[100px] animate-pulse delay-700" />
        </div>

        <div className="z-10 flex flex-col items-center max-w-lg w-full animate-in zoom-in-95 fade-in duration-700 ease-out">
          <div className="w-32 h-32 mb-8 relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20" />
            <div className="relative w-full h-full bg-gradient-to-tr from-yellow-500 to-yellow-300 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.5)]">
              <Star size={64} className="text-yellow-900 fill-yellow-900" />
            </div>
          </div>

          <h1 className="text-4xl font-black text-text mb-4 text-center tracking-tight">
            Lesson Completed!
          </h1>
          <p className="text-lg text-text-light text-center mb-10">
            You&apos;ve successfully finished <strong>{topic.title}</strong> and collected your
            rewards.
          </p>

          <div className="flex items-center gap-3 px-8 py-4 bg-surface border border-border rounded-2xl mb-12 shadow-lg transform hover:scale-105 transition-transform">
            <Award size={32} className="text-yellow-400" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-light uppercase tracking-wider">
                XP Gained
              </span>
              <span className="text-3xl font-black text-text">+{topic.metadata?.xp || 10}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {hasNextLesson && onNextLesson ? (
              <Button
                variant="primary"
                className="w-full py-6 text-lg rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-transform"
                onClick={onNextLesson}
              >
                Continue to Next Lesson <ArrowRight size={20} />
              </Button>
            ) : (
              <Button
                variant="primary"
                className="w-full py-6 text-lg rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-transform"
                onClick={onExit}
              >
                Return to Course Map <CheckCircle2 size={20} />
              </Button>
            )}
            <Button
              variant="secondary"
              className="w-full py-6 text-lg rounded-2xl"
              onClick={onExit}
            >
              Exit Lesson
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-dvh max-h-dvh flex flex-col items-stretch px-0 justify-start">
      {/* Topbar Progress */}
      <div className="flex items-center gap-6 p-4 border-b border-border bg-surface shrink-0 z-20 relative px-8">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-text-light hover:text-text font-bold text-sm transition-colors"
        >
          <X size={16} /> Exit
        </button>

        <div className="flex-1 flex gap-2 h-3 max-w-2xl mx-auto">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full ${i < currentStep ? 'bg-primary' : i === currentStep ? 'bg-primary w-1/2' : 'w-0'}`}
                style={i === currentStep ? { transition: 'width 0.3s ease' } : {}}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm font-bold text-text-light">
          <div className="flex items-center gap-1">
            <span className="text-primary">XP</span> {topic.metadata?.xp || 10}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-40 px-8">
        <div className="max-w-3xl w-full mx-auto mt-8">
          {isContentStep ? (
            <>
              <h1 className="text-3xl font-black text-text mb-6 tracking-tight leading-tight">
                {topic.title}
              </h1>

              <div className="mb-10 flex flex-col gap-8">
                {topic.content?.length > 0 ? (
                  topic.content.map((blockData: any, idx: number) =>
                    renderBlock(blockData, idx, false),
                  )
                ) : (
                  <div className="text-center text-text-light">No content blocks available.</div>
                )}
              </div>
            </>
          ) : (
            <div className="mb-10 mt-8">
              {currentExercise && renderBlock(currentExercise, 0, true)}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar Area & Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        {validationState !== 'idle' && !isContentStep && (
          <div
            className={`w-full p-8 pb-32 font-bold text-xl ${validationState === 'correct' ? 'bg-[#1a2e1d] text-green-400 border-green-500/30' : 'bg-[#311c1c] text-red-400 border-red-500/30'} border-t flex flex-col gap-4 shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.5)]`}
          >
            <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${validationState === 'correct' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                >
                  {validationState === 'correct' ? <Check size={28} /> : <X size={28} />}
                </div>
                <span className="text-2xl">
                  {validationState === 'correct' ? 'Excellent!' : "Oops! That's not quite right."}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="w-full bg-surface/95 backdrop-blur-sm border-t border-border p-6 flex justify-center absolute bottom-0 z-10">
          <div className="max-w-3xl w-full flex justify-between gap-4">
            {isContentStep ? (
              <Button
                variant="primary"
                className="w-full py-6 text-lg rounded-2xl"
                onClick={handleNext}
              >
                {totalSteps > 1 ? 'Start Exercises' : 'Complete Lesson'}
              </Button>
            ) : validationState === 'idle' ? (
              <Button
                variant="primary"
                className="w-full py-6 text-lg rounded-2xl"
                onClick={handleCheck}
                disabled={!isAnswerComplete}
              >
                Check Answer
              </Button>
            ) : validationState === 'correct' ? (
              <Button
                variant="primary"
                className="w-full py-6 text-lg rounded-2xl bg-green-500 hover:bg-green-600 text-white border-green-500"
                onClick={handleNext}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="w-full py-6 text-lg rounded-2xl"
                onClick={() => setValidationState('idle')}
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Explanation Modal */}
      {showExplanationModal && currentExercise && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowExplanationModal(false)}
        >
          <div
            className="bg-background border border-border w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
              <div className="flex items-center gap-3 text-blue-400 font-bold text-xl">
                <Info size={24} /> Explanation
              </div>
              <button
                onClick={() => setShowExplanationModal(false)}
                className="p-2 text-text-light hover:text-text rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
              {currentExercise.explanation && (
                <div className="text-lg text-text leading-relaxed">
                  {currentExercise.explanation}
                </div>
              )}
              {currentExercise.explanationSnippet && (
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-bold text-text-light uppercase tracking-wider">
                    Code Example
                  </div>
                  <pre className="p-4 bg-black/40 border border-white/10 rounded-xl text-sm overflow-x-auto text-blue-300 font-mono">
                    <code>{currentExercise.explanationSnippet}</code>
                  </pre>
                </div>
              )}
              {currentExercise.explanationTip && (
                <InfoCardBlock title="Pro Tip" content={currentExercise.explanationTip} />
              )}
              {!currentExercise.explanation &&
                !currentExercise.explanationSnippet &&
                !currentExercise.explanationTip && (
                  <div className="text-center text-text-light italic">
                    No explanation provided for this exercise.
                  </div>
                )}
            </div>
            <div className="p-6 bg-surface border-t border-border flex justify-end">
              <Button variant="primary" onClick={() => setShowExplanationModal(false)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
