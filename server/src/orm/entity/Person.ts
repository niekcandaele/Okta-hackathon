import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Answer } from './Answer';
import { Base } from './Base';
import { Squad } from './Squad';

@Entity()
export class Person extends Base {
    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    email: string;

    @ManyToMany(() => Squad, squad => squad.members, { onDelete: "CASCADE" })
    squads: Squad[]

    @OneToMany(() => Answer, (answer) => answer.person, { onDelete: "CASCADE" })
    answers: Answer[];
}
