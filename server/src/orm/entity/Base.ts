import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Base extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

    static async findOrCreate(id: string) {
        const found = await this.findOne(id);
        if (found) {
            return found;
        }
        return new this();
    }

    async edit(newValues: Record<string, unknown>) {
        Object.assign(this, newValues);
        await this.save();
        return this;
    }
}
