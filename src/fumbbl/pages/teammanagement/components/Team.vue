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
                        <img v-if="team.teamStatus.isNew()" src="https://fumbbl.com/FUMBBL/Images/New_small.gif" alt="Roster" title="New team">
                        <img v-else-if="team.teamStatus.isActive()" src="https://fumbbl.com/FUMBBL/Images/Roster_small.gif" alt="Roster" title="Ready / View Roster">
                        <img v-else-if="team.teamStatus.isPostMatch()" src="https://fumbbl.com/FUMBBL/Images/p_small.png" alt="Roster" title="Post match sequence">
                        <img v-else-if="team.teamStatus.isRetired()" src="https://fumbbl.com/FUMBBL/Images/Retired_small.gif" alt="Roster" title="Retired">
                        <span :title="team.getDivision()"> [{{ team.getDivisionAbbreviated() }}]</span> {{ teamManagementSettings.rosterName }}
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
        <div v-if="false" class="redraft">
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
                <div class="errormessage"><template v-if="true">⚠ Not enough money to cover team cost.</template></div>
            </div>

            <div class="redraftactions">
                <div class="restartredraft"><a href="#">Restart redraft</a> (clears all changes)</div>
                <div class="finishredraft" v-if="true"><a href="#">Finish redraft</a> (saves your changes)</div>
            </div>
        </div>

        <div :class="{showhirerookies: showHireRookies}">
            <hirerookies
                v-if="showHireRookies"
                :roster-position-data-for-buying-player="rosterPositionDataForBuyingPlayer"
                :roster-icon-manager="rosterIconManager"
                :has-empty-team-sheet-entry="teamSheet.findFirstEmptyTeamSheetEntry() !== null"
                @hire-rookie="handleHireRookie"
            ></hirerookies>
            <div class="playerrowsouter">
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
                            @drag-enter="handlePlayerDragEnter"
                            @drop="handlePlayerDrop"
                            @drag-end="handlePlayerDragEnd"
                            @end-player-draggable="handleEndPlayerDraggable"
                            @fold-out="handleFoldOut"
                        ></player>
                    </template>
                </div>
                <div class="playerrowsfooter">
                    <div class="playercount">{{ team.countPlayersAvailableNextGame() }} players (+{{ team.countMissNextGamePlayers() }} players missing next game) <a href="#" @click.prevent="enableShowHireRookies()">Buy new player</a></div>
                    <div class="favouredof">Todo (Favoured of)</div>
                </div>
            </div>
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
                    {{ team.getTreasury()/1000 }}k
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
                    <div class="createerrorstitle">⚠ The following issues need to be fixed before this team can be created:</div>
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

import HireRookiesComponent from "./HireRookies.vue";
import RosterIconManager from "../include/RosterIconManager";
import TeamManagementSettings from "../include/TeamManagementSettings";

@Component({
    components: {
        'player': PlayerComponent,
        'hirerookies': HireRookiesComponent,
    },
    props: {
        demoTeamSettings: {
            type: Object,
            required: true,
        },
    },
})
export default class TeamComponent extends Vue {
    private teamManagementSettings: TeamManagementSettings | null = null;
    private rosterIconManager: RosterIconManager | null = null;
    private teamMode: 'CREATE' | 'POST_GAME' | 'READY' | 'RETIRED' | 'REDRAFT' = 'CREATE';
    public team: Team | null = null;
    public teamSheet: TeamSheet | null = null;

    private showHireRookies: boolean = false;

    async mounted() {
        if (this.$props.demoTeamSettings.newTeam !== null) {
            const rulesetId = this.$props.demoTeamSettings.newTeam.rulesetId;
            const rosterId = this.$props.demoTeamSettings.newTeam.rosterId;
            await this.setupForRulesetAndRoster(rulesetId, rosterId);
            this.team = new Team(this.teamManagementSettings.minStartFans);
        } else if (this.$props.demoTeamSettings.existingTeamId !== null) {
            const result = await Axios.post('https://fumbbl.com/api/team/get/' + this.$props.demoTeamSettings.existingTeamId);
            const rawApiTeam = result.data;
            await this.setupForRulesetAndRoster(rawApiTeam.ruleset, rawApiTeam.roster.id);
            this.team = Team.fromApi(
                rawApiTeam,
                this.teamManagementSettings.minStartFans,
                this.teamManagementSettings,
                this.rosterIconManager,
            );
        } else {
            throw new Error('Must be either new or existing configured.');
        }
        this.teamMode = 'CREATE';
        this.refreshTeamSheet();
    }

    private async setupForRulesetAndRoster(rulesetId: number, rosterId: number) {
        const resultA = await Axios.post('https://fumbbl.com/api/ruleset/get/' + rulesetId);
        const rawApiRuleset = resultA.data;

        const resultB = await Axios.post('https://fumbbl.com/api/roster/get/' + rosterId);
        const rawApiRoster = resultB.data;

        await this.setupRosterIconManager(rawApiRoster.positions);
        this.teamManagementSettings = new TeamManagementSettings(rawApiRuleset, rawApiRoster);
    }

    public async setupRosterIconManager(rawApiPositions: any[]) {
        const positionIconData = rawApiPositions.map((position: any) => {
            return {
                positionId: ~~position.id,
                positionIcon: ~~position.icon,
            };
        });
        const rosterIconManager = new RosterIconManager();
        await rosterIconManager.prepareIconData(positionIconData);

        this.rosterIconManager = rosterIconManager;
    }

    private get teamCost(): number {
        return this.teamManagementSettings.calculateTeamCost(this.team);
    }

    private get teamCreationBudgetRemaining(): number {
        return this.teamManagementSettings.getRemainingBudget(this.teamCost);
    }

    private get rosterPositionDataForBuyingPlayer(): PositionDataForBuyingPlayer[] {
        const positionQuantities: {positionId: number, quantity: number}[] = [];

        for (const position of this.teamManagementSettings.positions) {
            const positionQuantity = {
                positionId: position.id,
                quantity: this.team.countPlayersOfPositionId(position.id),
            };
            positionQuantities.push(positionQuantity);
        }

        return this.teamManagementSettings.getRosterPositionDataForBuyingPlayer(
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
        return this.teamManagementSettings.getAddRemovePermissions(this.team);
    }

    public refreshTeamSheet() {
        this.teamSheet = new TeamSheet(
            this.teamManagementSettings.maxPlayers,
            this.team.getPlayers(),
        );
    }

    private get rerollCostForMode(): number {
        if (this.teamMode === 'CREATE') {
            return this.teamManagementSettings.rerollCostOnCreate;
        } else {
            return this.teamManagementSettings.rerollCostFull;
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
        const result = await Axios.post('https://fumbbl.com/api/name/generate/default');
        const playerName = result.data;
        return playerName;
    }

    public createTeam() {
        this.teamMode = 'READY';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    private enableShowHireRookies(): void {
        this.showHireRookies = ! this.showHireRookies;
    }

    public async handleAddPlayer(teamSheetEntryNumber: number, positionId: number) {
        const newPlayer = new Player(
            'NEW--' + teamSheetEntryNumber,
            teamSheetEntryNumber,
            await this.generatePlayerName(),
            this.teamManagementSettings.getPosition(positionId),
            this.rosterIconManager.getRandomIconRowVersionPosition(positionId),
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

    private handleHireRookie(positionId: number) {
        this.handleAddPlayer(this.findEmptyTeamSheetEntry(), positionId);
    }

    private findEmptyTeamSheetEntry(): number {
        return this.teamSheet.findFirstEmptyTeamSheetEntry().getNumber();
    }
}
</script>