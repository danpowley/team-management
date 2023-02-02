<template>
    <div class="teammanagement">
        <demosetup v-if="overallApplicationMode === 'DEMO_SETUP'"
            @ruleset-chosen="handleRulesetChosen"
        ></demosetup>

        <chooseroster v-if="overallApplicationMode === 'CHOOSE_ROSTER'"
            :raw-basic-rosters="rawApiRuleset.rosters"
            @roster-chosen="handleRosterChosen"
        ></chooseroster>

        <team v-if="overallApplicationMode === 'TEAM'"
            :team-management-settings="teamManagementSettings"
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
import { PlayerRowFoldOutMode } from "./include/Interfaces";
import RosterIconManager from "./include/RosterIconManager";
import TeamManagementSettings from "./include/TeamManagementSettings";
import Team from "./include/Team";
import Player from "./include/Player";

@Component({
    components: {
        'demosetup': DemoSetupComponent,
        'chooseroster': ChooseRosterComponent,
        'team': TeamComponent,
    },
})
export default class TeamManagement extends Vue {
    public overallApplicationMode: 'DEMO_SETUP' | 'CHOOSE_ROSTER' | 'TEAM' = 'DEMO_SETUP';
    private rawApiRuleset: any;
    private teamManagementSettings: TeamManagementSettings;
    public team: Team | null = null;
    private rosterIconManager: RosterIconManager | null = null;
    public foldOuts: {buy: number[], more: number[]} = {buy: [], more: []};

    async mounted() {
    }

    public async handleRulesetChosen(rulesetId: number) {
        const result = await Axios.post('http://localhost:3000/api/ruleset/get/' + rulesetId);
        this.rawApiRuleset = result.data;
        this.overallApplicationMode = 'CHOOSE_ROSTER';
    }

    public async handleRosterChosen(rosterId: number) {
        const result = await Axios.post('http://localhost:3000/api/roster/get/' + rosterId);
        const rawApiRoster = result.data;

        await this.setupRosterIconManager(rawApiRoster.positions);
        this.teamManagementSettings = new TeamManagementSettings(this.rawApiRuleset, rawApiRoster);
        this.team = new Team(this.teamManagementSettings.minStartFans);

        this.overallApplicationMode = 'TEAM';
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

    private async generatePlayerName(): Promise<string> {
        const result = await Axios.post('http://localhost:3000/api/name/generate/default');
        const playerName = result.data;
        return playerName;
    }

    public handleDragDropPlayer(dragDropData: any) {
        if (dragDropData.source.playerNumber === dragDropData.target.playerNumber) {
            return;
        }

        const emptyTarget = dragDropData.target.playerId === null;
        const movingUp = dragDropData.source.playerNumber > dragDropData.target.playerNumber;

        let sourcePlayer = null;
        for (const player of this.team.getPlayers()) {
            if (player.getPlayerNumber() === dragDropData.source.playerNumber) {
                sourcePlayer = player;
            }

            if (! emptyTarget) {
                if (movingUp) {
                    if (player.getPlayerNumber() >= dragDropData.target.playerNumber && player.getPlayerNumber() < dragDropData.source.playerNumber) {
                        player.increasePlayerNumber();
                    }
                } else {
                    if (player.getPlayerNumber() <= dragDropData.target.playerNumber && player.getPlayerNumber() > dragDropData.source.playerNumber) {
                        player.decreasePlayerNumber();
                    }
                }
            }
        }
        sourcePlayer.setPlayerNumber(dragDropData.target.playerNumber);
    }

    public async handleAddPlayer(teamSheetEntryNumber: number, positionId: number) {
        const newPlayer = new Player(
            'NEW--' + teamSheetEntryNumber,
            teamSheetEntryNumber,
            await this.generatePlayerName(),
            this.teamManagementSettings.getPosition(positionId),
            this.rosterIconManager.getRandomIconRowVersionPosition(positionId),
        );
        this.team.addPlayer(newPlayer);
    }

    public handleDeletePlayer(teamSheetEntryNumber: number) {
        this.team.removePlayer(teamSheetEntryNumber);
    }

    private handleResetCreateTeam() {
        this.team.resetDuringCreate();
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
                this.team.addReroll();
            } else {
                this.team.removeReroll();
            }
        } else if (whatToAdd === 'dedicated-fans') {
            if (isAdd) {
                this.team.addDedicatedFans();
            } else {
                this.team.removeDedicatedFans;
            }
        } else if (whatToAdd === 'cheerleader') {
            if (isAdd) {
                this.team.addCheerleader();
            } else {
                this.team.addCheerleader();
            }
        } else if (whatToAdd === 'assistant-coach') {
            if (isAdd) {
                this.team.addAssistantCoach();
            } else {
                this.team.removeAssistantCoach();
            }
        } else if (whatToAdd === 'apothecary') {
            if (isAdd) {
                this.team.addApothecary();
            } else {
                this.team.removeApothecary();
            }
        }
    }
}
</script>