<template>
    <div class="teammanagement">
        <demosetup v-if="overallApplicationMode === 'DEMO_SETUP'"
            @create-empty-demo-team="handleCreateEmptyDemoTeam"
            @demo-team-chosen="handleDemoTeamChosen"
        ></demosetup>

        <team v-if="overallApplicationMode === 'TEAM'"
            :demo-team-settings="demoTeamSettings"
        ></team>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Axios from "axios";
import Component from "vue-class-component";
import TeamComponent from "./components/Team.vue";
import DemoSetupComponent from "./components/DemoSetup.vue";

@Component({
    components: {
        'demosetup': DemoSetupComponent,
        'team': TeamComponent,
    },
})
export default class TeamManagement extends Vue {
    public overallApplicationMode: 'DEMO_SETUP' | 'CHOOSE_ROSTER' | 'TEAM' = 'DEMO_SETUP';

    private demoTeamSettings: {existingTeamId: number | null, newTeam: {division: string, rulesetId: number, rosterId: number} | null} = {existingTeamId: null, newTeam: null};

    mounted() {
        // just some hacks to quickly load the page
        this.handleCreateEmptyDemoTeam('Competitive', 4, 5141); // competitive amazons
        // this.handleDemoTeamChosen(1107138); // bone wrappers
    }

    public handleCreateEmptyDemoTeam(division: string, rulesetId: number, rosterId: number) {
        this.demoTeamSettings = {existingTeamId: null, newTeam: {division: division, rulesetId: rulesetId, rosterId: rosterId}};
        this.overallApplicationMode = 'TEAM';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    public handleDemoTeamChosen(demoTeamId: number) {
        this.demoTeamSettings = {existingTeamId: demoTeamId, newTeam: null};
        this.overallApplicationMode = 'TEAM';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
</script>