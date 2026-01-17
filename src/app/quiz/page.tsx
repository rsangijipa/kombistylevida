"use client";

import React, { useEffect } from "react";
import { QuizShell } from "@/components/quiz/QuizShell";
import { QuizStepper } from "@/components/quiz/QuizStepper";
import { QuizResult } from "@/components/quiz/QuizResult";
import { useQuizStore } from "@/store/quizStore";
import { QUIZ_QUESTIONS, RESULTS } from "@/data/quizFull";
import { ChevronRight, Check } from "lucide-react";
import { useShallow } from 'zustand/react/shallow';

export default function AdvancedQuizPage() {
    const {
        currentQuestionIndex,
        answers,
        isFinished,
        score,
        safetyTriggered,
        setAnswer,
        nextQuestion,
        prevQuestion,
        resetQuiz
    } = useQuizStore(useShallow(state => ({
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        isFinished: state.isFinished,
        score: state.score,
        safetyTriggered: state.safetyTriggered,
        setAnswer: state.setAnswer,
        nextQuestion: state.nextQuestion,
        prevQuestion: state.prevQuestion,
        resetQuiz: state.resetQuiz
    })));

    // Reset on mount if desired, but user asked for persistence. 
    // We will keep state. If users want to restart, they can click restart in result.

    // Derived: Current Question
    const question = QUIZ_QUESTIONS[currentQuestionIndex];
    const hasAnswer = question ? !!answers[question.id] : false;

    // Derived: Result Calculation
    const getResult = () => {
        if (safetyTriggered) return RESULTS.SAFETY_OVERRIDE;

        // Calculate total score from answers map recomposed
        // We stored score in store, but let's re-verify:
        let totalScore = 0;
        QUIZ_QUESTIONS.forEach(q => {
            const chosenId = answers[q.id];
            const opt = q.options.find(o => o.id === chosenId);
            if (opt) totalScore += opt.score;
        });

        if (totalScore >= 8) return RESULTS.START_GENTLE; // High sensitivity
        if (totalScore >= 4) return RESULTS.MODERATE;
        return RESULTS.STABLE; // Low sensitivity
    };

    const handleOptionSelect = (optId: string, points: number, isSafety: boolean = false) => {
        setAnswer(question.id, optId, points, isSafety);
        // Auto advance after small delay for better UX
        setTimeout(() => {
            nextQuestion(QUIZ_QUESTIONS.length);
        }, 250);
    };

    if (isFinished) {
        const finalResult = getResult();
        return (
            <QuizShell>
                <QuizResult result={finalResult} />
            </QuizShell>
        );
    }

    return (
        <QuizShell>
            <QuizStepper current={currentQuestionIndex} total={QUIZ_QUESTIONS.length} />

            <div className="flex-1 flex flex-col justify-center animate-fade-in-right">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink mb-8 text-center leading-tight">
                    {question.text}
                </h2>

                <div className="space-y-3">
                    {question.options.map((opt) => {
                        const isSelected = answers[question.id] === opt.id;
                        return (
                            <button
                                key={opt.id}
                                onClick={() => handleOptionSelect(opt.id, opt.score, opt.isSafetyTrigger)}
                                className={`
                                    w-full text-left p-5 rounded-xl border transition-all flex items-center justify-between group
                                    ${isSelected
                                        ? "bg-olive text-paper border-olive shadow-md scale-[1.01]"
                                        : "bg-paper border-ink/10 hover:border-olive/30 hover:bg-olive/5"
                                    }
                                `}
                            >
                                <span className={`font-serif text-lg ${isSelected ? "font-bold" : "font-medium"}`}>
                                    {opt.text}
                                </span>
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "border-paper bg-paper text-olive" : "border-ink/20 group-hover:border-olive/50"}`}>
                                    {isSelected && <Check size={14} strokeWidth={4} />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="mt-8 flex justify-between items-center border-t border-ink/5 pt-6">
                <button
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="text-xs font-bold uppercase tracking-widest text-ink/40 hover:text-ink disabled:opacity-0 transition-colors"
                >
                    Voltar
                </button>

                {/* Manual Next if auto-advance fails or user wants to review */}
                <button
                    onClick={() => nextQuestion(QUIZ_QUESTIONS.length)}
                    disabled={!hasAnswer}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-olive disabled:opacity-30 disabled:cursor-not-allowed hover:underline underline-offset-4"
                >
                    {currentQuestionIndex === QUIZ_QUESTIONS.length - 1 ? "Ver Resultado" : "Próxima"}
                    <ChevronRight size={14} />
                </button>
            </div>
        </QuizShell>
    );
}
