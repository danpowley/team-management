<template>
    <div class="teammanagement">
        <div v-if="mode === 'START'">Do you want to <a @click="mode = 'CHOOSE_RULESET'">new team</a> or <input type=text><button>load team</button></div>

        <div v-if="mode === 'CHOOSE_RULESET'">
            Just for demo purposes: choose either a division or a league/group.
            <div>
                By Division ({{ newTeamDivisionId }}):
                <select v-model="newTeamDivisionId">
                    <option value="">Please choose</option>
                    <option value="2">Competitive</option>
                    <option value="1">Ranked</option>
                </select>
            </div>

            <div>
                By League ({{ newTeamLeagueId }}):
                <select  v-model="newTeamLeagueId">
                    <option value="">Please choose</option>
                    <option value="15734">Open League 2020</option>
                    <option value="3180">145 League</option>
                    <option value="14708">Secret League</option>
                </select>
            </div>
            <button @click="getRulesetFromChosenDivisionOrGroup">Go</button>
        </div>

        <newteam v-if="mode === 'NEW_TEAM'"
            :ruleset-id="newTeamRulesetId"
            @quick-start-finished="handleQuickStartFinished"
        ></newteam>

        <team v-if="mode === 'MANAGE_TEAM'"
            :team="team"
        ></team>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Axios from "axios";
import Component from "vue-class-component";
import NewTeamComponent from "./components/NewTeam.vue";
import TeamComponent from "./components/Team.vue";

@Component({
    components: {
        'newteam': NewTeamComponent,
        'team': TeamComponent,
    },
})
export default class TeamManagement extends Vue {
    public mode: 'START' | 'CHOOSE_RULESET' | 'NEW_TEAM' | 'MANAGE_TEAM' = 'START';
    public newTeamDivisionId: number | null = null;
    public newTeamLeagueId: number | null = null;
    public newTeamRulesetId: number | null = null;

    public team: any = null;

    async mounted() {
    }

    public async getRulesetFromChosenDivisionOrGroup() {
        if (this.newTeamDivisionId) {
            const result = await Axios.post('http://localhost:3000/api/division/get/' + this.newTeamDivisionId);
            this.newTeamRulesetId = result.data.rulesetId;
            this.mode = 'NEW_TEAM';
        }

        if (this.newTeamLeagueId) {
            const result = await Axios.post('http://localhost:3000/api/group/get/' + this.newTeamLeagueId);
            this.newTeamRulesetId = result.data.ruleset;
            this.mode = 'NEW_TEAM';
        }
    }

    public handleQuickStartFinished(buildData: any) {
        this.setupNewTeamFromBuildData(buildData);
        this.mode = 'MANAGE_TEAM';
    }

    private setupNewTeamFromBuildData(buildData) {
        let players = [];
        for (const position of buildData.roster.positions) {
            for (let step = 0; step < buildData.positionQuantities[position.id]; step++) {
                const playerNumber = step + 1;
                players.push(this.createNewPlayer(playerNumber, position.id));
            }
        }

        players.sort((a,b) => {
            const positionA = this.getPosition(buildData.roster, a.positionId);
            const positionB = this.getPosition(buildData.roster, b.positionId);
            const positionACost = ~~positionA.cost;
            const positionBCost = ~~positionB.cost;
            if (positionACost === positionBCost) {
                return 0;
            }
            return positionACost > positionBCost ? -1 : 1;
        });

        this.team = {
            ruleset: buildData.ruleset,
            roster: buildData.roster,
            players: players,
            rerolls: buildData.rerolls,
            dedicatedFans: buildData.dedicatedFans,
            assistantCoaches: buildData.assistantCoaches,
            cheerleaders: buildData.cheerleaders,
            apothecary: buildData.apothecary,
        };
    }

    private createNewPlayer(playerNumber: number, positionId: number) {
        return {
            id: null,
            number: playerNumber,
            name: 'Bert',
            gender: 'Female',
            positionId: positionId,
            // earned skills,
            // injuries,
        };
    }

    public getPosition(roster: any, positionId: number) {
        for (const position of roster.positions) {
            if (positionId === position.id) {
                return position;
            }
        }
        throw new Error('Failed to find position for ' + positionId);
    }
}
</script>

<style scoped>
</style>