<template>
    <div class="buyplayer">
        <table class="buyingpositionals">
            <thead>
                <th>Buy?</th>
                <th>Cost</th>
                <th colspan="2">Position</th>
                <th>Quant.</th>
                <th>Ma</th>
                <th>St</th>
                <th>Ag</th>
                <th>Pa</th>
                <th>Av</th>
                <th>Skills</th>
            </thead>
            <tbody>
            <tr v-for="positionDataForBuyingPlayer in rosterPositionDataForBuyingPlayer" :key="positionDataForBuyingPlayer.positionId">
                <td class="buylink">
                    <template v-if="positionDataForBuyingPlayer.quantityHired < positionDataForBuyingPlayer.position.quantityAllowed">
                        <a
                            @click.prevent="$emit('add-player', positionDataForBuyingPlayer.positionId)"
                            href="#" :title="!positionDataForBuyingPlayer.canAfford ? 'Insufficient treasury' : ''"
                        >Buy<template v-if="!positionDataForBuyingPlayer.canAfford"> &#9888;</template></a>
                    </template>
                    <template v-else>
                        n/a
                    </template>
                </td>
                <td>{{ positionDataForBuyingPlayer.position.cost/1000 }}k</td>
                <td>
                    <div class="positioniconcontainer">
                        <div class="iconusingbackground" :style="rosterIconManager.getIconStyle(positionDataForBuyingPlayer.positionId, null)"></div>
                    </div>
                </td>
                <td class="positionname">{{ positionDataForBuyingPlayer.position.name }}</td>
                <td class="quantityallowed">0-{{ positionDataForBuyingPlayer.position.quantityAllowed }}{{ positionDataForBuyingPlayer.quantityHired > 0 ? ` (${positionDataForBuyingPlayer.quantityHired}*)` : '' }}</td>
                <td>{{ positionDataForBuyingPlayer.position.stats.Movement }}</td>
                <td>{{ positionDataForBuyingPlayer.position.stats.Strength }}</td>
                <td>{{ positionDataForBuyingPlayer.position.stats.Agility }}</td>
                <td>{{ positionDataForBuyingPlayer.position.stats.Passing }}</td>
                <td>{{ positionDataForBuyingPlayer.position.stats.Armour }}</td>
                <td class="skills">{{ positionDataForBuyingPlayer.position.skills.join(', ') }}</td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';

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
    },
    watch: {
    }
})
export default class BuyPlayerComponent extends Vue {
}
</script>