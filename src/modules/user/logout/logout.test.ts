import { Connection } from 'typeorm';
import { ObjectID } from 'mongodb';

import { User } from '../../../entity/User';
import { TestClient } from '../../../utils/TestClient';
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

describe('logout', () => {
	it('should check logging out from multiple sessions', async () => {
		// computer 1
		const sess1 = new TestClient(process.env.TEST_HOST as string);
		// computer 2
		const sess2 = new TestClient(process.env.TEST_HOST as string);

		await sess1.login(email, password);
		await sess2.login(email, password);
		expect(await sess1.me()).toEqual(await sess2.me());
		await sess1.logout();
		expect(await sess1.me()).toEqual(await sess2.me());
	});

	xit('should check logging out from single session', async () => {
		const client = new TestClient(process.env.TEST_HOST as string);
		await client.login(email, password);
		const response = await client.me();
		expect(response.data).toEqual({
			me: {
				id: userId,
				email,
			},
		});

		await client.logout();

		const response2 = await client.me();
		expect(response2.data.me).toBeNull();
	});
});
