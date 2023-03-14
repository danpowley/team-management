import Player from "./Player";
import RosterIconManager from "./RosterIconManager";
import TeamManagementSettings from "./TeamManagementSettings";
import TeamStatus from "./TeamStatus";

export default class Team {
    private teamStatus: TeamStatus = new TeamStatus();
    private name: string = '';
    private division: string = '';
    private players: Player[] = [];
    private treasury: number = 0;
    private rerolls: number = 0;
    private minStartDedicatedFans: number = 0;
    private dedicatedFans: number = 0;
    private assistantCoaches: number = 0;
    private cheerleaders: number = 0;
    private apothecary: boolean = false;

    constructor(division: string, minStartFans: number, treasury: number) {
        this.division = division;
        this.name = 'New demo team name';
        this.minStartDedicatedFans = minStartFans;
        this.dedicatedFans = minStartFans;
        this.treasury = treasury;
    }

    static fromApi(
        rawApiTeam: any,
        minStartDedicatedFans: number,
        teamManagementSettings: TeamManagementSettings,
        rosterIconManager: RosterIconManager,
    ): Team {
        const team = new Team(rawApiTeam.division, minStartDedicatedFans, rawApiTeam.treasury);
        team.teamStatus = new TeamStatus(rawApiTeam.status);
        team.name = rawApiTeam.name;
        team.rerolls = rawApiTeam.rerolls;
        team.dedicatedFans = rawApiTeam.fanFactor;
        team.assistantCoaches = rawApiTeam.assistantCoaches;
        team.cheerleaders = rawApiTeam.cheerleaders;
        team.apothecary = rawApiTeam.apothecary === 'Yes';

        for (const rawApiPlayer of rawApiTeam.players) {
            team.addPlayer(
                Player.fromApi(
                    rawApiPlayer,
                    teamManagementSettings.getPosition(rawApiPlayer.positionId),
                    rosterIconManager.getRandomIconRowVersionPosition(rawApiPlayer.positionId),
                )
            );
        }

        return team;
    }

    public getDivision(): string {
        return this.division;
    }

    public getDivisionAbbreviated(): string {
        return this.division.charAt(0);
    }

    public getTeamStatus(): TeamStatus {
        return this.teamStatus;
    }

    public getName(): string {
        return this.name;
    }

    public setName(teamName: string): void {
        this.name = teamName;
    }

    public getTreasury(): number {
        return this.treasury;
    }

    public getPlayers(): Player[] {
        return this.players;
    }

    public getPlayerCount(): number {
        return this.players.length;
    }

    public addPlayer(player: Player): void {
        this.players.push(player);
    }

    public buyPlayer(player: Player): void {
        this.addPlayer(player);
        this.treasury -= player.getPositionCost();
    }

    public findPlayerByNumber(playerNumber: number): Player | null {
        const player = this.players.find(player => player.getPlayerNumber() === playerNumber);
        return player ? player : null;
    }

    public removePlayer(teamSheetEntryNumber: number): void {
        const index = this.players.findIndex((player) => player.getPlayerNumber() === teamSheetEntryNumber);
        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }

    public getRerolls(): number {
        return this.rerolls;
    }

    public getDedicatedFans(): number {
        return this.dedicatedFans;
    }

    public getAssistantCoaches(): number {
        return this.assistantCoaches;
    }

    public getCheerleaders(): number {
        return this.cheerleaders;
    }

    public getApothecary(): boolean {
        return this.apothecary;
    }

    public countPlayersOfPositionId(positionId: number): number {
        return this.players.filter(player => player.getPositionId() === positionId).length;
    }

    public getMissNextGamePlayers(): Player[] {
        return this.players.filter((player) => {
            return player.isMissNextGame();
        });
    }

    public countMissNextGamePlayers(): number {
        return this.getMissNextGamePlayers().length;
    }

    public countPlayersAvailableNextGame(): number {
        return this.players.length - this.countMissNextGamePlayers();
    }

    public addReroll(cost: number): void {
        this.rerolls++;
        this.treasury -= cost;
    }

    public removeReroll(): void {
        this.rerolls--;
    }

    public addDedicatedFans(cost: number): void {
        this.dedicatedFans++;
        this.treasury -= cost;
    }

    public removeDedicatedFans(): void {
        this.dedicatedFans--;
    }

    public addAssistantCoach(cost: number): void {
        this.assistantCoaches++;
        this.treasury -= cost;
    }

    public removeAssistantCoach(): void {
        this.assistantCoaches--;
    }

    public addCheerleader(cost: number): void {
        this.cheerleaders++;
        this.treasury -= cost;
    }

    public removeCheerleader(): void {
        this.cheerleaders--;
    }

    public addApothecary(cost: number): void {
        this.apothecary = true;
        this.treasury -= cost;
    }

    public removeApothecary(): void {
        this.apothecary = false;
    }

    public movePlayer(sourcePlayerNumber: number, targetPlayerNumber: number, emptyTarget: boolean) {
        if (sourcePlayerNumber === targetPlayerNumber) {
            return;
        }

        const movingUp = sourcePlayerNumber > targetPlayerNumber;

        let sourcePlayer = null;
        for (const player of this.getPlayers()) {
            if (player.getPlayerNumber() === sourcePlayerNumber) {
                sourcePlayer = player;
            }

            if (! emptyTarget) {
                if (movingUp) {
                    if (player.getPlayerNumber() >= targetPlayerNumber && player.getPlayerNumber() < sourcePlayerNumber) {
                        player.increasePlayerNumber();
                    }
                } else {
                    if (player.getPlayerNumber() <= targetPlayerNumber && player.getPlayerNumber() > sourcePlayerNumber) {
                        player.decreasePlayerNumber();
                    }
                }
            }
        }
        sourcePlayer.setPlayerNumber(targetPlayerNumber);
    }
}