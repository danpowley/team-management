<template>
    <div class="teammanagement">
        <demosetup v-if="overallApplicationMode === 'DEMO_SETUP' && fumbblApi !== null"
            :fumbbl-api="fumbblApi"
            @create-empty-demo-team="handleCreateEmptyDemoTeam"
            @demo-team-chosen="handleDemoTeamChosen"
        ></demosetup>

        <team v-if="overallApplicationMode === 'TEAM'"
            :fumbbl-api="fumbblApi"
            :demo-team-settings="demoTeamSettings"
            @unexpected-error="handleUnexpectedError"
            @delete-team="handleDeleteTeam"
        ></team>

        <modal
            v-if="overallApplicationMode === 'ERROR'"
            :modal-size="'small'"
            :exclude-close-top-right="true"
        >
            <template v-slot:header>
                Unexpected error.
            </template>

            <template v-slot:body>
                <p>Unfortunately an unexpected error has occurred, please reload this page before continuing.</p>
                <p>Current action: {{ unexpectedErrorMessage.currentAction }}</p>
                <p>Error message: {{ unexpectedErrorMessage.errorMessage }}</p>
            </template>
        </modal>

        <modal
            v-if="overallApplicationMode === 'DELETED'"
            :modal-size="'small'"
            :exclude-close-top-right="true"
        >
            <template v-slot:header>
                Team deleted.
            </template>

            <template v-slot:body>
                <p>Team successfully deleted, you will shortly be redirected to your coach homepage.</p>
                <div><a href="`https://fumbbl.com/~${this.coachName}`">Go to coach homepage</a></div>
            </template>
        </modal>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import TeamComponent from "./components/Team.vue";
import DemoSetupComponent from "./components/DemoSetup.vue";
import FumbblApi from "./include/FumbblApi";
import FumbblApiDev from "./include/FumbblApiDev";
import modal from "./components/Modal.vue";
import { DemoTeamSettings } from "./include/Interfaces";

@Component({
    components: {
        modal,
        'demosetup': DemoSetupComponent,
        'team': TeamComponent,
    },
})
export default class TeamManagement extends Vue {
    private coachName: string = null;
    private isDevMode: boolean = true;
    public fumbblApi: FumbblApi = null;
    public overallApplicationMode: 'DEMO_SETUP' | 'CHOOSE_ROSTER' | 'TEAM' | 'ERROR' | 'DELETED' = 'DEMO_SETUP';
    public unexpectedErrorMessage: {currentAction: string, errorMessage: string} = null;

    public demoTeamSettings: DemoTeamSettings = {existingTeamId: null, newTeam: null};

    mounted() {
        // TODO: hardcoded coach name
        this.coachName = 'HimalayaP1C7';

        if (this.isDevMode) {
            this.fumbblApi = new FumbblApiDev();
        } else {
            this.fumbblApi = new FumbblApi();
        }

        // just some hacks to quickly load the page
        // this.handleCreateEmptyDemoTeam('Competitive', 4, 5141); // competitive amazons
        // this.handleCreateEmptyDemoTeam('Competitive', 4, 4959); // competitive dark elves
        // this.handleCreateEmptyDemoTeam('Competitive', 4, 4958); // competitive chaos renegades
        // this.handleCreateEmptyDemoTeam('Competitive', 4, 4974); // competitive orc
        // this.handleCreateEmptyDemoTeam('Competitive', 4, 4978); // competitive underworld denizens
        // this.handleCreateEmptyDemoTeam('Competitive', 4, 4972); // competitive old world alliances
        // this.handleCreateEmptyDemoTeam('Competitive', 4, 5142); // competitive chaos dwarves
        // this.handleCreateEmptyDemoTeam('Competitive', 4, 4957); // competitive chaos chosen
        // this.handleCreateEmptyDemoTeam('Competitive', 4, 5144); // competitive norse
        // this.handleCreateEmptyDemoTeam('Competitive', 4, 4970); // competitive nurgle
        // this.handleCreateEmptyDemoTeam('Competitive', 4, 5145); // competitive tomb kings
        // this.handleCreateEmptyDemoTeam('Competitive', 4, 4962); // competitive goblins
        // this.handleDemoTeamChosen(1107138); // bone wrappers
        // this.handleDemoTeamChosen(1089119); // chaos chosen
        // this.handleDemoTeamChosen(1105756); // norse chaos
        // this.handleDemoTeamChosen(1054459); // chaos dwarves
        // this.handleDemoTeamChosen(1056435); // norse old wild
        // this.handleDemoTeamChosen(714168); // flying sandwiches

        // NEW TEAMS
        // this.handleDemoTeamChosen(1121103); // NEW NORSE
        // this.handleDemoTeamChosen(1121104); // NEW CHAOS CHOSEN
        // this.handleDemoTeamChosen(1121102); // NEW CHAOS DWARF
        // this.handleDemoTeamChosen(1121101); // NEW NURGLE
        // this.handleDemoTeamChosen(1121106); // NEW TOMB KINGS
        // this.handleDemoTeamChosen(1121509); // NEW CHAOS CHOSEN
        // this.handleDemoTeamChosen(1078726); // STAT UP TEAM
        // this.handleDemoTeamChosen(1065138); // MOVEMENT STAT UP TEAM
        // this.handleDemoTeamChosen(1108080); // WARPSTONE MUTATION TEAM
        // this.handleDemoTeamChosen(1041409); // LOW COST LINE MEN TEAM
        // this.handleDemoTeamChosen(1089112); // Necro
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

    public handleUnexpectedError(currentAction: string, errorMessage: string) {
        this.unexpectedErrorMessage = {currentAction, errorMessage};
        this.overallApplicationMode = 'ERROR';
    }

    public handleDeleteTeam() {
        this.overallApplicationMode = 'DELETED';
        setTimeout(() => window.location.href = `https://fumbbl.com/~${this.coachName}`, 5000);
    }
}
</script>