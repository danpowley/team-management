import { PlayerRowFoldOutMode } from "./Interfaces";
import Player from "./Player";
import TeamSheetEntry from "./TeamSheetEntry";

export default class TeamSheet {
    private teamSheetEntries: TeamSheetEntry[] = [];

    constructor(maxPlayers: number, players: Player[]) {
        for (let step = 1; step <= maxPlayers; step++) {
            let entryPlayer = null;
            for (const player of players) {
                if (player.getPlayerNumber() === step) {
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

    private findTeamSheetEntry(teamSheetEntryNumber: number): TeamSheetEntry {
        return this.teamSheetEntries.find(teamSheetEntry => teamSheetEntry.getNumber() === teamSheetEntryNumber);
    }

    public setDragSource(teamSheetEntryNumber: number): void {
        this.teamSheetEntries.forEach(teamSheetEntry => teamSheetEntry.setIsDragSource(false));
        const teamSheetEntry = this.findTeamSheetEntry(teamSheetEntryNumber);
        teamSheetEntry.setIsDragSource(true);
    }

    public setDropTarget(teamSheetEntryNumber: number): void {
        this.teamSheetEntries.forEach(teamSheetEntry => teamSheetEntry.setIsDropTarget(false));
        const teamSheetEntry = this.findTeamSheetEntry(teamSheetEntryNumber);
        teamSheetEntry.setIsDropTarget(true);
    }

    public clearDragDrop(): void {
        this.teamSheetEntries.forEach(teamSheetEntry => {
            teamSheetEntry.setIsDragSource(false);
            teamSheetEntry.setIsDropTarget(false);
        });
    }

    public clearAllDropTargets(): void {
        this.teamSheetEntries.forEach(teamSheetEntry => {
            teamSheetEntry.setIsDropTarget(false);
        });
    }

    public isDragSource(teamSheetEntryNumber: number): boolean {
        const teamSheetEntry = this.findTeamSheetEntry(teamSheetEntryNumber);
        return teamSheetEntry.getIsDragSource();
    }

    public getDragSourcePlayerNumber(): number | null {
        const teamSheetEntry = this.teamSheetEntries.find(teamSheetEntry => teamSheetEntry.getIsDragSource());
        return teamSheetEntry ? teamSheetEntry.getNumber() : null;
    }

    public getDropTargetPlayerNumber(): number | null {
        const teamSheetEntry = this.teamSheetEntries.find(teamSheetEntry => teamSheetEntry.getIsDropTarget());
        return teamSheetEntry ? teamSheetEntry.getNumber() : null;
    }

    public useActiveSeperatorForDragDrop(teamSheetEntry: TeamSheetEntry): boolean {
        const dragSourcePlayerNumber = this.getDragSourcePlayerNumber();
        const dropTargetPlayerNumber = this.getDropTargetPlayerNumber();

        let dragDirection: 'UP' | 'DOWN' | null = null;
        const isMovingUpOrDown =
            dropTargetPlayerNumber !== null
            && dragSourcePlayerNumber !== null
            && dropTargetPlayerNumber !== dragSourcePlayerNumber;

        if (isMovingUpOrDown) {
            dragDirection = dropTargetPlayerNumber > dragSourcePlayerNumber ? 'DOWN' : 'UP';
        }

        if (
            dragDirection === 'DOWN' &&
            dropTargetPlayerNumber === teamSheetEntry.getNumber() &&
            teamSheetEntry.getPlayer() !== null
        ) {
            return true;
        }

        const isAboveDropTarget = dropTargetPlayerNumber !== null && dropTargetPlayerNumber - 1 === teamSheetEntry.getNumber();
        if (
            dragDirection === 'UP' &&
            isAboveDropTarget &&
            this.getEntryNumbersWithPlayerBelow().includes(teamSheetEntry.getNumber())
        ) {
            return true;
        }

        return false;
    }

    public allFoldOutsClosed() {
        const firstWithFoldOut = this.teamSheetEntries.find(teamSheetEntry => teamSheetEntry.getFoldOut() !== 'CLOSED');
        return firstWithFoldOut === undefined;
    }

    public updateFoldOut(teamSheetEntryNumber: number, playerRowFoldOutMode: PlayerRowFoldOutMode, multipleOpenMode: boolean) {
        if (playerRowFoldOutMode !== 'CLOSED' && ! multipleOpenMode) {
            this.teamSheetEntries.forEach(teamSheetEntry => {
                teamSheetEntry.setFoldOut('CLOSED');
            });
        }

        const teamSheetEntry = this.findTeamSheetEntry(teamSheetEntryNumber);
        teamSheetEntry.setFoldOut(playerRowFoldOutMode);
    }
}