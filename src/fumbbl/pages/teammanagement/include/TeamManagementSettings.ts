import { AddRemovePermissions, Position, PositionDataForBuyingPlayer, SetupTeamManagementSettings } from "./Interfaces";
import Team from "./Team";

export default class TeamManagementSettings {
    private settings: SetupTeamManagementSettings;

    constructor(settings: SetupTeamManagementSettings) {
        this.settings = settings;
    }

    public get rosterName() {
        return this.settings.roster.name;
    }

    public get maxPlayers() {
        return this.settings.players.max;
    }

    public get startPlayers() {
        return this.settings.players.start;
    }

    public get startTreasury() {
        return this.settings.treasury.start;
    }

    public get minStartFans() {
        return this.settings.dedicatedFans.minStart;
    }

    public get rerollCostOnCreate(): number {
        return this.settings.rerolls.cost;
    }

    public get rerollCostFull(): number {
        return this.settings.rerolls.cost * 2;
    }

    public get apothecaryAllowed(): boolean {
        return this.settings.sidelineStaff.apothecary.allowed;
    }

    public get positions(): Position[] {
        return this.settings.players.positions;
    }

    public getPosition(positionId: number): Position {
        for (const position of this.settings.players.positions) {
            if (position.id === positionId) {
                return position;
            }
        }
        throw Error(`Position not found ${positionId}`);
    }

    public calculateTeamCost(team: Team): number {
        const positionCostsLookup = this.getPositionCostsLookup();
        let playerCost = 0;
        for (const player of team.getPlayers()) {
            playerCost += positionCostsLookup[player.getPositionId()];
        }

        return playerCost +
            (team.getRerolls() * this.settings.rerolls.cost) +
            (team.getAssistantCoaches() * this.settings.sidelineStaff.assistantCoaches.cost) +
            (team.getCheerleaders() * this.settings.sidelineStaff.cheerleaders.cost) +
            (team.getApothecary() && this.settings.sidelineStaff.apothecary ? this.settings.sidelineStaff.apothecary.cost : 0) +
            ((team.getDedicatedFans() - this.settings.dedicatedFans.minStart) * this.settings.dedicatedFans.cost);
    }

    private getPositionCostsLookup(): any {
        const positionCostsLookup = {};
        for (const position of this.settings.players.positions) {
            positionCostsLookup[position.id] = position.cost;
        }
        return positionCostsLookup;
    }

    public getRemainingBudget(teamCost: number): number {
        return this.settings.treasury.start - teamCost;
    }

    public getAddRemovePermissions(team: any): AddRemovePermissions {
        return {
            rerolls: {
                add: team.rerolls < this.settings.rerolls.max,
                remove: team.rerolls > 0,
            },
            dedicatedFans: {
                add: team.dedicatedFans < this.settings.dedicatedFans.maxStart,
                remove: team.dedicatedFans > this.settings.dedicatedFans.minStart,
            },
            assistantCoaches: {
                add: team.assistantCoaches < this.settings.sidelineStaff.assistantCoaches.max,
                remove: team.assistantCoaches > 0,
            },
            cheerleaders: {
                add: team.cheerleaders < this.settings.sidelineStaff.cheerleaders.max,
                remove: team.cheerleaders > 0,
            },
            apothecary: {
                add: this.settings.sidelineStaff.apothecary.allowed && team.apothecary === false,
                remove: this.settings.sidelineStaff.apothecary.allowed && team.apothecary === true,
            },
        }
    }

    public getRosterPositionDataForBuyingPlayer(
        availableTreasury: number,
        positionQuantities: {positionId: number, quantity: number}[]
    ): PositionDataForBuyingPlayer[] {
        const rosterPositionDataForBuyingPlayer: PositionDataForBuyingPlayer[] = [];
        for (const position of this.positions.filter(position => position.quantityAllowed > 0)) {
            let quantityHired = 0;
            for (const positionQuantityData of positionQuantities) {
                if (positionQuantityData.positionId === position.id) {
                    quantityHired = positionQuantityData.quantity;
                    break;
                }
            }

            rosterPositionDataForBuyingPlayer.push({
                positionId: position.id,
                quantityHired: quantityHired,
                canAfford: position.cost < availableTreasury,
                position: position,
            } as PositionDataForBuyingPlayer);
        }

        rosterPositionDataForBuyingPlayer.sort((a, b) => {
            const postitionACost = a.position.cost;
            const postitionBCost = b.position.cost;
            if (postitionACost === postitionBCost) {
                return 0;
            }
            return postitionACost > postitionBCost ? -1 : 1;
        });

        return rosterPositionDataForBuyingPlayer;
    }
}