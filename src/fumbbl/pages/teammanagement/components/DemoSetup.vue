<template>
    <div class="demosetup">
        <div>
            <input v-model="demoTeamId" type=text><button @click="loadDemoTeam()">load team</button>
        </div>
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
    private divisionOrGroup: string = '';
    private rostersForSelect: any[] = [];
    private rulesetId: number = 0;
    private rosterId: number = 0;
    public newTeamDivisionId: number | null = null;
    public newTeamLeagueId: number | null = null;
    public demoTeamId: number | null = 1085077;

    private async setupRosters() {
        const bits = this.divisionOrGroup.split('-');
        const isDivision = bits[0] === 'd';
        const divisionOrGroupId = bits[1];

        if (isDivision) {
            const result = await Axios.post('http://localhost:3000/api/division/get/' + divisionOrGroupId);
            this.rulesetId = result.data.rulesetId;
        } else {
            const result = await Axios.post('http://localhost:3000/api/group/get/' + divisionOrGroupId);
            this.rulesetId = result.data.ruleset;
        }

        const result2 = await Axios.post('http://localhost:3000/api/ruleset/get/' + this.rulesetId);
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

    private resetDemo() {
        this.newTeamDivisionId = null;
        this.newTeamLeagueId = null;
    }

    public createForDivision(divisionId: number) {
        this.resetDemo();
        this.newTeamDivisionId = divisionId;
        this.createNewTeam();
    }

    public createForGroup(groupId: number) {
        this.resetDemo();
        this.newTeamLeagueId = groupId;
        this.createNewTeam();
    }

    public async createNewTeam() {
        if (this.newTeamDivisionId) {
            const result = await Axios.post('http://localhost:3000/api/division/get/' + this.newTeamDivisionId);
            this.$emit('ruleset-chosen', result.data.rulesetId);
        }

        if (this.newTeamLeagueId) {
            const result = await Axios.post('http://localhost:3000/api/group/get/' + this.newTeamLeagueId);
            this.$emit('ruleset-chosen', result.data.ruleset);
        }
    }

    public createEmptyDemoTeam() {
        this.$emit('create-empty-demo-team', this.rulesetId, this.rosterId);
    }

    public loadDemoTeam() {
        this.$emit('demo-team-chosen', this.demoTeamId);
    }
}
</script>