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
            <template v-if="player !== null && ! showBuyDialogTemporarily">
                <div class="cell playericoncontainer">
                    <div class="iconusingbackground" :style="playerIconStyle"></div>
                </div>
                <div class="cell playerdetails">
                    <div class="playername">
                        <a href="#" @click.prevent="foldOutToggle()">{{ player.name }}</a>
                    </div>
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
                    <template v-if="showBuyDialogTemporarily">
                        Please wait, buying player...
                    </template>
                    <template v-else-if="showPlayerInfoFoldoutTemporarily">
                        Please wait, removing player...
                    </template>
                    <template v-else-if="foldOut">
                        <span>Choose position to buy.</span> <a href="#" @click.prevent="foldOutToggle()">Cancel</a>
                    </template>
                    <template v-else>
                        <a href="#" @click.prevent="foldOutToggle()">Buy player</a>
                    </template>
                </div>
            </template>
        </div>
        <div class="foldout" :class="{active: foldOut}" :style="{maxHeight: foldOut ? `${roster.positions.length * 65}px` : '0'}">
            <div v-if="(player === null || showBuyDialogTemporarily) && ! showPlayerInfoFoldoutTemporarily" class="buyingplayer">
                <table class="buyingpositionals">
                    <thead>
                        <th>Buy?</th>
                        <th>Cost</th>
                        <th colspan="2">Position</th>
                        <th>Quant.</th>
                        <th>Ma</th>
                        <th>St</th>
                        <th>Ag</th>
                        <th>Pa</th>
                        <th>Av</th>
                        <th>Skills</th>
                    </thead>
                    <tbody>
                    <tr v-for="positionData in sortedRosterPositionData" :key="positionData.id">
                        <td class="buylink">
                            <template v-if="positionData.quantityHired < positionData.quantityAllowed">
                                <a
                                    @click.prevent="addPlayer(positionData.id)"
                                    href="#" :title="!positionData.canAfford ? 'Insufficient treasury' : ''"
                                >Buy<template v-if="!positionData.canAfford"> &#9888;</template></a>
                            </template>
                            <template v-else>
                                n/a
                            </template>
                        </td>
                        <td>{{ positionData.cost/1000 }}k</td>
                        <td>
                            <div class="iconusingbackground" :style="getIconStyle(positionData.id, null)"></div>
                        </td>
                        <td class="positionname">{{ positionData.name }}</td>
                        <td>0-{{ positionData.quantityAllowed }}{{ positionData.quantityHired > 0 ? ` (${positionData.quantityHired}*)` : '' }}</td>
                        <td>{{ positionData.stats.MA }}</td>
                        <td>{{ positionData.stats.ST }}</td>
                        <td>{{ positionData.stats.AG }}</td>
                        <td>{{ positionData.stats.PA }}</td>
                        <td>{{ positionData.stats.AV }}</td>
                        <td class="skills">{{ positionData.skills.join(', ') }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="(player !== null || showPlayerInfoFoldoutTemporarily) && ! showBuyDialogTemporarily" class="playerinfofoldout">
                <div class="playerinfosection playeredit">
                    <a href="#" @click.prevent="deletePlayer()" style="float: right;">Remove player</a>
                    <div class="title">Edit</div>
                    <p>Todo: decide what can be edited here.</p>
                    <ul>
                        <li>Name</li>
                        <li>Gender</li>
                        <li>Profile (after creation?)</li>
                        <li>Player card image</li>
                    </ul>
                </div>
                <div class="playerinfosection playerdetails">
                    <div class="title">Details</div>
                    <p>Todo: decide what to display here.</p>
                    <ul>
                        <li>Games played: [data unavailable]</li>
                        <li>Completions: {{ player ? player.record.completions : '0' }}</li>
                        <li>Touchdowns: {{ player ? player.record.touchdowns : '0' }}</li>
                        <li>Interceptions: {{ player ? player.record.interceptions : '0' }}</li>
                        <li>Casualties: {{ player ? player.record.casualties : '0' }}</li>
                        <li>MVPs: {{ player ? player.record.mvps : '0' }}</li>
                    </ul>
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
        rosterPositionData: {
            type: Object,
            required: true,
        },
        positionsIconData: {
            type: Object,
            required: true,
        },
    },
    watch: {
    }
})
export default class PlayerComponent extends Vue {
    readonly delayForFoldoutAnimations = 600;
    private foldOut: boolean = false;
    private showBuyDialogTemporarily: boolean = false;
    private showPlayerInfoFoldoutTemporarily: boolean = false;

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

    private foldOutToggle() {
        this.foldOut = ! this.foldOut;
    }

    public addPlayer(positionId: number) {
        // prevent UI from updating until after the animation has updated.
        this.showBuyDialogTemporarily = true;
        setTimeout(() => {this.showBuyDialogTemporarily = false;}, this.delayForFoldoutAnimations);

        this.foldOut = false;
        this.$emit('add-player', this.$props.playerNumber, positionId);
    }

    public deletePlayer() {
        this.showPlayerInfoFoldoutTemporarily = true;
        setTimeout(() => {this.showPlayerInfoFoldoutTemporarily = false;}, this.delayForFoldoutAnimations);

        this.foldOut = false;
        console.log('fold out set to false', this.foldOut);
        this.$emit('delete-player', this.$props.playerNumber);
    }

    public makePlayerDraggable(playerNumber: number, playerId: string) {
        this.$emit('make-player-draggable', playerNumber, playerId);
    }

    private get playerIconStyle(): string {
        return this.getIconStyle(this.$props.player.positionId, this.$props.player.iconRowVersionPosition);
    }

    private getIconStyle(positionId: number, iconRowVersionPosition: number | null): string {
        const positionIconInfo = this.$props.positionsIconData[positionId];

        if (iconRowVersionPosition === null) {
            iconRowVersionPosition = 0;
        }

        const iconSize = positionIconInfo.iconData.size;

        const iconVersionPosition = positionIconInfo.iconData.iconRowVersionPositions[iconRowVersionPosition];

        return `width: ${iconSize}px; height: ${iconSize}px; background: rgba(0, 0, 0, 0) url("https://fumbbl.com/i/${positionIconInfo.iconId}") repeat scroll 0px ${iconVersionPosition}px;'"`;
    }

    private get sortedRosterPositionData(): any[] {
        return Object.values(this.$props.rosterPositionData).sort((a: any, b: any) => {
            if (a.cost === b.cost) {
                return 0;
            }
            return a.cost > b.cost ? -1 : 1;
        });
    }
}
</script>