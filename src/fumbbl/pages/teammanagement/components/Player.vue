<template>
    <tbody class="player"
        :draggable="playerNumber == dragSourcePlayerNumber"
        :class="{
            playerinrow: player !== null,
            dragsource: dragSourcePlayerNumber === ~~playerNumber,
            droptarget: dropTargetPlayerNumber === ~~playerNumber,
        }"
        :data-position="playerNumber"
        :data-id="player ? player.id : ''"
    >
        <template v-if="~~playerNumber === 1 && hasPlayer && ~~playerNumber !== dragSourcePlayerNumber && ~~playerNumber === dropTargetPlayerNumber">
            <tr class="seperator active">
                <td colspan="19">
                    <div class="line"></div>
                </td>
            </tr>
        </template>
        <template v-else>
            <tr class="seperator spacer">
                <td colspan="19">
                    <div class="line"></div>
                </td>
            </tr>
        </template>
        <tr class="main">
            <template v-if="player !== null">
                <td class="draghandle" @mousedown="makePlayerDraggable(~~playerNumber, player.id)" @mouseup="makePlayerDraggable(false, '')">
                    <template v-if="dragSourcePlayerNumber === false || dragSourcePlayerNumber === ~~playerNumber">
                        <svg fill="#000000" version="1.1" id="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                            width="15px" height="25px" viewBox="0 0 32 32" xml:space="preserve">
                            <title>draggable</title>
                            <rect x="10" y="6" width="4" height="4"/>
                            <rect x="18" y="6" width="4" height="4"/>
                            <rect x="10" y="14" width="4" height="4"/>
                            <rect x="18" y="14" width="4" height="4"/>
                            <rect x="10" y="22" width="4" height="4"/>
                            <rect x="18" y="22" width="4" height="4"/>
                            <rect id="_Transparent_Rectangle_" width="15" height="25" style="fill:none;"/>
                        </svg>
                    </template>
                    <template v-else>
                        <div class="droptargetindicator">&#8982;</div>
                    </template>
                </td>
            </template>
            <template v-else>
                <td class="draghandle">
                    <div class="droptargetindicator">&#8982;</div>
                </td>
            </template>
            <td class="playernumber">
                <span class="normalplayernumber">
                    {{ playerNumber }}
                </span>
                <div class="draggingnowindicator">&#8597;</div>
            </td>
            <template v-if="player !== null">
                <td>
                    <div class="iconouter">
                        <div class="iconinner" :style="player.iconStyle"></div>
                    </div>
                </td>
                <td>
                    <div class="playername">{{ player.name }}</div>
                    <div class="playerposition">{{ player.position }}</div>
                </td>
                <td>
                    {{ position.stats.MA }}
                </td>
                <td>
                    {{ position.stats.ST }}
                </td>
                <td>
                    {{ position.stats.AG }}+
                </td>
                <td>
                    {{ position.stats.PA }}+
                </td>
                <td>
                    {{ position.stats.AV }}+
                </td>
                <td class="skills">
                    <div class="positionskills">
                        {{ position.skills.join(', ') }}
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
                <td colspan="5" :class="{revealonhover: showEditAndDeletePlayer}">
                    <div>
                        <a href="#">Edit</a>&nbsp;&nbsp;&nbsp;<a href="#" @click.prevent="deletePlayer()">Delete</a>
                    </div>
                </td>
                <td :class="{hideonhover: showEditAndDeletePlayer}">
                    {{ player.record.completions }}
                </td>
                <td :class="{hideonhover: showEditAndDeletePlayer}">
                    {{ player.record.touchdowns }}
                </td>
                <td :class="{hideonhover: showEditAndDeletePlayer}">
                    {{ player.record.interceptions }}
                </td>
                <td :class="{hideonhover: showEditAndDeletePlayer}">
                    {{ player.record.casualties }}
                </td>
                <td :class="{hideonhover: showEditAndDeletePlayer}">
                    {{ player.record.mvps }}
                </td>
                <td>
                    {{ player.record.spp }}
                </td>
                <td>
                    {{ position.cost }}
                </td>
            </template>
            <template v-else>
                <td colspan="17" class="emptyplayer">
                    <div class="emptyplayeractive">
                        <div class="buypositionlabel">Buy: </div>
                        <div v-for="position in positionsAvailableToAdd" :key="position.id" class="positiontoadd">
                            <a @click.prevent="addPlayer(position.id)" href="#">{{ position.name }}</a> ({{ position.cost/1000 }}k)
                        </div>
                    </div>
                    <div class="emptyplayerinactive">
                        Empty
                    </div>
                </td>
            </template>
        </tr>
        <tr class="seperator" :class="getSeperatorClasses()">
            <td colspan="19">
                <div class="line"></div>
            </td>
        </tr>
    </tbody>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';

