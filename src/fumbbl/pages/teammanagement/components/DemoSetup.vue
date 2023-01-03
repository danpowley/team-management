<template>
    <div class="demosetup">
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
    public newTeamDivisionId: number | null = null;
    public newTeamLeagueId: number | null = null;

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
}
</script>