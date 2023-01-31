<template>
    <div class="team" v-if="team !== null">
        <div class="teamheader">
            <img class="rosterlogo" src="https://fumbbl.com/i/486276" alt="Roster logo">
            <img class="divisionlogo" src="https://fumbbl.com/i/677766" alt="Division logo">
            <div><input v-if="teamMode === 'CREATE'"></div>
            <div align="center" style="margin-top: 0.5em;">
                <img src="https://fumbbl.com/FUMBBL/Images/Roster_small.gif" alt="Roster" title="Explanation of team mode here"> [C] {{ teamManagementSettings.rosterName }}
            </div>
        </div>
        <div v-if="teamMode === 'CREATE'" class="createteamstats">
            <div class="playerinfo">
                <div class="currentplayercount">{{ team.players.length }}</div> <div class="currentplayercountlabel">Players ({{ teamManagementSettings.startPlayers }} required)</div>
            </div>
            <div class="costinfo">
                <div class="currentteamcost">{{ teamCost/1000 }}k</div> <div class="currentteamcostlabel">(Max {{ teamManagementSettings.startTreasury/1000 }}k)</div>
            </div>
            <div class="actions">
                <a href="#" @click.prevent="resetCreateTeam()">Reset</a>
            </div>
        </div>
        <div class="playerrows">
            <div class="playerrowsheader">
                <div class="cell draghandle"></div>
                <div class="cell playernumber"></div>
                <div class="cell playericoncontainer"></div>
                <div class="cell playerdetails"></div>
                <div class="cell statma">Ma</div>
                <div class="cell statst">St</div>
                <div class="cell statag">Ag</div>
                <div class="cell statpa">Pa</div>
                <div class="cell statav">Av</div>
                <div class="cell skills">Skills</div>
                <div class="cell injuries">Inj</div>
                <div class="cell spp">SPP</div>
                <div class="cell cost">Cost</div>
            </div>
            <template v-if="teamSheet !== null">
                <player v-for="teamSheetEntry in teamSheet.getEntries()" :key="teamSheetEntry.getNumber()"
                    :team-mode="teamMode"
                    :playerNumber="teamSheetEntry.getNumber()"
                    :player="teamSheetEntry.getPlayer()"
                    :position="teamSheetEntry.getPlayer() ? teamManagementSettings.getPosition(teamSheetEntry.getPlayer().positionId) : null"
                    :is-fold-out-buy="isFoldOutBuy(teamSheetEntry.getNumber())"
                    :is-fold-out-more="isFoldOutMore(teamSheetEntry.getNumber())"
                    :all-fold-outs-closed="allFoldOutsClosed"
                    :is-first-team-number="teamSheetEntry.getNumber() === 1"
                    :is-any-player-drag-in-progress="dragSourcePlayerNumber !== false"
                    :is-drag-source="dragSourcePlayerNumber === teamSheetEntry.getNumber()"
                    :is-drop-target="dropTargetPlayerNumber === teamSheetEntry.getNumber()"
                    :use-active-seperator-for-drag-drop="useActiveSeperatorForDragDrop(teamSheetEntry)"
                    :team-creation-budget-remaining="teamCreationBudgetRemaining"
                    :roster-position-data-for-buying-player="rosterPositionDataForBuyingPlayer"
                    :roster-icon-manager="rosterIconManager"
                    @add-player="handleAddPlayer"
                    @delete-player="handleDeletePlayer"
                    @make-player-draggable="handleMakePlayerDraggable"
                    @end-player-draggable="handleEndPlayerDraggable"
                    @fold-out="handleFoldOut"
                ></player>
            </template>
        </div>
        <div class="playerrowsfooter">
            <div class="playercount">{{ team.players.length - mngPlayerCount }} players (+{{ mngPlayerCount }} players missing next game)</div>
            <div class="favouredof">Todo (Favoured of)</div>
        </div>
        <div class="teammanagement" :class="{newteam: teamMode === 'CREATE'}">
            <div class="teammanagementrow">
                <div class="title left">
                    Coach:
                </div>
                <div class="info left">
                    <a href="#">Bob</a>
                </div>
                <div class="title right">
                    Re-Rolls ({{ rerollCostForMode/1000 }}k):
                </div>
                <div class="info right">
                    <div class="data">
                        {{ team.rerolls }}
                    </div>
                    <div v-if="teamMode === 'CREATE'" class="newteamcontrols">
                        <template v-if="addRemovePermissions.rerolls.add">(<a href="#" @click.prevent="addReroll()">Add</a>)</template><template v-if="addRemovePermissions.rerolls.remove">(<a href="#" @click.prevent="removeReroll()">Remove</a>)</template>
                    </div>
                </div>
            </div>
            <div class="teammanagementrow">
                <div class="title left">
                    Roster:
                </div>
                <div class="info left">
                    {{ teamManagementSettings.rosterName }}
                </div>
                <div class="title right">
                    Dedicated Fans:
                </div>
                <div class="info right">
                    <div class="data">
                        {{ team.dedicatedFans }}
                    </div>
                    <div v-if="teamMode === 'CREATE'" class="newteamcontrols">
                        <template v-if="addRemovePermissions.dedicatedFans.add">(<a href="#" @click.prevent="addDedicatedFans()">Add</a>)</template><template v-if="addRemovePermissions.dedicatedFans.remove">(<a href="#" @click.prevent="removeDedicatedFans()">Remove</a>)</template>
                    </div>
                </div>
            </div>
            <div class="teammanagementrow">
                <div class="title left">
                    Current Team Value:
                </div>
                <div class="info left">
                    todo
                </div>
                <div class="title right">
                    Assistant Coaches:
                </div>
                <div class="info right">
                    <div class="data">
                        {{ team.assistantCoaches }}
                    </div>
                    <div v-if="teamMode === 'CREATE'" class="newteamcontrols">
                        <template v-if="addRemovePermissions.assistantCoaches.add">(<a href="#" @click.prevent="addAssistantCoaches()">Add</a>)</template><template v-if="addRemovePermissions.assistantCoaches.remove">(<a href="#" @click.prevent="removeAssistantCoaches()">Remove</a>)</template>
                    </div>
                </div>
            </div>
            <div class="teammanagementrow">
                <div class="title left">
                    Treasury:
                </div>
                <div class="info left">
                    todo
                </div>
                <div class="title right">
                    Cheerleaders:
                </div>
                <div class="info right">
                    <div class="data">
                        {{ team.cheerleaders }}
                    </div>
                    <div v-if="teamMode === 'CREATE'" class="newteamcontrols">
                        <template v-if="addRemovePermissions.cheerleaders.add">(<a href="#" @click.prevent="addCheerleaders()">Add</a>)</template><template v-if="addRemovePermissions.cheerleaders.remove">(<a href="#" @click.prevent="removeCheerleaders()">Remove</a>)</template>
                    </div>
                </div>
            </div>
            <div class="teammanagementrow">
                <div class="title left">
                    Team Value:
                </div>
                <div class="info left">
                    todo
                </div>
                <div class="title right">
                    Apothecary:
                </div>
                <div class="info right">
                    <div class="data">
                        {{ team.apothecary ? 'Yes' : 'No' }}
                    </div>
                    <div v-if="teamMode === 'CREATE' && teamManagementSettings.apothecaryAllowed" class="newteamcontrols">
                        <template v-if="addRemovePermissions.apothecary.add">(<a href="#" @click.prevent="addApothecary()">Add</a>)</template><template v-if="addRemovePermissions.apothecary.remove">(<a href="#" @click.prevent="removeApothecary()">Remove</a>)</template>
                    </div>
                </div>
            </div>
            <div class="teammanagementrow">
                <div class="title left">
                    Games this Season:
                </div>
                <div class="info left">
                    todo
                </div>
                <div class="title right">
                    Current Re-draft Budget:
                </div>
                <div class="info right">
                    <div class=data>
                        todo
                    </div>
                    <div v-if="teamMode === 'CREATE'" class="newteamcontrols">
                        <!-- deliberately empty -->
                    </div>
                </div>
            </div>
        </div>
        <div class="teamrecord">
            <div class="teamstats">
                <div class="gamesplayed">Games Played:	{{ gamesPlayedStatDisplay }}</div>
                <div class="tddiff">TD Diff: {{ tdDiffStatDisplay }}</div>
                <div class="casdiff">Cas Diff: {{ casDiffStatDisplay }}</div>
            </div>
            <div class="lastopponent">
                Last Opponent: <a href="#" :data-id="lastPlayedTeamData.id">{{ lastPlayedTeamData.name }}</a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';
