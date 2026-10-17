import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import type { GrammarQuizQuestion } from '../../../core/content/grammar-lessons.data';
import { questionAttemptsRepository } from '../../../core/database/repositories/question-attempts.repository';
import { cn } from '../../../lib/utils';

interface GrammarQuizProps {
  taskId: string;
  questions: GrammarQuizQuestion[];
  onQuizComplete?: (score: number) => void;
}

export const GrammarQuiz: React.FC<GrammarQuizProps> = ({ taskId, questions, onQuizComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <Card className="border-border bg-card p-6 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Award className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">Bu Bölüm İçin Quiz Bulunmuyor</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Bu video soru çözümü ve uygulama pratiği içerdiğinden sorular video içerisinde doğrudan hoca tarafından çözülmektedir.
        </p>
      </Card>
    );
  }

  const currentQ = questions[currentIndex];
  const selectedChoice = selectedAnswers[currentIndex];
  const hasAnswered = selectedChoice !== undefined;

  const handleSelectOption = async (optionLabel: string) => {
    if (hasAnswered) return; // Zaten cevaplandıysa tekrar tıklanamaz

    const isCorrect = optionLabel === currentQ.correctAnswer;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optionLabel }));
    setShowExplanation((prev) => ({ ...prev, [currentIndex]: true }));

    // IndexedDB'ye anında kaydet
    await questionAttemptsRepository.recordAttempt({
      taskId,
      questionId: currentQ.id,
      isCorrect,
      submittedAnswer: optionLabel,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      // Skor hesabı
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswer) {
          correctCount++;
        }
      });
      const scorePercentage = Math.round((correctCount / questions.length) * 100);
      if (onQuizComplete) {
        onQuizComplete(scorePercentage);
      }
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentIndex(0);
    setIsFinished(false);
  };

  if (isFinished) {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });
    const score = Math.round((correctCount / questions.length) * 100);

    return (
      <Card className="border-primary/30 bg-card p-6 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Award className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold">Quiz Tamamlandı!</h3>
        <p className="text-sm text-muted-foreground">
          {questions.length} sorudan <strong className="text-foreground">{correctCount}</strong> tanesini doğru yanıtladınız.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-base font-bold text-foreground">
          <span>Başarı Oranı:</span>
          <span className={score >= 70 ? 'text-emerald-500' : 'text-amber-500'}>
            %{score}
          </span>
        </div>

        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={handleRestart} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            <span>Testi Tekrar Çöz</span>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">
              Soru {currentIndex + 1} / {questions.length}
            </Badge>
            <span className="text-xs text-muted-foreground">YDS & YÖKDİL Formatı</span>
          </div>

          <div className="text-xs text-muted-foreground font-medium">
            Doğru cevap anında IndexedDB geçmişinize işlenir
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        {/* Question Prompt */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-sm sm:text-base font-medium leading-relaxed text-foreground">
          {currentQ.question}
        </div>

        {/* Options List */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt) => {
            const isSelected = selectedChoice === opt.label;
            const isCorrect = opt.label === currentQ.correctAnswer;

            let optionStyle = 'border-border bg-card hover:bg-muted/80 text-foreground';

            if (hasAnswered) {
              if (isCorrect) {
                optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 font-semibold';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-200';
              } else {
                optionStyle = 'border-border/60 opacity-60 bg-muted/20 text-muted-foreground';
              }
            }

            return (
              <button
                key={opt.label}
                disabled={hasAnswered}
                onClick={() => handleSelectOption(opt.label)}
                className={cn(
                  'w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all',
                  optionStyle
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold border',
                      isSelected || (hasAnswered && isCorrect)
                        ? 'bg-foreground text-background border-transparent'
                        : 'bg-muted text-muted-foreground border-border'
                    )}
                  >
                    {opt.label}
                  </span>
                  <span>{opt.text}</span>
                </div>

                {hasAnswered && isCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Card */}
        {hasAnswered && showExplanation[currentIndex] && (
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.04] space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Çözüm & Soru Analizi
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Doğru Seçenek: {currentQ.correctAnswer}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Next Button */}
        {hasAnswered && (
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={handleNext} className="gap-2 text-xs h-9">
              <span>{currentIndex === questions.length - 1 ? 'Quizi Bitir' : 'Sonraki Soru'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
