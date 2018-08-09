import { Connection } from 'typeorm';
import * as faker from 'faker';

import { invalidLogin, confirmEmailError } from './errorMessages';
import { User } from '../../../entity/User';
import { TestClient } from '../../../utils/TestClient';
import { createTestConn } from '../../../tests/createTestConn';

const email = faker.internet.email();
const password = faker.internet.password();

let conn: Connection;

beforeAll(async () => {
	conn = await createTestConn();
});

afterAll(async () => {
	conn.close();
});

const userLoginError = async (client: TestClient, e: string, p: string, errMsg: string, mutationType: any) => {
	let response: object;
	response = mutationType === 'login' ? await client.login(e, p) : await client.register(e, p);
	expect(response.data).toEqual({
		login: [
			{
				path: 'email',
				message: errMsg,
			},
		],
	});
};

describe('Loign User', () => {
	it('should throw error if email is not registered', async () => {
		const client = new TestClient(process.env.TEST_HOST as string);
		await userLoginError(client, 'test@gmail.com', 'hjsafh', invalidLogin, 'login');
	});

	it('should throw error if email is not valid', async () => {
		const client = new TestClient(process.env.TEST_HOST as string);
		await userLoginError(client, 'sdsadfasfd', password, invalidLogin, 'login');
	});

	it('should throw error if password is not valid', async () => {
		const client = new TestClient(process.env.TEST_HOST as string);
		await userLoginError(client, email, 'sgdfhgsdaf', invalidLogin, 'login');
	});

	it('should register user to test valid scenario', async () => {
		const client = new TestClient(process.env.TEST_HOST as string);
		const response = await client.register(email, password);
		expect(response.data).toEqual({ register: null });
	});

	it('should throw error email confirmation Error', async () => {
		const client = new TestClient(process.env.TEST_HOST as string);
		await userLoginError(client, email, password, confirmEmailError, 'login');
	});

	it('should return success response for valid login', async () => {
		await User.update({ email }, { confirmed: true });
		const client = new TestClient(process.env.TEST_HOST as string);
		const res = await client.login(email, password);
		expect(res.data).toEqual({
			login: null,
		});
	});
});
