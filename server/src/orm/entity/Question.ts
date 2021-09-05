import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Answer } from './Answer';
import { Base } from './Base';
import { Session } from './Session';

@Entity()
export class Question extends Base {
  @ManyToOne(() => Session, session => session.questions, { onDelete: "CASCADE" })
  session: Session

  @Column()
  question: string;

  @Column({ nullable: true })
  descriptionGood: string;

  @Column({ nullable: true })
  descriptionBad: string;

  @OneToMany(() => Answer, answer => answer.question, { eager: true, cascade: true, onDelete: 'CASCADE' })
  answers: Answer[]
};
