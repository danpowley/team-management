<template>
    <div class="demosetup">
        <h2>Load demo team</h2>
        <div>
            <select v-model="coach" @change="setupTeams">
                <option v-for="c in coachesForSelect" :key="c" :value="c">{{ c }}</option>
            </select>
            <select v-model="demoTeamId">
                <option v-for="t in teamsForSelect" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
            <button @click="loadDemoTeam()">Load team</button>
        </div>
        <br>
        <br>
        <h2>Create empty demo team</h2>
        <div>
            <select v-model="divisionOrGroup" @change="setupRosters">
                <option value="d-0">Please choose</option>
                <option value="d-2">Competitive</option>
                <option value="d-1">Ranked</option>
                <option value="g-15734">Group: Open League 2020</option>
                <option value="g-3180">Group: 145 League</option>
                <option value="g-14708">Group: Secret League</option>
            </select>
            <select v-model="rosterId">
                <option value="0">Please choose</option>
                <option v-for="r in rostersForSelect" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
            <button @click="createEmptyDemoTeam">Create empty demo team</button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Axios from "axios";
import Component from 'vue-class-component';

@Component({
    components: {
    },
    props: {
    }
})
export default class DemoSetupComponent extends Vue {
    private coachesForSelect: any[] = ['HimalayaP1C7', 'Christer', 'PurpleChest', 'Malmir', 'Nelphine', 'Java', 'MerryZ'];
    private coach: string = '';
    private teamsForSelect: any[] = [];
    public demoTeamId: number | null = null;
    private divisionOrGroup: string = '';
    private rostersForSelect: any[] = [];
    private rulesetId: number = 0;
    private rosterId: number = 0;
    public newTeamDivisionId: number | null = null;
    public newTeamLeagueId: number | null = null;

    private async setupRosters() {
        const bits = this.divisionOrGroup.split('-');
        const isDivision = bits[0] === 'd';
        const divisionOrGroupId = bits[1];

        if (isDivision) {
            const result = await Axios.post('https://fumbbl.com/api/division/get/' + divisionOrGroupId);
            this.rulesetId = result.data.rulesetId;
        } else {
            const result = await Axios.post('https://fumbbl.com/api/group/get/' + divisionOrGroupId);
            this.rulesetId = result.data.ruleset;
        }

        const result2 = await Axios.post('https://fumbbl.com/api/ruleset/get/' + this.rulesetId);
        const rawApiRuleset = result2.data;
        this.prepareBasicRosters(rawApiRuleset.rosters);
    }

    private async prepareBasicRosters(rawBasicRosters) {
        const basicRosters = [];
        for (const roster of rawBasicRosters) {
            if (roster.value.startsWith('_')) {
                continue;
            }
            const rosterId = ~~roster.id;
            basicRosters.push({id: rosterId, name: roster.value});
        }

        basicRosters.sort((a, b) => {
            if (a.name === b.name) {
                return 0;
            }
            return a.name > b.name ? 1 : -1;
        });

        this.rostersForSelect = basicRosters;
    }

    private async setupTeams() {
        const result = await Axios.post('https://fumbbl.com/api/coach/teams/' + this.coach);
        const rawApiTeams = result.data.teams;
        this.prepareTeams(rawApiTeams);
    }

    private async prepareTeams(rawApiTeams) {
        const basicTeams = [];
        for (const team of rawApiTeams) {
            const teamId = ~~team.id;
            const leagueInfo = team.league ? ` [${team.league}] ` : '';
            basicTeams.push({id: teamId, name: `${team.division}${leagueInfo} (${team.status}): ${team.race} - ${team.name}`});
        }

        basicTeams.sort((a, b) => {
            if (a.name === b.name) {
                return 0;
            }
            return a.name > b.name ? 1 : -1;
        });

        this.teamsForSelect = basicTeams;
    }

    public createEmptyDemoTeam() {
        this.$emit('create-empty-demo-team', this.rulesetId, this.rosterId);
    }

    public loadDemoTeam() {
        this.$emit('demo-team-chosen', this.demoTeamId);
    }
}
</script>