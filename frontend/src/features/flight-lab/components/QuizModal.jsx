import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Award } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { useAppContext } from '../../../context/AppContext';

export default function QuizModal({ isOpen, onClose, moduleId, moduleTitle, questions, onComplete }) {
  const { user } = useAppContext();
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const currentQ = questions[currentQuestionIdx];

  const handleSelectAnswer = (idx) => {
    if (isAnswerRevealed) return;
    setSelectedAnswer(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswerRevealed(true);
    if (selectedAnswer === currentQ.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = async () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(idx => idx + 1);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
    } else {
      // Finish Quiz
      setIsFinished(true);
      await saveProgress();
    }
  };

  const saveProgress = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const finalScore = score + (selectedAnswer === currentQ.correctAnswer && !isAnswerRevealed ? 1 : 0);
      const percentage = Math.round((finalScore / questions.length) * 100);

      // Upsert progress
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          completed: percentage >= 70, // 70% to pass
          score: percentage,
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id, module_id'
        });

      if (error) throw error;
      
      if (onComplete) {
        onComplete(percentage);
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0b1221] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Knowledge Check: {moduleTitle}
            </h2>
            {!isFinished && (
              <p className="text-slate-400 text-sm mt-1">
                Question {currentQuestionIdx + 1} of {questions.length}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {!isFinished ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentQuestionIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-lg sm:text-xl font-medium text-white mb-6">
                  {currentQ.question}
                </h3>
                
                <div className="space-y-3 mb-8">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === currentQ.correctAnswer;
                    
                    let bgClass = "bg-white/5 border-white/10 hover:border-white/30 text-slate-300 hover:bg-white/10";
                    let icon = null;

                    if (isAnswerRevealed) {
                      if (isCorrect) {
                        bgClass = "bg-emerald-500/10 border-emerald-500/50 text-emerald-400";
                        icon = <CheckCircle2 className="w-5 h-5" />;
                      } else if (isSelected) {
                        bgClass = "bg-red-500/10 border-red-500/50 text-red-400";
                        icon = <XCircle className="w-5 h-5" />;
                      } else {
                        bgClass = "bg-white/5 border-white/5 text-slate-500 opacity-50";
                      }
                    } else if (isSelected) {
                      bgClass = "bg-[#0ea5e9]/20 border-[#0ea5e9] text-white";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(idx)}
                        disabled={isAnswerRevealed}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${bgClass}`}
                      >
                        <span className="flex-1">{opt}</span>
                        {icon}
                      </button>
                    );
                  })}
                </div>

                {isAnswerRevealed && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`mb-8 p-4 rounded-xl flex items-start gap-3 ${selectedAnswer === currentQ.correctAnswer ? 'bg-emerald-500/10 text-emerald-200' : 'bg-red-500/10 text-red-200'}`}
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{currentQ.explanation}</p>
                  </motion.div>
                )}

                <div className="flex justify-end pt-4 border-t border-white/10">
                  {!isAnswerRevealed ? (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={selectedAnswer === null}
                      className="bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-colors"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="bg-white text-black hover:bg-slate-200 px-8 py-3 rounded-xl font-bold transition-colors"
                    >
                      {currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'View Results'}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" 
                   style={{ background: percentage >= 70 ? 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)' }}>
                <Award className={`w-12 h-12 ${percentage >= 70 ? 'text-emerald-400' : 'text-red-400'}`} />
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-2">
                {percentage >= 70 ? 'Module Passed!' : 'Module Failed'}
              </h3>
              <p className="text-slate-400 mb-8">
                You scored <span className="text-white font-bold">{score}</span> out of {questions.length} ({percentage}%)
              </p>

              {percentage >= 70 ? (
                <p className="text-emerald-400 text-sm mb-8">
                  Your progress has been saved to your academy record. You may proceed to the next lab.
                </p>
              ) : (
                <p className="text-amber-400 text-sm mb-8">
                  A score of 70% is required to pass. Please review the material and try again.
                </p>
              )}

              <div className="flex justify-center gap-4">
                <button
                  onClick={onClose}
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
