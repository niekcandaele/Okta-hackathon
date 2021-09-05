import { Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Base } from './Base';
import { Person } from './Person';
import { Session } from './Session';

@Entity()
export class Squad extends Base {
  @OneToMany(() => Session, session => session.squad, { onDelete: "CASCADE" })
  @JoinTable()
  sessions: Session[];

  @Column()
  name: string;

  @ManyToMany(() => Person, person => person.squads, { eager: true, cascade: true, onDelete: 'CASCADE' })
  @JoinTable()
  members: Person[];

  @Column({ nullable: true })
  discordWebhook: string

  @Column({ default: false })
  open: boolean;

  @OneToOne(() => Session)
  @JoinTable()
  activeSession: Session

  async addMember(person: Person) {
    this.members.push(person);
    await this.save();
    return this;
  }

  async removeMember(person: Person) {
    this.members.splice(this.members.indexOf(person), 1);
    await this.save();
    return this;
  }

  async setOpen() {
    this.open = true;
    return this.save();
  }
}
