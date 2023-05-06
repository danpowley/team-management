<template>
    <div class="adremovecontainer">
        <div class="addremove">
            <div v-if="! canEdit">
                {{ currentValue }}
            </div>

            <template v-else>
                <button
                    class="teambutton remove"
                    :class="{disabled: !removeIsEnabled}"
                    :disabled="!removeIsEnabled"
                    @click.prevent="remove"
                >{{ labelRemove }}</button>
                <div class="currentvalue">{{ currentValue }}</div>
                <button
                    class="teambutton add"
                    :class="{disabled: !addIsEnabled}"
                    :disabled="!addIsEnabled"
                    @click.prevent="add"
                >{{ labelAdd }}</button>
            </template>
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
        currentValue: {
            type: String,
            required: true,
        },
        canEdit: {
            type: Boolean,
            required: true,
        },
        canRemoveImmediately: {
            type: Boolean,
            required: true,
        },
        canAdd: {
            type: Boolean,
            required: true,
        },
        canRemove: {
            type: Boolean,
            required: true,
        },
        labelAdd: {
            type: String,
            required: true,
        },
        labelRemove: {
            type: String,
            required: true,
        },
        updateInProgress: {
            type: Boolean,
            required: true,
        },
    },
    watch: {
        updateInProgress(newVal, oldVal) {
            if (newVal === false) {
                // @ts-ignore (property does not exist)
                this.updateInProgressStatusForThisInstance = 'NONE';
            }
        },
    },
})
export default class AddRemoveComponent extends Vue {
    private updateInProgressStatusForThisInstance: 'NONE' | 'ADD' | 'REMOVE' = 'NONE';

    private get addIsEnabled(): boolean {
        return this.$props.canAdd && ! this.isAddInProgress;
    }

    private get removeIsEnabled(): boolean {
        return this.$props.canRemove && ! this.isRemoveInProgress;
    }

    private get isAddInProgress(): boolean {
        return this.updateInProgressStatusForThisInstance === 'ADD' && this.$props.updateInProgress;
    }

    private get isRemoveInProgress(): boolean {
        return this.updateInProgressStatusForThisInstance === 'REMOVE' && this.$props.updateInProgress;
    }

    private add() {
        if (this.addIsEnabled) {
            this.updateInProgressStatusForThisInstance = 'ADD';
            this.$emit('add');
        }
    }

    private remove() {
        if (this.removeIsEnabled) {
            this.updateInProgressStatusForThisInstance = 'REMOVE';
            this.$emit(this.$props.canRemoveImmediately ? 'remove-immediately' : 'remove-with-confirm');
        }
    }
}
</script>