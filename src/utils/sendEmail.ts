import * as Sparkpost from 'sparkpost';

export const sendEmail = async (recipient: string, url: string) => {
	const client = new Sparkpost(process.env.SPARKPOST_API_KEY);
	const response = await client.transmissions.send({
		content: {
			from: 'support@idoor.org',
			subject: 'Confirm Email',
			html: `
			<html>
			  <body>
			    <p>Testing SparkPost - the world's most awesomest email service!</p>
			    <a href="${url}">confirm email</a>
			  </body>
			</html>`,
		},
		recipients: [{ address: recipient }],
	});

	console.log(response);
};
