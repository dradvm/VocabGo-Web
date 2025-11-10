export class Lesson {
  lesson_id!: string;
  lesson_name!: string;
  lesson_reward!: number;
  lesson_type_id!: string;
  lesson_type!: LessonType;
  lesson_order!: number;
  lesson_question!: LessonQuestion[];
}
export class Question {
  question_id!: string;
  question_name!: string;
}
export class LessonQuestion {
  question_id!: string;
  question_count!: number;
  question?: Question;
}
export class LessonType {
  lesson_type_id!: string;
  lesson_type_name!: string;
}