@Component({
    components: {
    },
    props: {
        teamMode: {
            type: String,
            required: true,
        },
        playerNumber: {
            type: Number,
            required: true,
        },
        player: {
            validator: function (player) {
                return typeof player === 'object' || player === null;
            }
        },
        roster: {
            type: Object,
            required: true,
        },
        position: {
            validator: function (position) {
                return typeof position === 'object' || position === null;
            }
        },
        dragSourcePlayerNumber: {
            validator: function (dragSourcePlayerNumber) {
                return typeof dragSourcePlayerNumber === 'number' || dragSourcePlayerNumber === false;
            }
        },
        dropTargetPlayerNumber: {
            validator: function (dropTargetPlayerNumber) {
                return typeof dropTargetPlayerNumber === 'number' || dropTargetPlayerNumber === false;
            }
        },
        playerNumbersWithPlayerBelow: {
            type: Array,
            required: true,
        },
    },
    watch: {
    }
})
export default class TeamComponent extends Vue {
    private get showEditAndDeletePlayer(): boolean {
        return this.$props.teamMode === 'CREATE' || this.$props.teamMode === 'POST_GAME'
    }

    private get positionsAvailableToAdd(): any[] {
        // also update according to treasury to spend
        return this.$props.roster.positions.filter((position) => {
            return true;
        }).map((position) => {
            return {
                id: ~~position.id,
                name: position.title,
                cost: position.cost,
            }
        });
    }

    public getSeperatorClasses() {
        const draggingDownward = this.$props.dropTargetPlayerNumber > this.$props.dragSourcePlayerNumber;
        const ourPlayerNumberIsTheDropTarget = this.$props.playerNumber === this.$props.dropTargetPlayerNumber;
        if (
            draggingDownward &&
            ourPlayerNumberIsTheDropTarget &&
            this.hasPlayer
        ) {
            return { active: true };
        }

        const draggingUpward = this.$props.dropTargetPlayerNumber < this.$props.dragSourcePlayerNumber;
        const ourPlayerNumberIsImmediatelyAboveDropTarget = this.$props.dropTargetPlayerNumber !== false && this.$props.playerNumber === this.$props.dropTargetPlayerNumber - 1;
        if (
            draggingUpward &&
            ourPlayerNumberIsImmediatelyAboveDropTarget &&
            this.hasPlayerBelow
        ) {
            return { active: true };
        }

        return {
            normal: true,
        };
    }

    public get hasPlayer() {
        return this.$props.player !== null;
    }

    public get hasPlayerBelow() {
        return this.$props.playerNumbersWithPlayerBelow.includes(~~this.$props.playerNumber);
    }

    public addPlayer(positionId: number) {
        this.$emit('add-player', this.$props.playerNumber, positionId);
    }

    public deletePlayer() {
        this.$emit('delete-player', this.$props.playerNumber);
    }

    public makePlayerDraggable(playerNumber: number, playerId: string) {
        this.$emit('make-player-draggable', playerNumber, playerId);
    }
}
</script>