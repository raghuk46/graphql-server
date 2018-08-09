import { ObjectID } from 'mongodb';
import { Entity, ObjectIdColumn, Column, BaseEntity, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity('users')
export class User extends BaseEntity {
	@ObjectIdColumn() id: ObjectID;

	@Column() name: string;

	@Column() email: string;

	@Column() password: string;

	@Column() passCode: number;

	@Column({ default: true })
	confirmed: boolean;

	@Column('boolean', { default: false })
	isLocked: boolean;

	@BeforeInsert()
	async hashPassword() {
		this.password = await bcrypt.hash(this.password, 10);
	}
}
