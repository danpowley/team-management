<template>
    <div class="teammanagement">
        <demosetup v-if="mode === 'DEMO_SETUP'"
            @ruleset-chosen="handleRulesetChosen"
        ></demosetup>

        <chooseroster v-if="mode === 'CHOOSE_ROSTER'"
            :rosters="newTeamRuleset.rosters"
            @roster-chosen="handleRosterChosen"
        ></chooseroster>

        <team v-if="mode === 'TEAM'"
            :team="team"
            @add-player="handleAddPlayer"
            @drag-drop-player="handleDragDropPlayer"
        ></team>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Axios from "axios";
import Component from "vue-class-component";
import ChooseRosterComponent from "./components/ChooseRoster.vue";
import TeamComponent from "./components/Team.vue";
import DemoSetupComponent from "./components/DemoSetup.vue";

@Component({
    components: {
        'demosetup': DemoSetupComponent,
        'chooseroster': ChooseRosterComponent,
        'team': TeamComponent,
    },
})
export default class TeamManagement extends Vue {
    public mode: 'DEMO_SETUP' | 'CHOOSE_ROSTER' | 'TEAM' = 'DEMO_SETUP';
    public newTeamRuleset: any | null = null;
    public team: any = null;
    public positionsIconData: any = null;

    async mounted() {
    }

    public async handleRulesetChosen(rulesetId: number) {
        this.newTeamRuleset = await this.getRosterDetailsForRuleset(rulesetId);
        this.mode = 'CHOOSE_ROSTER';
    }

    private async getRosterDetailsForRuleset(rulesetId: number) {
        const result = await Axios.post('http://localhost:3000/api/ruleset/get/' + rulesetId);

        const rosterLogos = await this.getRosterLogosVeryInefficiently(result.data.rosters);

        const rosters = [];
        for (const roster of result.data.rosters) {
            if (roster.value.startsWith('_')) {
                continue;
            }
            const rosterId = ~~roster.id;
            rosters.push({
                id: rosterId,
                name: roster.value,
                tier: roster.tier,
                logos: rosterLogos[rosterId],
            });
        }

        rosters.sort((a, b) => {
            if (a.name === b.name) {
                return 0;
            }
            return a.name > b.name ? 1 : -1;
        });

        return {
            id: result.data.id,
            name: result.data.name,
            startTreasury: result.data.options.teamSettings.startTreasury,
            startPlayers: result.data.options.teamSettings.startPlayers,
            maxPlayers: result.data.options.teamSettings.maxPlayers,
            startFans: result.data.options.teamSettings.startFans,
            minStartFans: result.data.options.teamSettings.minStartFans,
            maxStartFans: result.data.options.teamSettings.maxStartFans,
            rosters: rosters,
        };

        // https://fumbbl.com/api/ruleset/get/4
        // data.options.teamSettings.teamProgression
        // data.options.teamSettings.skillProgressionType
        // data.options.teamSettings.sppLimits": "6,16,31,51,76,176"
        // data.options.teamSettings.predeterminedSkills": "0:6N2D8S|0:3N|0:2N2D|0:3N3D|0:6N2D"
        // data.options.teamSettings.skillsPerPlayer
    }

    private async getRosterLogosVeryInefficiently(rosters: any[]): Promise<any> {
        const realLogos = false;
        const rosterLogos = {};
        for (const roster of rosters) {
            if (realLogos) {
                console.log('INEFFICIENT: loading logo data for ', roster.id);
                const result = await Axios.post('http://localhost:3000/api/roster/get/' + roster.id);
                rosterLogos[roster.id] = result.data.logos;
            } else {
                rosterLogos[roster.id] = {128: 486276};
            }
        }
        return rosterLogos;
    }

    public async handleRosterChosen(rosterId: number) {
        const roster = await this.getRoster(rosterId);

        const positionsLookup = {};
        for (const position of roster.positions) {
            positionsLookup[position.id] = position;
        }

        const team = {
            players: [],
            rerolls: 0,
            dedicatedFans: 0,
            assistantCoaches: 0,
            cheerleaders: 0,
            apothecary: false,
            ruleset: this.newTeamRuleset,
            roster: roster,
            positionsLookup: positionsLookup,
        };

        this.team = team;

        await this.refreshPositionIconData();

        this.mode = 'TEAM';
    }

    public async refreshPositionIconData() {
        const positionsIconData = {};
        for (const position of this.team.roster.positions) {
            positionsIconData[position.id] = {iconId: position.icon, iconData: await this.getIconData(position.icon)};
        }

        this.positionsIconData = positionsIconData;
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

    private getPlayerIconStyle(positionIconInfo: any): string {
        const iconSize = positionIconInfo.iconData.size;

        const iconVersionPosition = positionIconInfo.iconData.iconRowVersionPositions[Math.floor(Math.random() * positionIconInfo.iconData.iconRowVersionPositions.length)]

        return `width: ${iconSize}px; height: ${iconSize}px; background: rgba(0, 0, 0, 0) url("https://fumbbl.com/i/${positionIconInfo.iconId}") repeat scroll 0px ${iconVersionPosition}px;'"`;
    }

    private async getRoster(rosterId: number) {
        const result = await Axios.post('http://localhost:3000/api/roster/get/' + rosterId);
        return result.data;
    }

    private async createPlayer(playerNumber: number): Promise<any> {
        // get the first position we can get our hands on, fix later
        let positionObject = null;
        for (const positionId of Object.keys(this.team.positionsLookup)) {
            positionObject = this.team.positionsLookup[positionId];
        }

        const result = await Axios.post('http://localhost:3000/api/name/generate/default');
        const playerName = result.data;

        return {
            id: 'NEW--' + playerNumber,
            number: playerNumber,
            name: playerName,
            position: positionObject.title,
            positionId: positionObject.id,
            record: {
                completions: 0,
                touchdowns: 0,
                interceptions: 0,
                casualties: 0,
                mvps: 0,
                spp: 0,
            },
            injuries: 'x,y,z',
            skills: ['skill1', 'skill2'],
            gender: 'Female',
            iconStyle: await this.getPlayerIconStyle(this.positionsIconData[positionObject.id]),
        };
    }

    public handleDragDropPlayer(dragDropData: any) {
        if (dragDropData.source.playerNumber === dragDropData.target.playerNumber) {
            return;
        }

        const emptyTarget = dragDropData.target.playerId === null;
        const movingUp = dragDropData.source.playerNumber > dragDropData.target.playerNumber;

        let sourcePlayer = null;
        for (const player of this.team.players) {
            if (player.number === dragDropData.source.playerNumber) {
                sourcePlayer = player;
            }

            if (! emptyTarget) {
                if (movingUp) {
                    if (player.number >= dragDropData.target.playerNumber && player.number < dragDropData.source.playerNumber) {
                        player.number += 1;
                    }
                } else {
                    if (player.number <= dragDropData.target.playerNumber && player.number > dragDropData.source.playerNumber) {
                        player.number -= 1;
                    }
                }
            }
        }
        sourcePlayer.number = dragDropData.target.playerNumber;
    }

    public async handleAddPlayer(playerNumber: number) {
        this.team.players.push(await this.createPlayer(playerNumber));
    }
}
</script>