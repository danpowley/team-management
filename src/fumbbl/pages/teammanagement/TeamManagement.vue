<template>
    <div class="teammanagement" v-if="team !== null">
        Hello, team management.

        <budget></budget>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import BudgetComponent from "./components/Budget.vue";

@Component({
    components: {
        'budget': BudgetComponent,
    },
})
export default class TeamManagement extends Vue {

    async mounted() {
    }
}
</script>

<style scoped>
</style>