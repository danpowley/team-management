<template>
    <div class="chooseroster">
        <div class="heading">Select Roster</div>
        <div class="availablerosters">
            <div v-for="basicRoster in basicRosters" :key="basicRoster.id" class="selectroster" @click="raiseRosterChosen(basicRoster.id)">
                <img :src="'https://fumbbl.com/i/' + basicRoster.getLogoImageId(logoImageSize)">
                <div class="rostername">{{ basicRoster.name }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Axios from "axios";
import Component from 'vue-class-component';
import BasicRoster from "../include/BasicRoster";

@Component({
    components: {
    },
    props: {
        rawBasicRosters: {
            type: Array,
            required: true,
        },
    }
})
export default class ChooseRosterComponent extends Vue {
    readonly useInefficientRealLogos = false;
    readonly logoImageSize = 128;
    private basicRosters: BasicRoster[] = [];

    async mounted() {
        await this.prepareBasicRosters();
    }

    private async prepareBasicRosters() {
        const rosterLogos = await this.getRosterLogosVeryInefficiently();

        const basicRosters: BasicRoster[] = [];
        for (const roster of this.$props.rawBasicRosters) {
            if (roster.value.startsWith('_')) {
                continue;
            }
            const rosterId = ~~roster.id;

            const basicRoster = new BasicRoster(
                rosterId,
                roster.value,
                roster.tier,
                rosterLogos[rosterId],
            );

            basicRosters.push(basicRoster);
        }

        basicRosters.sort((a, b) => {
            if (a.name === b.name) {
                return 0;
            }
            return a.name > b.name ? 1 : -1;
        });

        this.basicRosters = basicRosters;
    }

    private async getRosterLogosVeryInefficiently(): Promise<any> {
        const rosterLogos = {};
        for (const roster of this.$props.rawBasicRosters) {
            if (this.useInefficientRealLogos) {
                console.log('INEFFICIENT: loading logo data for ', roster.id);
                const result = await Axios.post('http://localhost:3000/api/roster/get/' + roster.id);
                rosterLogos[roster.id] = result.data.logos;
            } else {
                rosterLogos[roster.id] = {128: 486276};
            }
        }
        return rosterLogos;
    }

    private raiseRosterChosen(rosterId: number) {
        this.$emit('roster-chosen', rosterId);
    }
}
</script>