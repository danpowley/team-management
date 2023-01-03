<template>
    <div class="newteam" v-if="ruleset !== null">
        NT: Ruleset: {{ ruleset.id }}: {{ ruleset.name }}

        <chooseroster v-if="newTeamRosterId === null"
            :rosters="ruleset.rosters"
            @chosen-roster="handleChosenRoster"
        ></chooseroster>

        <hr>

        <quickstart v-if="newTeamRosterId !== null"
            :roster-id="newTeamRosterId"
            :ruleset="ruleset"
            @quick-start-finished="handleQuickStartFinished"
        ></quickstart>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Axios from "axios";
import Component from 'vue-class-component';
import ChooseRosterComponent from "./ChooseRoster.vue";
import QuickStartComponent from "./QuickStart.vue";

@Component({
    components: {
        'chooseroster': ChooseRosterComponent,
        'quickstart': QuickStartComponent,
    },
    props: {
        rulesetId: {
            type: Number,
            required: true,
        },
    }
})
export default class NewTeamComponent extends Vue {
    public ruleset: any = null;
    public rosters = [];
    public newTeamRosterId: number | null = null;

    async mounted() {
        const result = await Axios.post('http://localhost:3000/api/ruleset/get/' + this.$props.rulesetId);

        const rosters = [];
        for (const roster of result.data.rosters) {
            if (roster.value.startsWith('_')) {
                continue;
            }
            rosters.push({
                id: ~~roster.id,
                name: roster.value
            });
        }

        rosters.sort((a, b) => {
            if (a.name === b.name) {
                return 0;
            }
            return a.name > b.name ? 1 : -1;
        });

        const ruleset = {
            id: result.data.id,
            name: result.data.name,
            startTreasury: result.data.options.teamSettings.startTreasury,
            startPlayers: result.data.options.teamSettings.startPlayers,
            maxPlayers: result.data.options.teamSettings.maxPlayers,
            startFans: result.data.options.teamSettings.startFans,
            minStartFans: result.data.options.teamSettings.minStartFans,
            maxStartFans: result.data.options.teamSettings.maxStartFans,
            rosters: rosters,
        };

        this.ruleset = ruleset;

        // https://fumbbl.com/api/ruleset/get/4
        // data.options.teamSettings.teamProgression
        // data.options.teamSettings.skillProgressionType
        // data.options.teamSettings.sppLimits": "6,16,31,51,76,176"
        // data.options.teamSettings.predeterminedSkills": "0:6N2D8S|0:3N|0:2N2D|0:3N3D|0:6N2D"
        // data.options.teamSettings.skillsPerPlayer
    }

    public handleChosenRoster(rosterId: number) {
        this.newTeamRosterId = rosterId;
    }

    public handleQuickStartFinished(buildData: any) {
        this.$emit('quick-start-finished', buildData);
    }
}
</script>