<template>
    <div class="team" v-if="team !== null && accessControl !== null">
        <div class="teamheader">
            <img class="rosterlogo" :src="`https://fumbbl.com/i/${teamManagementSettings.logoIdLarge}`" :alt="`Roster logo for ${teamManagementSettings.rosterName}`" :title="`Roster logo for ${teamManagementSettings.rosterName}`">
            <div class="teamheadermain">
                <div class="teamheadermaincontent">
                    <div class="teamname">
                        <div class="teamnamecontent">
                            <template v-if="editTeamName && accessControl.canCreate()">
                                <input v-model="newTeamName" class="editteamname">
                                <button class="teambutton" @click="saveNewTeamName()">Save</button>
                                <a href="#" @click.prevent="cancelNewTeamName()">Cancel</a>
                            </template>
                            <template v-else>
                                <div class="teamnametext">{{ team.name }}</div>
                                <div v-if="accessControl.canCreate()" class="editlink"><a href="#" @click.prevent="enableTeamNameEdit()">edit name</a></div>
                            </template>
                        </div>
                    </div>
                    <div class="rosterinfo" style="margin-top: 0.5em;">
                        <img v-if="team.teamStatus.isNew()" src="https://fumbbl.com/FUMBBL/Images/New_small.gif" alt="Roster" title="New team">
                        <img v-else-if="team.teamStatus.isActive()" src="https://fumbbl.com/FUMBBL/Images/Roster_small.gif" alt="Roster" title="Ready / View Roster">
                        <img v-else-if="team.teamStatus.isPostMatch()" src="https://fumbbl.com/FUMBBL/Images/p_small.png" alt="Roster" title="Post match sequence">
                        <img v-else-if="team.teamStatus.isRetired()" src="https://fumbbl.com/FUMBBL/Images/Retired_small.gif" alt="Roster" title="Retired">
                        <span :title="team.getDivision()"> [{{ team.getDivisionAbbreviated() }}]</span> {{ teamManagementSettings.rosterName }}
                    </div>
                    <ul class="teamnav">
                        <li v-if="false"><a href="/p/team?team_id=1085077">Refresh</a></li>
                        <li v-if="accessControl.canViewHistory()" class="menu" @mouseenter="menuShow('show')" @mouseleave="menuHide('show')">
                            <a href="#">Show<img src="https://fumbbl.com/FUMBBL/Images/Icons/disclosure.png"></a>
                            <ul class="submenu" v-show="mainMenuShow === 'show'">
                                <li><a :href="`https://fumbbl.com/p/team?op=log&team_id=${team.getId()}`">Log</a></li>
                                <li><a :href="`https://fumbbl.com/p/team?op=view&showmatches=1&team_id=${team.getId()}`">Matches</a></li>
                                <li><a :href="`https://fumbbl.com/p/team?op=view&showstats=1&team_id=${team.getId()}`">Stats</a></li>
                                <li><a :href="`https://fumbbl.com/p/team?op=development&team_id=${team.getId()}`">Development</a></li>
                                <li><a :href="`https://fumbbl.com/p/team?op=pastplayers&team_id=${team.getId()}`">Past Players</a></li>
                                <li><a :href="`https://fumbbl.com/~${team.getCoach().name}/${team.getName()}`">View Roster</a></li>
                                <li><a :href="`https://fumbbl.com/p/yearbook?team_id=${team.getId()}`">Yearbook</a></li>
                            </ul>
                        </li>
                        <li v-if="team.getDivision() === 'League'" class="menu">
                            <a :href="`https://fumbbl.com/p/teamoptions?id=${team.getId()}`">Team options</a>
                        </li>
                        <li class="menu" @mouseenter="menuShow('misc')" @mouseleave="menuHide('misc')">
                            <a href="#">Misc<img src="https://fumbbl.com/FUMBBL/Images/Icons/disclosure.png"></a>
                            <ul class="submenu" v-show="mainMenuShow === 'misc'">
                                <li><a :href="`https://fumbbl.com/p/team?op=reportteam&team_id=${team.getId()}`">Report</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            <img class="divisionlogo" :src="divisionLogoImageUrl" :alt="`Division logo for ${team.getDivision()}.`" :title="`Division logo for ${team.getDivision()}.`">
        </div>
        <div class="teamfluff">
            <div class="teamflufflinks">
                <span>(<a :href="`https://fumbbl.com/p/gallery3?team=${team.getId()}`">Change Image</a>) </span>
                <span>(<a :href="`https://fumbbl.com/p/team?op=editbio&amp;team_id=${team.getId()}`">Edit Bio</a>) </span>
            </div>
        </div>
        <div v-if="accessControl.canCreate()" class="createteamstats">
            <div class="playerinfo">
                <div class="currentplayercount">{{ team.getPlayerCount() }}</div> <div class="currentplayercountlabel">Players ({{ teamManagementSettings.startPlayers }} required)</div>
            </div>
            <div class="costinfo">
                <div class="currentteamcostlabel">Treasury spent (Max {{ teamManagementSettings.startTreasury/1000 }}k)</div> <div class="currentteamcost">{{ teamCost/1000 }}k</div>
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
                :max-big-guys="teamManagementSettings.maxBigGuys"
                :update-in-progress="updateInProgress"
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
                            :fumbbl-api="getFumbblApi()"
                            :team-sheet-entry="teamSheetEntry"
                            :access-control="accessControl"
                            :all-fold-outs-closed="teamSheet.allFoldOutsClosed()"
                            :is-any-player-drag-in-progress="teamSheet.getDragSourcePlayerNumber() !== null"
                            :use-active-seperator-for-drag-drop="teamSheet.useActiveSeperatorForDragDrop(teamSheetEntry)"
                            :roster-icon-manager="rosterIconManager"
                            :name-generator="teamManagementSettings.nameGenerator"
                            @remove-player="handleRemovePlayer"
                            @retire-player="handleRetirePlayer"
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
                    <div class="playercount">{{ team.countPlayersAvailableNextGame() }} players (+{{ team.countMissNextGamePlayers() }} players missing next game) <a href="#" v-if="accessControl.canEdit()" @click.prevent="enableShowHireRookies()">Buy new player</a></div>
                    <specialrules
                        :fumbbl-api="getFumbblApi()"
                        :team-id="team.getId()"
                        :can-edit="accessControl.canCreate()"
                        :raw-api-special-rules="rawApiSpecialRules"
                        @rules-updated="handleSpecialRulesUpdated"
                    ></specialrules>
                </div>
            </div>
        </div>
        <div class="teammanagement" :class="{editteam: accessControl.canEdit()}">
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
                    <addremove
                        :current-value="team.getRerolls().toString()"
                        :can-edit="accessControl.canEdit()"
                        :can-remove-immediately="accessControl.canCreate()"
                        :can-add="addRemovePermissions.rerolls.add"
                        :can-remove="addRemovePermissions.rerolls.remove"
                        :label-add="accessControl.canCreate() ? 'Add' : 'Buy'"
                        :label-remove="accessControl.canCreate() ? 'Remove' : 'Discard'"
                        :update-in-progress="updateInProgress"
                        @add="addReroll"
                        @remove-with-confirm="modals.removeReroll = true"
                        @remove-immediately="removeReroll"
                    ></addremove>
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
                    <template v-if="accessControl.canCreate()">
                        <select v-model.number="team.dedicatedFans" @change="updateDedicatedFans()">
                            <option v-for="dedicatedFansStartValue in this.teamManagementSettings.dedicatedFansStartValues">{{ dedicatedFansStartValue }}</option>
                        </select>
                    </template>
                    <template v-else>
                        {{ team.getDedicatedFans() }}
                    </template>
                </div>
            </div>
            <div class="teammanagementrow">
                <div class="title left">
                    Current Team Value:
                </div>
                <div class="info left">
                    {{ team.getCurrentTeamValue()/1000 }}k
                </div>
                <div class="title right">
                    Assistant Coaches:
                </div>
                <div class="info right">
                    <addremove
                        :current-value="team.getAssistantCoaches().toString()"
                        :can-edit="accessControl.canEdit()"
                        :can-remove-immediately="accessControl.canCreate()"
                        :can-add="addRemovePermissions.assistantCoaches.add"
                        :can-remove="addRemovePermissions.assistantCoaches.remove"
                        :label-add="accessControl.canCreate() ? 'Add' : 'Buy'"
                        :label-remove="accessControl.canCreate() ? 'Remove' : 'Discard'"
                        :update-in-progress="updateInProgress"
                        @add="addAssistantCoach"
                        @remove-with-confirm="modals.removeAssistantCoach = true"
                        @remove-immediately="removeAssistantCoach"
                    ></addremove>
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
                    <addremove
                        :current-value="team.getCheerleaders().toString()"
                        :can-edit="accessControl.canEdit()"
                        :can-remove-immediately="accessControl.canCreate()"
                        :can-add="addRemovePermissions.cheerleaders.add"
                        :can-remove="addRemovePermissions.cheerleaders.remove"
                        :label-add="accessControl.canCreate() ? 'Add' : 'Buy'"
                        :label-remove="accessControl.canCreate() ? 'Remove' : 'Discard'"
                        :update-in-progress="updateInProgress"
                        @add="addCheerleader"
                        @remove-with-confirm="modals.removeCheerleader = true"
                        @remove-immediately="removeCheerleader"
                    ></addremove>
                </div>
            </div>
            <div class="teammanagementrow">
                <div class="title left">
                    Team Value:
                </div>
                <div class="info left">
                    {{ team.getTeamValue()/1000 }}k
                </div>
                <div class="title right">
                    Apothecary:
                </div>
                <div class="info right">
                    <addremove
                        :current-value="team.getApothecary() ? 'Yes' : 'No'"
                        :can-edit="accessControl.canEdit() && teamManagementSettings.apothecaryAllowed"
                        :can-remove-immediately="accessControl.canCreate()"
                        :can-add="addRemovePermissions.apothecary.add"
                        :can-remove="addRemovePermissions.apothecary.remove"
                        :label-add="accessControl.canCreate() ? 'Add' : 'Hire'"
                        :label-remove="accessControl.canCreate() ? 'Remove' : 'Fire'"
                        :update-in-progress="updateInProgress"
                        @add="addApothecary"
                        @remove-with-confirm="modals.removeApothecary = true"
                        @remove-immediately="removeApothecary"
                    ></addremove>
                </div>
            </div>
            <div v-if="accessControl.canViewHistory()" class="teammanagementrow">
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
                    <div v-if="accessControl.canEdit()" class="editteamcontrols">
                        <!-- deliberately empty -->
                    </div>
                </div>
            </div>
        </div>
        <div v-if="accessControl.canViewHistory()" class="teamrecord">
            <div class="teamstats">
                <div class="gamesplayed">Games Played:	{{ gamesPlayedStatDisplay }}</div>
                <div class="tddiff">TD Diff: {{ tdDiffStatDisplay }}</div>
                <div class="casdiff">Cas Diff: {{ casDiffStatDisplay }}</div>
            </div>
            <div class="lastopponent">
                Last Opponent: <a href="#" :data-id="lastPlayedTeamData.id">{{ lastPlayedTeamData.name }}</a>
            </div>
        </div>
        <div v-if="accessControl.canCreate()" class="createteam">
            <div class="submitforapproval">
                <template v-if="editTeamName">
                    NOTE: The submit for approval button is hidden whilst you are editing the team name above.
                </template>
                <template v-else-if="teamManagementSettings.isValidForCreate(team)">
                    <button @click="modals.submitForApproval = true" class="teambutton">Submit for approval</button>
                </template>
                <template v-else>
                    <button @click="modals.errorsForCreate = true" class="teambutton">Submit for approval</button>
                </template>
            </div>
            <div class="deleteteam">
                <button @click="modals.deleteTeam = true" class="teambutton">Delete Team</button>
            </div>
        </div>
        <div v-if="accessControl.canRetireTeam()" class="retireteam">
            <button @click="modals.retireTeam = true" class="teambutton">Retire Team</button>
        </div>
        <modal
            v-if="errorModalInfo !== null"
            :buttons-config="{'close': 'Ok'}"
            :modal-size="'small'"
            @close="errorModalInfo = null"
        >
            <template v-slot:header>
                Error
            </template>

            <template v-slot:body>
                <p>{{ errorModalInfo.general }}</p>
                <p>Technical details: {{ errorModalInfo.technical }}</p>
            </template>
        </modal>
        <modal
            v-show="modals.removeReroll === true"
            :buttons-config="{'close': 'Cancel', 'remove': 'Remove'}"
            :modal-size="'small'"
            @close="modals.removeReroll = false"
            @remove="removeReroll"
        >
            <template v-slot:header>
                Discard reroll
            </template>

            <template v-slot:body>
                <p>Are you sure you wish to discard this reroll? This cannot be undone.</p>
            </template>
        </modal>
        <modal
            v-show="modals.removeAssistantCoach === true"
            :buttons-config="{'close': 'Cancel', 'remove': 'Remove'}"
            :modal-size="'small'"
            @close="modals.removeAssistantCoach = false"
            @remove="removeAssistantCoach"
        >
            <template v-slot:header>
                Discard assistant coach
            </template>

            <template v-slot:body>
                <p>Are you sure you wish to discard this assistant coach? This cannot be undone.</p>
            </template>
        </modal>
        <modal
            v-show="modals.removeCheerleader === true"
            :buttons-config="{'close': 'Cancel', 'remove': 'Remove'}"
            :modal-size="'small'"
            @close="modals.removeCheerleader = false"
            @remove="removeCheerleader"
        >
            <template v-slot:header>
                Discard cheerleader
            </template>

            <template v-slot:body>
                <p>Are you sure you wish to discard this cheerleader? This cannot be undone.</p>
            </template>
        </modal>
        <modal
            v-show="modals.removeApothecary === true"
            :buttons-config="{'close': 'Cancel', 'remove': 'Remove'}"
            :modal-size="'small'"
            @close="modals.removeApothecary = false"
            @remove="removeApothecary"
        >
            <template v-slot:header>
                Fire apothecary
            </template>

            <template v-slot:body>
                <p>Are you sure you wish to fire this apothecary? This cannot be undone.</p>
            </template>
        </modal>
        <modal
            v-show="modals.submitForApproval === true"
            :buttons-config="{'close': 'Oops, let me go back and check!', 'continue': 'Yes, my team complies'}"
            :modal-size="'small'"
            @close="modals.submitForApproval = false"
            @continue="modals.submitForApproval = false"
        >
            <template v-slot:header>
                * * * Important Notice * * *
            </template>

            <template v-slot:body>
                <p>Before you activate your team, please make sure your team complies with our <a href="https://fumbbl.com/note/Christer/NamesAndImages" target="_blank">Team Naming Policy</a>.</p>
                <p>Failure to follow these rules may result in your account being suspended for some time, depending on the severity of the transgression. The staff and the community are constantly monitoring teams and we do take this seriously. So, please make sure your team is in accordance with the rules before activating it.</p>
            </template>
        </modal>
        <modal
            v-show="modals.errorsForCreate === true"
            :buttons-config="{'close': 'Close'}"
            :modal-size="'small'"
            @close="modals.errorsForCreate = false"
        >
            <template v-slot:header>
                Unable to create team.
            </template>

            <template v-slot:body>
                <p>Sorry we are unable to create your team, please review the errors listed below.</p>
                <ul>
                    <li v-for="error in teamManagementSettings.getErrorsForCreate(team)" :key="error">
                        <template v-if="error === 'teamNameBlank'">Team name is blank.</template>
                        <template v-if="error === 'insufficientTreasury'">Insufficient treasury for chosen players and sideline staff.</template>
                        <template v-if="error === 'insufficientPlayers'">Less than minimum required starting players selected.</template>
                    </li>
                </ul>
            </template>
        </modal>
        <modal
            v-show="modals.deleteTeam === true"
            :buttons-config="{'close': 'Cancel', 'continue': 'Delete Team'}"
            :modal-size="'small'"
            @close="modals.deleteTeam = false"
            @continue="modals.deleteTeam = false"
        >
            <template v-slot:header>
                Delete team?
            </template>

            <template v-slot:body>
                <p>Are you sure you want to delete the following team?</p>
                <p>Team: <strong>{{ team.getName() }}</strong> ({{ teamManagementSettings.rosterName }})</p>
            </template>
        </modal>
        <modal
            v-show="modals.retireTeam === true"
            :buttons-config="{'close': 'Cancel', 'continue': 'Retire Team'}"
            :modal-size="'small'"
            @close="modals.retireTeam = false"
            @continue="modals.retireTeam = false"
        >
            <template v-slot:header>
                Retire team?
            </template>

            <template v-slot:body>
                <p>Are you sure you want to retire the following team?</p>
                <p>Team: <strong>{{ team.getName() }}</strong> ({{ teamManagementSettings.rosterName }})</p>
            </template>
        </modal>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';
