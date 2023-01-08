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
            <tbody v-for="(player, playerNumber) in playersInPositions" :key="playerNumber"
                :draggable="playerNumber == dragSourcePlayerNumber"
                :class="{
                    playerinrow: player !== null,
                    dragsource: dragSourcePlayerNumber === ~~playerNumber,
                    droptarget: dropTargetPlayerNumber === ~~playerNumber,
                }"
                :data-position="playerNumber"
                :data-id="player ? player.id : ''"
            >
                <template v-if="~~playerNumber !== dragSourcePlayerNumber && ~~playerNumber === dropTargetPlayerNumber && ~~playerNumber === 1">
                    <tr class="seperator active">
                        <td colspan="19">
                            <div class="line"></div>
                        </td>
                    </tr>
                </template>
                <template v-else>
                    <tr class="seperator spacer">
                        <td colspan="19">
                            <div class="line"></div>
                        </td>
                    </tr>
                </template>
                <tr class="main">
                    <template v-if="player !== null">
                        <td class="draghandle" @mousedown="makePlayerDraggable(~~playerNumber, player.id)" @mouseup="makePlayerDraggable(false, '')">
                            <template v-if="dragSourcePlayerNumber === false || dragSourcePlayerNumber === ~~playerNumber">
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
                        </td>
                    </template>
                    <template v-else>
                        <td class="draghandle">
                            <div class="droptargetindicator">&#8982;</div>
                        </td>
                    </template>
                    <td class="playernumber">
                        <span class="normalplayernumber">
                            {{ playerNumber }}
                        </span>
                        <div class="draggingnowindicator">&#8597;</div>
                    </td>
                    <template v-if="player !== null">
                        <td>
                            <div v-if="playerIconStyles !== null" class="iconouter">
                                <div class="iconinner" :style="playerIconStyles[player.id]"></div>
                            </div>
                        </td>
                        <td>
                            <div class="playername">{{ player.name }}</div>
                            <div class="playerposition">{{ player.position }}</div>
                        </td>
                        <td>
                            {{ team.positionsLookup[player.positionId].stats.MA }}
                        </td>
                        <td>
                            {{ team.positionsLookup[player.positionId].stats.ST }}
                        </td>
                        <td>
                            {{ team.positionsLookup[player.positionId].stats.AG }}+
                        </td>
                        <td>
                            {{ team.positionsLookup[player.positionId].stats.PA }}+
                        </td>
                        <td>
                            {{ team.positionsLookup[player.positionId].stats.AV }}+
                        </td>
                        <td>
                            <div class="positionskills">
                                {{ team.positionsLookup[player.positionId].skills.join(', ') }}
                            </div>
                            <div class="playerskills">
                                {{ player.skills.join(', ') }}
                            </div>
                        </td>
                        <td>
                            {{ player.injuries }}
                        </td>
                        <td>
                            ?
                        </td>
                        <template v-if="editMode === false">
                            <td>
                                {{ player.record.completions }}
                            </td>
                            <td>
                                {{ player.record.touchdowns }}
                            </td>
                            <td>
                                {{ player.record.interceptions }}
                            </td>
                            <td>
                                {{ player.record.casualties }}
                            </td>
                            <td>
                                {{ player.record.mvps }}
                            </td>
                        </template>
                        <template v-else>
                            <td colspan="5">
                                <div>
                                    <a href="#">edit</a> <a href="#">delete</a>
                                </div>
                            </td>
                        </template>
                        <td>
                            {{ player.record.spp }}
                        </td>
                        <td>
                            {{ team.positionsLookup[player.positionId].cost }}
                        </td>
                    </template>
                    <template v-else>
                        <td colspan="17">
                            No player here
                        </td>
                    </template>
                </tr>
                <tr class="seperator" :class="getSeperatorClasses(~~playerNumber)">
                    <td colspan="19">
                        <div class="line"></div>
                    </td>
                </tr>
            </tbody>
        </table>
        <a @click.prevent="editMode = !editMode">Edit mode toggle</a>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Axios from "axios";
import Component from 'vue-class-component';

