<template>
    <div class="quickstart" v-if="roster !== null">
        <div class="rostername">{{ roster.name }} (Tier: {{ getRosterTier(roster.id) }})</div>

        <div class="rosterinfo">{{ roster.info }}</div>

        <div class="quickstarthelp">
            Use this page to quickly get your team up and running, you can still make changes after you finish on this page
            or you can skip this page and set everything up manually if you prefer.
        </div>

        <div class="subheading">
            Players
        </div>

        <table class="infotable playertable">
            <thead>
            <tr>
                <th>Quantity</th>
                <th>Position</th>
                <th>MA</th>
                <th>ST</th>
                <th>AG</th>
                <th>PA</th>
                <th>AV</th>
                <th>Skills</th>
                <th>Cost</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="position in roster.positions" :key="position.id">
                <td class="positionquantity">
                    <select v-model="positionQuantities[position.id]" @change="positionQuantityChanged">
                        <option>0</option>
                        <option v-for="index in ~~position.quantity" :key="index" :value="index">{{ index }}</option>
                    </select>
                </td>
                <td class="positiontitle">
                    {{ position.title }}
                </td>
                <td class="positionstat">
                    {{ position.stats.MA }}
                </td>
                <td class="positionstat">
                    {{ position.stats.ST }}
                </td>
                <td class="positionstat">
                    {{ position.stats.AG }}+
                </td>
                <td class="positionstat">
                    {{ position.stats.PA }}+
                </td>
                <td class="positionstat">
                    {{ position.stats.AV }}+
                </td>
                <td class="positionskills">
                    {{ position.skills.join(', ') }}
                </td>
                <td class="positioncost">
                    {{ position.cost }}
                </td>
            </tr>
            </tbody>
        </table>

        <div class="fiftyfifty">
            <div class="theleft">
                <div class="subheading">
                    Staff and Rerolls
                </div>

                <table class="infotable stafftable">
                    <thead>
                        <th>Quantity</th>
                        <th>Type</th>
                        <th>Cost</th>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="staffquantity">
                                <select v-model="rerolls" id="rerolls">
                                    <option value="0">0</option>
                                    <option v-for="index in 8" :key="index" :value="index">{{ index }}</option>
                                </select>
                            </td>
                            <td>
                                <label for="rerolls">Team re-rolls</label>
                            </td>
                            <td class="staffcost">
                                {{ roster.rerollCost }}
                            </td>
                        </tr>
                        <tr>
                            <td class="staffquantity">
                                <select v-model="dedicatedFans" id="dedicatedfans">
                                    <option v-for="df in dedicatedFansOptions" :key="df.amountBuying" :value="df.amountBuying">{{ df.amountDisplay }}</option>
                                </select>
                            </td>
                            <td>
                                <label for="dedicatedfans">Dedicated fans</label>
                            </td>
                            <td class="staffcost">
                                {{ dedicatedFansCost }}
                            </td>
                        </tr>
                        <tr>
                            <td class="staffquantity">
                                <select v-model="assistantCoaches" id="assistantcoaches">
                                    <option value="0">0</option>
                                    <option v-for="index in 6" :key="index" :value="index">{{ index }}</option>
                                </select>
                            </td>
                            <td>
                                <label for="assistantcoaches">Assistant coaches</label>
                            </td>
                            <td class="staffcost">
                                {{ assistantCoachesCost }}
                            </td>
                        </tr>
                        <tr>
                            <td class="staffquantity">
                                <select v-model="cheerleaders" id="cheerleaders">
                                    <option value="0">0</option>
                                    <option v-for="index in 12" :key="index" :value="index">{{ index }}</option>
                                </select>
                            </td>
                            <td>
                                <label for="cheerleaders">Cheerleaders</label>
                            </td>
                            <td class="staffcost">
                                {{ cheerleadersCost }}
                            </td>
                        </tr>
                        <tr v-if="roster.apothecary === 'Yes'">
                            <td class="staffquantity">
                                <input type="checkbox" v-model="apothecary" id="apothecary">
                            </td>
                            <td>
                                <label for="apothecary">Apothecary</label>
                            </td>
                            <td class="staffcost">
                                {{ apothecaryCost }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="theright">
                <div class="subheading">
                    Your team:
                </div>

                <div class="calculatedteam">
                    <div class="costs">
                        <div class="calculatedcelllabel">Cost:</div>
                        <div class="teamvalue calculatedcell">{{ teamValue }}</div>
                        <div class="maximumcell">/ {{ ruleset.startTreasury }}</div>
                    </div>
                    <div class="players">
                        <div class="calculatedcelllabel">Total players:</div>
                        <div class="playercount calculatedcell">{{ playerCount }}</div>
                        <div class="maximumcell">/ {{ ruleset.maxPlayers }}</div>
                    </div>
                    <div v-if="errors.length > 0" class="errors">
                        <div class="errorheading">Issues to fix:</div>
                        <div v-for="(error, index) in errors" :key="index" class="error">
                            {{ error}}
                        </div>
                    </div>
                </div>

                <div class="nextbutton" v-if="errors.length === 0">
                    <button @click="finishedBuild">Continue</button>
                    <div>You'll still be able to make further changes, this is just to get things setup quickly.</div>
                </div>

                <div v-if="errors.length > 0">
                    <a @click.prevent="skipQuickStart" href="#">Set everything up manually</a>
                </div>
            </div>
        </div>
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
        rosterId: {
            type: Number,
            required: true,
        },
        ruleset: {
            type: Object,
            required: true,
        },
    }
})
export default class QuickStartComponent extends Vue {
    readonly dedicatedFansCost = 10000;
    readonly assistantCoachesCost = 10000;
    readonly cheerleadersCost = 10000;
    readonly apothecaryCost = 50000;

