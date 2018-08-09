import * as RequsetPromise from 'request-promise';

export class TestClient {
	url: string;
	options: {
		jar: any;
		withCredentials: boolean;
		json: boolean;
	};
	constructor(url: string) {
		this.url = url;
		this.options = {
			withCredentials: true,
			jar: RequsetPromise.jar(),
			json: true,
		};
	}

	async register(email: string, password: string) {
		return RequsetPromise.post(this.url, {
			...this.options,
			body: {
				query: `
              mutation {
                register(email: "${email}", password: "${password}") {
                  path
                  message
                }
              }
            `,
			},
		});
	}

	async login(email: string, password: string) {
		return RequsetPromise.post(this.url, {
			...this.options,
			body: {
				query: ` 
                mutation { 
                    login(email: "${email}", password: "${password}") {
                         path
                         message
                    } 
                }`,
			},
		});
	}

	async me() {
		return RequsetPromise.post(this.url, {
			...this.options,
			body: {
				query: `
                    {
                        me {
                            id
                            email
                        }
                    }
            `,
			},
		});
	}

	async logout() {
		return RequsetPromise.post(this.url, {
			...this.options,
			body: {
				query: `
                        mutation {
                            logout
                        }
                `,
			},
		});
	}

	async forgotPasswordChange(newPassword: string, key: string) {
		return RequsetPromise.post(this.url, {
			...this.options,
			body: {
				query: `
			  mutation {
				forgotPasswordChange(newPassword: "${newPassword}", key: "${key}") {
				  path
				  message
				}
			  }
			`,
			},
		});
	}
}
