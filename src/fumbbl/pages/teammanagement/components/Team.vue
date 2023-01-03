<template>
    <div class="team" v-if="team !== null">
        <a @click.prevent="editMode = !editMode">Edit mode toggle</a>
        <table class="infotable teamtable">
            <thead>
            <tr>
                <th></th>
                <th></th>
                <th>Player</th>
                <th>Ma</th>
                <th>St</th>
                <th>Ag</th>
                <th>Pa</th>
                <th>Av</th>
                <th>Skills</th>
                <th>Inj</th>
                <th>G</th>
                <template v-if="editMode === false">
                    <th>Cp</th>
                    <th>Td</th>
                    <th>It</th>
                    <th>Cs</th>
                    <th>Mvp</th>
                </template>
                <template v-else>
                    <th colspan="5" class="editcontrolscolumn">
                        Edit
                    </th>
                </template>
                <th>SPP</th>
                <th>Cost</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(player, playerNumber) in playersInPositions" :key="playerNumber">
                <td class="playernumber">
                    {{ playerNumber }}
                </td>
                <template v-if="player !== null">
                    <td>
                        <div v-if="playerIconStyles !== null" class="iconouter">
                            <div class="iconinner" :style="playerIconStyles[player.id]"></div>
                        </div>
                    </td>
                    <td>
                        <div class="playername">{{ player.name }}</div>
                        <div class="playerposition">{{ player.position }}</div>
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
                        <div class="positionskills">
                            {{ team.positionsLookup[player.positionId].skills.join(', ') }}
                        </div>
                        <div class="playerskills">
                            {{ player.skills.join(', ') }}
                        </div>
                    </td>
                    <td>
                        {{ player.injuries }}
                    </td>
                    <td>
                        ?
                    </td>
                    <template v-if="editMode === false">
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
                    </template>
                    <template v-else>
                        <td colspan="5">
                            <div style="font-size: 30px; font-weight: bold;">
                                <a @click.prevent="movePlayerUp(playerNumber)" href="#">&#8679;</a> <a @click.prevent="movePlayerDown(playerNumber)" href="#">&#8681;</a>
                            </div>
                        </td>
                    </template>
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
    public editMode: boolean = false;
    public positionsLookup: any = null;
    public playersInPositions: any = null;
    public playerIconStyles: any = null;

    async mounted() {
        this.refreshPlayersInPositions();
        await this.refreshPlayerIconStyles();
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

    public async refreshPlayerIconStyles() {
        const positionIcons = {};
        for (const position of this.$props.team.roster.positions) {
            positionIcons[position.id] = {iconId: position.icon, iconData: await this.getIconData(position.icon)};
        }

        const playerIconStyles = {};
        for (const player of this.$props.team.players) {
            const playerIconStyle = this.getPlayerIconStyle(positionIcons[player.positionId]);
            playerIconStyles[player.id] = playerIconStyle;
        }

        this.playerIconStyles = playerIconStyles;
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

    public async getIconData(positionIconId: number): Promise<any> {
        const imageDimensions = (imageUrl): Promise<{width: number, height: number}> =>
            new Promise((resolve, reject) => {
                const img = new Image()

                img.onload = () => {
                    const { naturalWidth: width, naturalHeight: height } = img;
                    resolve({ width, height });
                }

                img.onerror = () => {
                    reject('There was some problem with the image.');
                }

                img.src = imageUrl;
            }
        );

        try {
            const dimensions = await imageDimensions(`https://fumbbl.com/i/${positionIconId}`);
            const iconSize = dimensions.width / 4;
            let counter = 0;
            const iconRowVersionPositions = [];
            while (counter < dimensions.height) {
                iconRowVersionPositions.push(-1 * counter);
                counter += iconSize;
            }
            return {
                size: iconSize,
                iconRowVersionPositions: iconRowVersionPositions,
            };
        } catch(error) {
            return 30;
        }
    }

    public getPlayerIconStyle(positionIconInfo: any): string {
        const iconSize = positionIconInfo.iconData.size;

        const iconVersionPosition = positionIconInfo.iconData.iconRowVersionPositions[Math.floor(Math.random() * positionIconInfo.iconData.iconRowVersionPositions.length)]

        return `width: ${iconSize}px; height: ${iconSize}px; background: rgba(0, 0, 0, 0) url("https://fumbbl.com/i/${positionIconInfo.iconId}") repeat scroll 0px ${iconVersionPosition}px;'"`;
    }
}
</script>