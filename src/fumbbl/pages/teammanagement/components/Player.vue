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
        <div class="main" :class="{missnextgame: teamSheetEntry.hasPlayer() && teamSheetEntry.getPlayer().isMissNextGame()}">
            <template v-if="accessControl.canEdit()">
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
            </template>
            <div class="cell playernumber">
                <span class="normalplayernumber">
                    {{ teamSheetEntry.getNumber() }}
                </span>
                <div class="draggingnowindicator">&#8597;</div>
            </div>
            <template v-if="teamSheetEntry.hasPlayer()">
                <div class="cell playericoncontainer">
                    <div class="iconusingbackground" :style="rosterIconManager.getIconStyle(teamSheetEntry.getPlayer().getPositionId(), teamSheetEntry.getPlayer().getIconRowVersionPosition())"></div>
                </div>
                <div class="cell playerdetails">
                    <div class="playername" :title="teamSheetEntry.getPlayer().getPlayerName()">
                        <span v-if="teamSheetEntry.getPlayer().isTemporaryPlayerWithoutName()">Loading...</span>
                        <span v-else-if="teamSheetEntry.getPlayer().isTemporaryPlayer()">{{ teamSheetEntry.getPlayer().getPlayerName() }}</span>
                        <a v-else href="#" @click.exact.prevent="toggleFoldOutMore(false)" @click.ctrl.prevent="toggleFoldOutMore(true)" :title="`Player: ${teamSheetEntry.getPlayer().getPlayerName()}, ID: ${teamSheetEntry.getPlayer().getId()}`">{{ teamSheetEntry.getPlayer().getPlayerName() }}</a>
                    </div>
                    <div class="playerposition" :title="teamSheetEntry.getPlayer().getPositionName()">{{ teamSheetEntry.getPlayer().getPositionName() }}</div>
                </div>
                <div class="cell statma">
                    <span :class="{
                        statincrease: teamSheetEntry.getPlayer().hasMovementIncrease,
                        statdecrease: teamSheetEntry.getPlayer().hasMovementDecrease,
                        }">{{ teamSheetEntry.getPlayer().movementStat }}</span>
                </div>
                <div class="cell statst">
                    <span :class="{
                        statincrease: teamSheetEntry.getPlayer().hasStrengthIncrease,
                        statdecrease: teamSheetEntry.getPlayer().hasStrengthDecrease,
                        }">{{ teamSheetEntry.getPlayer().strengthStat }}</span>
                </div>
                <div class="cell statag">
                    <span :class="{
                        statincrease: teamSheetEntry.getPlayer().hasAgilityIncrease,
                        statdecrease: teamSheetEntry.getPlayer().hasAgilityDecrease,
                        }">{{ teamSheetEntry.getPlayer().agilityStat }}+</span>
                </div>
                <div class="cell statpa">
                    <span v-if="teamSheetEntry.getPlayer().getPositionStats().Passing" :class="{
                        statincrease: teamSheetEntry.getPlayer().hasPassingIncrease,
                        statdecrease: teamSheetEntry.getPlayer().hasPassingDecrease,
                        }">{{ teamSheetEntry.getPlayer().passingStat }}+</span>
                    <span v-else>-</span>
                </div>
                <div class="cell statav">
                    <span :class="{
                        statincrease: teamSheetEntry.getPlayer().hasArmourIncrease,
                        statdecrease: teamSheetEntry.getPlayer().hasArmourDecrease,
                        }">{{ teamSheetEntry.getPlayer().armourStat }}+</span>
                </div>
                <div class="cell skills">
                    <div class="positionskills" :title="teamSheetEntry.getPlayer().getPositionSkills().join(', ')">
                        {{ teamSheetEntry.getPlayer().getPositionSkills().join(', ') }}
                    </div>
                    <div class="playerskills" :title="teamSheetEntry.getPlayer().getSkills().join(', ')">
                        {{ teamSheetEntry.getPlayer().getSkills().join(', ') }}
                    </div>
                </div>
                <div v-if="! accessControl.canCreate()" class="cell injuries" :title="'Injuries in chronological order: ' + teamSheetEntry.getPlayer().getInjuries().join(',')">
                    {{ displayInjuries(teamSheetEntry.getPlayer().getInjuries()) }}
                </div>
                <div v-if="! accessControl.canCreate()" class="cell spp" :title="sppSummaryText">
                    <span class="spendable">{{ sppDisplayInfo.spendable }}/</span><span class="maxlimit">{{ sppDisplayInfo.maxLimit }}</span>
                    <div class="tierinfo"><template v-for="n in sppDisplayInfo.tier">•</template></div>
                </div>
                <div class="cell cost">
                    <div class="costbasic">{{ teamSheetEntry.getPlayer().getPlayerCost()/1000 }}k</div>
                    <div class="costbreakdown">({{ teamSheetEntry.getPlayer().getPositionCost()/1000 }}+{{ teamSheetEntry.getPlayer().getSkillCost()/1000 }})k</div>
                </div>
                <div v-if="accessControl.canCreate()" class="cell removenewplayer">
                    <a href="#" @click.prevent="handleRemovePlayer">Remove</a>
                </div>
            </template>
            <template v-else>
                <div class="emptyplayer">
                    <template v-if="showPlayerInfoFoldoutTemporarily">
                        Please wait, removing player...
                    </template>
                    <template v-else>
                        <span>Empty</span>
                    </template>
                </div>
            </template>
        </div>
        <div class="foldout foldoutmore" :class="{active: isFoldOutMore}">
            <playerdetails v-if="teamSheetEntry.hasPlayer() || showPlayerInfoFoldoutTemporarily"
                :fumbbl-api="getFumbblApi()"
                :team-sheet-entry="teamSheetEntry"
                :can-create="accessControl.canCreate()"
                :can-edit="accessControl.canEdit()"
                :name-generator="nameGenerator"
                @remove-player="handleRemovePlayer()"
                @retire-player="handleRetirePlayer()"
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
import PlayerDetailsComponent from "./PlayerDetails.vue";
import FumbblApi from "../include/FumbblApi";