import { PlayerRowFoldOutMode, PositionDataForBuyingPlayer } from "../include/Interfaces";
import TeamSheet from "../include/TeamSheet";
import TeamSheetEntry from "../include/TeamSheetEntry";
import PlayerComponent from "./Player.vue";

@Component({
    components: {
        'player': PlayerComponent,
    },
    props: {
        teamManagementSettings: {
            type: Object,
            required: true,
        },
        addRemovePermissions: {
            type: Object,
            required: true,
        },
        team: {
            type: Object,
            required: true,
        },
        rosterIconManager: {
            type: Object,
            required: true,
        },
        foldOuts: {
            type: Object,
            required: true,
        }
    },
    watch: {
        team: {
            handler(newValue, oldValue) {
                // @ts-ignore: Property does not exist on type 'Vue'.
                this.refreshTeamSheet();
            },
            deep: true
        },
    }
})
export default class TeamComponent extends Vue {
    private teamMode: 'CREATE' | 'POST_GAME' | 'READY' = 'CREATE';
    public teamSheet: TeamSheet = null;

    public dragSourcePlayerNumber: number | false = false;
    public dragSourcePlayerId: string = ''; // deal with new id string
    public dropTargetPlayerNumber: number | false = false;
    public dropTargetPlayerId: string = '';

