<template>
    <div class="specialrules">
        <template v-if="! updateInProgress">
            <template v-if="!canEdit">
                <template v-if="isOneOfActive">
                    {{ oneOfDisplayName }}
                </template>
                <template v-else>
                    {{ displayNames.join(', ') }}
                </template>
            </template>
            <template v-else>
                <template v-if="isOneOfActive">
                    <template v-if="showOneOfOptions">
                        <select @change="changeOneOf">
                            <option value="">Choose Special Rule</option>
                            <template v-for="oneOfOption in oneOfOptions">
                                <option :value="oneOfOption" :key="oneOfOption">{{ oneOfOption }}</option>
                            </template>
                        </select>
                    </template>
                    <template v-else>
                        <a @click.prevent="showOneOfOptions = !showOneOfOptions" href="#">Choose one of: </a>
                    </template>
                </template>
                <template v-for="(specialRuleLabel, index) in specialRuleLabels">
                    <span :key="index">
                        <span v-if="index !== 0" :class="{oneofseparator: isOneOfActive}">{{ isOneOfActive ? 'OR' : ', ' }}</span>
                        <template v-if="labelHasOptions(specialRuleLabel)">
                            <template v-if="showTeamOptions">
                                <select @change="changeTeamOption">
                                    <template v-if="!labelHasChoice(specialRuleLabel)">
                                        <option value="">Choose Special Rule</option>
                                    </template>
                                    <template v-for="specialRuleOption in teamOptions[specialRuleLabel]">
                                        <option :value="specialRuleLabel + '|' + specialRuleOption" :key="specialRuleOption" :selected="getLabelChoice(specialRuleLabel) === specialRuleOption">{{ specialRuleOption }}</option>
                                    </template>
                                </select>
                            </template>
                            <template v-else>
                                {{ oneOfChoice === specialRuleLabel ? '✓' : '' }}<a @click.prevent="showTeamOptions = !showTeamOptions" href="#" :class="{oneofchosen: oneOfChoice === specialRuleLabel}">{{ getLabelChoice(specialRuleLabel) }}</a>
                            </template>
                        </template>
                        <template v-else>
                            <span :class="{oneofchosen: oneOfChoice === specialRuleLabel}">{{ oneOfChoice === specialRuleLabel ? '✓' : '' }}{{ specialRuleLabel }}</span>
                        </template>
                    </span>
                </template>
            </template>
        </template>
        <template v-else>
            Please wait updating special rules.
        </template>
        <modal
            v-if="errorModalInfo !== null"
            :buttons-config="{'close': 'Ok'}"
            :modal-size="'small'"
            @close="errorModalInfo = null"
        >
            <template v-slot:header>
                Error
            </template>

            <template v-slot:body>
                <p>{{ errorModalInfo.general }}</p>
                <p>Technical details: {{ errorModalInfo.technical }}</p>
            </template>
        </modal>
    </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import Component from 'vue-class-component';
import FumbblApi from "../include/FumbblApi";
import modal from "./Modal.vue";
import { RawApiSpecialRules } from "../include/Interfaces";

const SpecialRulesComponentProps = Vue.extend({
    components: {
        modal
    },
    props: {
        fumbblApi: {
            type: Object as PropType<FumbblApi>,
            required: true,
        },
        teamId: {
            type: Number,
            required: true,
        },
        canEdit: {
            type: Boolean,
            required: true,
        },
        rawApiSpecialRules: {
            type: Object as PropType<RawApiSpecialRules>,
            required: true,
        },
    },
});

@Component
export default class SpecialRulesComponent extends SpecialRulesComponentProps {
    private readonly ONE_OF_ID = '-3';
    public showOneOfOptions = false;
    public showTeamOptions = false;
    public updateInProgress = false;
    public errorModalInfo: {general: string, technical: string} = null;

    public get isOneOfActive(): boolean {
        return this.oneOfOptions.length > 0;
    }

    public get oneOfDisplayName(): string {
        if (! this.isOneOfActive) {
            return '';
        }

        if (Object.keys(this.teamChoices).includes(this.oneOfChoice)) {
            return this.teamChoices[this.oneOfChoice];
        }

        if (this.oneOfChoice) {
            return this.oneOfChoice;
        }

        return '';
    }

    public getLabelChoice(label: string): string {
        if (this.labelHasChoice(label)) {
            return this.teamChoices[label];
        }
        return label;
    }

    public labelHasChoice(label: string): boolean {
        return Object.keys(this.teamChoices).includes(label) && this.teamChoices[label] !== null;
    }

    public labelHasOptions(label: string): boolean {
        return Object.keys(this.teamOptions).includes(label);
    }

    public get specialRuleLabels(): string[] {
        const specialRuleLabels = [];
        const rosterSpecialRules = this.rawApiSpecialRules.fromRoster;
        for (const rosterSpecialRule of rosterSpecialRules) {
            if (rosterSpecialRule.id === this.ONE_OF_ID) {
                continue;
            }
            const label = rosterSpecialRule.option ? rosterSpecialRule.option : rosterSpecialRule.name;
            specialRuleLabels.push(label);
        }
        return specialRuleLabels;
    }

