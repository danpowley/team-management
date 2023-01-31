import TeamSheetEntry from "./TeamSheetEntry";

export default class TeamSheet {
    private teamSheetEntries: TeamSheetEntry[] = [];

    constructor(maxPlayers: number, players: any[]) {
        for (let step = 1; step <= maxPlayers; step++) {
            let entryPlayer = null;
            for (const player of players) {
                if (player.number === step) {
                    entryPlayer = player;
                    break;
                }
            }
            this.teamSheetEntries.push(new TeamSheetEntry(step, entryPlayer));
        }
    }

    public getEntries(): TeamSheetEntry[] {
        return this.teamSheetEntries;
    }

    public getEntryNumbersWithPlayerBelow(): number[] {
        const entryNumbersWithPlayerBelow: number[] = [];
        for (const teamSheetEntry of this.teamSheetEntries) {
            if (teamSheetEntry.getNumber() !== this.teamSheetEntries.length) {
                for (const teamSheetEntryInner of this.teamSheetEntries) {
                    if (teamSheetEntryInner.getNumber() === teamSheetEntry.getNumber() + 1) {
                        if (teamSheetEntryInner.getPlayer() !== null) {
                            entryNumbersWithPlayerBelow.push(teamSheetEntry.getNumber());
                        }
                    }
                }
            }
        }
        return entryNumbersWithPlayerBelow;
    }
}