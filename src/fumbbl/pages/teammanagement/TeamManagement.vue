<template>
    <div class="teammanagement">
        <demosetup v-if="overallApplicationMode === 'DEMO_SETUP'"
            @ruleset-chosen="handleRulesetChosen"
            @demo-team-chosen="handleDemoTeamChosen"
        ></demosetup>

        <chooseroster v-if="overallApplicationMode === 'CHOOSE_ROSTER' && rawApiRuleset"
            :raw-basic-rosters="rawApiRuleset.rosters"
            @roster-chosen="handleRosterChosen"
        ></chooseroster>

        <team v-if="overallApplicationMode === 'TEAM'"
            :demo-team-settings="demoTeamSettings"
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

@Component({
    components: {
        'demosetup': DemoSetupComponent,
        'chooseroster': ChooseRosterComponent,
        'team': TeamComponent,
    },
})
export default class TeamManagement extends Vue {
    public overallApplicationMode: 'DEMO_SETUP' | 'CHOOSE_ROSTER' | 'TEAM' = 'DEMO_SETUP';
    private rawApiRuleset: any = null;

    private demoTeamSettings: {existingTeamId: number | null, newTeam: {rulesetId: number, rosterId: number} | null} = {existingTeamId: null, newTeam: null};

    async mounted() {
    }

    public async handleRulesetChosen(rulesetId: number) {
        const result = await Axios.post('http://localhost:3000/api/ruleset/get/' + rulesetId);
        this.rawApiRuleset = result.data;

        this.demoTeamSettings = {existingTeamId: null, newTeam: {rulesetId: rulesetId, rosterId: 0}};
        this.overallApplicationMode = 'CHOOSE_ROSTER';
    }

    public async handleRosterChosen(rosterId: number) {
        this.demoTeamSettings.newTeam.rosterId = rosterId;
        this.overallApplicationMode = 'TEAM';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    public async handleDemoTeamChosen(demoTeamId: number) {
        this.demoTeamSettings = {existingTeamId: demoTeamId, newTeam: null};
        this.overallApplicationMode = 'TEAM';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
</script>