    public roster: any = null;
    public positionQuantities: any = null;
    public playerCost: number = 0;
    public playerCount: number = 0;
    public rerolls: number = 0;
    public dedicatedFans: number = 0;
    public assistantCoaches: number = 0;
    public cheerleaders: number = 0;
    public apothecary: boolean = false;

    async mounted() {
        const result = await Axios.post('http://localhost:3000/api/roster/get/' + this.$props.rosterId);

        this.positionQuantities = {};

        for (const position of result.data.positions) {
            this.positionQuantities[position.id] = 0;
        }

        this.roster = result.data;
    }

    public positionQuantityChanged() {
        let playerCost = 0;
        let playerCount = 0;
        for (const position of this.roster.positions) {
            const positionQuantity = ~~this.positionQuantities[position.id];
            playerCost += position.cost * positionQuantity;
            playerCount += positionQuantity;
        }
        this.playerCost = playerCost;
        this.playerCount = playerCount;
    }

    public get errors() {
        const errors = [];
        if (this.teamValue > this.$props.ruleset.startTreasury) {
            errors.push(`Starting treasury is ${this.$props.ruleset.startTreasury}, you have spent ${this.teamValue}.`);
        }

        if (this.playerCount > this.$props.ruleset.maxPlayers) {
            errors.push(`Maximum players is ${this.$props.ruleset.maxPlayers}, you have selected ${this.playerCount}.`);
        }

        if (this.playerCount < this.$props.ruleset.startPlayers) {
            errors.push(`Minimum players is ${this.$props.ruleset.startPlayers}, you have selected ${this.playerCount}.`);
        }

        return errors;
    }

    public skipQuickStart() {
        const positionsLookup = {};
        for (const position of this.roster.positions) {
            positionsLookup[position.id] = position;
        }

        const buildData = {
            players: [],
            rerolls: 0,
            dedicatedFans: 0,
            assistantCoaches: 0,
            cheerleaders: 0,
            apothecary: false,
            ruleset: this.$props.ruleset,
            roster: this.roster,
            positionsLookup: positionsLookup,
        };
        this.$emit('quick-start-finished', buildData);
    }

    public async finishedBuild() {
        const positionsLookup = {};
        for (const position of this.roster.positions) {
            positionsLookup[position.id] = position;
        }

        const buildData = {
            players: await this.createPlayers(),
            rerolls: this.rerolls,
            dedicatedFans: this.dedicatedFans,
            assistantCoaches: this.assistantCoaches,
            cheerleaders: this.cheerleaders,
            apothecary: this.apothecary,
            ruleset: this.$props.ruleset,
            roster: this.roster,
            positionsLookup: positionsLookup,
        };
        this.$emit('quick-start-finished', buildData);
    }

    private async createPlayers(): Promise<any[]> {
        const positionsLookup = {};
        for (const position of this.roster.positions) {
            positionsLookup[position.id] = position;
        }

        // sort by cost
        const sortedPositionIds = this.roster.positions
            .map((position) => { return {positionId: ~~position.id, cost: ~~position.cost};})
            .sort((a, b) => {
                if (a.cost === b.cost) {
                    return 0;
                }
                return a.cost > b.cost ? -1 : 1;
            })
            .map((positionData => { return positionData.positionId; }));

        const players = [];

        let playerNumber = 1;
        for (const positionId of sortedPositionIds) {
            for (let step = 0; step < this.positionQuantities[positionId]; step++) {
                players.push(await this.createPlayer(playerNumber, positionsLookup[positionId]));
                playerNumber++;
            }
        }

        return players;
    }

    private async createPlayer(playerNumber: number, positionObject: any): Promise<any> {
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
        };
    }

    public get teamValue() {
        return this.playerCost +
            (this.rerolls * this.roster.rerollCost) +
            (this.assistantCoaches * this.assistantCoachesCost) +
            (this.cheerleaders * this.cheerleadersCost) +
            (this.apothecary && this.roster.apothecary === 'Yes' ? this.apothecaryCost : 0) +
            (this.dedicatedFans * this.dedicatedFansCost);
    }

    public get dedicatedFansOptions() {
        const startFans = this.$props.ruleset.startFans;
        const maxFans = this.$props.ruleset.maxStartFans;

        const options = [];

        for (let step = 0; step <= (maxFans - startFans); step++) {
            options.push(
                {
                    amountBuying: step,
                    amountDisplay: step + startFans,
                }
            );
        }

        return options;
    }

    public getRosterTier(rosterId: number) {
        for (const roster of this.$props.ruleset.rosters) {
            console.log(rosterId, roster.id, rosterId === roster.id);
            if (roster.id === ~~rosterId) {
                return roster.tier;
            }
        }
        return null;
    }
}
</script>