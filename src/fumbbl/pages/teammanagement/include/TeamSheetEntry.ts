export default class TeamSheetEntry {
    private entryNumber: number;
    private entryPlayer: any;

    constructor(entryNumber: number, entryPlayer: any) {
        this.entryNumber = entryNumber;
        this.entryPlayer = entryPlayer;
    }

    public getNumber(): number {
        return this.entryNumber;
    }

    public getPlayer(): any {
        return this.entryPlayer;
    }

    public hasPlayer(): any {
        return this.entryPlayer !== null;
    }
}