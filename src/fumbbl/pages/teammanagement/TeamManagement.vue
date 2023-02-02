<template>
    <div class="teammanagement">
        <demosetup v-if="overallApplicationMode === 'DEMO_SETUP'"
            @ruleset-chosen="handleRulesetChosen"
        ></demosetup>

        <chooseroster v-if="overallApplicationMode === 'CHOOSE_ROSTER'"
            :raw-basic-rosters="rawApiRuleset.rosters"
            @roster-chosen="handleRosterChosen"
        ></chooseroster>

        <team v-if="overallApplicationMode === 'TEAM'"
            :team-management-settings="teamManagementSettings"
            :roster-icon-manager="rosterIconManager"
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
import RosterIconManager from "./include/RosterIconManager";
import TeamManagementSettings from "./include/TeamManagementSettings";

@Component({
    components: {
        'demosetup': DemoSetupComponent,
        'chooseroster': ChooseRosterComponent,
        'team': TeamComponent,
    },
})
export default class TeamManagement extends Vue {
    public overallApplicationMode: 'DEMO_SETUP' | 'CHOOSE_ROSTER' | 'TEAM' = 'DEMO_SETUP';
    private rawApiRuleset: any;
    private teamManagementSettings: TeamManagementSettings;
    private rosterIconManager: RosterIconManager | null = null;

    async mounted() {
    }

    public async handleRulesetChosen(rulesetId: number) {
        const result = await Axios.post('http://localhost:3000/api/ruleset/get/' + rulesetId);
        this.rawApiRuleset = result.data;
        this.overallApplicationMode = 'CHOOSE_ROSTER';
    }

    public async handleRosterChosen(rosterId: number) {
        const result = await Axios.post('http://localhost:3000/api/roster/get/' + rosterId);
        const rawApiRoster = result.data;
        await this.setupRosterIconManager(rawApiRoster.positions);
        this.teamManagementSettings = new TeamManagementSettings(this.rawApiRuleset, rawApiRoster);
        this.overallApplicationMode = 'TEAM';
    }

    public async setupRosterIconManager(rawApiPositions: any[]) {
        const positionIconData = rawApiPositions.map((position: any) => {
            return {
                positionId: ~~position.id,
                positionIcon: ~~position.icon,
            };
        });
        const rosterIconManager = new RosterIconManager();
        await rosterIconManager.prepareIconData(positionIconData);

        this.rosterIconManager = rosterIconManager;
    }
}
</script>