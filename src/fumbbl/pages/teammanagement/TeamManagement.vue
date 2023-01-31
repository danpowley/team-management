<template>
    <div class="teammanagement">
        <demosetup v-if="mode === 'DEMO_SETUP'"
            @ruleset-chosen="handleRulesetChosen"
        ></demosetup>

        <chooseroster v-if="mode === 'CHOOSE_ROSTER'"
            :raw-basic-rosters="rawApiRuleset.rosters"
            @roster-chosen="handleRosterChosen"
        ></chooseroster>

        <team v-if="mode === 'TEAM'"
            :team-management-settings="teamManagementSettings"
            :add-remove-permissions="addRemovePermissions"
            :team="team"
            :roster-icon-manager="rosterIconManager"
            :fold-outs="foldOuts"
            @add-player="handleAddPlayer"
            @delete-player="handleDeletePlayer"
            @drag-drop-player="handleDragDropPlayer"
            @reset-create-team="handleResetCreateTeam"
            @fold-out="handleFoldOut"
            @add-remove="handleAddRemove"
        ></team>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Axios from "axios";
import Component from "vue-class-component";
import ChooseRosterComponent from "./components/ChooseRoster.vue";
import TeamComponent from "./components/Team.vue";
import DemoSetupComponent from "./components/DemoSetup.vue";
import { AddRemovePermissions, PlayerRowFoldOutMode, Position, PositionStats, SetupTeamManagementSettings } from "./include/Interfaces";
import RosterIconManager from "./include/RosterIconManager";
import TeamManagementSettings from "./include/TeamManagementSettings";

@Component({
    components: {
        'demosetup': DemoSetupComponent,
        'chooseroster': ChooseRosterComponent,
        'team': TeamComponent,
    },
})
export default class TeamManagement extends Vue {
    public mode: 'DEMO_SETUP' | 'CHOOSE_ROSTER' | 'TEAM' = 'DEMO_SETUP';
    private rawApiRuleset: any;
    private teamManagementSettings: TeamManagementSettings;
    public team: any = null;
    private rosterIconManager: RosterIconManager | null = null;
    public foldOuts: {buy: number[], more: number[]} = {buy: [], more: []};

    async mounted() {
    }

    private get addRemovePermissions(): AddRemovePermissions {
        return this.teamManagementSettings.getAddRemovePermissions(this.team);
    }

    public async handleRulesetChosen(rulesetId: number) {
        await this.setupRawRuleset(rulesetId);
        this.mode = 'CHOOSE_ROSTER';
    }

    private async setupRawRuleset(rulesetId: number) {
        const result = await Axios.post('http://localhost:3000/api/ruleset/get/' + rulesetId);
        this.rawApiRuleset = result.data;
    }

    public async handleRosterChosen(rosterId: number) {
        const result = await Axios.post('http://localhost:3000/api/roster/get/' + rosterId);
        const rawApiRoster = result.data;

        await this.setupRosterIconManager(rawApiRoster.positions);
        this.setupTeamManagementSettings(rawApiRoster);
        this.setupNewTeam();

        this.mode = 'TEAM';
    }

    public async setupRosterIconManager(rawApiPositions: any[]) {
        const positionIconData = rawApiPositions.map((position: any) => {
            return {
                positionId: ~~position.id,
                positionIcon: ~~position.icon,
            };
        });
        const rosterIconManager = new RosterIconManager();
        await rosterIconManager.prepareIconData(positionIconData);

        this.rosterIconManager = rosterIconManager;
    }

    private setupTeamManagementSettings(rawApiRoster: any) {
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
                start: this.rawApiRuleset.options.teamSettings.startTreasury,
            },
            players: {
                start: this.rawApiRuleset.options.teamSettings.startPlayers,
                max: this.rawApiRuleset.options.teamSettings.maxPlayers,
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
                start: this.rawApiRuleset.options.teamSettings.startFans,
                minStart: this.rawApiRuleset.options.teamSettings.minStartFans,
                maxStart: this.rawApiRuleset.options.teamSettings.maxStartFans,
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

        this.teamManagementSettings = new TeamManagementSettings(setupTeamManagementSettings);
    }

    private setupNewTeam() {
        const team = {
            players: [],
            rerolls: 0,
            dedicatedFans: this.teamManagementSettings.minStartFans,
            assistantCoaches: 0,
            cheerleaders: 0,
            apothecary: false,
        };

        this.team = team;
    }

