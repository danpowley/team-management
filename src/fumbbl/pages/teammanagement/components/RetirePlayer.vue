<template>
    <modal
        :buttons-config="{'close': 'Close', 'retire': 'Retire player'}"
        :modal-size="'small'"
        @close="$emit('nominate-retire-player-cancel')"
        @retire="$emit('nominate-retire-player-confirm')"
    >
        <template v-slot:header>
            Retire player?
        </template>

        <template v-slot:body>
            <template v-if="errors.length === 0">
                <p>Are you sure you want to retire the following player?</p>
                <p>#{{ player.getPlayerNumber() }} <strong>{{ player.getPositionName() }}:</strong> {{ player.getPlayerName() }}</p>
                <template v-if="player.getSkills().length === 0">
                    <p>No earned skills.</p>
                </template>
                <template v-else>
                    <p>Earned skills: <strong>{{ player.getSkills().join(', ') }}</strong></p>
                </template>
                <p>Unspent SPP: {{ player.sppDisplayInfo.spendable }}</p>
                <p>Injuries: {{ player.getInjuries().length > 0 ? player.getInjuries().join(', ') : 'none' }}</p>
            </template>
            <template v-else>
                <p>Unable to retire player. Please try fully reloading the page to fix this problem. If the problem persists please contact support with the following error details.</p>
                <ul>
                    <li v-for="error in errors" :key="error">{{ error }}</li>
                </ul>
            </template>
        </template>
    </modal>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import Component from 'vue-class-component';
import ModalComponent from "./Modal.vue";
import Player from "../include/Player";
import FumbblApi from "../include/FumbblApi";

const RetirePlayerComponentProps = Vue.extend({
    components: {
        'modal': ModalComponent,
    },
    props: {
        fumbblApi: {
            type: Object as PropType<FumbblApi>,
            required: true,
        },
        player: {
            type: Object as PropType<Player>,
            required: true,
        },
    },
});

@Component
export default class RetirePlayerComponent extends RetirePlayerComponentProps {
    public errors: string[] = [];

    async mounted() {
        const apiResponse = await this.fumbblApi.getPlayer(this.player.getId());
        if (apiResponse.isSuccessful()) {
            const rawApiPlayer = apiResponse.getData();
            this.validatePlayer(rawApiPlayer);
        } else {
            this.errors.push('Unable to verify player details.');
        }
    }

    private validatePlayer(rawApiPlayer: any) {
        if (rawApiPlayer.status !== 'Active') {
            this.errors.push('This player is not active.');
        }

        if (this.player.getPlayerNumber() !== rawApiPlayer.number) {
            this.errors.push('Local player number is out of sync with saved player number.');
        }

        if (this.player.getPositionId() !== rawApiPlayer.position.id) {
            this.errors.push('Invalid player position.');
        }

        if (this.player.getPlayerName() !== rawApiPlayer.name) {
            this.errors.push('Local player name is out of sync with saved player name.');
        }

        if (this.player.getRecord().spp.total !== rawApiPlayer.statistics.spp) {
            this.errors.push('Local SPP out of sync with saved SPP.');
        }

        if (this.player.getInjuries().length !== rawApiPlayer.injuries.length) {
            this.errors.push('Local injuries out of sync with saved injuries.');
        }

        if (this.player.getSkills().length + this.player.getPositionSkills().length !== rawApiPlayer.skills.length) {
            this.errors.push('Local skills out of sync with saved skills.');
        }
    }
}
</script>