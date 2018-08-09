import fetch from 'node-fetch';
import * as Redis from 'ioredis';
import * as faker from 'faker';
import { Connection } from 'typeorm';

import { User } from '../../../entity/User';
import { duplicateEmail, validEmail, passwordNotLong } from './errorMessages';
import { createConfirmEmailLink } from './createConfirmEmailLink';
import { TestClient } from '../../../utils/TestClient';
import { createTestConn } from '../../../tests/createTestConn';

const email = faker.internet.email();
const password = faker.internet.password();
const redis = new Redis();

let conn: Connection;

beforeAll(async () => {
	conn = await createTestConn();
});

afterAll(() => {
	conn.close();
});

describe('User Registration', async () => {
	const client = new TestClient(process.env.TEST_HOST as string);
	it('it should throw error if email is not valid', async () => {
		const response = await client.register('rag', password);
		expect(response.data).toEqual({
			register: [
				{
					path: 'email',
					message: validEmail,
				},
			],
		});
	});

	it('it should throw error if password is not valid', async () => {
		const response = await client.register(email, 'hw');
		expect(response.data).toEqual({
			register: [
				{
					path: 'password',
					message: passwordNotLong,
				},
			],
		});
	});

	it('it should register a user', async () => {
		const response = await client.register(email, password);
		expect(response.data).toEqual({ register: null });
	});

	it('it should find a user in database after registration', async () => {
		const users = await User.find({ where: { email } });
		expect(users).toHaveLength(1);
		const user = users[0];
		expect(user.email).toEqual(email);
		expect(user.password).not.toEqual(password);
	});

	it('it should throw error if user try to regirster duplicate email', async () => {
		const response = await client.register(email, password);
		expect(response.data.register).toHaveLength(1);
		expect(response.data.register[0]).toEqual({
			path: 'email',
			message: duplicateEmail,
		});
	});
});

describe('Confirm Email Link Generator', async () => {
	it('should check if the link is generated', async () => {
		const user = await User.findOne({ where: { email } });
		const link = await createConfirmEmailLink(process.env.TEST_HOST as string, user.id, redis);

		const response = await fetch(link);
		const text = await response.text();
		expect(text).toEqual('ok');
		const fetchUser = await User.findOne(user.id);
		expect(fetchUser.confirmed).toBeTruthy();

		const chunks = link.split('/');
		const key = chunks[chunks.length - 1];
		const value = await redis.get(key);
		expect(value).toBeNull();
	});

	it('should respond back with invalid response if confirm link is not valid', async () => {
		const response = await fetch(`${process.env.TEST_HOST}/confirm/72341278354239184`);
		const text = await response.text();
		expect(text).toEqual('invalid');
	});
});
