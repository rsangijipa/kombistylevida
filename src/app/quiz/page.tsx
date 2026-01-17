"use client";

import React, { useEffect } from "react";
import { QuizShell } from "@/components/quiz/QuizShell";
import { QuizStepper } from "@/components/quiz/QuizStepper";
import { QuizResult } from "@/components/quiz/QuizResult";
import { QuizIntro } from "@/components/quiz/QuizIntro"; // Import Intro
import { useQuizStore } from "@/store/quizStore";
import { QUIZ_QUESTIONS, RESULTS } from "@/data/quizFull";
import { ChevronRight, Check } from "lucide-react";
import { useShallow } from 'zustand/react/shallow';

export default function AdvancedQuizPage() {
    const {
        currentQuestionIndex,
        answers,
        isFinished,
        isStarted,
        score,
        safetyTriggered,
        setAnswer,
        nextQuestion,
        prevQuestion,
        resetQuiz,
        startQuiz
    } = useQuizStore(useShallow(state => ({
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        isFinished: state.isFinished,
        isStarted: state.isStarted,
        score: state.score,
        safetyTriggered: state.safetyTriggered,
        setAnswer: state.setAnswer,
        nextQuestion: state.nextQuestion,
        prevQuestion: state.prevQuestion,
        resetQuiz: state.resetQuiz,
        startQuiz: state.startQuiz
    })));

    // Reset on mount if isFinished is true? Or keep persistence?
    // Let's keep persistence but if !isStarted, we show intro.
    // If user refreshes on question 3, they stay on question 3 (isStarted was persisted).

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

    if (!isStarted) {
        return (
            <QuizShell>
                <QuizIntro onStart={startQuiz} />
            </QuizShell>
        );
    }

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
                                    w-full text-left p-6 mb-3 rounded-2xl border-2 transition-all flex items-center justify-between group touch-target shadow-sm
                                    ${isSelected
                                        ? "bg-olive text-paper border-olive shadow-lg scale-[1.01]"
                                        : "bg-paper border-ink/20 hover:border-olive hover:bg-olive/5"
                                    }
                                `}
                                aria-pressed={isSelected}
                            >
                                <span className={`font-serif text-xl md:text-2xl leading-tight pr-4 ${isSelected ? "font-bold" : "font-medium text-ink"}`}>
                                    {opt.text}
                                </span>
                                <div className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors 
                                    ${isSelected ? "border-paper bg-paper text-olive" : "border-ink/20 group-hover:border-olive"}`}>
                                    {isSelected && <Check size={20} strokeWidth={4} />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="mt-12 flex justify-between items-center border-t border-ink/10 pt-8 gap-6">
                <button
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-4 min-h-[60px] text-base font-bold uppercase tracking-widest text-ink/60 hover:text-ink hover:bg-ink/5 rounded-lg disabled:opacity-0 transition-all touch-target"
                    aria-label="Voltar para pergunta anterior"
                >
                    Voltar
                </button>

                {/* Manual Next */}
                <button
                    onClick={() => nextQuestion(QUIZ_QUESTIONS.length)}
                    disabled={!hasAnswer}
                    className={`
                        flex items-center gap-4 px-10 py-4 min-h-[60px] rounded-full font-bold uppercase tracking-widest transition-all touch-target shadow-md
                        ${hasAnswer
                            ? "bg-olive text-paper hover:scale-105 active:scale-95"
                            : "bg-ink/5 text-ink/30 cursor-not-allowed"}
                    `}
                    aria-label={currentQuestionIndex === QUIZ_QUESTIONS.length - 1 ? "Ver meu resultado" : "Ir para próxima pergunta"}
                >
                    <span className="text-base md:text-lg">
                        {currentQuestionIndex === QUIZ_QUESTIONS.length - 1 ? "Ver Resultado" : "Próxima"}
                    </span>
                    <ChevronRight size={24} />
                </button>
            </div>
        </QuizShell>
    );
}
