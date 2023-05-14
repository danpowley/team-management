import { PlayerGender, Position } from "./Interfaces";
import UpdatePlayerDetails from "./UpdatePlayerDetails";

export default class Player {
    private static readonly temporaryPlayerId = 0;
    private static readonly temporaryPlayerName = 'Temporary Player';
    static missNextGameInjury = 'm';

    private id: number;
    private playerNumber: number;
    private playerName: string;
    private gender: PlayerGender = 'NEUTRAL';
    private iconRowVersionPosition: number; // allows selection of icon for display when position has multiple versions in the icon image
    private position: Position;
    private injuries: string[] = []; // Type?
    private skills: string[] = [];
    private record: any = null;

    constructor(
        id: number,
        playerNumber: number,
        playerName: string,
        position: Position,
        iconRowVersionPosition: number,
        gender: PlayerGender,
    ) {
        this.id = id;
        this.playerNumber = playerNumber;
        this.playerName = playerName;
        this.position = position;
        this.iconRowVersionPosition = iconRowVersionPosition;
        this.gender = gender;

        this.injuries = [];
        this.skills = [];

        this.record = {
            completions: 0,
            touchdowns: 0,
            interceptions: 0,
            casualties: 0,
            mvps: 0,
            spp: 0,
        };
    }

    static fromApi(rawApiPlayer: any, position: Position, iconRowVersionPosition: number): Player {
        const player = new Player(
            rawApiPlayer.id,
            rawApiPlayer.number,
            rawApiPlayer.name,
            position,
            iconRowVersionPosition,
            rawApiPlayer.gender.toUpperCase(),
        );
        player.injuries = rawApiPlayer.injuries.split(',');
        player.skills = rawApiPlayer.skills;
        return player;
    }

    static temporaryPlayer(teamSheetEntryNumber: number, position: Position, iconRowVersionPosition: number, playerGender: PlayerGender): Player {
        return new Player(Player.temporaryPlayerId, teamSheetEntryNumber, Player.temporaryPlayerName, position, iconRowVersionPosition, playerGender);
    }

    public getId(): number {
        return this.id;
    }

    public setIdForTemporaryPlayer(playerId: number) {
        if (this.isTemporaryPlayer()) {
            this.id = playerId;
        }
    }

    public getPlayerNumber(): number {
        return this.playerNumber;
    }

    public setPlayerNumber(playerNumber: number): void {
        this.playerNumber = playerNumber;
    }

    public getPlayerName(): string {
        return this.playerName;
    }

    public setPlayerName(playerName: string) {
        this.playerName = playerName;
    }

    public getPosition(): Position {
        return this.position;
    }

    public getGender(): PlayerGender {
        return this.gender;
    }

    public getPositionId(): number {
        return this.position.id;
    }

    public getPositionName(): string {
        return this.position.name;
    }

    public getPositionCost(): number {
        return this.position.cost;
    }

    public getPositionStats(): any {
        return this.position.stats;
    }

    public getPositionSkills(): string[] {
        return this.position.skills;
    }

    public getIconRowVersionPosition(): number {
        return this.iconRowVersionPosition;
    }

    public getInjuries(): string[] {
        return this.injuries;
    }

    public getSkills(): string[] {
        return this.skills;
    }

    public getRecord(): any {
        return this.record;
    }

    public isMissNextGame(): boolean {
        return this.injuries.includes(Player.missNextGameInjury);
    }

    public isTemporaryPlayer(): boolean {
        return this.getId() === Player.temporaryPlayerId;
    }

    public isTemporaryPlayerWithoutName(): boolean {
        return this.isTemporaryPlayer() && this.getPlayerName() === Player.temporaryPlayerName;
    }

    public increasePlayerNumber() {
        this.playerNumber += 1;
    }

    public decreasePlayerNumber() {
        this.playerNumber -= 1;
    }

    public updatePlayerDetails(updatePlayerDetails: UpdatePlayerDetails) {
        this.playerName = updatePlayerDetails.getPlayerName();
        this.gender = updatePlayerDetails.getGender();
    }
}