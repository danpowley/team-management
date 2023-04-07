<template>
    <div class="playerdetails">
        <div class="playerdetailssection playerdetailsedit" v-if="canEdit">
            <a href="#" @click.prevent="$emit('delete-player')" style="float: right;">Remove player</a>
            <div class="title">Edit player details</div>
            <template v-if="updatePlayerDetails">
                <label :for="'playerName_' + teamSheetEntry.getNumber()">Name</label>
                <input :id="'playerName_' + teamSheetEntry.getNumber()" v-model="updatePlayerDetails.playerName" type="text">
                <a href="#" @click.prevent="generatePlayerName"><img src="https://fumbbl.com/FUMBBL/Images/Icons/reroll_light.png"></a>
                <label :for="'gender_' + teamSheetEntry.getNumber()">Gender</label>
                <select :id="'gender_' + teamSheetEntry.getNumber()" v-model="updatePlayerDetails.gender">
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="NEUTRAL">Neutral</option>
                    <option value="NONBINARY">Non-Binary</option>
                </select>
                <div v-for="error in updatePlayerDetailsErrors" :key="error" class="errormessages">
                    <div v-if="error === 'empty_name'">Please enter a name.</div>
                    <div v-if="error === 'empty_gender'">Please select a Gender.</div>
                </div>
                <div>
                    <button @click="saveUpdatedPlayerDetails">Save</button>
                </div>
            </template>
        </div>
        <div class="playerdetailssection playerdetailsrecord">
            <a v-if="player" :href="`https://fumbbl.com/p/player?player_id=${player.getId()}`" style="float: right;">Manage player</a>
            <div class="title">Details</div>
            <table class="playerstats">
                <tr>
                    <td>0</td>
                    <td>Games played: [data unavailable]</td>
                </tr>
                <tr>
                    <td>{{ player ? player.getRecord().completions : '0' }}</td>
                    <td>Completions</td>
                </tr>
                <tr>
                    <td>{{ player ? player.getRecord().touchdowns : '0' }}</td>
                    <td>Touchdowns</td>
                </tr>
                <tr>
                    <td>{{ player ? player.getRecord().interceptions : '0' }}</td>
                    <td>Interceptions</td>
                </tr>
                <tr>
                    <td>{{ player ? player.getRecord().casualties : '0' }}</td>
                    <td>Casualties</td>
                </tr>
                <tr>
                    <td>{{ player ? player.getRecord().mvps : '0' }}</td>
                    <td>MVPs</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';
import UpdatePlayerDetails from "../include/UpdatePlayerDetails";
import Axios from "axios";

@Component({
    components: {
    },
    props: {
        canEdit: {
            type: Boolean,
            required: true,
        },
        teamSheetEntry: {
            validator: function (teamSheetEntry) {
                return typeof teamSheetEntry === 'object' || teamSheetEntry === null;
            }
        },
        nameGenerator: {
            type: String,
            required: true,
        },
    },
})
export default class PlayerDetailsComponent extends Vue {
    private updatePlayerDetailsErrors: string[] = [];

    public get player() {
        return this.$props.teamSheetEntry.getPlayer();
    }

    public get updatePlayerDetails(): UpdatePlayerDetails {
        return this.$props.teamSheetEntry.getUpdatePlayerDetails();
    }

    private saveUpdatedPlayerDetails(): void {
        if (this.updatePlayerDetails) {
            this.updatePlayerDetailsErrors = this.updatePlayerDetails.getErrors();
        }

        if (this.updatePlayerDetailsErrors.length === 0) {
            this.$props.teamSheetEntry.saveUpdatePlayerDetails();
            this.$emit('close');
        }
    }

    private async generatePlayerName(): Promise<void> {
        const result = await Axios.post(`https://fumbbl.com/api/name/generate/${this.$props.nameGenerator}/${this.updatePlayerDetails.getGender().toLowerCase()}`);
        const playerName = result.data;
        this.updatePlayerDetails.setPlayerName(playerName);
    }
}
</script>