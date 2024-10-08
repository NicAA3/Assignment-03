import { APIRequestContext } from "@playwright/test";


export class APIHelper {
    private BASE_URL: string;
    private TEST_USERNAME: string;
    private token: string

    constructor(baseUrl: string, username: string, password: string) {
        this.BASE_URL = baseUrl;
        this.TEST_USERNAME = username;
    }
    public setToken(token: string) {
        this.token = token;
    }


    async postNewRoom(request: APIRequestContext, payload: object) {
        const authPayload = JSON.stringify({
            username: `${process.env.TEST_USERNAME}`,
            token: this.token
        });
        const response = await request.post(`http://localhost:3000/api/room/new`, {
            headers: {
                'x-user-auth': authPayload,  // Send authPayload as JSON string
                'Content-Type': 'application/json',  // Specify content type
            },
            data: payload
        });
        return response;
    }
}