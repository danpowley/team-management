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
                <div class="currentplayercount">{{ team.getPlayerCount() }}</div> <div class="currentplayercountlabel">Players ({{ teamManagementSettings.startPlayers }} required)</div>
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
                    :team-sheet-entry="teamSheetEntry"
                    :all-fold-outs-closed="teamSheet.allFoldOutsClosed()"
                    :is-any-player-drag-in-progress="teamSheet.getDragSourcePlayerNumber() !== null"
                    :use-active-seperator-for-drag-drop="teamSheet.useActiveSeperatorForDragDrop(teamSheetEntry)"
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
            <div class="playercount">{{ team.countPlayersAvailableNextGame() }} players (+{{ team.countMissNextGamePlayers() }} players missing next game)</div>
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
                        {{ team.getRerolls() }}
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
                        {{ team.getDedicatedFans() }}
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
                        {{ team.getAssistantCoaches() }}
                    </div>
                    <div v-if="teamMode === 'CREATE'" class="newteamcontrols">
                        <template v-if="addRemovePermissions.assistantCoaches.add">(<a href="#" @click.prevent="addAssistantCoach()">Add</a>)</template><template v-if="addRemovePermissions.assistantCoaches.remove">(<a href="#" @click.prevent="removeAssistantCoach()">Remove</a>)</template>
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
                        {{ team.getCheerleaders() }}
                    </div>
                    <div v-if="teamMode === 'CREATE'" class="newteamcontrols">
                        <template v-if="addRemovePermissions.cheerleaders.add">(<a href="#" @click.prevent="addCheerleader()">Add</a>)</template><template v-if="addRemovePermissions.cheerleaders.remove">(<a href="#" @click.prevent="removeCheerleader()">Remove</a>)</template>
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
                        {{ team.getApothecary() ? 'Yes' : 'No' }}
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
import Axios from "axios";
import Component from 'vue-class-component';
import { AddRemovePermissions, PlayerRowFoldOutMode, PositionDataForBuyingPlayer } from "../include/Interfaces";
import Team from "../include/Team";
import TeamSheet from "../include/TeamSheet";
import PlayerComponent from "./Player.vue";
import Player from "../include/Player";

@Component({
    components: {
        'player': PlayerComponent,
    },
    props: {
        teamManagementSettings: {
            type: Object,
            required: true,
        },
        rosterIconManager: {
            type: Object,
            required: true,
        },
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
    public team: Team | null = null;
    public teamSheet: TeamSheet = null;

    async mounted() {
        this.teamMode = 'CREATE';

        this.team = new Team(this.$props.teamManagementSettings.minStartFans);
        this.refreshTeamSheet();

        // HACK: artificial delay needed for setting up drag and drop to be ready.
        setTimeout(() => {
            this.setupDragDrop();
        }, 1000);
    }

    private get teamCost(): number {
        return this.$props.teamManagementSettings.calculateTeamCost(this.team);
    }

    private get teamCreationBudgetRemaining(): number {
        return this.$props.teamManagementSettings.getRemainingBudget(this.teamCost);
    }

    private get rosterPositionDataForBuyingPlayer(): PositionDataForBuyingPlayer[] {
        const positionQuantities: {positionId: number, quantity: number}[] = [];

        for (const position of this.$props.teamManagementSettings.positions) {
            const positionQuantity = {
                positionId: position.id,
                quantity: this.team.countPlayersOfPositionId(position.id),
            };
            positionQuantities.push(positionQuantity);
        }

        return this.$props.teamManagementSettings.getRosterPositionDataForBuyingPlayer(
            this.teamCreationBudgetRemaining,
            positionQuantities,
        );
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

    private get addRemovePermissions(): AddRemovePermissions {
        return this.$props.teamManagementSettings.getAddRemovePermissions(this.team);
    }

    public refreshTeamSheet() {
        this.teamSheet = new TeamSheet(
            this.$props.teamManagementSettings.maxPlayers,
            this.team.getPlayers(),
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
                if (! vueComponent.teamSheet.isDragSource(teamNumberFromDataAttribute)) {
                    vueComponent.teamSheet.setDropTarget(teamNumberFromDataAttribute);
                } else {
                    vueComponent.teamSheet.clearAllDropTargets();
                }
            });

            tbody.addEventListener('drop', function (this: any, e) {
                const dropTargetRow = this;

                const teamNumberFromDataAttribute = ~~dropTargetRow.dataset.teamNumber;

                const emptyPlayer = dropTargetRow.dataset.playerId ? false : true;
                vueComponent.team.movePlayer(
                    vueComponent.teamSheet.getDragSourcePlayerNumber(),
                    teamNumberFromDataAttribute,
                    emptyPlayer,
                );
                e.stopPropagation();
                return false;
            });
        });
    }

    private get rerollCostForMode(): number {
        if (this.teamMode === 'CREATE') {
            return this.$props.teamManagementSettings.rerollCostOnCreate;
        } else {
            return this.$props.teamManagementSettings.rerollCostFull;
        }
    }

    public handleMakePlayerDraggable(playerNumber: number, playerId: string) {
        this.teamSheet.setDragSource(playerNumber);
    }

    public handleEndPlayerDraggable() {
        this.teamSheet.clearDragDrop();
    }

    public endDragDrop() {
        this.teamSheet.clearDragDrop();
    }

    private resetCreateTeam() {
        this.team.resetDuringCreate();
    }

    private addReroll() {
        this.team.addReroll();
    }

    private removeReroll() {
        this.team.removeReroll();
    }

    private addDedicatedFans() {
        this.team.addDedicatedFans();
    }

    private removeDedicatedFans() {
        this.team.removeDedicatedFans();
    }

    private addAssistantCoach() {
        this.team.addAssistantCoach();
    }

    private removeAssistantCoach() {
        this.team.removeAssistantCoach();
    }

    private addCheerleader() {
        this.team.addCheerleader();
    }

    private removeCheerleader() {
        this.team.removeCheerleader();
    }

    private addApothecary() {
        this.team.addApothecary();
    }

    private removeApothecary() {
        this.team.removeApothecary();
    }

    private async generatePlayerName(): Promise<string> {
        const result = await Axios.post('http://localhost:3000/api/name/generate/default');
        const playerName = result.data;
        return playerName;
    }

    public async handleAddPlayer(teamSheetEntryNumber: number, positionId: number) {
        const newPlayer = new Player(
            'NEW--' + teamSheetEntryNumber,
            teamSheetEntryNumber,
            await this.generatePlayerName(),
            this.$props.teamManagementSettings.getPosition(positionId),
            this.$props.rosterIconManager.getRandomIconRowVersionPosition(positionId),
        );
        this.team.addPlayer(newPlayer);
    }

    public handleDeletePlayer(teamSheetEntryNumber: number) {
        this.team.removePlayer(teamSheetEntryNumber);
    }

    private handleFoldOut(teamSheetEntryNumber: number, playerRowFoldOutMode: PlayerRowFoldOutMode, multipleOpenMode: boolean) {
        this.teamSheet.updateFoldOut(teamSheetEntryNumber, playerRowFoldOutMode, multipleOpenMode);
    }
}
</script>