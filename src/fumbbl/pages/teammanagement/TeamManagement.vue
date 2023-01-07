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
            @drag-drop-player="handleDragDropPlayer"
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
}
</script>

<style scoped>
</style>