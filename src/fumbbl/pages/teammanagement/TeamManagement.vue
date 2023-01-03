<template>
    <div class="teammanagement">
        <div v-if="mode === 'START'" class="demosetup">
            <div style="text-align: center; margin-bottom: 1em">
                <div style="font-size: 200%; line-height: 200%;">Create Team</div>
                Choose a Division or Group for the demo.
            </div>
            <div>
                <table>
                    <tr>
                        <td>Competitive</td>
                        <td><a href="#" @click.prevent="createForDivision(2)">Create team for this division</a></td>
                    </tr>
                    <tr>
                        <td>Ranked</td>
                        <td><a href="#" @click.prevent="createForDivision(1)">Create team for this division</a></td>
                    </tr>
                    <tr>
                        <td>Group: Open League 2020</td>
                        <td><a href="#" @click.prevent="createForGroup(15734)">Create team for this group</a></td>
                    </tr>
                    <tr>
                        <td>Group: 145 League</td>
                        <td><a href="#" @click.prevent="createForGroup(3180)">Create team for this group</a></td>
                    </tr>
                    <tr>
                        <td>Group: Secret League</td>
                        <td><a href="#" @click.prevent="createForGroup(14708)">Create team for this group</a></td>
                    </tr>
                </table>
                <br>
                <br>
                <br>
                <div>
                    <input type=text><button>load team</button>
                </div>
            </div>
        </div>

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
import Axios from "axios";
import Component from "vue-class-component";
import NewTeamComponent from "./components/NewTeam.vue";
import TeamComponent from "./components/Team.vue";

@Component({
    components: {
        'newteam': NewTeamComponent,
        'team': TeamComponent,
    },
})
export default class TeamManagement extends Vue {
    public mode: 'START' | 'NEW_TEAM' | 'MANAGE_TEAM' = 'START';
    public newTeamDivisionId: number | null = null;
    public newTeamLeagueId: number | null = null;
    public newTeamRulesetId: number | null = null;

    public team: any = null;

    async mounted() {
    }

    private resetDemo() {
        this.newTeamDivisionId = null;
        this.newTeamLeagueId = null;
        this.newTeamRulesetId = null;
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
            this.newTeamRulesetId = result.data.rulesetId;
            this.mode = 'NEW_TEAM';
        }

        if (this.newTeamLeagueId) {
            const result = await Axios.post('http://localhost:3000/api/group/get/' + this.newTeamLeagueId);
            this.newTeamRulesetId = result.data.ruleset;
            this.mode = 'NEW_TEAM';
        }
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