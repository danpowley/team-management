import Player from "./Player";

export default class TeamSheetEntry {
    private entryNumber: number;
    private entryPlayer: Player | null;

    constructor(entryNumber: number, entryPlayer: Player | null) {
        this.entryNumber = entryNumber;
        this.entryPlayer = entryPlayer;
    }

    public getNumber(): number {
        return this.entryNumber;
    }

    public getPlayer(): Player | null {
        return this.entryPlayer;
    }

    public hasPlayer(): any {
        return this.entryPlayer !== null;
    }
}