import {
    AddRemovePermissions,
    PlayerGender,
    PlayerRowFoldOutMode,
    PositionDataForBuyingPlayer
} from "../include/Interfaces";
import AccessControl from "../include/AccessControl";
import Team from "../include/Team";
import TeamSheet from "../include/TeamSheet";
import PlayerComponent from "./Player.vue";
import Player from "../include/Player";

import HireRookiesComponent from "./HireRookies.vue";
import RosterIconManager from "../include/RosterIconManager";
import TeamManagementSettings from "../include/TeamManagementSettings";
import SpecialRulesComponent from "./SpecialRules.vue";
import AddRemoveComponent from "./AddRemove.vue";
import ModalComponent from "./Modal.vue";
import FumbblApi from "../include/FumbblApi";

@Component({
    components: {
        'player': PlayerComponent,
        'hirerookies': HireRookiesComponent,
        'specialrules': SpecialRulesComponent,
        'addremove': AddRemoveComponent,
        'modal': ModalComponent,
    },
    props: {
        fumbblApi: {
            type: Object,
            required: true,
        },
        demoTeamSettings: {
            type: Object,
            required: true,
        },
    },
})
export default class TeamComponent extends Vue {
    private accessControl: AccessControl | null = null;
    private teamManagementSettings: TeamManagementSettings | null = null;
    private rosterIconManager: RosterIconManager | null = null;
    public team: Team | null = null;
    public teamSheet: TeamSheet | null = null;
    private editTeamName: boolean = false;
    private newTeamName: string = '';