    public get displayNames(): string[] {
        if (this.isOneOfActive) {
            return [];
        }
        const displayNames: string[] = [];
        const rosterSpecialRules = this.rawApiSpecialRules.fromRoster;
        for (const rosterSpecialRule of rosterSpecialRules) {
            let displayName = rosterSpecialRule.name;

            if (Object.keys(this.teamChoices).includes(rosterSpecialRule.name)) {
                displayName = this.teamChoices[rosterSpecialRule.name];
            }

            displayNames.push(displayName);
        }
        return displayNames;
    }

    private get teamChoices(): any {
        const teamChoices = {};
        const teamSpecialRules = this.rawApiSpecialRules.fromTeam;
        for (const specialRuleLabel of Object.keys(teamSpecialRules)) {
            const teamSpecialRule = teamSpecialRules[specialRuleLabel];
            const teamSpecialRuleOptions = teamSpecialRule[0];
            const teamSpecialRuleChoice = teamSpecialRule[1];
            const teamSpecialRuleSettings = teamSpecialRule[2];
            if (typeof teamSpecialRuleSettings === 'object' && teamSpecialRuleSettings !== null) {
                if (teamSpecialRuleSettings.oneOf === true) {
                    continue;
                }
            }
            if (teamSpecialRuleOptions) {
                teamChoices[specialRuleLabel] = teamSpecialRuleChoice;
            }
        }
        return teamChoices;
    }

    public get teamOptions(): any {
        const teamOptions = {};
        const rosterSpecialRules = this.rawApiSpecialRules.fromRoster;
        for (const rosterSpecialRule of rosterSpecialRules) {
            if (rosterSpecialRule.id === this.ONE_OF_ID) {
                continue;
            }
            if (rosterSpecialRule.options === null || (rosterSpecialRule.option !== null && rosterSpecialRule.option !== '')) {
                continue;
            }
            let finalOptions = JSON.parse(rosterSpecialRule.options);
            if (rosterSpecialRule.filter !== null) {
                finalOptions = rosterSpecialRule.filter.split('|');
            }
            teamOptions[rosterSpecialRule.name] = finalOptions;
        }
        return teamOptions;
    }

    public get oneOfChoice(): any {
        const teamSpecialRules = this.rawApiSpecialRules.fromTeam;
        for (const specialRuleLabel of Object.keys(teamSpecialRules)) {
            const teamSpecialRule = teamSpecialRules[specialRuleLabel];
            const teamSpecialRuleChoice = teamSpecialRule[1];
            const teamSpecialRuleSettings = teamSpecialRule[2];
            if (typeof teamSpecialRuleSettings === 'object' && teamSpecialRuleSettings !== null) {
                if (teamSpecialRuleSettings.oneOf === true) {
                    return teamSpecialRuleChoice;
                }
            }
        }
        return null;
    }

    public get oneOfOptions(): any {
        const oneOfOptions = [];
        let oneOfIsActive = false;
        const rosterSpecialRules = this.rawApiSpecialRules.fromRoster;
        for (const rosterSpecialRule of rosterSpecialRules) {
            if (rosterSpecialRule.id === this.ONE_OF_ID) {
                oneOfIsActive = true;
                continue;
            }
            oneOfOptions.push(rosterSpecialRule.name);
        }
        if (oneOfIsActive) {
            return oneOfOptions;
        } else {
            return [];
        }
    }

    private get oneOfRuleName(): string {
        const rosterSpecialRules = this.rawApiSpecialRules.fromRoster;
        for (const rosterSpecialRule of rosterSpecialRules) {
            if (rosterSpecialRule.id === this.ONE_OF_ID) {
                return rosterSpecialRule.name;
            }
        }
        return '';
    }

    public async changeOneOf(event) {
        const newSpecialRuleValue = event.target.value;
        if (newSpecialRuleValue) {
            await this.setSpecialRule(this.oneOfRuleName, newSpecialRuleValue);
        }
    }

    public async changeTeamOption(event) {
        const newSpecialRuleRaw = event.target.value;
        if (newSpecialRuleRaw.includes('|')) {
            const ruleBits = newSpecialRuleRaw.split('|');
            const ruleName = ruleBits[0];
            const ruleValue = ruleBits[1];
            await this.setSpecialRule(ruleName, ruleValue);
        }
    }

    private async setSpecialRule(ruleName: string, ruleValue: string) {
        const apiResponse = await this.fumbblApi.setSpecialRule(this.teamId, ruleName, ruleValue);
        if (apiResponse.isSuccessful()) {
            this.$emit('rules-updated');
            this.updateInProgress = true;
            this.showOneOfOptions = false;
            this.showTeamOptions = false;
            setTimeout(() => {
                this.updateInProgress = false;
            }, 2000);
        } else {
            this.errorModalInfo = {
                general: 'An error occurred updating the teams special rule.',
                technical: apiResponse.getErrorMessage(),
            };
        }
    }

}
</script>