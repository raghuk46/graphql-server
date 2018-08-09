import { initServer } from '../boot';

export const setup = async () => {
	await initServer();
	// const { port } = app.address();
	process.env.TEST_HOST = `http://localhost:4200`;
};
