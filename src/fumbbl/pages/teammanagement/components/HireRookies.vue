<template>
    <div class="hirerookies">
        <div class="hirerookie" v-for="positionDataForBuyingPlayer in rosterPositionDataForBuyingPlayer" :key="positionDataForBuyingPlayer.positionId">
            <div class="rookieheader">
                <div class="positionname" :title="positionDataForBuyingPlayer.position.name">{{ positionDataForBuyingPlayer.position.name }}</div>
                <div class="positionquantity">{{ positionDataForBuyingPlayer.quantityHired }}/{{ positionDataForBuyingPlayer.position.quantityAllowed }}</div>
                <div class="positioncost">{{ positionDataForBuyingPlayer.position.cost/1000 }}k</div>
            </div>
            <div class="rookiebody">
                <div class="iconwithstats">
                    <div class="positioniconcontainer">
                        <div class="iconusingbackground" :style="rosterIconManager.getIconStyle(positionDataForBuyingPlayer.positionId, null)"></div>
                    </div>
                    <table class="rookiestats">
                        <tr>
                            <th>MA</th>
                            <th>ST</th>
                            <th>AG</th>
                            <th>PA</th>
                            <th>AV</th>
                        </tr>
                        <tr>
                            <td>{{ positionDataForBuyingPlayer.position.stats.Movement }}</td>
                            <td>{{ positionDataForBuyingPlayer.position.stats.Strength }}</td>
                            <td>{{ positionDataForBuyingPlayer.position.stats.Agility }}+</td>
                            <td>{{ positionDataForBuyingPlayer.position.stats.Passing ? `${positionDataForBuyingPlayer.position.stats.Passing}+` : '-' }}</td>
                            <td>{{ positionDataForBuyingPlayer.position.stats.Armour }}+</td>
                        </tr>
                    </table>
                    <div class="buying">
                        <button
                            @click="hireRookie(positionDataForBuyingPlayer)"
                            class="teambutton"
                            :class="{disabled: ! canBuyPosition(positionDataForBuyingPlayer)}"
                            :title="reasonsCannotBuy(positionDataForBuyingPlayer).join('\r\n')"
                        >Buy</button>
                    </div>
                </div>
                <div class="skills">{{ positionDataForBuyingPlayer.position.skills.join(', ') }}</div>
                <div class="quantityprogressouter" v-if="positionDataForBuyingPlayer.position.quantityAllowed > 100">
                    <div class="quantityprogress">
                        <div v-for="item in positionDataForBuyingPlayer.position.quantityAllowed" :key="item" :class="{yes: item <= positionDataForBuyingPlayer.quantityHired, no: item > positionDataForBuyingPlayer.quantityHired}"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';
import { PositionDataForBuyingPlayer } from "../include/Interfaces";

@Component({
    components: {
    },
    props: {
        rosterPositionDataForBuyingPlayer: {
            type: Array,
            required: true,
        },
        rosterIconManager: {
            type: Object,
            required: true,
        },
        hasEmptyTeamSheetEntry: {
            type: Boolean,
            required: true,
        },
        maxBigGuys: {
            type: Number,
            required: true,
        },
    },
    watch: {
    }
})
export default class HireRookiesComponent extends Vue {
    private inProgressPositionId: number = null;

    private get bigGuyCount(): number {
        let bigGuyCount = 0;
        for (const positionDataForBuyingPlayer of this.$props.rosterPositionDataForBuyingPlayer as PositionDataForBuyingPlayer[]) {
            if (positionDataForBuyingPlayer.position.isBigGuy) {
               bigGuyCount += positionDataForBuyingPlayer.quantityHired;
            }
        }
        return bigGuyCount;
    }
    private reasonsCannotBuy(positionDataForBuyingPlayer: PositionDataForBuyingPlayer): string[] {
        const errors: string[] = [];
        if (! this.$props.hasEmptyTeamSheetEntry) {
            errors.push('No space left on team list.');
        }
        if (positionDataForBuyingPlayer.quantityHired >= positionDataForBuyingPlayer.position.quantityAllowed) {
            errors.push('Limit for position reached.');
        }
        if (! positionDataForBuyingPlayer.canAfford) {
            errors.push('Insufficient treasury.');
        }
        if (positionDataForBuyingPlayer.position.isBigGuy && this.bigGuyCount >= this.$props.maxBigGuys) {
            errors.push('Maximum Big Guy limit reached.');
        }
        return errors;
    }

    private canBuyPosition(positionDataForBuyingPlayer: PositionDataForBuyingPlayer): boolean {
        if (this.inProgressPositionId === positionDataForBuyingPlayer.position.id) {
            return false;
        }
        return this.reasonsCannotBuy(positionDataForBuyingPlayer).length === 0;
    }

    private hireRookie(positionDataForBuyingPlayer: PositionDataForBuyingPlayer) {
        if (this.canBuyPosition(positionDataForBuyingPlayer)) {
            this.inProgressPositionId = positionDataForBuyingPlayer.position.id;
            setTimeout(() => this.inProgressPositionId = null, 750);
            this.$emit('hire-rookie', positionDataForBuyingPlayer.position.id);
        }
    }
}
</script>