    private rawApiSpecialRules: {fromRoster: any, fromTeam: any} = {fromRoster: null, fromTeam: null};

    private mainMenuShow: string = 'none';

    private showHireRookies: boolean = false;

    private errorModalInfo: {general: string, technical: string} = null;

    private modals: {
        submitForApproval: boolean,
        errorsForCreate: boolean,
        deleteTeam: boolean,
        retireTeam: boolean,
        removeReroll: boolean,
        removeAssistantCoach: boolean,
        removeCheerleader: boolean,
        removeApothecary: boolean,
    } = {
        submitForApproval: false,
        errorsForCreate: false,
        deleteTeam: false,
        retireTeam: false,
        removeReroll: false,
        removeAssistantCoach: false,
        removeCheerleader: false,
        removeApothecary: false,
    };

    private updateInProgress: boolean = false;

    private getFumbblApi(): FumbblApi {
        return this.$props.fumbblApi;
    }

    private menuShow(menu: string) {
        this.mainMenuShow = menu;
    }

    private menuHide(menu: string) {
        this.mainMenuShow = 'none';
    }

    async mounted() {
        if (this.$props.demoTeamSettings.newTeam !== null) {
            const rulesetId = this.$props.demoTeamSettings.newTeam.rulesetId;
            const rosterId = this.$props.demoTeamSettings.newTeam.rosterId;
            await this.setupForRulesetAndRoster(rulesetId, rosterId);
            this.team = new Team(
                this.$props.demoTeamSettings.newTeam.division,
                this.teamManagementSettings.minStartFans,
                this.teamManagementSettings.startTreasury,
            );
        } else if (this.$props.demoTeamSettings.existingTeamId !== null) {
            await this.reloadTeam();
        } else {
            throw new Error('Must be either new or existing configured.');
        }

        this.accessControl = new AccessControl(['OWNER'], this.team.getTeamStatus().getStatus());
        this.refreshTeamSheet();
    }

