<template>
    <div class="playerrow"
        :draggable="teamSheetEntry.getIsDragSource() && ! teamSheetEntry.getIsJourneyMan()"
        :class="{
            playerinrow: teamSheetEntry.hasPlayer(),
            dragsource: teamSheetEntry.getIsDragSource(),
            droptarget: teamSheetEntry.getIsDropTarget(),
        }"
        @dragenter="! teamSheetEntry.getIsJourneyMan() ? handleDragEnter() : undefined"
        @dragover="! teamSheetEntry.getIsJourneyMan() ? handleDragOver($event) : undefined"
        @drop="! teamSheetEntry.getIsJourneyMan() ? handleDrop($event) : undefined"
        @dragend="! teamSheetEntry.getIsJourneyMan() ? handleDragEnd() : undefined"
    >
        <template v-if="teamSheetEntry.isFirst() && teamSheetEntry.hasPlayer() && !teamSheetEntry.getIsDragSource() && teamSheetEntry.getIsDropTarget()">
            <div class="seperator active"><div class="line"></div></div>
        </template>
        <template v-else>
            <div class="seperator spacer"><div class="line"></div></div>
        </template>
        <div class="main" :class="{missnextgame: teamSheetEntry.hasPlayer() && teamSheetEntry.getPlayer().isMissNextGame()}">
            <template v-if="accessControl.canEdit()">
                <template v-if="teamSheetEntry.hasRosteredPlayer()">
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
                        <span v-else-if="teamSheetEntry.getPlayer().isTemporaryPlayer() || teamSheetEntry.getIsJourneyMan()">{{ teamSheetEntry.getPlayer().getPlayerName() }}</span>
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
                        <template v-if="teamSheetEntry.getIsJourneyMan()">Loner</template>
                    </div>
                </div>
                <div v-if="! accessControl.canCreate()" class="cell injuries" :title="'Injuries in chronological order: ' + teamSheetEntry.getPlayer().getInjuries().join(',')">
                    {{ displayInjuries(teamSheetEntry.getPlayer().getInjuries()) }}
                </div>
                <div v-if="! accessControl.canCreate()" class="cell spp" :title="sppSummaryText">
                    <span class="spendable">{{ sppDisplayInfo.spendable }}/</span><span class="maxlimit">{{ sppDisplayInfo.maxLimit }}</span>
                    <div class="tierinfo"><span v-for="n in sppDisplayInfo.tier" :key="n">•</span></div>
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
            <playerdetails v-if="teamSheetEntry.hasRosteredPlayer() || showPlayerInfoFoldoutTemporarily"
                :fumbbl-api="fumbblApi"
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
import Vue, { PropType } from "vue";
import Component from 'vue-class-component';
import { PlayerRowFoldOutMode } from "../include/Interfaces";
import PlayerDetailsComponent from "./PlayerDetails.vue";
import FumbblApi from "../include/FumbblApi";
import TeamSheetEntry from "../include/TeamSheetEntry";
import AccessControl from "../include/AccessControl";
import RosterIconManager from "../include/RosterIconManager";

const PlayerComponentProps = Vue.extend({
    components: {
        'playerdetails': PlayerDetailsComponent,
    },
    props: {
        fumbblApi: {
            type: Object as PropType<FumbblApi>,
            required: true,
        },
        teamSheetEntry: {
            type: Object as PropType<TeamSheetEntry>,
            required: true,
        },
        accessControl: {
            type: Object as PropType<AccessControl>,
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
            type: Object as PropType<RosterIconManager>,
            required: true,
        },
        nameGenerator: {
            type: String,
            required: true,
        },
    },
});

@Component
export default class PlayerComponent extends PlayerComponentProps {
    readonly delayForFoldoutAnimations = 600;
    public showPlayerInfoFoldoutTemporarily: boolean = false;
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

    private handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            if (this.isFoldOutMore) {
                event.preventDefault();
                this.performFoldOut('CLOSED', true);
            }
        }
    }

    public get isFoldOutMore(): boolean {
        return this.teamSheetEntry.getFoldOut() === 'MORE';
    }

    public getSeperatorClasses() {
        if (this.useActiveSeperatorForDragDrop) {
            return { active: true };
        }

        return {
            normal: true,
        };
    }

    public performFoldOut(playerRowFoldOutMode: PlayerRowFoldOutMode, multipleOpenMode = false) {
        this.$emit('fold-out', this.teamSheetEntry.getNumber(), playerRowFoldOutMode, multipleOpenMode);
        this.enableSmartScroll();
        if (playerRowFoldOutMode === 'CLOSED') {
            this.teamSheetEntry.refreshUpdatePlayerDetails();
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

    public toggleFoldOutMore(multipleOpenMode: boolean) {
        if (this.isFoldOutMore) {
            this.performFoldOut('CLOSED', multipleOpenMode);
        } else {
            this.performFoldOut('MORE', multipleOpenMode);
        }
    }

    public makePlayerDraggable() {
        this.$emit('make-player-draggable', this.teamSheetEntry.getNumber());
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
        this.$emit('remove-player', this.teamSheetEntry.getNumber(), this.teamSheetEntry.getPlayer().getId());
    }

    public handleRetirePlayer() {
        this.closeFoldOutWithAnimationDelay();
        this.$emit('retire-player', this.teamSheetEntry.getNumber(), this.teamSheetEntry.getPlayer().getId());
    }

    public handleDragEnter() {
        this.$emit('drag-enter', this.teamSheetEntry.getNumber());
    }

    public handleDragOver(event) {
        event.preventDefault();
        return false;
    }

    public handleDrop(event) {
        this.$emit('drop', this.teamSheetEntry.getNumber(), this.teamSheetEntry.hasPlayer());
        event.stopPropagation();
        return false;
    }

    public handleDragEnd() {
        this.$emit('drag-end');
    }

    public displayInjuries(injuries: string[]): string {
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

    public get sppDisplayInfo(): any {
        return this.teamSheetEntry.getPlayer().sppDisplayInfo;
    }

    public get sppSummaryText(): string {
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