<template>
    <div class="team" v-if="team !== null">
        <div class="teamheader">
            <img class="rosterlogo" src="https://fumbbl.com/i/486246" alt="Roster logo">
            <img class="divisionlogo" src="https://fumbbl.com/i/677766" alt="Division logo">
            <div><input></div>
            <div align="center" style="margin-top: 0.5em;">
                <img src="https://fumbbl.com/FUMBBL/Images/Roster_small.gif" alt="Roster" title="Explanation of team mode here"> [C] Chaos Chosen
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
                <template v-if="editMode === false">
                    <th>Cp</th>
                    <th>Td</th>
                    <th>It</th>
                    <th>Cs</th>
                    <th>Mvp</th>
                </template>
                <template v-else>
                    <th colspan="5" class="editcontrolscolumn">
                        Edit
                    </th>
                </template>
                <th>SPP</th>
                <th>Cost</th>
            </tr>
            </thead>
            <player v-for="(player, playerNumber) in playersInPositions" :key="playerNumber"
                :editMode="editMode"
                :playerNumber="~~playerNumber"
                :player="player"
                :position="player ? getPosition(player.positionId) : null"
                :drag-source-player-number="dragSourcePlayerNumber"
                :drop-target-player-number="dropTargetPlayerNumber"
                :player-numbers-with-player-below="playerNumbersWithPlayerBelow"
                @add-player="handleAddPlayer"
                @make-player-draggable="handleMakePlayerDraggable"
            ></player>
        </table>
        <a @click.prevent="editMode = !editMode">Edit mode toggle</a>
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
    public editMode: boolean = false;
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

    public handleAddPlayer(playerNumber: number) {
        this.$emit('add-player', playerNumber);
    }
}
</script>