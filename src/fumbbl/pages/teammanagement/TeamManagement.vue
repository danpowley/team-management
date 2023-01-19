<template>
    <div class="teammanagement">
        <demosetup v-if="mode === 'DEMO_SETUP'"
            @ruleset-chosen="handleRulesetChosen"
        ></demosetup>

        <chooseroster v-if="mode === 'CHOOSE_ROSTER'"
            :raw-basic-rosters="basicRostersForRuleset"
            @roster-chosen="handleRosterChosen"
        ></chooseroster>

        <team v-if="mode === 'TEAM'"
            :team="team"
            :positions-icon-data="positionsIconData"
            :fold-outs="foldOuts"
            @add-player="handleAddPlayer"
            @delete-player="handleDeletePlayer"
            @drag-drop-player="handleDragDropPlayer"
            @reset-create-team="handleResetCreateTeam"
            @fold-out="handleFoldOut"
            @add-reroll="handleAddReroll"
            @remove-reroll="handleRemoveReroll"
            @add-dedicated-fans="handleAddDedicatedFans"
            @remove-dedicated-fans="handleRemoveDedicatedFans"
            @add-assistant-coaches="handleAddAssistantCoaches"
            @remove-assistant-coaches="handleRemoveAssistantCoaches"
            @add-cheerleaders="handleAddCheerleaders"
            @remove-cheerleaders="handleRemoveCheerleaders"
            @add-apothecary="handleAddApothecary"
            @remove-apothecary="handleRemoveApothecary"
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

@Component({
    components: {
        'demosetup': DemoSetupComponent,
        'chooseroster': ChooseRosterComponent,
        'team': TeamComponent,
    },
})
export default class TeamManagement extends Vue {
    public mode: 'DEMO_SETUP' | 'CHOOSE_ROSTER' | 'TEAM' = 'DEMO_SETUP';
    private basicRostersForRuleset: any[] = [];
    public newTeamRuleset: any | null = null;
    public team: any = null;
    public positionsIconData: any = null;
    public foldOuts: {buy: number[], more: number[]} = {buy: [], more: []};

    readonly maxRerolls = 8;
    readonly maxAssistantCoaches = 6;
    readonly maxCheerleaders = 12;

    async mounted() {
    }

    public async handleRulesetChosen(rulesetId: number) {
        await this.setupRulesetAndBasicRostersForRuleset(rulesetId);
        this.mode = 'CHOOSE_ROSTER';
    }

    private async setupRulesetAndBasicRostersForRuleset(rulesetId: number) {
        const result = await Axios.post('http://localhost:3000/api/ruleset/get/' + rulesetId);

        this.basicRostersForRuleset = result.data.rosters;

        this.newTeamRuleset =  {
            id: result.data.id,
            name: result.data.name,
            startTreasury: result.data.options.teamSettings.startTreasury,
            startPlayers: result.data.options.teamSettings.startPlayers,
            maxPlayers: result.data.options.teamSettings.maxPlayers,
            startFans: result.data.options.teamSettings.startFans,
            minStartFans: result.data.options.teamSettings.minStartFans,
            maxStartFans: result.data.options.teamSettings.maxStartFans,
            maxRerolls: this.maxRerolls,
            maxAssistantCoaches: this.maxAssistantCoaches,
            maxCheerleaders: this.maxCheerleaders,
        };

        // https://fumbbl.com/api/ruleset/get/4
        // data.options.teamSettings.teamProgression
        // data.options.teamSettings.skillProgressionType
        // data.options.teamSettings.sppLimits": "6,16,31,51,76,176"
        // data.options.teamSettings.predeterminedSkills": "0:6N2D8S|0:3N|0:2N2D|0:3N3D|0:6N2D"
        // data.options.teamSettings.skillsPerPlayer
    }

    public async handleRosterChosen(rosterId: number) {
        const roster = await this.getRoster(rosterId);

        const positionsLookup = {};
        for (const position of roster.positions) {
            positionsLookup[position.id] = position;
        }

        const team = {
            players: [],
            rerolls: 0,
            dedicatedFans: this.newTeamRuleset.minStartFans,
            assistantCoaches: 0,
            cheerleaders: 0,
            apothecary: false,
            ruleset: this.newTeamRuleset,
            roster: roster,
            positionsLookup: positionsLookup,
        };

        this.team = team;

        await this.refreshPositionIconData();

        this.mode = 'TEAM';
    }

    public async refreshPositionIconData() {
        const positionsIconData = {};
        for (const position of this.team.roster.positions) {
            positionsIconData[position.id] = {iconId: position.icon, iconData: await this.getIconData(position.icon)};
        }

        this.positionsIconData = positionsIconData;
    }

