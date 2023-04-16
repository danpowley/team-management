<template>
    <div class="adremovecontainer">
        <div class="addremove">
            <div v-if="! canEdit">
                {{ currentValue }}
            </div>
            <template v-else>
                <template v-if="canRemove">
                    <button class="teambutton remove" @click.prevent="$emit('remove')">{{ labelRemove }}</button>
                </template>
                <template v-else>
                    <button class="teambutton remove disabled" disabled="disabled">{{ labelRemove }}</button>
                </template>
                <div class="currentvalue">{{ currentValue }}</div>
                <template v-if="canAdd">
                    <button class="teambutton add" @click.prevent="$emit('add')">{{ labelAdd }}</button>
                </template>
                <template v-else>
                    <button class="teambutton add disabled" disabled="disabled">{{ labelAdd }}</button>
                </template>
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
})
export default class AddRemoveComponent extends Vue {
}
</script>