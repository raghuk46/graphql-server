import { Connection } from 'typeorm';
import { User } from '../../../entity/User';
import { TestClient } from '../../../utils/TestClient';
import { ObjectID } from 'mongodb';
import { createTestConn } from '../../../tests/createTestConn';
import * as faker from 'faker';

let conn: Connection;
const email = faker.internet.email();
const password = faker.internet.password();

let userId: ObjectID;
beforeAll(async () => {
	conn = await createTestConn();
	const user = await User.create({
		email,
		password,
		confirmed: true,
	}).save();
	userId = user.id;
});

afterAll(async () => {
	conn.close();
});

describe('me', () => {
	xit('should get current user', async () => {
		const client = new TestClient(process.env.TEST_HOST as string);
		await client.login(email, password);
		const response = await client.me();
		expect(response.data).toEqual({
			me: {
				id: userId,
				email,
			},
		});
	});

	xit('should return null if no cookie', async () => {
		const client = new TestClient(process.env.TEST_HOST as string);
		const response = await client.me();
		expect(response.data.me).toBeNull();
	});
});
