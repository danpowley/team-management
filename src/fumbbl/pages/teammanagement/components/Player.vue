<template>
    <div class="playerrow"
        :draggable="isDragSource"
        :class="{
            playerinrow: player !== null,
            dragsource: isDragSource,
            droptarget: isDropTarget,
        }"
        :data-team-number="playerNumber"
        :data-player-id="player ? player.id : ''"
    >
        <template v-if="isFirstTeamNumber && hasPlayer && !isDragSource && isDropTarget">
            <div class="seperator active"><div class="line"></div></div>
        </template>
        <template v-else>
            <div class="seperator spacer"><div class="line"></div></div>
        </template>
        <div class="main">
            <template v-if="player !== null">
                <div v-if="allFoldOutsClosed" class="cell draghandle" @mousedown="makePlayerDraggable()" @mouseup="endPlayerDraggable()">
                    <template v-if="!isAnyPlayerDragInProgress || isDragSource">
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
                <div v-else class="cell draghandledisabled">
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
                    <div class="iconusingbackground" :style="rosterIconManager.getIconStyle(player.positionId, player.iconRowVersionPosition)"></div>
                </div>
                <div class="cell playerdetails">
                    <div class="playername">
                        <a href="#" @click.exact.prevent="toggleFoldOutMore(false)" @click.ctrl.prevent="toggleFoldOutMore(true)">{{ player.name }}</a>
                    </div>
                    <div class="playerposition">{{ player.position }}</div>
                </div>
                <div class="cell statma">
                    {{ position.stats.Movement }}
                </div>
                <div class="cell statst">
                    {{ position.stats.Strength }}
                </div>
                <div class="cell statag">
                    {{ position.stats.Agility }}+
                </div>
                <div  class="cell statpa">
                    {{ position.stats.Passing ? `${position.stats.Passing}+` : '-' }}
                </div>
                <div class="cell statav">
                    {{ position.stats.Armour }}+
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
                    <template v-else-if="isFoldOutBuy">
                        <span>Choose position to buy.</span> <a href="#" @click.prevent="performFoldOut('CLOSED')">Cancel</a>
                    </template>
                    <template v-else>
                        <a href="#" @click.prevent="performFoldOut('BUY')">Buy player</a>
                    </template>
                </div>
            </template>
        </div>
        <div class="foldout foldoutbuy" :class="{active: isFoldOutBuy}" :style="{maxHeight: isFoldOutBuy ? `${rosterPositionDataForBuyingPlayer.length * 65}px` : '0'}">
            <buyplayer v-if="(player === null || showBuyDialogTemporarily) && ! showPlayerInfoFoldoutTemporarily"
                :roster-position-data-for-buying-player="rosterPositionDataForBuyingPlayer"
                :roster-icon-manager="rosterIconManager"
                @add-player="handleAddPlayer"
            ></buyplayer>
        </div>
        <div class="foldout foldoutmore" :class="{active: isFoldOutMore}">
            <playerdetails v-if="(player !== null || showPlayerInfoFoldoutTemporarily) && ! showBuyDialogTemporarily"
                :player="player"
                @delete-player="handleDeletePlayer()"
            ></playerdetails>
        </div>
        <div class="seperator" :class="getSeperatorClasses()"><div class="line"></div></div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';
import { PlayerRowFoldOutMode } from "../include/Interfaces";
import BuyPlayerComponent from "./BuyPlayer.vue";
import PlayerDetailsComponent from "./PlayerDetails.vue";

@Component({
    components: {
        'buyplayer': BuyPlayerComponent,
        'playerdetails': PlayerDetailsComponent,
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
        position: {
            validator: function (position) {
                return typeof position === 'object' || position === null;
            }
        },
        isFoldOutBuy: {
            type: Boolean,
            required: true,
        },
        isFoldOutMore: {
            type: Boolean,
            required: true,
        },
        allFoldOutsClosed: {
            type: Boolean,
            required: true,
        },
        isFirstTeamNumber: {
            type: Boolean,
            required: true,
        },
        isAnyPlayerDragInProgress: {
            type: Boolean,
            required: true,
        },
        isDragSource: {
            type: Boolean,
            required: true,
        },
        isDropTarget: {
            type: Boolean,
            required: true,
        },
        useActiveSeperatorForDragDrop: {
            type: Boolean,
            required: true,
        },
        teamCreationBudgetRemaining: {
            type: Number,
            required: true,
        },
        rosterPositionDataForBuyingPlayer: {
            type: Array,
            required: true,
        },
        rosterIconManager: {
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
    private intervalIdsScrollDuringCssTransition: number[] = [];

    private mounted() {
        this.$el.getElementsByClassName('foldout')[0].addEventListener('transitionend', () => {
            this.clearIntervalIdsScrollDuringCssTransition();
        });
    }

    public getSeperatorClasses() {
        if (this.$props.useActiveSeperatorForDragDrop) {
            return { active: true };
        }

        return {
            normal: true,
        };
    }

    public get hasPlayer() {
        return this.$props.player !== null;
    }

    private performFoldOut(playerRowFoldOutMode: PlayerRowFoldOutMode, multipleOpenMode = false) {
        this.$emit('fold-out', this.$props.playerNumber, playerRowFoldOutMode, multipleOpenMode);
        this.enableSmartScroll();
    }

    private enableSmartScroll() {
        this.clearIntervalIdsScrollDuringCssTransition();
        const onlyRunUntil = Date.now() + 1000;
        const intervalId = setInterval(() => {
            // prevent running indefinitely on a cancelled transition
            if (Date.now() > onlyRunUntil) {
                this.clearIntervalIdsScrollDuringCssTransition();
                return;
            }

            // when bottom of player row extends past end of screen
            if (this.$el.getBoundingClientRect().bottom > window.innerHeight) {
                this.$el.scrollIntoView({behavior: 'smooth', block: 'end'});
            }

            // when top of player row extends above start of screen
            if (this.$el.getBoundingClientRect().top < 0) {
                this.$el.scrollIntoView({behavior: 'smooth', block: 'center'});
            }
        });
        this.intervalIdsScrollDuringCssTransition.push(intervalId);
    }

    private clearIntervalIdsScrollDuringCssTransition() {
        for (const intervalId of this.intervalIdsScrollDuringCssTransition) {
            clearInterval(intervalId);
        }
        this.intervalIdsScrollDuringCssTransition = [];
    }

    private toggleFoldOutMore(multipleOpenMode: boolean) {
        if (this.$props.isFoldOutMore) {
            this.performFoldOut('CLOSED', multipleOpenMode);
        } else {
            this.performFoldOut('MORE', multipleOpenMode);
        }
    }

    public makePlayerDraggable() {
        this.$emit('make-player-draggable', this.$props.playerNumber, this.$props.player.id);
    }

    public endPlayerDraggable() {
        this.$emit('end-player-draggable');
    }

    public handleAddPlayer(positionId: number) {
        // prevent UI from updating until after the animation has updated.
        this.showBuyDialogTemporarily = true;
        setTimeout(() => {this.showBuyDialogTemporarily = false;}, this.delayForFoldoutAnimations);

        this.performFoldOut('CLOSED');
        this.$emit('add-player', this.$props.playerNumber, positionId);
    }

    public handleDeletePlayer() {
        this.showPlayerInfoFoldoutTemporarily = true;
        setTimeout(() => {this.showPlayerInfoFoldoutTemporarily = false;}, this.delayForFoldoutAnimations);

        this.performFoldOut('CLOSED');
        this.$emit('delete-player', this.$props.playerNumber);
    }
}
</script>