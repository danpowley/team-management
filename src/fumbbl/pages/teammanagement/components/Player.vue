<template>
    <div class="playerrow"
        :draggable="teamSheetEntry.getIsDragSource()"
        :class="{
            playerinrow: teamSheetEntry.hasPlayer(),
            dragsource: teamSheetEntry.getIsDragSource(),
            droptarget: teamSheetEntry.getIsDropTarget(),
        }"
        @dragenter="handleDragEnter()"
        @dragover="handleDragOver($event)"
        @drop="handleDrop($event)"
        @dragend="handleDragEnd()"
    >
        <template v-if="teamSheetEntry.isFirst() && teamSheetEntry.hasPlayer() && !teamSheetEntry.getIsDragSource() && teamSheetEntry.getIsDropTarget()">
            <div class="seperator active"><div class="line"></div></div>
        </template>
        <template v-else>
            <div class="seperator spacer"><div class="line"></div></div>
        </template>
        <div v-if="originalPlayerForRedraft">
            Original: {{ originalPlayerForRedraft.getPlayerName() }}
            <select @change="keepOrFire($event)">
                <option>KEEP</option>
                <option>FIRE</option>
            </select>
        </div>
        <div class="main">
            <template v-if="teamSheetEntry.hasPlayer()">
                <div v-if="allFoldOutsClosed" class="cell draghandle" @mousedown="makePlayerDraggable()" @mouseup="endPlayerDraggable()">
                    <template v-if="!isAnyPlayerDragInProgress || teamSheetEntry.getIsDragSource()">
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
                    {{ teamSheetEntry.getNumber() }}
                </span>
                <div class="draggingnowindicator">&#8597;</div>
            </div>
            <template v-if="teamSheetEntry.hasPlayer() && ! showBuyDialogTemporarily">
                <div class="cell playericoncontainer">
                    <div class="iconusingbackground" :style="rosterIconManager.getIconStyle(teamSheetEntry.getPlayer().getPositionId(), teamSheetEntry.getPlayer().getIconRowVersionPosition())"></div>
                </div>
                <div class="cell playerdetails">
                    <div class="playername" :title="teamSheetEntry.getPlayer().getPlayerName()">
                        <a href="#" @click.exact.prevent="toggleFoldOutMore(false)" @click.ctrl.prevent="toggleFoldOutMore(true)">{{ teamSheetEntry.getPlayer().getPlayerName() }}</a>
                    </div>
                    <div class="playerposition" :title="teamSheetEntry.getPlayer().getPositionName()">{{ teamSheetEntry.getPlayer().getPositionName() }}</div>
                </div>
                <div class="cell statma">
                    {{ teamSheetEntry.getPlayer().getPositionStats().Movement }}
                </div>
                <div class="cell statst">
                    {{ teamSheetEntry.getPlayer().getPositionStats().Strength }}
                </div>
                <div class="cell statag">
                    {{ teamSheetEntry.getPlayer().getPositionStats().Agility }}+
                </div>
                <div  class="cell statpa">
                    {{ teamSheetEntry.getPlayer().getPositionStats().Passing ? `${teamSheetEntry.getPlayer().getPositionStats().Passing}+` : '-' }}
                </div>
                <div class="cell statav">
                    {{ teamSheetEntry.getPlayer().getPositionStats().Armour }}+
                </div>
                <div class="cell skills">
                    <div class="positionskills" :title="teamSheetEntry.getPlayer().getPositionSkills().join(', ')">
                        {{ teamSheetEntry.getPlayer().getPositionSkills().join(', ') }}
                    </div>
                    <div class="playerskills" :title="teamSheetEntry.getPlayer().getSkills().join(', ')">
                        {{ teamSheetEntry.getPlayer().getSkills().join(', ') }}
                    </div>
                </div>
                <div class="cell injuries">
                    {{ teamSheetEntry.getPlayer().getInjuries().join(', ') }}
                </div>
                <div class="cell spp">
                    {{ teamSheetEntry.getPlayer().getRecord().spp }}
                </div>
                <div class="cell cost">
                    {{ teamSheetEntry.getPlayer().getPositionCost()/1000 }}k
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
            <buyplayer v-if="(teamSheetEntry.getPlayer() === null || showBuyDialogTemporarily) && ! showPlayerInfoFoldoutTemporarily"
                :roster-position-data-for-buying-player="rosterPositionDataForBuyingPlayer"
                :roster-icon-manager="rosterIconManager"
                @add-player="handleAddPlayer"
            ></buyplayer>
        </div>
        <div class="foldout foldoutmore" :class="{active: isFoldOutMore}">
            <playerdetails v-if="(teamSheetEntry.hasPlayer() || showPlayerInfoFoldoutTemporarily) && ! showBuyDialogTemporarily"
                :team-sheet-entry="teamSheetEntry"
                @delete-player="handleDeletePlayer()"
                @close="performFoldOut('CLOSED')"
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
        teamSheetEntry: {
            type: Object,
            required: true,
        },
        allFoldOutsClosed: {
            type: Boolean,
            required: true,
        },
        isAnyPlayerDragInProgress: {
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
        originalPlayerForRedraft: {
            validator: function (team) {
                return typeof team === 'object' || team === null;
            }
        },
    },
    watch: {
    }
})
export default class PlayerComponent extends Vue {
    readonly delayForFoldoutAnimations = 600;
    private showBuyDialogTemporarily: boolean = false;
    private showPlayerInfoFoldoutTemporarily: boolean = false;
    private intervalIdsScrollDuringCssTransition: number[] = [];

