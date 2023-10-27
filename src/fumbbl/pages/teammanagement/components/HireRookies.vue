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
import Vue, { PropType } from "vue";
import Component from 'vue-class-component';
import { PositionDataForBuyingPlayer } from "../include/Interfaces";
import RosterIconManager from "../include/RosterIconManager";

const HireRookiesComponentProps = Vue.extend({
    components: {
    },
    props: {
        rosterPositionDataForBuyingPlayer: {
            type: Array as PropType<PositionDataForBuyingPlayer[]>,
            required: true,
        },
        rosterIconManager: {
            type: Object as PropType<RosterIconManager>,
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
});

@Component
export default class HireRookiesComponent extends HireRookiesComponentProps {
    private get bigGuyCount(): number {
        let bigGuyCount = 0;
        for (const positionDataForBuyingPlayer of this.rosterPositionDataForBuyingPlayer) {
            if (positionDataForBuyingPlayer.position.isBigGuy) {
               bigGuyCount += positionDataForBuyingPlayer.quantityHired;
            }
        }
        return bigGuyCount;
    }

    public reasonsCannotBuy(positionDataForBuyingPlayer: PositionDataForBuyingPlayer): string[] {
        const errors: string[] = [];
        if (! this.hasEmptyTeamSheetEntry) {
            errors.push('No space left on team list.');
        }
        if (positionDataForBuyingPlayer.quantityHired >= positionDataForBuyingPlayer.position.quantityAllowed) {
            errors.push('Limit for position reached.');
        }
        if (! positionDataForBuyingPlayer.canAfford) {
            errors.push('Insufficient treasury.');
        }
        if (positionDataForBuyingPlayer.position.isBigGuy && this.bigGuyCount >= this.maxBigGuys) {
            errors.push('Maximum Big Guy limit reached.');
        }
        return errors;
    }

    public canBuyPosition(positionDataForBuyingPlayer: PositionDataForBuyingPlayer): boolean {
        return this.reasonsCannotBuy(positionDataForBuyingPlayer).length === 0;
    }

    public hireRookie(positionDataForBuyingPlayer: PositionDataForBuyingPlayer) {
        if (this.canBuyPosition(positionDataForBuyingPlayer)) {
            this.$emit('hire-rookie', positionDataForBuyingPlayer.position.id);
        }
    }
}
</script>