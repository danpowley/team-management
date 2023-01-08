<template>
    <div class="chooseroster">
        <div class="heading">Select Roster</div>
        <div class="availablerosters">
            <div v-for="roster in rosters" :key="roster.id" class="selectroster" @click="raiseRosterChosen(roster.id)">
                <img :src="'https://fumbbl.com/i/' + roster.logos[128]">
                <div class="rostername">{{ roster.name }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';

@Component({
    components: {
    },
    props: {
        rosters: {
            type: Array,
            required: true,
        },
    }
})
export default class ChooseRosterComponent extends Vue {
    public raiseRosterChosen(rosterId: number) {
        this.$emit('roster-chosen', rosterId);
    }
}
</script>