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
        ></newteam>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Axios from "axios";
import Component from "vue-class-component";
import NewTeamComponent from "./components/NewTeam.vue";

@Component({
    components: {
        'newteam': NewTeamComponent,
    },
})
export default class TeamManagement extends Vue {
    public mode: 'START' | 'CHOOSE_RULESET' | 'NEW_TEAM' | 'MANAGE_TEAM' = 'START';
    public newTeamDivisionId: number | null = null;
    public newTeamLeagueId: number | null = null;
    public newTeamRulesetId: number | null = null;

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
}
</script>

<style scoped>
</style>