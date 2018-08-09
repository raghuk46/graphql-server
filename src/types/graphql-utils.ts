import { Redis } from 'ioredis';
import { ObjectID } from 'mongodb';

export interface Session extends Express.Session {
	userId?: ObjectID;
}

export interface Context {
	redis: Redis;
	url: string;
	session: Session;
	req: Express.Request;
}

export type Resolver = (parent: any, args: any, context: Context, info: any) => any;

export type GraphQLMiddlewareFunc = (resolver: Resolver, parent: any, args: any, context: Context, info: any) => any;

export interface ResolverMap {
	[key: string]: {
		[key: string]: Resolver;
	};
}
