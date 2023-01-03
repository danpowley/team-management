<template>
    <div class="teammanagement">
        <demosetup v-if="mode === 'START'"
            @ruleset-chosen="handleRulesetChosen"
        ></demosetup>

        <newteam v-if="mode === 'NEW_TEAM'"
            :ruleset-id="newTeamRulesetId"
            @quick-start-finished="handleQuickStartFinished"
        ></newteam>

        <team v-if="mode === 'MANAGE_TEAM'"
            :team="team"
            @change-player-number="handleChangePlayerNumber"
        ></team>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import NewTeamComponent from "./components/NewTeam.vue";
import TeamComponent from "./components/Team.vue";
import DemoSetupComponent from "./components/DemoSetup.vue";

@Component({
    components: {
        'demosetup': DemoSetupComponent,
        'newteam': NewTeamComponent,
        'team': TeamComponent,
    },
})
export default class TeamManagement extends Vue {
    public mode: 'START' | 'NEW_TEAM' | 'MANAGE_TEAM' = 'START';
    public newTeamRulesetId: number | null = null;

    public team: any = null;

    async mounted() {
    }

    public handleRulesetChosen(rulesetId: number) {
        this.newTeamRulesetId = rulesetId;
        this.mode = 'NEW_TEAM';
    }

    public handleQuickStartFinished(buildData: any) {
        this.team = buildData;
        this.mode = 'MANAGE_TEAM';
    }

    public handleChangePlayerNumber(playerId: number, newPlayerNumber) {
        const player = this.team.players.find((player) => {
            return player.id == playerId;
        });

        player.number = newPlayerNumber;
    }
}
</script>

<style scoped>
</style>