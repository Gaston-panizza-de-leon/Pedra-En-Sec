import { useState, useEffect, useRef } from 'react';
import { quizQuestions } from '../../data/quizQuestions';
import './QuizModal.css';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function QuizModal({ isOpen, onClose }: QuizModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState(() => 
    quizQuestions.map((q) => ({
      ...q,
      shuffledOptions: shuffleArray([...q.answerOptions]),
    }))
  );

  // Regenerate shuffled questions when modal opens
  useEffect(() => {
    if (isOpen) {
      const shuffled = shuffleArray(quizQuestions);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShuffledQuestions(
        shuffled.map((q) => ({
          ...q,
          shuffledOptions: shuffleArray([...q.answerOptions]),
        }))
      );
    }
  }, [isOpen]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    modalRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleAnswerClick = (index: number) => {
    if (answered) return;

    setSelectedAnswerIndex(index);
    setAnswered(true);

    if (currentQuestion.shuffledOptions[index].isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswerIndex(null);
      setAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setScore(0);
    setAnswered(false);
    setQuizFinished(false);
  };

  const handleClose = () => {
    handleRestart();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="quiz-modal-overlay" onClick={handleClose}>
      <div
        ref={modalRef}
        className="quiz-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Quiz sobre Pedra en Sec"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="quiz-modal__close"
          onClick={handleClose}
          aria-label="Cerrar quiz"
        >
          ✕
        </button>

        <div className="quiz-modal__body">
          {!quizFinished ? (
            <>
              {/* Progress bar */}
              <div className="quiz-modal__progress">
                <div className="quiz-modal__progress-bar">
                  <div
                    className="quiz-modal__progress-fill"
                    style={{
                      width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%`,
                    }}
                  />
                </div>
                <p className="quiz-modal__progress-text">
                  Pregunta {currentQuestionIndex + 1} de {shuffledQuestions.length}
                </p>
              </div>

              {/* Question */}
              <h2 className="quiz-modal__question">{currentQuestion.question}</h2>

              {/* Answer options */}
              <div className="quiz-modal__options">
                {currentQuestion.shuffledOptions.map((option, index) => (
                  <button
                    key={index}
                    className={`quiz-modal__option ${
                      selectedAnswerIndex === index ? 'quiz-modal__option--selected' : ''
                    } ${
                      answered && selectedAnswerIndex === index
                        ? option.isCorrect
                          ? 'quiz-modal__option--correct'
                          : 'quiz-modal__option--incorrect'
                        : ''
                    } ${
                      answered && option.isCorrect && selectedAnswerIndex !== index
                        ? 'quiz-modal__option--correct'
                        : ''
                    }`}
                    onClick={() => handleAnswerClick(index)}
                    disabled={answered}
                  >
                    <span className="quiz-modal__option-text">{option.text}</span>
                  </button>
                ))}
              </div>

              {/* Rationale */}
              {answered && selectedAnswerIndex !== null && (
                <div
                  className={`quiz-modal__rationale ${
                    currentQuestion.shuffledOptions[selectedAnswerIndex].isCorrect
                      ? 'quiz-modal__rationale--correct'
                      : 'quiz-modal__rationale--incorrect'
                  }`}
                >
                  <p className="quiz-modal__rationale-title">
                    {currentQuestion.shuffledOptions[selectedAnswerIndex].isCorrect
                      ? '✓ ¡Correcto!'
                      : '✗ Incorrecto'}
                  </p>
                  {currentQuestion.shuffledOptions[selectedAnswerIndex].rationale && (
                    <p className="quiz-modal__rationale-text">
                      {currentQuestion.shuffledOptions[selectedAnswerIndex].rationale}
                    </p>
                  )}
                </div>
              )}

              {/* Next button */}
              {answered && (
                <button
                  className="quiz-modal__next-btn"
                  onClick={handleNext}
                >
                  {currentQuestionIndex < shuffledQuestions.length - 1
                    ? 'Siguiente'
                    : 'Ver resultados'}
                </button>
              )}
            </>
          ) : (
            <>
              {/* Results screen */}
              <div className="quiz-modal__results">
                <h2 className="quiz-modal__results-title">¡Quiz completado!</h2>
                <div className="quiz-modal__score">
                  <div className="quiz-modal__score-circle">
                    <span className="quiz-modal__score-number">{score}</span>
                    <span className="quiz-modal__score-total">/{shuffledQuestions.length}</span>
                  </div>
                  <p className="quiz-modal__score-percentage">
                    {Math.round((score / shuffledQuestions.length) * 100)}%
                  </p>
                </div>

                <div className="quiz-modal__score-message">
                  {score === shuffledQuestions.length && (
                    <p>¡Excelente! ¡Eres un verdadero experto en Pedra en Sec!</p>
                  )}
                  {score >= shuffledQuestions.length * 0.7 && score < shuffledQuestions.length && (
                    <p>¡Muy bien! Tienes un sólido conocimiento sobre Pedra en Sec.</p>
                  )}
                  {score >= shuffledQuestions.length * 0.5 && score < shuffledQuestions.length * 0.7 && (
                    <p>Buen trabajo. ¿Por qué no repasas más información sobre Pedra en Sec?</p>
                  )}
                  {score < shuffledQuestions.length * 0.5 && (
                    <p>Necesitas aprender más. ¡Inténtalo de nuevo!</p>
                  )}
                </div>

                <button className="quiz-modal__restart-btn" onClick={handleRestart}>
                  Reintentar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
