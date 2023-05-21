<template>
    <div class="teamname">
        <div class="teamnamecontent">
            <template v-if="editTeamName && canEdit">
                <input v-model="newTeamName" class="editteamname">
                <button class="teambutton" @click="save">Save</button>
                <a href="#" @click.prevent="cancel">Cancel</a>
            </template>
            <template v-else>
                <div class="teamnametext">{{ teamName }}</div>
                <div v-if="canEdit" class="editlink"><a href="#" @click.prevent="begin">edit name</a></div>
            </template>
        </div>
        <modal
            v-if="validationErrors.length !== 0"
            :buttons-config="{'close': 'Ok'}"
            :modal-size="'small'"
            @close="validationErrors = []"
        >
            <template v-slot:header>
                Error
            </template>

            <template v-slot:body>
                <p>Unable to edit team name, please see the issues below.</p>
                <ul>
                    <li v-for="error in validationErrors">
                        {{ error }}
                    </li>
                </ul>
            </template>
        </modal>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';
import modal from "./Modal.vue";

@Component({
    components: {
        modal
    },
    props: {
        fumbblApi: {
            type: Object,
            required: true,
        },
        teamName: {
            type: String,
            required: true,
        },
        canEdit: {
            type: Boolean,
            required: true,
        },
    },
})
export default class EditTeamNameComponent extends Vue {
    private newTeamName: string = '';
    private editTeamName: boolean = false;
    private validationErrors: string[] = [];

    private async refreshValidationErrors() {
        const errors = [];

        if (this.newTeamName === this.$props.teamName) {
            errors.push('The team name has not been altered.');
        }

        if (this.newTeamName.length < 2) {
            errors.push('The team name must be at least two characters long.');
        }

        if (this.newTeamName.toUpperCase() === this.newTeamName) {
            errors.push('The team name can\'t be entirely upper case.');
        }

        if (this.newTeamName.slice(0,4).toLowerCase() === 'the ') {
            errors.push('The team name can\' t start with the word "The".');
        }

        if (this.newTeamName.charAt(this.newTeamName.length - 1) === '.') {
            errors.push('The team name can\'t end with a period.');
        }

        if (['/', '\\', '?', '"', '&', '#', '+', ':', '*'].some((excludeMe) => this.newTeamName.indexOf(excludeMe) >= 0)) {
            errors.push('The team name can\'t include any of "/ \\ ? " & # + : *"')
        }

        if (errors.length === 0) {
            const apiResponse = await this.$props.fumbblApi.checkTeamName(this.newTeamName);
            if (! apiResponse.isSuccessful()) {
                errors.push(apiResponse.getErrorMessage());
            }
        }

        this.validationErrors = errors;
    }

    private begin(): void {
        this.validationErrors = [];
        this.editTeamName = true;
        this.newTeamName = this.$props.teamName;
        this.$emit('begin');
    }

    private cancel(): void {
        this.validationErrors = [];
        this.newTeamName = '';
        this.editTeamName = false;
        this.$emit('cancel');
    }

    private async save() {
        this.validationErrors = [];
        await this.refreshValidationErrors();
        if (this.validationErrors.length === 0) {
            this.$emit('edit', this.newTeamName);
            this.editTeamName = false;
        }
    }
}
</script>