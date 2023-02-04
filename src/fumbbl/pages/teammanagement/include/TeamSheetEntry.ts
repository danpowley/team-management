import { PlayerRowFoldOutMode } from "./Interfaces";
import Player from "./Player";

export default class TeamSheetEntry {
    private entryNumber: number;
    private entryPlayer: Player | null;
    private isDragSource: boolean = false;
    private isDropTarget: boolean = false;
    private foldOut: PlayerRowFoldOutMode = 'CLOSED';

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

    public isFirst(): boolean {
        return this.entryNumber === 1;
    }

    public getIsDragSource(): boolean {
        return this.isDragSource;
    }

    public setIsDragSource(isDragSource: boolean): void {
        this.isDragSource = isDragSource;
    }

    public getIsDropTarget(): boolean {
        return this.isDropTarget;
    }

    public setIsDropTarget(isDropTarget: boolean): void {
        this.isDropTarget = isDropTarget;
    }

    public getFoldOut(): PlayerRowFoldOutMode {
        return this.foldOut;
    }

    public setFoldOut(foldOutValue: PlayerRowFoldOutMode): void {
        this.foldOut = foldOutValue;
    }
}