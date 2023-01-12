<template>
    <div class="playerrow"
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
            <div class="seperator active"><div class="line"></div></div>
        </template>
        <template v-else>
            <div class="seperator spacer"><div class="line"></div></div>
        </template>
        <div class="main">
            <template v-if="player !== null">
                <div class="cell draghandle" @mousedown="makePlayerDraggable(~~playerNumber, player.id)" @mouseup="makePlayerDraggable(false, '')">
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
                </div>
            </template>
            <template v-else>
                <div class="cell draghandle">
                    <div class="droptargetindicator">&#8982;</div>
                </div>
            </template>
            <div class="cell playernumber">
                <span class="normalplayernumber">
                    {{ playerNumber }}
                </span>
                <div class="draggingnowindicator">&#8597;</div>
            </div>
            <template v-if="player !== null">
                <div class="cell playericon">
                    <div class="iconouter">
                        <div class="iconinner" :style="player.iconStyle"></div>
                    </div>
                </div>
                <div class="cell playerdetails">
                    <div class="playername">{{ player.name }}</div>
                    <div class="playerposition">{{ player.position }}</div>
                </div>
                <div class="cell statma">
                    {{ position.stats.MA }}
                </div>
                <div class="cell statst">
                    {{ position.stats.ST }}
                </div>
                <div class="cell statag">
                    {{ position.stats.AG }}+
                </div>
                <div  class="cell statpa">
                    {{ position.stats.PA }}+
                </div>
                <div class="cell statav">
                    {{ position.stats.AV }}+
                </div>
                <div class="cell skills">
                    <div class="positionskills">
                        {{ position.skills.join(', ') }}
                    </div>
                    <div class="playerskills">
                        {{ player.skills.join(', ') }}
                    </div>
                </div>
                <div class="cell injuries">
                    {{ player.injuries }}
                </div>
                <div class="cell spp">
                    {{ player.record.spp }}
                </div>
                <div class="cell cost">
                    {{ position.cost/1000 }}k
                </div>
            </template>
            <template v-else>
                <div class="emptyplayer">
                    <div>
                        Buy:
                        <span v-for="position in positionsAvailableToAdd" :key="position.id">
                            <a @click.prevent="addPlayer(position.id)" href="#">{{ position.name }}</a> ({{ position.cost/1000 }}k) | 
                        </span>
                    </div>
                </div>
            </template>
        </div>
        <div style="display: none;">
            TODO: Player foldout
            <div v-if="player !== null">
                <div>
                    ? (games played)
                </div>
                <div>
                    {{ player.record.completions }}
                </div>
                <div>
                    {{ player.record.touchdowns }}
                </div>
                <div>
                    {{ player.record.interceptions }}
                </div>
                <div>
                    {{ player.record.casualties }}
                </div>
                <div>
                    {{ player.record.mvps }}
                </div>
            </div>
        </div>
        <div class="seperator" :class="getSeperatorClasses()"><div class="line"></div></div>
    </div>
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
        teamCreationBudgetRemaining: {
            type: Number,
            required: true,
        },
        positionsAvailableToAdd: {
            type: Array,
            required: true,
        },
    },
    watch: {
    }
})
export default class TeamComponent extends Vue {
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