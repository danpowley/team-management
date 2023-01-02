<template>
    <div class="quickstart" v-if="roster !== null">
        <h1>{{ roster.name }}</h1>

        <table>
            <tr v-for="position in roster.positions" :key="position.id">
                <td>
                    <select v-model="positionQuantities[position.id]" @change="positionQuantityChanged">
                        <option>0</option>
                        <option v-for="index in ~~position.quantity" :key="index" :value="index">{{ index }}</option>
                    </select>
                </td>
                <td>
                    {{ position.title }}
                </td>
                <td>
                    {{ position.cost }}
                </td>
            </tr>
        </table>

        <div>
            <select v-model="rerolls">
                <option value="0">0</option>
                <option v-for="index in 8" :key="index" :value="index">{{ index }}</option>
            </select>
            Team re-rolls
        </div>

        <div>
            <select v-model="dedicatedFans">
                <option v-for="df in dedicatedFansOptions" :key="df.amountBuying" :value="df.amountBuying">{{ df.amountDisplay }}</option>
            </select>
            Dedicated fans
        </div>

        <div>
            <select v-model="assistantCoaches">
                <option value="0">0</option>
                <option v-for="index in 6" :key="index" :value="index">{{ index }}</option>
            </select>
            Assistant coaches
        </div>

        <div>
            <select v-model="cheerleaders">
                <option value="0">0</option>
                <option v-for="index in 12" :key="index" :value="index">{{ index }}</option>
            </select>
            Cheerleaders
        </div>

        <div v-if="roster.apothecary === 'Yes'">
            <input type="checkbox" v-model="apothecary">
            Apothecary
        </div>

        <div>
            {{ teamValue }} / {{ ruleset.startTreasury }}
        </div>
        <div>
            {{ playerCount }} / {{ ruleset.maxPlayers }}
        </div>
        <div v-for="(error, index) in errors" :key="index" style="color: red; font-weight: bold;">
            {{ error}}
        </div>

        <div v-if="errors.length === 0">
            <button @click="finishedBuild">Finished build</button>
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
            errors.push('Exceeded starting treasury.');
        }

        if (this.playerCount > this.$props.ruleset.maxPlayers) {
            errors.push('Exceeded maximum players.');
        }

        return errors;
    }

    public finishedBuild() {
        const positionsLookup = {};
        for (const position of this.roster.positions) {
            positionsLookup[position.id] = position;
        }

        const buildData = {
            players: this.createPlayers(),
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

    private createPlayers(): any[] {
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
                players.push(this.createPlayer(playerNumber, positionsLookup[positionId]));
                playerNumber++;
            }
        }

        return players;
    }

    private createPlayer(playerNumber: number, positionObject: any): any {
        return {
            id: 'NEW--' + playerNumber,
            number: playerNumber,
            name: `Player_${playerNumber}`,
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
            injuries: '',
            skills: [],
            gender: 'Female',
        };
    }

    public get teamValue() {
        return this.playerCost +
            (this.rerolls * this.roster.rerollCost) +
            (this.assistantCoaches * 10000) +
            (this.cheerleaders * 10000) +
            (this.apothecary && this.roster.apothecary === 'Yes' ? 50000 : 0) +
            (this.dedicatedFans * 10000);
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
}
</script>