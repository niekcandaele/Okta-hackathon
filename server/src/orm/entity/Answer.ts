import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Base } from './Base';
import { Person } from './Person';
import { Question } from './Question';

@Entity()
export class Answer extends Base {
  @ManyToOne(() => Question, (question) => question.answers, { onDelete: "CASCADE" })
  question: Question;

  @Column()
  answer: number;

  @ManyToOne(() => Person, (person) => person.answers, { cascade: true, onDelete: "CASCADE" })
  person: Person;
}
