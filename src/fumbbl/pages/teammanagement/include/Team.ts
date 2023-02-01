export default class Team {
    private readonly mngValue = 'm';

    private players: any[] = [];
    private rerolls: number = 0;
    private minStartDedicatedFans: number = 0;
    private dedicatedFans: number = 0;
    private assistantCoaches: number = 0;
    private cheerleaders: number = 0;
    private apothecary: boolean = false;

    constructor(minStartFans: number) {
        this.minStartDedicatedFans = minStartFans;
        this.dedicatedFans = minStartFans;
    }

    public getPlayers() {
        return this.players;
    }

    public getPlayerCount() {
        return this.players.length;
    }

    public addPlayer(player: any) {
        this.players.push(player);
    }

    public removePlayer(teamSheetEntryNumber: number) {
        const index = this.players.findIndex((player) => player.number === teamSheetEntryNumber);
        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }

    public resetDuringCreate() {
        this.players = [];
        this.rerolls = 0;
        this.dedicatedFans = this.minStartDedicatedFans;
        this.assistantCoaches = 0;
        this.cheerleaders = 0;
        this.apothecary = false;
    }

    public getRerolls() {
        return this.rerolls;
    }

    public getDedicatedFans() {
        return this.dedicatedFans;
    }

    public getAssistantCoaches() {
        return this.assistantCoaches;
    }

    public getCheerleaders() {
        return this.cheerleaders;
    }

    public getApothecary() {
        return this.apothecary;
    }

    public countPlayersOfPositionId(positionId: number) {
        return this.players.filter(player => player.positionId === positionId).length;
    }

    public getMissNextGamePlayers(): any[] {
        return this.players.filter((player) => {
            return player.injuries.split(',').includes(this.mngValue);
        });
    }

    public countMissNextGamePlayers(): number {
        return this.getMissNextGamePlayers().length;
    }

    public countPlayersAvailableNextGame(): number {
        return this.players.length - this.countMissNextGamePlayers();
    }

    public addReroll() {
        this.rerolls++;
    }

    public removeReroll() {
        this.rerolls--;
    }

    public addDedicatedFans() {
        this.dedicatedFans++;
    }

    public removeDedicatedFans() {
        this.dedicatedFans--;
    }

    public addAssistantCoach() {
        this.assistantCoaches++;
    }

    public removeAssistantCoach() {
        this.assistantCoaches--;
    }

    public addCheerleader() {
        this.cheerleaders++;
    }

    public removeCheerleader() {
        this.cheerleaders--;
    }

    public addApothecary() {
        this.apothecary = true;
    }

    public removeApothecary() {
        this.apothecary = false;
    }
}