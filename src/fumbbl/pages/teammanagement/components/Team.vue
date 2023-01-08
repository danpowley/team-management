<template>
    <div class="team" v-if="team !== null">
        <div class="teamheader">
            <img class="rosterlogo" src="https://fumbbl.com/i/486246" alt="Roster logo">
            <img class="divisionlogo" src="https://fumbbl.com/i/677766" alt="Division logo">
            <div><input v-if="teamMode === 'CREATE'"></div>
            <div align="center" style="margin-top: 0.5em;">
                <img src="https://fumbbl.com/FUMBBL/Images/Roster_small.gif" alt="Roster" title="Explanation of team mode here"> [C] Chaos Chosen
            </div>
        </div>
        <div v-if="teamMode === 'CREATE'" class="createteamstats">
            <div class="playerinfo">
                <div class="currentplayercount">{{ team.players.length }}</div> Players ({{ team.ruleset.startPlayers }} required)
            </div>
            <div class="costinfo">
                <div class="currentteamcost">{{ teamCost/1000 }}k</div> (Max {{ team.ruleset.startTreasury/1000 }}k)
            </div>
            <div class="actions">
                <a href="#" @click.prevent="resetCreateTeam()">Reset</a>
            </div>
        </div>
        <table class="infotable teamtable">
            <thead>
            <tr>
                <th></th>
                <th></th>
                <th></th>
                <th>Player</th>
                <th>Ma</th>
                <th>St</th>
                <th>Ag</th>
                <th>Pa</th>
                <th>Av</th>
                <th>Skills</th>
                <th>Inj</th>
                <th>G</th>
                <th>Cp</th>
                <th>Td</th>
                <th>It</th>
                <th>Cs</th>
                <th>Mvp</th>
                <th>SPP</th>
                <th>Cost</th>
            </tr>
            </thead>
            <player v-for="(player, playerNumber) in playersInPositions" :key="playerNumber"
                :team-mode="teamMode"
                :playerNumber="~~playerNumber"
                :player="player"
                :roster="team.roster"
                :position="player ? getPosition(player.positionId) : null"
                :drag-source-player-number="dragSourcePlayerNumber"
                :drop-target-player-number="dropTargetPlayerNumber"
                :player-numbers-with-player-below="playerNumbersWithPlayerBelow"
                @add-player="handleAddPlayer"
                @delete-player="handleDeletePlayer"
                @make-player-draggable="handleMakePlayerDraggable"
            ></player>
        </table>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';
import PlayerComponent from "./Player.vue";

@Component({
    components: {
        'player': PlayerComponent,
    },
    props: {
        team: {
            type: Object,
            required: true,
        },
    },
    watch: {
        team: {
            handler(newValue, oldValue) {
                // @ts-ignore: Property does not exist on type 'Vue'.
                this.refreshPlayersInPositions();
            },
            deep: true
        },
    }
})
export default class TeamComponent extends Vue {
    private teamMode: 'CREATE' | 'POST_GAME' | 'READY' = 'CREATE';
    public positionsLookup: any = null;
    public playersInPositions: any = null;

    public playerNumbersWithPlayerBelow: number[] = [];

    public dragSourcePlayerNumber: number | false = false;
    public dragSourcePlayerId: string = ''; // deal with new id string
    public dropTargetPlayerNumber: number | false = false;
    public dropTargetPlayerId: string = '';

    async mounted() {
        this.refreshPlayersInPositions();

        // HACK: artificial delay needed for setting up drag and drop to be ready.
        setTimeout(() => {
            this.setupDragDrop();
        }, 1000);
    }

    public get maxPlayers(): number {
        return Object.keys(this.playersInPositions).length;
    }

    private get teamCost(): number {
        let playerCost = 0;
        for (const player of this.$props.team.players) {
            const position = this.$props.team.positionsLookup[player.positionId];
            playerCost += ~~position.cost;
        }

        return playerCost;

        // return playerCost +
        //     (this.rerolls * this.roster.rerollCost) +
        //     (this.assistantCoaches * this.assistantCoachesCost) +
        //     (this.cheerleaders * this.cheerleadersCost) +
        //     (this.apothecary && this.roster.apothecary === 'Yes' ? this.apothecaryCost : 0) +
        //     (this.dedicatedFans * this.dedicatedFansCost);
    }

    public handleMakePlayerDraggable(playerNumber: number, playerId: string) {
        this.dragSourcePlayerNumber = playerNumber;
        this.dragSourcePlayerId = playerId;
    }

    public refreshPlayersInPositions() {
        const playersInPositions = {};

        for (let step = 1; step <= this.$props.team.ruleset.maxPlayers; step++) {
            playersInPositions[step] = null;
        }

        for (const player of this.$props.team.players) {
            playersInPositions[~~player.number] = player;
        }

        const playerNumbersWithPlayerBelow = [];
        for (const playerNumber of Object.keys(playersInPositions)) {
            if (~~playerNumber < this.$props.team.ruleset.maxPlayers) {
                if (playersInPositions[~~playerNumber + 1] !== null) {
                    playerNumbersWithPlayerBelow.push(~~playerNumber);
                }
            }
        }

        this.playersInPositions = playersInPositions;
        this.playerNumbersWithPlayerBelow = playerNumbersWithPlayerBelow;
    }

    public setupDragDrop() {
        const vueComponent = this;
        let rowsGroupedByTbody = document.querySelectorAll('.teamtable tbody');
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

                const dropTargetPlayerNumber = ~~dropTargetRow.dataset.position;
                if (dropTargetPlayerNumber !== vueComponent.dragSourcePlayerNumber) {
                    vueComponent.dropTargetPlayerNumber = dropTargetPlayerNumber;
                    vueComponent.dropTargetPlayerId = dropTargetRow.dataset.id; // string id!!!
                } else {
                    vueComponent.dropTargetPlayerNumber = false;
                    vueComponent.dropTargetPlayerId = ''; // string id!!!
                }
            });

            // naming, dataset.position, dataset.id

            tbody.addEventListener('drop', function (this: any, e) {
                const eventData = {
                    source: {
                        playerNumber: vueComponent.dragSourcePlayerNumber,
                        playerId: vueComponent.dragSourcePlayerId,
                    },
                    target: {
                        playerNumber: ~~this.dataset.position,
                        playerId: this.dataset.id ? this.dataset.id : null,
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

    public getPosition(positionId: number) {
        return this.$props.team.positionsLookup[positionId];
    }

    private resetCreateTeam() {
        this.$emit('reset-create-team');
    }

    public handleAddPlayer(playerNumber: number, positionId: number) {
        this.$emit('add-player', playerNumber, positionId);
    }

    public handleDeletePlayer(playerNumber: number) {
        this.$emit('delete-player', playerNumber);
    }
}
</script>