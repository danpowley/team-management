<template>
    <div class="team" v-if="team !== null">
        <table>
            <thead>
            <tr>
                <th>-</th>
                <th>-</th>
                <th>Player</th>
                <th>Ma</th>
                <th>St</th>
                <th>Ag</th>
                <th>Pa</th>
                <th>Av</th>
                <th>Skills</th>
                <th>Inj</th>
                <th>G</th>
                <th>Cp</th>
                <th>Td</th>
                <th>It</th>
                <th>Cs</th>
                <th>Mvp</th>
                <th>SPP</th>
                <th>Cost</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(player, playerNumber) in playersInPositions" :key="playerNumber">
                <td>
                    {{ playerNumber }}
                </td>
                <template v-if="player !== null">
                    <td>
                        <img src="x.jpg">
                    </td>
                    <td>
                        <div>{{ player.name }} ({{ player.gender }})</div>
                        <div>{{ player.position }}</div>
                        <div style="font-size: larger; font-weight: bold;">
                            <a @click.prevent="movePlayerUp(playerNumber)" href="#">&#8679;</a> <a @click.prevent="movePlayerDown(playerNumber)" href="#">&#8681;</a>
                        </div>
                    </td>
                    <td>
                        {{ team.positionsLookup[player.positionId].stats.MA }}
                    </td>
                    <td>
                        {{ team.positionsLookup[player.positionId].stats.ST }}
                    </td>
                    <td>
                        {{ team.positionsLookup[player.positionId].stats.AG }}+
                    </td>
                    <td>
                        {{ team.positionsLookup[player.positionId].stats.PA }}+
                    </td>
                    <td>
                        {{ team.positionsLookup[player.positionId].stats.AV }}+
                    </td>
                    <td>
                        <div>
                            {{ team.positionsLookup[player.positionId].skills.join(', ') }}
                        </div>
                        <div>
                            {{ player.skills.join(', ') }}
                        </div>
                    </td>
                    <td>
                        {{ player.injuries }}
                    </td>
                    <td>
                        ?
                    </td>
                    <td>
                        {{ player.record.completions }}
                    </td>
                    <td>
                        {{ player.record.touchdowns }}
                    </td>
                    <td>
                        {{ player.record.interceptions }}
                    </td>
                    <td>
                        {{ player.record.casualties }}
                    </td>
                    <td>
                        {{ player.record.mvps }}
                    </td>
                    <td>
                        {{ player.record.spp }}
                    </td>
                    <td>
                        {{ team.positionsLookup[player.positionId].cost }}
                    </td>
                </template>
                <template v-else>
                    <td colspan="17">No player here</td>
                </template>
            </tr>
            </tbody>
        </table>
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
        team: {
            type: Object,
            required: true,
        },
    },
    watch: {
        team: {
            handler(newValue, oldValue) {
                // @ts-ignore: Property does not exist on type 'Vue'.
                this.refreshPlayersInPositions();
            },
            deep: true
        },
    }
})
export default class TeamComponent extends Vue {
    public positionsLookup: any = null;
    public playersInPositions: any = null;

    async mounted() {
        this.refreshPlayersInPositions();
    }

    public refreshPlayersInPositions() {
        const playersInPositions = {};

        for (let step = 1; step <= this.$props.team.ruleset.maxPlayers; step++) {
            playersInPositions[step] = null;
        }

        for (const player of this.$props.team.players) {
            playersInPositions[~~player.number] = player;
        }

        this.playersInPositions = playersInPositions;
    }

    public movePlayerUp(playerNumber: number) {
        this.movePlayer(playerNumber, 'UP');
    }

    public movePlayerDown(playerNumber: number) {
        this.movePlayer(playerNumber, 'DOWN');
    }

    private movePlayer(playerNumber: number, upOrDown: 'UP' | 'DOWN') {
        playerNumber = ~~playerNumber;

        if (playerNumber === 1 && upOrDown === 'UP') {
            return;
        }

        if (playerNumber === this.$props.team.ruleset.maxPlayers && upOrDown === 'DOWN') {
            return;
        }

        const swapPlayerNumber = upOrDown === 'UP' ? playerNumber - 1 : playerNumber + 1;

        let originPlayerId = null;
        let swapPlayerId = null;
        for (const player of this.$props.team.players) {
            if (player.number === playerNumber) {
                originPlayerId = player.id;
            }

            if (player.number === swapPlayerNumber) {
                swapPlayerId = player.id;
            }
        }

        if (originPlayerId) {
            this.$emit('change-player-number', originPlayerId, swapPlayerNumber);
        }

        if (swapPlayerId) {
            this.$emit('change-player-number', swapPlayerId, playerNumber);
        }
    }
}
</script>