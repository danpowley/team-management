<template>
    <div class="chooseroster">
        Choose a roster
        <div v-for="roster in rosters" :key="roster.id">
            <a @click="raiseChosenRoster(roster.id)">{{ roster.name }}</a>
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
    public raiseChosenRoster(rosterId: number) {
        this.$emit('chosen-roster', rosterId);
    }
}
</script>