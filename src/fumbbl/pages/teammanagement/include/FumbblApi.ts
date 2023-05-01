import Axios from "axios";

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
}