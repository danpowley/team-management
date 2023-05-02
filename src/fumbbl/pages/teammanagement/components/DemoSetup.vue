<template>
    <div class="demosetup">
        <div class="quickteams">
            <div v-for="t in quickTeamsForSelect" :key="t.id">
                <a @click.prevent="loadQuickTeam(t.id)" href="#" :class="t.quickClasses.join(' ')">{{ t.quickName }}</a>
            </div>
        </div>
        <h2>Load demo team</h2>
        <div>
            <select v-model="coach" @change="setupTeams">
                <option v-for="c in coachesForSelect" :key="c" :value="c">{{ c }}</option>
            </select>
            <select v-model="demoTeamId">
                <option v-for="t in teamsForSelect" :key="t.id" :value="t.id">{{ t.name }} ({{ t.id }})</option>
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
import Component from 'vue-class-component';
import FumbblApi from "../include/FumbblApi";

@Component({
    components: {
    },
    props: {
        fumbblApi: {
            type: Object,
            required: true,
        },
    }
})
export default class DemoSetupComponent extends Vue {
    private coachesForSelect: any[] = ['HimalayaP1C7', 'Christer', 'PurpleChest', 'Malmir', 'Nelphine', 'Java', 'MerryZ', 'Mekutata', 'Jopotzuki', 'iena'];
    private coach: string = '';
    private teamsForSelect: any[] = [];
    private quickTeamsForSelect: any[] = [];
    public demoTeamId: number | null = null;
    private divisionOrGroup: string = '';
    private rostersForSelect: any[] = [];
    private rulesetId: number = 0;
    private rosterId: number = 0;
    public newTeamDivisionId: number | null = null;
    public newTeamLeagueId: number | null = null;

    async mounted() {
        await this.setupQuickTeam();
    }

    private getFumbblApi(): FumbblApi {
        return this.$props.fumbblApi;
    }

    private get basicDivisionName(): 'Competitive' | 'Ranked' | 'League' {
        if (this.divisionOrGroup === 'd-2') {
            return 'Competitive';
        } else if (this.divisionOrGroup === 'd-1') {
            return 'Ranked';
        } else {
            return 'League';
        }
    }

    private async setupRosters() {
        const bits = this.divisionOrGroup.split('-');
        const isDivision = bits[0] === 'd';
        const divisionOrGroupId = ~~bits[1];

        if (isDivision) {
            const apiResponse = await this.getFumbblApi().getRulesetIdForDivision(divisionOrGroupId);
            this.rulesetId = apiResponse.getData();
            if (! apiResponse.isSuccessful()) {
                console.log('Error getting ruleset id for division', apiResponse.getErrorMessage());
            }
        } else {
            const apiResponse = await this.getFumbblApi().getRulesetIdForGroup(divisionOrGroupId);
            this.rulesetId = apiResponse.getData();
            if (! apiResponse.isSuccessful()) {
                console.log('Error getting ruleset id for group', apiResponse.getErrorMessage());
            }
        }

        const apiResponse = await this.getFumbblApi().getRuleset(this.rulesetId);
        const rawApiRuleset = apiResponse.getData();
        if (! apiResponse.isSuccessful()) {
            console.log('Error getting ruleset for ruleset id', apiResponse.getErrorMessage());
        }
        await this.prepareBasicRosters(rawApiRuleset.rosters);
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

    private async setupQuickTeam() {
        const apiResponse = await this.getFumbblApi().getTeamsForCoach('HimalayaP1C7');
        const rawApiTeams = apiResponse.getData();
        if (! apiResponse.isSuccessful()) {
            console.log('Error getting quick teams for demo coach', apiResponse.getErrorMessage());
        }
        this.quickTeamsForSelect = await this.convertToBasicTeams(rawApiTeams);
    }

    private async setupTeams() {
        const apiResponse = await this.getFumbblApi().getTeamsForCoach(this.coach);
        const rawApiTeams = apiResponse.getData();
        if (! apiResponse.isSuccessful()) {
            console.log('Error getting teams for chosen coach', apiResponse.getErrorMessage());
        }
        this.teamsForSelect = await this.convertToBasicTeams(rawApiTeams);
    }

    private async convertToBasicTeams(rawApiTeams): Promise<any[]> {
        const basicTeams = [];
        for (const team of rawApiTeams) {
            const teamId = ~~team.id;
            const leagueInfo = team.league ? ` [${team.league}] ` : '';
            const quickName = `${team.race} ----- (${team.name})`;
            basicTeams.push({id: teamId, name: `${team.division}${leagueInfo} (${team.status}): ${team.race} - ${team.name}`, quickClasses: [team.division, team.status], quickName: quickName});
        }

        basicTeams.sort((a, b) => {
            if (a.name === b.name) {
                return 0;
            }
            return a.name > b.name ? 1 : -1;
        });

        return basicTeams;
    }

    public createEmptyDemoTeam() {
        this.$emit('create-empty-demo-team', this.basicDivisionName, this.rulesetId, this.rosterId);
    }

    public loadQuickTeam(teamId: number) {
        this.$emit('demo-team-chosen', teamId);
    }

    public loadDemoTeam() {
        this.$emit('demo-team-chosen', this.demoTeamId);
    }
}
</script>