    private async reloadTeam() {
        const apiResponse = await this.getFumbblApi().getTeam(this.$props.demoTeamSettings.existingTeamId);
        if (apiResponse.isSuccessful()) {
            const rawApiTeam = apiResponse.getData();
            this.rawApiSpecialRules.fromTeam = rawApiTeam.specialRules;
            await this.setupForRulesetAndRoster(rawApiTeam.ruleset, rawApiTeam.roster.id);
            this.team = Team.fromApi(
                rawApiTeam,
                this.teamManagementSettings.minStartFans,
                this.teamManagementSettings,
                this.rosterIconManager,
            );
            this.refreshTeamSheet();
        } else {
            this.$emit('unexpected-error', 'Loading team information.', apiResponse.getErrorMessage());
        }
    }

    private created() {
        window.addEventListener("keydown", this.handleKeyDown);
    }

    private destroyed() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.ctrlKey || event.metaKey) {
            if (this.accessControl && this.accessControl.canEdit()) {
                if (event.key === "$") {
                    event.preventDefault();
                    this.enableShowHireRookies();
                }
            }
        }
    }

    private async setupForRulesetAndRoster(rulesetId: number, rosterId: number) {
        const apiResponseRuleset = await this.getFumbblApi().getRuleset(rulesetId);
        const apiResponseRoster = await this.getFumbblApi().getRoster(rosterId);

        if (apiResponseRuleset.isSuccessful() && apiResponseRoster.isSuccessful()) {
            const rawApiRuleset = apiResponseRuleset.getData();
            const rawApiRoster = apiResponseRoster.getData();

            this.rawApiSpecialRules.fromRoster = rawApiRoster.specialRules;

            await this.setupRosterIconManager(rawApiRoster.positions);
            this.teamManagementSettings = new TeamManagementSettings(rawApiRuleset, rawApiRoster);
        } else {
            let currentAction = '';
            let errorMessage = '';
            if (! apiResponseRuleset.isSuccessful()) {
                currentAction = 'Loading ruleset information.';
                errorMessage = apiResponseRuleset.getErrorMessage();
            } else {
                currentAction = 'Loading roster information.';
                errorMessage = apiResponseRoster.getErrorMessage();
            }
            this.$emit('unexpected-error', currentAction, errorMessage);
        }
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
            this.team.getTreasury(),
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

    private get divisionLogoImageUrl(): string {
        if (this.team.getDivision() === 'Competitive') {
            return 'https://fumbbl.com/i/677766';
        } else if (this.team.getDivision() === 'League') {
            return 'https://fumbbl.com/FUMBBL/Images/Icons/league.png';
        } else {
            return 'https://fumbbl.com/FUMBBL/Images/Race/unknown_196.png';
        }
    }

    public refreshTeamSheet() {
        this.teamSheet = new TeamSheet(
            this.teamManagementSettings.maxPlayers,
            this.team.getPlayers(),
        );
    }

    private get rerollCostForMode(): number {
        if (this.team.getTeamStatus().isNew()) {
            return this.teamManagementSettings.rerollCostOnCreate;
        } else {
            return this.teamManagementSettings.rerollCostFull;
        }
    }

    public handleMakePlayerDraggable(playerNumber: number) {
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

    private async updateDedicatedFans() {
        const apiResponse = await this.getFumbblApi().setDedicatedFans(this.team.getId(), this.team.getDedicatedFans());
        if (apiResponse.isSuccessful()) {
            await this.reloadTeam();
        } else {
            this.errorModalInfo = {
                general: 'An error occurred setting dedicated fans.',
                technical: apiResponse.getErrorMessage(),
            }
        }
    }

    private async addReroll() {
        this.updateInProgress = true;
        const apiResponse = await this.getFumbblApi().addReroll(this.team.getId());
        if (apiResponse.isSuccessful()) {
            this.team.addReroll(
                this.team.getTeamStatus().isNew() ? this.teamManagementSettings.rerollCostOnCreate : this.teamManagementSettings.rerollCostFull
            );
            await this.reloadTeam();
        } else {
            this.errorModalInfo = {
                general: 'An error occurred adding a reroll.',
                technical: apiResponse.getErrorMessage(),
            }
        }
        this.updateInProgress = false;
    }

    private async removeReroll() {
        this.updateInProgress = true;
        this.modals.removeReroll = false;
        let apiResponse = null;
        if (this.accessControl.canCreate()) {
            apiResponse = await this.getFumbblApi().removeReroll(this.team.getId());
        } else {
            apiResponse = await this.getFumbblApi().discardReroll(this.team.getId());
        }
        if (apiResponse.isSuccessful()) {
            this.team.removeReroll();
            await this.reloadTeam();
        } else {
            this.errorModalInfo = {
                general: 'An error occurred removing a reroll.',
                technical: apiResponse.getErrorMessage(),
            }
        }
        this.updateInProgress = false;
    }

    private async addAssistantCoach() {
        this.updateInProgress = true;
        const apiResponse = await this.getFumbblApi().addAssistantCoach(this.team.getId());
        if (apiResponse.isSuccessful()) {
            this.team.addAssistantCoach(
                this.teamManagementSettings.assistantCoachCost
            );
            await this.reloadTeam();
        } else {
            this.errorModalInfo = {
                general: 'An error occurred adding an assistant coach.',
                technical: apiResponse.getErrorMessage(),
            }
        }
        this.updateInProgress = false;
    }

    private async removeAssistantCoach() {
        this.updateInProgress = true;
        this.modals.removeAssistantCoach = false;
        let apiResponse = null;
        if (this.accessControl.canCreate()) {
            apiResponse = await this.getFumbblApi().removeAssistantCoach(this.team.getId());
        } else {
            apiResponse = await this.getFumbblApi().fireAssistantCoach(this.team.getId());
        }
        if (apiResponse.isSuccessful()) {
            this.team.removeAssistantCoach();
            await this.reloadTeam();
        } else {
            this.errorModalInfo = {
                general: 'An error occurred removing an assistant coach.',
                technical: apiResponse.getErrorMessage(),
            }
        }
        this.updateInProgress = false;
    }

    private async addCheerleader() {
        this.updateInProgress = true;
        const apiResponse = await this.getFumbblApi().addCheerleader(this.team.getId());
        if (apiResponse.isSuccessful()) {
            this.team.addCheerleader(
                this.teamManagementSettings.cheerleaderCost
            );
            await this.reloadTeam();
        } else {
            this.errorModalInfo = {
                general: 'An error occurred adding a cheerleader.',
                technical: apiResponse.getErrorMessage(),
            }
        }
        this.updateInProgress = false;
    }

    private async removeCheerleader() {
        this.updateInProgress = true;
        this.modals.removeCheerleader = false;
        let apiResponse = null;
        if (this.accessControl.canCreate()) {
            apiResponse = await this.getFumbblApi().removeCheerleader(this.team.getId());
        } else {
            apiResponse = await this.getFumbblApi().fireCheerleader(this.team.getId());
        }
        if (apiResponse.isSuccessful()) {
            this.team.removeCheerleader();
            await this.reloadTeam();
        } else {
            this.errorModalInfo = {
                general: 'An error occurred removing a cheerleader.',
                technical: apiResponse.getErrorMessage(),
            }
        }
        this.updateInProgress = false;
    }

    private async addApothecary() {
        this.updateInProgress = true;
        const apiResponse = await this.getFumbblApi().addApothecary(this.team.getId());
        if (apiResponse.isSuccessful()) {
            this.team.addApothecary(
                this.teamManagementSettings.apothecaryCost
            );
            await this.reloadTeam();
        } else {
            this.errorModalInfo = {
                general: 'An error occurred adding an apothecary.',
                technical: apiResponse.getErrorMessage(),
            }
        }
        this.updateInProgress = false;
    }

    private async removeApothecary() {
        this.updateInProgress = true;
        this.modals.removeApothecary = false;
        let apiResponse = null;
        if (this.accessControl.canCreate()) {
            apiResponse = await this.getFumbblApi().removeApothecary(this.team.getId());
        } else {
            apiResponse = await this.getFumbblApi().fireApothecary(this.team.getId());
        }
        if (apiResponse.isSuccessful()) {
            this.team.removeApothecary();
            await this.reloadTeam();
        } else {
            this.errorModalInfo = {
                general: 'An error occurred removing an apothecary.',
                technical: apiResponse.getErrorMessage(),
            }
        }
        this.updateInProgress = false;
    }

    private enableShowHireRookies(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.showHireRookies = ! this.showHireRookies;
    }

    private getGender(defaultGender: string): PlayerGender {
        const availableGenders: PlayerGender[] = ['FEMALE', 'MALE', 'NEUTRAL', 'NONBINARY'];
        if (availableGenders.includes(defaultGender.toUpperCase() as PlayerGender)) {
            return defaultGender.toUpperCase() as PlayerGender;
        }
        return availableGenders[Math.floor(Math.random()*availableGenders.length)];
    }

    public handleRemovePlayer(teamSheetEntryNumber: number) {
        this.team.removePlayer(teamSheetEntryNumber);
        // TODO: Call API to remove player
        this.refreshTeamSheet();
    }

    public handleRetirePlayer(teamSheetEntryNumber: number) {
        // TODO: Call API to retire player
    }

    private handleFoldOut(teamSheetEntryNumber: number, playerRowFoldOutMode: PlayerRowFoldOutMode, multipleOpenMode: boolean) {
        this.teamSheet.updateFoldOut(teamSheetEntryNumber, playerRowFoldOutMode, multipleOpenMode);
    }

    private async handleHireRookie(positionId: number) {
        this.updateInProgress = true;

        const position = this.teamManagementSettings.getPosition(positionId);
        const gender = this.getGender(position.defaultGender);

        // Add quick temporary player for user interface responsiveness
        // This temporary player is removed when reload team is called later in this method
        this.team.buyTemporaryPlayer(
            this.teamSheet.findFirstEmptyTeamSheetEntry().getNumber(),
            this.teamManagementSettings.getPosition(positionId),
            this.rosterIconManager.getRandomIconRowVersionPosition(positionId),
        );
        this.refreshTeamSheet();

        const apiResponsePlayerName = await this.getFumbblApi().generatePlayerName(this.teamManagementSettings.nameGenerator, gender);

        if (! apiResponsePlayerName.isSuccessful()) {
            this.team.removeTemporaryPlayers();
            this.refreshTeamSheet();
            this.errorModalInfo = {
                general: 'An error occurred when generating a player name.',
                technical: apiResponsePlayerName.getErrorMessage(),
            }
            this.updateInProgress = false;
            return;
        }

        const playerName = apiResponsePlayerName.getData();

        const apiResponse = await this.getFumbblApi().addPlayer(this.team.getId(), positionId, gender, playerName);
        if (apiResponse.isSuccessful()) {
            await this.reloadTeam();
        } else {
            this.team.removeTemporaryPlayers();
            this.refreshTeamSheet();
            this.errorModalInfo = {
                general: 'An error occurred buying a new player.',
                technical: apiResponse.getErrorMessage(),
            }
        }
        this.updateInProgress = false;
    }

    private enableTeamNameEdit(): void {
        this.editTeamName = true;
        this.newTeamName = this.team.getName();
    }

    private async saveNewTeamName() {
        const apiResponse = await this.getFumbblApi().renameTeam(this.team.getId(), this.newTeamName);
        if (apiResponse.isSuccessful()) {
            this.team.setName(this.newTeamName);
            this.newTeamName = '';
            this.editTeamName = false;
        } else {
            this.newTeamName = '';
            this.editTeamName = false;
            this.errorModalInfo = {
                general: 'Unable to rename team.',
                technical: apiResponse.getErrorMessage(),
            }
        }
    }

    private cancelNewTeamName(): void {
        this.newTeamName = '';
        this.editTeamName = false;
    }

    private handleSpecialRulesUpdated() {
        this.reloadTeam();
    }
}
</script>