import { AddRemovePermissions, Position, PositionDataForBuyingPlayer, PositionStats, SetupTeamManagementSettings } from "./Interfaces";
import Team from "./Team";

export default class TeamManagementSettings {
    private settings: SetupTeamManagementSettings;

    constructor(rawApiRuleset: any, rawApiRoster: any) {
        const dedicatedFansCost = 10000;
        const assistantCoachesCost = 10000;
        const cheerleadersCost = 10000;
        const apothecaryCost = 50000;

        const maxRerolls = 8;
        const maxAssistantCoaches = 6;
        const maxCheerleaders = 12;

        const setupTeamManagementSettings: SetupTeamManagementSettings = {
            roster: {
                name: rawApiRoster.name,
            },
            treasury: {
                start: rawApiRuleset.options.teamSettings.startTreasury,
            },
            players: {
                start: rawApiRuleset.options.teamSettings.startPlayers,
                max: rawApiRuleset.options.teamSettings.maxPlayers,
                positions: rawApiRoster.positions.map((position: any) => {
                    return {
                        id: ~~position.id,
                        name: position.title,
                        cost: ~~position.cost,
                        skills: position.skills,
                        stats: {
                            Movement: ~~position.stats.MA,
                            Strength: ~~position.stats.ST,
                            Agility: ~~position.stats.AG,
                            Passing: position.stats.PA !== '0' ? ~~position.stats.PA : null,
                            Armour: ~~position.stats.AV,
                        } as PositionStats,
                        quantityAllowed: ~~position.quantity,
                    } as Position;
                }),
            },
            dedicatedFans: {
                start: rawApiRuleset.options.teamSettings.startFans,
                minStart: rawApiRuleset.options.teamSettings.minStartFans,
                maxStart: rawApiRuleset.options.teamSettings.maxStartFans,
                cost: dedicatedFansCost,
            },
            rerolls: {
                max: maxRerolls,
                cost: ~~rawApiRoster.rerollCost,
            },
            sidelineStaff: {
                assistantCoaches: {
                    max: maxAssistantCoaches,
                    cost: assistantCoachesCost,
                },
                cheerleaders: {
                    max: maxCheerleaders,
                    cost: cheerleadersCost,
                },
                apothecary: {
                    allowed: rawApiRoster.apothecary === 'Yes',
                    cost: apothecaryCost,
                },
            }
        };

        // https://fumbbl.com/api/ruleset/get/4
        // data.options.teamSettings.teamProgression
        // data.options.teamSettings.skillProgressionType
        // data.options.teamSettings.sppLimits": "6,16,31,51,76,176"
        // data.options.teamSettings.predeterminedSkills": "0:6N2D8S|0:3N|0:2N2D|0:3N3D|0:6N2D"
        // data.options.teamSettings.skillsPerPlayer

        this.settings = setupTeamManagementSettings;
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

    public getErrorsForCreate(team: Team): string[] {
        const errors: string[] = [];
        if (team.getName().trim() === '') {
            errors.push('teamNameBlank');
        }

        if (team.getPlayerCount() < this.startPlayers) {
            errors.push('insufficentPlayers');
        }

        const teamCost = this.calculateTeamCost(team);
        if (teamCost > this.startTreasury) {
            errors.push('insufficientTreasury');
        }

        return errors;
    }

    public isValidForCreate(team: Team): boolean {
        return this.getErrorsForCreate(team).length === 0;
    }
}