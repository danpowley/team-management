import { PlayerGender } from "./Interfaces";

export default class UpdatePlayerDetails {
    private playerName: string = '';
    private gender: PlayerGender | null = null;

    constructor(playerName: string, gender: PlayerGender) {
        this.playerName = playerName;
        this.gender = gender;
    }

    public getPlayerName(): string {
        return this.playerName;
    }

    public getGender(): PlayerGender | null {
        return this.gender;
    }

    public getErrors(): string[] {
        const errors = [];
        if (this.playerName.trim().length === 0) {
            errors.push('empty_name');
        }
        if (typeof this.gender !== 'string' || this.gender.length === 0) {
            errors.push('empty_gender');
        }
        return errors;
    }
}