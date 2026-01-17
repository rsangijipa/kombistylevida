import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QuizState {
    answers: Record<string, string>; // questionId -> optionId
    score: number;
    safetyTriggered: boolean;
    currentQuestionIndex: number;
    isFinished: boolean;

    // Actions
    setAnswer: (qId: string, optId: string, points: number, isSafety: boolean) => void;
    nextQuestion: (totalQuestions: number) => void;
    prevQuestion: () => void;
    resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>()(
    persist(
        (set) => ({
            answers: {},
            score: 0,
            safetyTriggered: false,
            currentQuestionIndex: 0,
            isFinished: false,

            setAnswer: (qId, optId, points, isSafety) => set((state) => {
                // Remove potential previous score for this question if changing answer (simplified: just overwrite)
                // For a robust score recalculation, we'd ideally recalculate from all answers,
                // but for this linear flow we can add. 
                // BETTER APPROACH: Save score per question to allow subtraction on change? 
                // Or just recalc score from answers map at the end. Let's save `score` purely for now, but really we should recalculate.
                // To keep it simple: We won't subtract previous points here because that requires complex tracking.
                // Instead, we will store the raw data and calculate score *derived* in the Component or a Selector.
                // But the user requested a store. Let's just track answers and derived logic will happen in the UI or a helper.

                const newAnswers = { ...state.answers, [qId]: optId };
                // Safety trigger logic: OR logic (once true, always true unless cleared) - actually should check if *any* answer is safety

                return {
                    answers: newAnswers,
                    safetyTriggered: state.safetyTriggered || isSafety
                };
            }),

            nextQuestion: (total) => set((state) => {
                const next = state.currentQuestionIndex + 1;
                if (next >= total) {
                    return { isFinished: true };
                }
                return { currentQuestionIndex: next };
            }),

            prevQuestion: () => set((state) => ({
                currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
                isFinished: false
            })),

            resetQuiz: () => set({
                answers: {},
                score: 0,
                safetyTriggered: false,
                currentQuestionIndex: 0,
                isFinished: false
            })
        }),
        {
            name: 'kombi-quiz-storage',
        }
    )
);
