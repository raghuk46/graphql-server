// import * as bcrypt from 'bcryptjs';
import * as yup from 'yup';
import { ResolverMap } from '../../../types/graphql-utils';
import { User } from '../../../entity/User';
import { formatYupError } from '../../../utils/formatYupError';
import { duplicateEmail } from './errorMessages';
import { createConfirmEmailLink } from './createConfirmEmailLink';
import { sendEmail } from '../../../utils/sendEmail';
import { registerPasswordValidation } from '../../../yupSchemas';

const schema = yup.object().shape({
	email: yup
		.string()
		.min(3)
		.max(255)
		.email(),
	password: registerPasswordValidation,
});

export const resolvers: ResolverMap = {
	Mutation: {
		register: async (_, args: GQL.IRegisterOnMutationArguments, { redis, url }) => {
			try {
				await schema.validate(args, { abortEarly: false });
			} catch (err) {
				return formatYupError(err);
			}
			const { email, password } = args;

			// check if user already exists
			const checkUserExists = await User.findOne({
				where: { email },
				select: ['id'],
			});

			if (checkUserExists) {
				return [
					{
						path: 'email',
						message: duplicateEmail,
					},
				];
			}

			const user = await User.create({
				email,
				password,
			});

			await user.save();

			if (process.env.NODE_ENV !== 'test') {
				await sendEmail(email, await createConfirmEmailLink(url, user.id, redis));
			}

			return null;
		},
	},
};
