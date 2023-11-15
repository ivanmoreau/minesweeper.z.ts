import type { Score } from "./models/Score";
import type { User } from "./models/User";

export class GameServiceClient {
    private apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    async createUser(name: string): Promise<User> {
        const response = await this.postApiRequest({ action: 'createUser', name });
        return response as User;
    }

    async updateScore(name: string, time: number, size: number, difficulty: number): Promise<void> {
        await this.postApiRequest({ action: 'updateScore', name, time, size, difficulty });
    }

    async getBestScores(): Promise<Score[]> {
        const response = await this.postApiRequest({ action: 'getBestScores' });
        return response as Score[];
    }

    async getUserName(id: number): Promise<string> {
        const response = await this.postApiRequest({ action: 'getUserName', id });
        return response as string;
    }

    private async postApiRequest(data: any): Promise<any> {
        try {
            console.log('Making API request:', JSON.stringify(data));
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error making API request:', error);
            throw error;
        }
    }
}