@Component({
    components: {
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
    public playerIconStyles: any = null;

    public dragSourcePlayerNumber: number | false = false;
    public dragSourcePlayerId: string = ''; // deal with new id string
    public dropTargetPlayerNumber: number | false = false;
    public dropTargetPlayerId: string = '';

    async mounted() {
        this.refreshPlayersInPositions();
        await this.refreshPlayerIconStyles();
        this.setupDragDrop(); // how will this behave as new ones are added???
    }

    public get maxPlayers(): number {
        return Object.keys(this.playersInPositions).length;
    }

    public makePlayerDraggable(playerNumber: number | false, playerId: string) {
        this.dragSourcePlayerNumber = playerNumber;
        this.dragSourcePlayerId = playerId;
    }

    public getSeperatorClasses(playerNumber: number) {
        const draggingDownward = this.dropTargetPlayerNumber > this.dragSourcePlayerNumber;
        const ourPlayerNumberIsTheDropTarget = playerNumber === this.dropTargetPlayerNumber;
        const hasPlayer = this.playersInPositions[playerNumber] !== null;
        if (
            draggingDownward &&
            ourPlayerNumberIsTheDropTarget &&
            hasPlayer
        ) {
            return { active: true };
        }

        const draggingUpward = this.dropTargetPlayerNumber < this.dragSourcePlayerNumber;
        const ourPlayerNumberIsImmediatelyAboveDropTarget = this.dropTargetPlayerNumber !== false && playerNumber === this.dropTargetPlayerNumber - 1;
        let hasPlayerBelow = false;
        if (playerNumber < this.maxPlayers) {
            hasPlayerBelow = this.playersInPositions[playerNumber + 1] !== null;
        }
        if (
            draggingUpward &&
            ourPlayerNumberIsImmediatelyAboveDropTarget &&
            hasPlayerBelow
        ) {
            return { active: true };
        }

        return {
            normal: true,
        };
    }

    public refreshPlayersInPositions() {
        const playersInPositions = {};

        for (let step = 1; step <= this.$props.team.ruleset.maxPlayers; step++) {
            playersInPositions[step] = null;
        }

        for (const player of this.$props.team.players) {
            playersInPositions[~~player.number] = player;
        }

        this.playersInPositions = playersInPositions;
    }

    public async refreshPlayerIconStyles() {
        const positionIcons = {};
        for (const position of this.$props.team.roster.positions) {
            positionIcons[position.id] = {iconId: position.icon, iconData: await this.getIconData(position.icon)};
        }

        const playerIconStyles = {};
        for (const player of this.$props.team.players) {
            const playerIconStyle = this.getPlayerIconStyle(positionIcons[player.positionId]);
            playerIconStyles[player.id] = playerIconStyle;
        }

        this.playerIconStyles = playerIconStyles;
    }

    public setupDragDrop() {
        const vueComponent = this;
        let rowsGroupedByTbody = document.querySelectorAll('.teamtable tbody');
        rowsGroupedByTbody.forEach(function (tbody) {
            tbody.addEventListener('dragend', function (this: any, e) {
                vueComponent.makePlayerDraggable(false, '');
                vueComponent.dropTargetPlayerNumber = false;
                vueComponent.dropTargetPlayerId = '';
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

    public async getIconData(positionIconId: number): Promise<any> {
        const imageDimensions = (imageUrl): Promise<{width: number, height: number}> =>
            new Promise((resolve, reject) => {
                const img = new Image()

                img.onload = () => {
                    const { naturalWidth: width, naturalHeight: height } = img;
                    resolve({ width, height });
                }

                img.onerror = () => {
                    reject('There was some problem with the image.');
                }

                img.src = imageUrl;
            }
        );

        try {
            const dimensions = await imageDimensions(`https://fumbbl.com/i/${positionIconId}`);
            const iconSize = dimensions.width / 4;
            let counter = 0;
            const iconRowVersionPositions = [];
            while (counter < dimensions.height) {
                iconRowVersionPositions.push(-1 * counter);
                counter += iconSize;
            }
            return {
                size: iconSize,
                iconRowVersionPositions: iconRowVersionPositions,
            };
        } catch(error) {
            return 30;
        }
    }

    public getPlayerIconStyle(positionIconInfo: any): string {
        const iconSize = positionIconInfo.iconData.size;

        const iconVersionPosition = positionIconInfo.iconData.iconRowVersionPositions[Math.floor(Math.random() * positionIconInfo.iconData.iconRowVersionPositions.length)]

        return `width: ${iconSize}px; height: ${iconSize}px; background: rgba(0, 0, 0, 0) url("https://fumbbl.com/i/${positionIconInfo.iconId}") repeat scroll 0px ${iconVersionPosition}px;'"`;
    }
}
</script>