    async mounted() {
        this.teamMode = 'CREATE';

        this.refreshTeamSheet();

        // HACK: artificial delay needed for setting up drag and drop to be ready.
        setTimeout(() => {
            this.setupDragDrop();
        }, 1000);
    }

    private get teamCost(): number {
        return this.$props.teamManagementSettings.calculateTeamCost(this.$props.team);
    }

    private get teamCreationBudgetRemaining(): number {
        return this.$props.teamManagementSettings.getRemainingBudget(this.teamCost);
    }

    private get rosterPositionDataForBuyingPlayer(): PositionDataForBuyingPlayer[] {
        const positionQuantities: {positionId: number, quantity: number}[] = [];

        for (const position of this.$props.teamManagementSettings.positions) {
            const positionQuantity = {
                positionId: position.id,
                quantity: this.$props.team.players.filter(player => player.positionId === position.id).length
            };
            positionQuantities.push(positionQuantity);
        }

        return this.$props.teamManagementSettings.getRosterPositionDataForBuyingPlayer(
            this.teamCreationBudgetRemaining,
            positionQuantities,
        );
    }

    private get mngPlayerCount(): number {
        return this.$props.team.players.filter((player) => {
            return player.injuries.split(',').includes('m');
        }).length;
    }

    private get gamesPlayedStatDisplay(): string {
        return '0 (0/0/0)'; // todo
    }

    private get tdDiffStatDisplay(): string {
        return '0 (0 - 0)'; // todo
    }

    private get casDiffStatDisplay(): string {
        return '0 (0/0/0 - 0/0/0)'; // todo
    }

    private get lastPlayedTeamData(): {id: number, name: string} {
        return {
            id: 10000000000,
            name: 'Todo United',
        };
    }

    private isFoldOutBuy(playerNumber: number): boolean {
        return this.$props.foldOuts.buy.includes(playerNumber);
    }

    private isFoldOutMore(playerNumber: number): boolean {
        return this.$props.foldOuts.more.includes(playerNumber);
    }

    private get allFoldOutsClosed(): boolean {
        return this.$props.foldOuts.buy.length === 0 && this.$props.foldOuts.more.length === 0;
    }

    private get rerollCostForMode(): number {
        if (this.teamMode === 'CREATE') {
            return this.$props.teamManagementSettings.rerollCostOnCreate;
        } else {
            return this.$props.teamManagementSettings.rerollCostFull;
        }
    }

    public handleMakePlayerDraggable(playerNumber: number, playerId: string) {
        this.dragSourcePlayerNumber = playerNumber;
        this.dragSourcePlayerId = playerId;
    }

    public handleEndPlayerDraggable() {
        this.dragSourcePlayerNumber = false;
        this.dragSourcePlayerId = ''; // string id issues (new players etc)
    }

    public refreshTeamSheet() {
        this.teamSheet = new TeamSheet(
            this.$props.teamManagementSettings.maxPlayers,
            this.$props.team.players
        );
    }

