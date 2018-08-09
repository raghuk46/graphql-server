import * as yup from 'yup';
import { passwordNotLong } from './modules/user/register/errorMessages';

export const registerPasswordValidation = yup
	.string()
	.min(3, passwordNotLong)
	.max(255);
