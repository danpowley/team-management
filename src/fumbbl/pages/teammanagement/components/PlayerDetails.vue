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
            <button v-if="canCreate" class="teambutton" @click.prevent="$emit('remove-player')" style="float: right;">Remove</button>
            <button v-else-if="canEdit" class="teambutton" @click.prevent="modals.retirePlayer = true" style="float: right;">Retire</button>
        </div>
        <modal
            v-show="modals.retirePlayer === true"
            :buttons-config="{'close': 'Close', 'retire': 'Retire player'}"
            :modal-size="'small'"
            @close="modals.retirePlayer = false"
            @retire="modals.retirePlayer = false; $emit('retire-player')"
        >
            <template v-slot:header>
                Retire player?
            </template>

            <template v-slot:body>
                <p>Are you sure you want to retire the following player?</p>
                <p>{{ player.getPositionName() }}: {{ player.getPlayerName() }}</p>
                <template v-if="player.getSkills().length === 0">
                    <p>No earned skills.</p>
                </template>
                <template v-else>
                    <p>Earned skills: <strong>{{ player.getSkills().join(', ') }}</strong></p>
                </template>
            </template>
        </modal>
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
import Vue from "vue";
import Component from 'vue-class-component';
import Axios from "axios";
import UpdatePlayerDetails from "../include/UpdatePlayerDetails";
import ModalComponent from "./Modal.vue";
import FumbblApi from "../include/FumbblApi";

@Component({
    components: {
        'modal': ModalComponent,
    },
    props: {
        fumbblApi: {
            type: Object,
            required: true,
        },
        canCreate: {
            type: Boolean,
            required: true,
        },
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
    private errorModalInfo: {general: string, technical: string} = null;
    private modals: {
        retirePlayer: boolean,
    } = {
        retirePlayer: false,
    };

    public get player() {
        return this.$props.teamSheetEntry.getPlayer();
    }

    public get updatePlayerDetails(): UpdatePlayerDetails {
        return this.$props.teamSheetEntry.getUpdatePlayerDetails();
    }

    private getFumbblApi(): FumbblApi {
        return this.$props.fumbblApi;
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
        const apiResponse = await this.getFumbblApi().generatePlayerName(this.$props.nameGenerator, this.updatePlayerDetails.getGender());
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