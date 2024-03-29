<template>
    <div class="playerdetails">
        <div class="playerdetailssection playerdetailsedit" v-if="canEdit">
            <div class="title">Edit player details</div>
            <template v-if="updatePlayerDetails">
                <div class="playername">
                    <label :for="'playerName_' + teamSheetEntry.getNumber()">Name</label>
                    <input :id="'playerName_' + teamSheetEntry.getNumber()" v-model="updatePlayerDetails.playerName" type="text">
                    <a href="#" @click.prevent="generatePlayerName">Generate random name</a>
                </div>
                <div class="playergender">
                    <label :for="'gender_' + teamSheetEntry.getNumber()">Gender</label>
                    <select :id="'gender_' + teamSheetEntry.getNumber()" v-model="updatePlayerDetails.gender">
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                        <option value="NEUTRAL">Neutral</option>
                        <option value="NONBINARY">Non-Binary</option>
                    </select>
                </div>
                <div v-for="error in updatePlayerDetailsErrors" :key="error" class="errormessages">
                    <div v-if="error === 'empty_name'">Please enter a name.</div>
                    <div v-if="error === 'empty_gender'">Please select a Gender.</div>
                </div>
                <div>
                    <button class="teambutton" @click="saveUpdatedPlayerDetails">Save</button>
                    <button class="teambutton" @click="$emit('close')" style="margin-left: 20px;">Cancel</button>
                </div>
            </template>
        </div>
        <div class="playerdetailssection playerdetailsrecord">
            <a v-if="player" :href="`https://fumbbl.com/p/player?player_id=${player.getId()}`" style="float: right;">Manage player</a>
            <div class="title">Details</div>
            <table class="playerstats">
                <tr>
                    <td>{{ player ? player.getRecord().games : '0' }}</td>
                    <td>Games played</td>
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
        <modal
            v-if="errorModalInfo !== null"
            :buttons-config="{'close': 'Ok'}"
            :modal-size="'small'"
            @close="errorModalInfo = null"
        >
            <template v-slot:header>
                Error
            </template>

            <template v-slot:body>
                <p>{{ errorModalInfo.general }}</p>
                <p>Technical details: {{ errorModalInfo.technical }}</p>
            </template>
        </modal>
    </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import Component from 'vue-class-component';
import UpdatePlayerDetails from "../include/UpdatePlayerDetails";
import ModalComponent from "./Modal.vue";
import FumbblApi from "../include/FumbblApi";
import TeamSheetEntry from "../include/TeamSheetEntry";


const PlayerDetailsComponentProps = Vue.extend({
    components: {
        'modal': ModalComponent,
    },
    props: {
        fumbblApi: {
            type: Object as PropType<FumbblApi>,
            required: true,
        },
        canEdit: {
            type: Boolean,
            required: true,
        },
        teamSheetEntry: {
            type: Object as PropType<TeamSheetEntry>,
            required: true,
        },
        nameGenerator: {
            type: String,
            required: true,
        },
    },
});

@Component
export default class PlayerDetailsComponent extends PlayerDetailsComponentProps {
    public updatePlayerDetailsErrors: string[] = [];
    public errorModalInfo: {general: string, technical: string} = null;

    public get player() {
        return this.teamSheetEntry.getPlayer();
    }

    public get updatePlayerDetails(): UpdatePlayerDetails {
        return this.teamSheetEntry.getUpdatePlayerDetails();
    }

    public async saveUpdatedPlayerDetails() {
        if (this.updatePlayerDetails) {
            this.updatePlayerDetailsErrors = this.updatePlayerDetails.getErrors();
        }

        if (this.updatePlayerDetailsErrors.length === 0) {
            const apiResponse = await this.fumbblApi.updatePlayer(
                this.teamSheetEntry.getPlayer().getId(),
                this.updatePlayerDetails.getPlayerName(),
                this.updatePlayerDetails.getGender()
            );
            if (apiResponse.isSuccessful()) {
                this.teamSheetEntry.saveUpdatePlayerDetails();
            } else {
                this.errorModalInfo = {
                    general: 'An error occurred updating player details.',
                    technical: apiResponse.getErrorMessage(),
                };
            }
            this.$emit('close');
        }
    }

    public async generatePlayerName(): Promise<void> {
        const apiResponse = await this.fumbblApi.generatePlayerName(this.nameGenerator, this.updatePlayerDetails.getGender());
        if (apiResponse.isSuccessful()) {
            const playerName = apiResponse.getData();
            this.updatePlayerDetails.setPlayerName(playerName);
        } else {
            this.errorModalInfo = {
                general: 'An error occurred generating a new player name.',
                technical: apiResponse.getErrorMessage(),
            };
        }
    }
}
</script>