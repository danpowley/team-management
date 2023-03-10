<template>
    <div class="team" v-if="team !== null">
        <div class="teamheader">
            <img class="rosterlogo" src="https://fumbbl.com/i/486276" alt="Roster logo">
            <div class="teamheadermain">
                <div class="teamheadermaincontent">
                    <div>
                        <input v-if="teamMode === 'CREATE'" v-model="team.name">
                        <div v-else class="teamname">
                            {{ team.name ? team.name : 'NO TEAM NAME CHOSEN' }}
                        </div>
                    </div>
                    <div class="rosterinfo" style="margin-top: 0.5em;">
                        <img src="https://fumbbl.com/FUMBBL/Images/Roster_small.gif" alt="Roster" title="Explanation of team mode here"> [C] {{ teamManagementSettings.rosterName }}
                    </div>
                    <div v-if="teamMode === 'READY'">
                        <a href="#" @click.prevent="beginRedraft()" style="font-size: 50%;">Test redraft</a>
                    </div>
                </div>
            </div>
            <img class="divisionlogo" src="https://fumbbl.com/i/677766" alt="Division logo">
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
        <div v-if="teamMode === 'REDRAFT'" class="redraft">
             <div class="redraftcalculation">
                <div class="budgetlabel">Re-drafting Budget</div>
                <div class="playercostlabel">Player (re-)hiring cost</div>
                <div class="othercostlabel">Team staff cost</div>
                <div class="remainingbudgetlabel">Remaining budget</div>
                <div class="budget">1145k</div>
                <div class="subtract1">-</div>
                <div class="playercost">1470k</div>
                <div class="subtract2">-</div>
                <div class="othercost">210k</div>
                <div class="equals">=</div>
                <div class="remainingbudget">-535k</div>
                <div class="errormessage"><template v-if="!team.withinRedraftBudget()">??? Not enough money to cover team cost.</template></div>
            </div>

            <div class="redraftactions">
                <div class="restartredraft"><a href="#" @click.prevent="restartRedraft()">Restart redraft</a> (clears all changes)</div>
                <div class="finishredraft" v-if="team.withinRedraftBudget()"><a href="#" @click.prevent="finishRedraft()">Finish redraft</a> (saves your changes)</div>
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
                    :original-player-for-redraft="getOriginalPlayerForRedraft(teamSheetEntry.getNumber())"
                    @add-player="handleAddPlayer"
                    @delete-player="handleDeletePlayer"
                    @make-player-draggable="handleMakePlayerDraggable"
                    @drag-enter="handlePlayerDragEnter"
                    @drop="handlePlayerDrop"
                    @drag-end="handlePlayerDragEnd"
                    @end-player-draggable="handleEndPlayerDraggable"
                    @fold-out="handleFoldOut"
                    @redraft-keep-player="handleRedraftKeepPlayer"
                    @redraft-fire-player="handleRedraftFirePlayer"
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
        <div v-if="teamMode === 'CREATE'" class="createteam">
            <template v-if="teamManagementSettings.isValidForCreate(team)">
                <button @click="createTeam()">Submit for approval</button>
            </template>
            <template v-else>
                <div class="unabletocreate">
                    <div class="createerrorstitle">??? The following issues need to be fixed before this team can be created:</div>
                    <div v-for="error in teamManagementSettings.getErrorsForCreate(team)" :key="error" class="createerror">
                        <template v-if="error === 'teamNameBlank'">Please enter a team name.</template>
                        <template v-if="error === 'insufficentTreasury'">Insufficent treasury.</template>
                        <template v-if="error === 'insufficentPlayers'">Less than minimum required starting players selected.</template>
                    </div>
                </div>
            </template>
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
})
export default class TeamComponent extends Vue {
    private teamMode: 'CREATE' | 'POST_GAME' | 'READY' | 'RETIRED' | 'REDRAFT' = 'CREATE';
    public team: Team | null = null;
    public teamSheet: TeamSheet | null = null;
    public preRedraftTeam: Team | null = null;

    async mounted() {
        this.teamMode = 'CREATE';

        this.team = new Team(this.$props.teamManagementSettings.minStartFans);
        this.refreshTeamSheet();
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

    public handlePlayerDragEnter(playerNumber: number) {
        if (! this.teamSheet.isDragSource(playerNumber)) {
            this.teamSheet.setDropTarget(playerNumber);
        } else {
            this.teamSheet.clearAllDropTargets();
        }
    }

    public handlePlayerDrop(playerNumber: number, hasPlayer: boolean) {
        this.team.movePlayer(
            this.teamSheet.getDragSourcePlayerNumber(),
            playerNumber,
            ! hasPlayer,
        );
        this.refreshTeamSheet();
    }

    public handlePlayerDragEnd() {
        this.endDragDrop();
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

    public createTeam() {
        this.teamMode = 'READY';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    public beginRedraft() {
        this.preRedraftTeam = this.team.createPreRedraftCopy();
        this.teamMode = 'REDRAFT';
    }

    public restartRedraft() {
        this.team = this.preRedraftTeam;
        this.beginRedraft();
        this.refreshTeamSheet();
    }

    public finishRedraft() {
        this.preRedraftTeam = null;
        this.teamMode = 'READY';
    }

    public getOriginalPlayerForRedraft(teamSheetEntryNumber: number): Player | null {
        if (this.preRedraftTeam === null) {
            return null;
        }
        return this.preRedraftTeam.findPlayerByNumber(teamSheetEntryNumber);
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
        this.refreshTeamSheet();
    }

    public handleDeletePlayer(teamSheetEntryNumber: number) {
        this.team.removePlayer(teamSheetEntryNumber);
        this.refreshTeamSheet();
    }

    private handleFoldOut(teamSheetEntryNumber: number, playerRowFoldOutMode: PlayerRowFoldOutMode, multipleOpenMode: boolean) {
        this.teamSheet.updateFoldOut(teamSheetEntryNumber, playerRowFoldOutMode, multipleOpenMode);
    }

    private handleRedraftKeepPlayer(teamSheetEntryNumber: number) {
        const originalPlayer = this.preRedraftTeam.findPlayerByNumber(teamSheetEntryNumber);
        this.team.addPlayer(originalPlayer);
        this.refreshTeamSheet();
    }

    private handleRedraftFirePlayer(teamSheetEntryNumber: number) {
        this.team.removePlayer(teamSheetEntryNumber);
        this.refreshTeamSheet();
    }
}
</script>