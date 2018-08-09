import 'reflect-metadata';
import 'dotenv/config';
import { GraphQLServer } from 'graphql-yoga';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import * as RateLimit from 'express-rate-limit';
import * as RateLimitRedisStore from 'rate-limit-redis';

import { redis } from './redis';
import { createTypeormConn } from './utils/createTypeormConn';
import { confirmEmail } from './routes/confirmEmail';
import { generateSchema } from './utils/generateSchema';
import { redisSessionPrefix } from './constants';
import { createTestConn } from './tests/createTestConn';

const SESSION_SECRET = 'YTWUEt87wtruyetqwutde67ftdsuyf';
const RedisStore = connectRedis(session);

export const initServer = async () => {
	if (process.env.NODE_ENV === 'test') {
		await redis.flushall();
	}

	const server = new GraphQLServer({
		schema: generateSchema(),
		context: ({ request }) => ({
			redis,
			url: request.protocol + '://' + request.get('host'),
			session: request.session,
			req: request,
		}),
	});

	server.express.use(
		new RateLimit({
			store: new RateLimitRedisStore({
				client: redis,
			}),
			windowMs: 15 * 60 * 1000, // 15 minutes
			max: 100, // limit each IP to 100 requests per windowMs
			delayMs: 0, // disable delaying - full speed until the max limit is reached
		})
	);

	server.express.use(
		session({
			store: new RedisStore({
				client: redis as any,
				prefix: redisSessionPrefix,
			}),
			name: 'qid',
			secret: SESSION_SECRET,
			resave: false,
			saveUninitialized: false,
			cookie: {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
			},
		})
	);

	const cors = {
		credentials: true,
		origin: process.env.NODE_ENV === 'test' ? '*' : (process.env.GQL_SERVER_HOST as string),
	};

	server.express.get('/confirm/:id', confirmEmail);

	if (process.env.NODE_ENV === 'test') {
		await createTestConn(true);
	} else {
		await createTypeormConn();
	}

	const serverPort = process.env.NODE_ENV === 'test' ? 4200 : 4000;
	const app = await server.start({
		cors,
		port: serverPort,
	});
	console.log(`🚀  Server ready at localhost:${serverPort}`);

	return app;
};
