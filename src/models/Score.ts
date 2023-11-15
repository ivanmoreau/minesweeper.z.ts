
export class Score {
    public user_id: number;
    public score: number;
    public time: number;
    public size: number;
    public difficulty: number;

    constructor(user_id: number, score: number, time: number, size: number, difficulty: number) {
        this.user_id = user_id;
        this.score = score;
        this.time = time;
        this.size = size;
        this.difficulty = difficulty;
    }
}