    public async getIconData(positionIconId: number): Promise<any> {
        const imageDimensions = (imageUrl): Promise<{width: number, height: number}> =>
            new Promise((resolve, reject) => {
                const img = new Image()

                img.onload = () => {
                    const { naturalWidth: width, naturalHeight: height } = img;
                    resolve({ width, height });
                }

                img.onerror = () => {
                    reject('There was some problem with the image.');
                }

                img.src = imageUrl;
            }
        );

        try {
            const dimensions = await imageDimensions(`https://fumbbl.com/i/${positionIconId}`);
            const iconSize = dimensions.width / 4;
            let counter = 0;
            const iconRowVersionPositions = [];
            while (counter < dimensions.height) {
                iconRowVersionPositions.push(-1 * counter);
                counter += iconSize;
            }
            return {
                size: iconSize,
                iconRowVersionPositions: iconRowVersionPositions,
            };
        } catch(error) {
            return 30;
        }
    }

    private getRandomIconRowVersionPosition(positionIconInfo: any): number {
        return Math.floor(Math.random() * positionIconInfo.iconData.iconRowVersionPositions.length);
    }

    private async getRoster(rosterId: number) {
        const result = await Axios.post('http://localhost:3000/api/roster/get/' + rosterId);
        return result.data;
    }

    private async createPlayer(playerNumber: number, positionId: number): Promise<any> {
        let positionObject = this.team.positionsLookup[positionId];

        const result = await Axios.post('http://localhost:3000/api/name/generate/default');
        const playerName = result.data;

        return {
            id: 'NEW--' + playerNumber,
            number: playerNumber,
            name: playerName,
            position: positionObject.title,
            positionId: positionObject.id,
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
            iconRowVersionPosition: this.getRandomIconRowVersionPosition(this.positionsIconData[positionObject.id]),
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

    public async handleAddPlayer(playerNumber: number, positionId: number) {
        this.team.players.push(await this.createPlayer(playerNumber, positionId));
    }

    public handleDeletePlayer(playerNumber: number) {
        const index = this.team.players.findIndex((player) => player.number === playerNumber);
        if (index !== -1) {
            this.team.players.splice(index, 1);
        }
    }

    private handleResetCreateTeam() {
        this.team.players = [];
        // need to reset more here too
    }

    private handleFoldOut(playerNumber: number, playerRowFoldOutMode: PlayerRowFoldOutMode, multipleOpenMode: boolean) {
        if (playerRowFoldOutMode === 'CLOSED') {
            this.closeFoldOutForPlayerNumber(playerNumber);
        } else if (! multipleOpenMode) {
            this.foldOuts.buy = [];
            this.foldOuts.more = [];
        }

        if (playerRowFoldOutMode === 'BUY') {
            if (! this.foldOuts.buy.includes(playerNumber)) {
                this.foldOuts.buy.push(playerNumber);
            }
        } else if (playerRowFoldOutMode === 'MORE') {
            if (! this.foldOuts.more.includes(playerNumber)) {
                this.foldOuts.more.push(playerNumber);
            }
        }
    }

    private closeFoldOutForPlayerNumber(playerNumber: number) {
        const buyIndex = this.foldOuts.buy.findIndex((playerNumberToCheck) => playerNumberToCheck === playerNumber);
        if (buyIndex !== -1) {
            this.foldOuts.buy.splice(buyIndex, 1);
        }
        const moreIndex = this.foldOuts.more.findIndex((playerNumberToCheck) => playerNumberToCheck === playerNumber);
        if (moreIndex !== -1) {
            this.foldOuts.more.splice(moreIndex, 1);
        }
    }

    private handleAddReroll() {
        if (this.team.rerolls < 8) {
            this.team.rerolls++;
        }
    }

    private handleRemoveReroll() {
        if (this.team.rerolls > 0) {
            this.team.rerolls--;
        }
    }

    private handleAddDedicatedFans() {
        if (this.team.dedicatedFans < this.team.ruleset.maxStartFans) {
            this.team.dedicatedFans++;
        }
    }

    private handleRemoveDedicatedFans() {
        if (this.team.dedicatedFans > this.team.ruleset.minStartFans) {
            this.team.dedicatedFans--;
        }
    }

    private handleAddAssistantCoaches() {
        if (this.team.assistantCoaches < this.team.ruleset.maxAssistantCoaches) {
            this.team.assistantCoaches++;
        }
    }

    private handleRemoveAssistantCoaches() {
        if (this.team.assistantCoaches > 0) {
            this.team.assistantCoaches--;
        }
    }

    private handleAddCheerleaders() {
        if (this.team.cheerleaders < this.team.ruleset.maxCheerleaders) {
            this.team.cheerleaders++;
        }
    }

    private handleRemoveCheerleaders() {
        if (this.team.cheerleaders > 0) {
            this.team.cheerleaders--;
        }
    }

    private handleAddApothecary() {
        if (this.team.roster.apothecary === 'Yes' && this.team.apothecary === false) {
            this.team.apothecary = true;
        }
    }

    private handleRemoveApothecary() {
        if (this.team.roster.apothecary === 'Yes' && this.team.apothecary === true) {
            this.team.apothecary = false;
        }
    }
}
</script>