@Component({
    components: {
        'playerdetails': PlayerDetailsComponent,
    },
    props: {
        fumbblApi: {
            type: Object,
            required: true,
        },
        teamSheetEntry: {
            type: Object,
            required: true,
        },
        accessControl: {
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
        rosterIconManager: {
            type: Object,
            required: true,
        },
        nameGenerator: {
            type: String,
            required: true,
        },
    },
    watch: {
    }
})
export default class PlayerComponent extends Vue {
    readonly delayForFoldoutAnimations = 600;
    private showPlayerInfoFoldoutTemporarily: boolean = false;
    private intervalIdsScrollDuringCssTransition: number[] = [];

    private mounted() {
        this.$el.getElementsByClassName('foldout')[0].addEventListener('transitionend', () => {
            this.clearIntervalIdsScrollDuringCssTransition();
        });
    }

    private created() {
        window.addEventListener("keydown", this.handleKeyDown);
    }

    private destroyed() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    private getFumbblApi(): FumbblApi {
        return this.$props.fumbblApi;
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            if (this.isFoldOutMore) {
                event.preventDefault();
                this.performFoldOut('CLOSED', true);
            }
        }
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
        this.$emit('make-player-draggable', this.$props.teamSheetEntry.getNumber());
    }

    public endPlayerDraggable() {
        this.$emit('end-player-draggable');
    }

    public closeFoldOutWithAnimationDelay() {
        this.showPlayerInfoFoldoutTemporarily = true;
        setTimeout(() => {this.showPlayerInfoFoldoutTemporarily = false;}, this.delayForFoldoutAnimations);

        this.performFoldOut('CLOSED');
    }

    public handleRemovePlayer() {
        this.closeFoldOutWithAnimationDelay();
        this.$emit('remove-player', this.$props.teamSheetEntry.getNumber(), this.$props.teamSheetEntry.getPlayer().getId());
    }

    public handleRetirePlayer() {
        this.closeFoldOutWithAnimationDelay();
        this.$emit('retire-player', this.$props.teamSheetEntry.getNumber(), this.$props.teamSheetEntry.getPlayer().getId());
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

    private displayInjuries(injuries: string[]): string {
        let niggleCount = 0;
        const displayInjuries: string[] = [];

        for (const injury of injuries) {
            if (injury === 'n') {
                niggleCount++;
            } else {
                displayInjuries.push(injury)
            }
        }
        if (niggleCount > 0) {
            if (niggleCount === 1) {
                displayInjuries.push('n');
            } else {
                displayInjuries.push(`n${niggleCount}`);
            }
        }

        return displayInjuries.sort().join(', ');
    }

    private get sppDisplayInfo(): any {
        return this.$props.teamSheetEntry.getPlayer().sppDisplayInfo;
    }

    private get sppSummaryText(): string {
        const spendable = this.sppDisplayInfo.spendable;

        const randomPrimaryThreshold = this.sppDisplayInfo.thresholds.randomPrimary;
        const randomPrimaryRequired = randomPrimaryThreshold <= spendable ? 0 : randomPrimaryThreshold - spendable;

        const randomSecondaryOrChosenPrimaryThreshold = this.sppDisplayInfo.thresholds.randomSecondaryOrChosenPrimary;
        const randomSecondaryOrChosenPrimaryRequired = randomSecondaryOrChosenPrimaryThreshold <= spendable ? 0 : randomSecondaryOrChosenPrimaryThreshold - spendable;

        const chosenSecondaryThreshold = this.sppDisplayInfo.thresholds.chosenSecondary;
        const chosenSecondaryRequired = chosenSecondaryThreshold <= spendable ? 0 : chosenSecondaryThreshold - spendable;

        const characteristicThreshold = this.sppDisplayInfo.thresholds.characteristic;
        const characteristicRequired = characteristicThreshold <= spendable ? 0 : characteristicThreshold - spendable;

        return `${randomPrimaryRequired} until random primary (${spendable}/${randomPrimaryThreshold})\n` +
            `${randomSecondaryOrChosenPrimaryRequired} until random secondary or chosen primary (${spendable}/${randomSecondaryOrChosenPrimaryThreshold})\n` +
            `${chosenSecondaryRequired} until chosen secondary (${spendable}/${chosenSecondaryThreshold})\n` +
            `${characteristicRequired} until characteristic (${spendable}/${characteristicThreshold})`;
    }
}
</script>