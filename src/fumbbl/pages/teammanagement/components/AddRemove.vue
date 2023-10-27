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

const AddRemoveComponentProps = Vue.extend({
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
    },
});

@Component
export default class AddRemoveComponent extends AddRemoveComponentProps {
    public get addIsEnabled(): boolean {
        return this.$props.canAdd;
    }

    public get removeIsEnabled(): boolean {
        return this.$props.canRemove;
    }

    public add() {
        if (this.addIsEnabled) {
            this.$emit('add');
        }
    }

    public remove() {
        if (this.removeIsEnabled) {
            this.$emit(this.$props.canRemoveImmediately ? 'remove-immediately' : 'remove-with-confirm');
        }
    }
}
</script>