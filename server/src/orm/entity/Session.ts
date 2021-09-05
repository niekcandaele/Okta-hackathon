import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { getDb } from '../../rejson/db';
import { Answer } from './Answer';
import { Base } from './Base';
import { Person } from './Person';
import { Question } from './Question';
import { Squad } from './Squad';

@Entity()
export class Session extends Base {
  @Column({ default: true })
  active: boolean;

  @OneToOne(() => Question, { cascade: true, onDelete: 'CASCADE' })
  activeQuestion: Question;

  @ManyToOne(() => Squad, squad => squad.sessions, { cascade: true, onDelete: 'CASCADE' })
  squad: Squad

  @OneToMany(() => Question, question => question.session, { eager: true,cascade: true, onDelete: 'CASCADE' })
  questions: Question[];

  async addQuestion(question: Partial<Question>) {
    const newQuestion = await Question.create(question).save();
    if (!this.questions) this.questions = [];
    this.questions.push(newQuestion);
    this.save();
    return newQuestion;
  }

  async answerQuestion(questionId: string, personId: string, answerChoice: number) {
    const question = await Question.findOne(questionId);
    if (!question) {
      throw new Error(`Question with id ${questionId} not found`);
    }

    const person = await Person.findOne(personId);
    if (!person) {
      throw new Error(`Person with id ${personId} not in squad`);
    }
    const answer = new Answer();
    answer.answer = answerChoice;
    await answer.save();
    return this;
  }

  async end() {
    if (!this.active) return;
    console.log(`Session: Ending session ${this.id}`);
    this.active = false;
    await this.save();

    await getDb().send_command('XADD', 'Session-end', '*', 'id', this.id);
    return this;
  }

  async setActiveQuestion(question: Question) {
    this.activeQuestion = question;
    return this.save();
  }

  public async getTotals() {
    const returnVal: Record<string, number> = {};
    for (const question of this.questions) {
      const total = await getDb().get(`Question:${question.id}:total`);
      // not !total because it could be 0!
      if (total === null) continue;
      returnVal[question.id] = parseInt(total, 10);
    }

    return returnVal;
  }
}
