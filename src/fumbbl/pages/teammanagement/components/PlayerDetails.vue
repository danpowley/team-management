<template>
    <div class="playerdetails">
        <div class="playerdetailssection playerdetailsedit">
            <a href="#" @click.prevent="$emit('delete-player')" style="float: right;">Remove player</a>
            <div class="title">Edit player details</div>
            <template v-if="updatePlayerDetails">
                <label :for="'playerName_' + teamSheetEntry.getNumber()">Name</label>
                <input :id="'playerName_' + teamSheetEntry.getNumber()" v-model="updatePlayerDetails.playerName" type="text">
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
            <div class="title">Details</div>
            <p>Todo: decide what to display here.</p>
            <ul>
                <li>Games played: [data unavailable]</li>
                <li>Completions: {{ player ? player.getRecord().completions : '0' }}</li>
                <li>Touchdowns: {{ player ? player.getRecord().touchdowns : '0' }}</li>
                <li>Interceptions: {{ player ? player.getRecord().interceptions : '0' }}</li>
                <li>Casualties: {{ player ? player.getRecord().casualties : '0' }}</li>
                <li>MVPs: {{ player ? player.getRecord().mvps : '0' }}</li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';
import UpdatePlayerDetails from "../include/UpdatePlayerDetails";

@Component({
    components: {
    },
    props: {
        teamSheetEntry: {
            validator: function (teamSheetEntry) {
                return typeof teamSheetEntry === 'object' || teamSheetEntry === null;
            }
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
}
</script>