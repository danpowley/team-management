import Axios from "axios";
import {PlayerGender} from "./Interfaces";

export default class FumbblApi {

    public async setSpecialRule(teamId: number, ruleName: string, ruleValue: string): Promise<void> {
        const bodyFormData = new FormData();
        bodyFormData.append('rule', ruleName);
        bodyFormData.append('val', ruleValue);
        await Axios({
            method: "post",
            url: 'https://fumbbl.com/api/team/setSpecialRule/' + teamId,
            data: bodyFormData,
        });
    }

    public async getRulesetIdForDivision(divisionId: number): Promise<number> {
        const result = await Axios.post('https://fumbbl.com/api/division/get/' + divisionId);
        return ~~result.data.rulesetId;
    }

    public async getRulesetIdForGroup(groupId: number): Promise<number> {
        const result = await Axios.post('https://fumbbl.com/api/group/get/' + groupId);
        return ~~result.data.ruleset;
    }

    public async getRuleset(rulesetId: number): Promise<any> {
        const result = await Axios.post('https://fumbbl.com/api/ruleset/get/' + rulesetId);
        return result.data;
    }

    public async getTeamsForCoach(coachName: string): Promise<any> {
        const result = await Axios.post('https://fumbbl.com/api/coach/teams/' + coachName);
        return result.data.teams;
    }

    public async getRoster(rosterId: number): Promise<any> {
        const result = await Axios.post('https://fumbbl.com/api/roster/get/' + rosterId);
        return result.data;
    }

    public async getTeam(teamId: number): Promise<any> {
        const result = await Axios.post('https://fumbbl.com/api/team/get/' + teamId);
        return result.data;
    }

    public async generatePlayerName(nameGenerator: string, gender: PlayerGender): Promise<string> {
        const result = await Axios.post(`https://fumbbl.com/api/name/generate/${nameGenerator}/${gender.toLowerCase()}`);
        return result.data;
    }
}