    public setupDragDrop() {
        const vueComponent = this;
        let rowsGroupedByTbody = document.querySelectorAll('.playerrow');
        rowsGroupedByTbody.forEach(function (tbody) {
            tbody.addEventListener('dragend', function (this: any, e) {
                vueComponent.endDragDrop();
            });

            tbody.addEventListener('dragover', function (this: any, e) {
                e.preventDefault();
                return false;
            });

            tbody.addEventListener('dragenter', function (this: any, e) {
                const dropTargetRow = this;

                const teamNumberFromDataAttribute = ~~dropTargetRow.dataset.teamNumber;
                if (teamNumberFromDataAttribute !== vueComponent.dragSourcePlayerNumber) {
                    vueComponent.dropTargetPlayerNumber = teamNumberFromDataAttribute;
                    vueComponent.dropTargetPlayerId = dropTargetRow.dataset.playerId; // new players using string id!!!
                } else {
                    vueComponent.dropTargetPlayerNumber = false;
                    vueComponent.dropTargetPlayerId = ''; // new players using string id!!!
                }
            });

            tbody.addEventListener('drop', function (this: any, e) {
                const dropTargetRow = this;

                const teamNumberFromDataAttribute = ~~dropTargetRow.dataset.teamNumber;
                const eventData = {
                    source: {
                        playerNumber: vueComponent.dragSourcePlayerNumber,
                        playerId: vueComponent.dragSourcePlayerId,
                    },
                    target: {
                        playerNumber: teamNumberFromDataAttribute,
                        playerId: dropTargetRow.dataset.playerId ? dropTargetRow.dataset.playerId : null,
                    }
                };

                vueComponent.$emit('drag-drop-player', eventData);
                e.stopPropagation();
                return false;
            });
        });

    }

    public endDragDrop() {
        this.dragSourcePlayerNumber = false;
        this.dragSourcePlayerId = '';
        this.dropTargetPlayerNumber = false;
        this.dropTargetPlayerId = '';
    }

    public useActiveSeperatorForDragDrop(teamSheetEntry: TeamSheetEntry): boolean {
        let dragDirection: 'UP' | 'DOWN' | null = null;
        const isMovingUpOrDown =
            this.dropTargetPlayerNumber !== false
            && this.dragSourcePlayerNumber !== false
            && this.dropTargetPlayerNumber !== this.dragSourcePlayerNumber;

        if (isMovingUpOrDown) {
            dragDirection = this.dropTargetPlayerNumber > this.dragSourcePlayerNumber ? 'DOWN' : 'UP';
        }

        if (
            dragDirection === 'DOWN' &&
            this.dropTargetPlayerNumber === teamSheetEntry.getNumber() &&
            teamSheetEntry.getPlayer() !== null
        ) {
            return true;
        }

        const isAboveDropTarget = this.dropTargetPlayerNumber !== false && this.dropTargetPlayerNumber - 1 === teamSheetEntry.getNumber();
        if (
            dragDirection === 'UP' &&
            isAboveDropTarget &&
            this.teamSheet.getEntryNumbersWithPlayerBelow().includes(teamSheetEntry.getNumber())
        ) {
            return true;
        }

        return false;
    }

    private resetCreateTeam() {
        this.$emit('reset-create-team');
    }

    private addReroll() {
        this.$emit('add-reroll');
    }

    private removeReroll() {
        this.$emit('remove-reroll');
    }

    private addDedicatedFans() {
        this.$emit('add-dedicated-fans');
    }

    private removeDedicatedFans() {
        this.$emit('remove-dedicated-fans');
    }

    private addAssistantCoaches() {
        this.$emit('add-assistant-coaches');
    }

    private removeAssistantCoaches() {
        this.$emit('remove-assistant-coaches');
    }

    private addCheerleaders() {
        this.$emit('add-cheerleaders');
    }

    private removeCheerleaders() {
        this.$emit('remove-cheerleaders');
    }

    private addApothecary() {
        this.$emit('add-apothecary');
    }

    private removeApothecary() {
        this.$emit('remove-apothecary');
    }

    public handleAddPlayer(playerNumber: number, positionId: number) {
        this.$emit('add-player', playerNumber, positionId);
    }

    public handleDeletePlayer(playerNumber: number) {
        this.$emit('delete-player', playerNumber);
    }

    private handleFoldOut(playerNumber: number, playerRowFoldOutMode: PlayerRowFoldOutMode, multipleOpenMode: boolean) {
        this.$emit('fold-out', playerNumber, playerRowFoldOutMode, multipleOpenMode);
    }
}
</script>