    private mounted() {
        this.$el.getElementsByClassName('foldout')[0].addEventListener('transitionend', () => {
            this.clearIntervalIdsScrollDuringCssTransition();
        });
    }

    private get isFoldOutBuy(): boolean {
        return this.$props.teamSheetEntry.getFoldOut() === 'BUY';
    }

    private get isFoldOutMore(): boolean {
        return this.$props.teamSheetEntry.getFoldOut() === 'MORE';
    }

    public getSeperatorClasses() {
        if (this.$props.useActiveSeperatorForDragDrop) {
            return { active: true };
        }

        return {
            normal: true,
        };
    }

    private performFoldOut(playerRowFoldOutMode: PlayerRowFoldOutMode, multipleOpenMode = false) {
        this.$emit('fold-out', this.$props.teamSheetEntry.getNumber(), playerRowFoldOutMode, multipleOpenMode);
        this.enableSmartScroll();
        if (playerRowFoldOutMode === 'CLOSED') {
            this.$props.teamSheetEntry.refreshUpdatePlayerDetails();
        }
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
        if (this.isFoldOutMore) {
            this.performFoldOut('CLOSED', multipleOpenMode);
        } else {
            this.performFoldOut('MORE', multipleOpenMode);
        }
    }

    public makePlayerDraggable() {
        this.$emit('make-player-draggable', this.$props.teamSheetEntry.getNumber(), this.$props.teamSheetEntry.getPlayer().getId());
    }

    public endPlayerDraggable() {
        this.$emit('end-player-draggable');
    }

    public handleAddPlayer(positionId: number) {
        // prevent UI from updating until after the animation has updated.
        this.showBuyDialogTemporarily = true;
        setTimeout(() => {this.showBuyDialogTemporarily = false;}, this.delayForFoldoutAnimations);

        this.performFoldOut('CLOSED');
        this.$emit('add-player', this.$props.teamSheetEntry.getNumber(), positionId);
    }

    public handleDeletePlayer() {
        this.showPlayerInfoFoldoutTemporarily = true;
        setTimeout(() => {this.showPlayerInfoFoldoutTemporarily = false;}, this.delayForFoldoutAnimations);

        this.performFoldOut('CLOSED');
        this.$emit('delete-player', this.$props.teamSheetEntry.getNumber());
    }

    private handleDragEnter() {
        this.$emit('drag-enter', this.$props.teamSheetEntry.getNumber());
    }

    private handleDragOver(event) {
        event.preventDefault();
        return false;
    }

    private handleDrop(event) {
        this.$emit('drop', this.$props.teamSheetEntry.getNumber(), this.$props.teamSheetEntry.hasPlayer());
        event.stopPropagation();
        return false;
    }

    private handleDragEnd() {
        this.$emit('drag-end');
    }

    public keepOrFire(event): void {
        const keepOrFire = event.target.value;

        if (keepOrFire === 'KEEP') {
            this.$emit('redraft-keep-player', this.$props.teamSheetEntry.getNumber());
        }

        if (keepOrFire === 'FIRE') {
            this.$emit('redraft-fire-player', this.$props.teamSheetEntry.getNumber());
        }
    }
}
</script>