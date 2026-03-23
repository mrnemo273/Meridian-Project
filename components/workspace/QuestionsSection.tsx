import type { OpenQuestion } from "@/types/case";

interface Props {
  questions: OpenQuestion[];
}

export function QuestionsSection({ questions }: Props) {
  return (
    <section id="questions">
      <div className="section-label">Open Questions</div>
      {questions.map((q) => (
        <div key={q.num} className="question-item">
          <div className="question-number">{q.num}</div>
          <div className="question-text">{q.text}</div>
          <div className="question-context">{q.context}</div>
        </div>
      ))}
    </section>
  );
}
