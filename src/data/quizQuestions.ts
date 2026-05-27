export interface QuizQuestion {
  question: string;
  answerOptions: Array<{
    text: string;
    isCorrect: boolean;
    rationale: string;
  }>;
}

export async function loadQuizQuestions(): Promise<QuizQuestion[]> {
  const response = await fetch('/data/quizQuestion.json');
  if (!response.ok) {
    throw new Error(`No se pudieron cargar las preguntas (${response.status})`);
  }
  return response.json();
}