    private async createPlayer(teamSheetEntryNumber: number, positionId: number): Promise<any> {
        let position = this.teamManagementSettings.getPosition(positionId);

        const result = await Axios.post('http://localhost:3000/api/name/generate/default');
        const playerName = result.data;

        return {
            id: 'NEW--' + teamSheetEntryNumber,
            number: teamSheetEntryNumber,
            name: playerName,
            position: position.name,
            positionId: position.id,
            record: {
                completions: 0,
                touchdowns: 0,
                interceptions: 0,
                casualties: 0,
                mvps: 0,
                spp: 0,
            },
            injuries: 'x,y,z',
            skills: ['skill1', 'skill2'],
            gender: 'Female',
            iconRowVersionPosition: this.rosterIconManager.getRandomIconRowVersionPosition(position.id),
        };
    }

    public handleDragDropPlayer(dragDropData: any) {
        if (dragDropData.source.playerNumber === dragDropData.target.playerNumber) {
            return;
        }

        const emptyTarget = dragDropData.target.playerId === null;
        const movingUp = dragDropData.source.playerNumber > dragDropData.target.playerNumber;

        let sourcePlayer = null;
        for (const player of this.team.players) {
            if (player.number === dragDropData.source.playerNumber) {
                sourcePlayer = player;
            }

            if (! emptyTarget) {
                if (movingUp) {
                    if (player.number >= dragDropData.target.playerNumber && player.number < dragDropData.source.playerNumber) {
                        player.number += 1;
                    }
                } else {
                    if (player.number <= dragDropData.target.playerNumber && player.number > dragDropData.source.playerNumber) {
                        player.number -= 1;
                    }
                }
            }
        }
        sourcePlayer.number = dragDropData.target.playerNumber;
    }

    public async handleAddPlayer(teamSheetEntryNumber: number, positionId: number) {
        this.team.players.push(await this.createPlayer(teamSheetEntryNumber, positionId));
    }

    public handleDeletePlayer(teamSheetEntryNumber: number) {
        const index = this.team.players.findIndex((player) => player.number === teamSheetEntryNumber);
        if (index !== -1) {
            this.team.players.splice(index, 1);
        }
    }

    private handleResetCreateTeam() {
        this.team.players = [];
        // team class should have its own reset method
    }

    private handleFoldOut(teamSheetEntryNumber: number, playerRowFoldOutMode: PlayerRowFoldOutMode, multipleOpenMode: boolean) {
        if (playerRowFoldOutMode === 'CLOSED') {
            this.closeFoldOutForTeamSheetEntryNumber(teamSheetEntryNumber);
        } else if (! multipleOpenMode) {
            this.foldOuts.buy = [];
            this.foldOuts.more = [];
        }

        if (playerRowFoldOutMode === 'BUY') {
            if (! this.foldOuts.buy.includes(teamSheetEntryNumber)) {
                this.foldOuts.buy.push(teamSheetEntryNumber);
            }
        } else if (playerRowFoldOutMode === 'MORE') {
            if (! this.foldOuts.more.includes(teamSheetEntryNumber)) {
                this.foldOuts.more.push(teamSheetEntryNumber);
            }
        }
    }

    private closeFoldOutForTeamSheetEntryNumber(teamSheetEntryNumber: number) {
        const buyIndex = this.foldOuts.buy.findIndex((teamSheetEntryNumberToCheck) => teamSheetEntryNumberToCheck === teamSheetEntryNumber);
        if (buyIndex !== -1) {
            this.foldOuts.buy.splice(buyIndex, 1);
        }
        const moreIndex = this.foldOuts.more.findIndex((teamSheetEntryNumberToCheck) => teamSheetEntryNumberToCheck === teamSheetEntryNumber);
        if (moreIndex !== -1) {
            this.foldOuts.more.splice(moreIndex, 1);
        }
    }

    private handleAddRemove(whatToAdd: string, isAdd: boolean) {
        if (whatToAdd === 'reroll') {
            if (isAdd) {
                this.team.rerolls++;
            } else {
                this.team.rerolls--;
            }
        } else if (whatToAdd === 'dedicated-fans') {
            if (isAdd) {
                this.team.dedicatedFans++;
            } else {
                this.team.dedicatedFans--;
            }
        } else if (whatToAdd === 'cheerleader') {
            if (isAdd) {
                this.team.cheerleaders++;
            } else {
                this.team.cheerleaders--;
            }
        } else if (whatToAdd === 'assistant-coach') {
            if (isAdd) {
                this.team.assistantCoaches++;
            } else {
                this.team.assistantCoaches--;
            }
        } else if (whatToAdd === 'apothecary') {
            if (isAdd) {
                this.team.apothecary = true;
            } else {
                this.team.apothecary = false;
            }
        }
    }
}
</script>