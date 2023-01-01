<template>
    <div class="budget">
        Hello this is the budget
        <button @click="x++">do thing {{ x }}</button>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';

@Component({
    components: {
    },
    props: {
    }
})
export default class BudgetComponent extends Vue {
    public x = 1;
}
</script>