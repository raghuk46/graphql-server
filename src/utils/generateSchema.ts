import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';

import { makeExecutableSchema } from 'graphql-tools';
import { mergeTypes, mergeResolvers } from 'merge-graphql-schemas';

// export const generateSchema = () => {
// 	const schemas: GraphQLSchema[] = [];
// 	const modulesList = fs.readdirSync(path.join(__dirname, '../modules'));
// 	modulesList.forEach(list => {
// 		const { resolvers } = require(`../modules/${list}/resolvers`);
// 		const typeDefs = importSchema(path.join(__dirname, `../modules/${list}/schema.graphql`));
// 		schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
// 	});

// 	return mergeSchemas({ schemas });
// };

export const generateSchema = () => {
	const pathToModules = path.join(__dirname, '../modules');
	const graphqlTypes = glob.sync(`${pathToModules}/**/*.graphql`).map(x => fs.readFileSync(x, { encoding: 'utf8' }));

	const resolvers = glob.sync(`${pathToModules}/**/resolvers.?s`).map(resolver => require(resolver).resolvers);

	return makeExecutableSchema({
		typeDefs: mergeTypes(graphqlTypes),
		resolvers: mergeResolvers(resolvers),
	});
};
