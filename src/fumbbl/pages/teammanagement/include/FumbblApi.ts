import Axios from "axios";
import {PlayerGender} from "./Interfaces";
import ApiResponse from "./ApiResponse";

export default class FumbblApi {
    private readonly ERROR_WITHIN_SUCCESS_PREFIX = 'Error:'

    protected getUrl(apiUrl: string): string {
        return 'https://fumbbl.com' + apiUrl;
    }

    protected async post(url: string, data: any = null, transform: (d: any) => any = null): Promise<ApiResponse> {
        let result;
        try {
            result = await Axios.post(url, data);
        } catch(error) {
            return ApiResponse.error(error);
        }

        let resultData = result.data;
        if (this.isErrorWithinSuccess(resultData)) {
            return ApiResponse.customErrorString(resultData.replace(this.ERROR_WITHIN_SUCCESS_PREFIX, ''));
        }

        if (transform !== null) {
            resultData = transform(resultData);
        }

        return ApiResponse.success(resultData);
    }

    protected async postForm(url: string, data: any, transform: (d: any) => any = null): Promise<ApiResponse> {
        const bodyFormData = new FormData();

        for (const dataKey of Object.keys(data)) {
            bodyFormData.append(dataKey, data[dataKey]);
        }

        let result;
        try {
            result = await Axios({
                method: "post",
                url: url,
                data: bodyFormData,
            });
        } catch(error) {
            return ApiResponse.error(error);
        }

        let resultData = result.data;
        if (this.isErrorWithinSuccess(resultData)) {
            return ApiResponse.customErrorString(resultData.replace(this.ERROR_WITHIN_SUCCESS_PREFIX, ''));
        }

        if (transform !== null) {
            resultData = transform(resultData);
        }

        return ApiResponse.success(resultData);
    }

    protected isErrorWithinSuccess(data: any): boolean {
        return typeof data === 'string' && data.startsWith(this.ERROR_WITHIN_SUCCESS_PREFIX);
    }

    public async setSpecialRule(teamId: number, ruleName: string, ruleValue: string): Promise<ApiResponse> {
        const url = this.getUrl('/api/team/setSpecialRule/' + teamId);
        const data = {rule: ruleName, val: ruleValue};
        return await this.postForm(url, data);
    }

    public async getRulesetIdForDivision(divisionId: number): Promise<ApiResponse> {
        const url = this.getUrl('/api/division/get/' + divisionId);
        const data = null;
        const transform = (result: any) => ~~result.rulesetId;
        return await this.post(url, data, transform);
    }

    public async getRulesetIdForGroup(groupId: number): Promise<ApiResponse> {
        const url = this.getUrl('/api/group/get/' + groupId);
        const data = null;
        const transform = (result: any) => ~~result.ruleset;
        return await this.post(url, data, transform);
    }

    public async getRuleset(rulesetId: number): Promise<ApiResponse> {
        const url = this.getUrl('/api/ruleset/get/' + rulesetId);
        return await this.post(url);
    }

    public async getTeamsForCoach(coachName: string): Promise<ApiResponse> {
        const url = this.getUrl('/api/coach/teams/' + coachName);
        const data = null;
        const transform = (result: any) => result.teams;
        return await this.post(url, data, transform);
    }

    public async getRoster(rosterId: number): Promise<ApiResponse> {
        const url = this.getUrl('/api/roster/get/' + rosterId);
        return await this.post(url);
    }

    public async getTeam(teamId: number): Promise<ApiResponse> {
        const url = this.getUrl('/api/team/get/' + teamId);
        return await this.post(url);
    }

    public async generatePlayerName(nameGenerator: string, gender: PlayerGender): Promise<ApiResponse> {
        const url = this.getUrl(`/api/name/generate/${nameGenerator}/${gender.toLowerCase()}`);
        return await this.post(url);
    }

    public async renameTeam(teamId: number, newName: string): Promise<ApiResponse> {
        const url = this.getUrl('/api/team/rename');
        const data = {teamId: teamId, newName: newName};
        return await this.post(url, data);
    }

    protected async simplePostWithOnlyTeamIdInBody(teamId: number, url: string): Promise<ApiResponse> {
        const data = {teamId: teamId};
        return await this.post(url, data);
    }

    public async addReroll(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getUrl('/api/team/addReroll'));
    }

    public async removeReroll(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getUrl('/api/team/removeReroll'));
    }

    public async discardReroll(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getUrl('/api/team/discardReroll'));
    }

    public async addAssistantCoach(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getUrl('/api/team/addAssistantCoach'));
    }

    public async removeAssistantCoach(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getUrl('/api/team/removeAssistantCoach'));
    }

    public async fireAssistantCoach(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getUrl('/api/team/fireAssistantCoach'));
    }

    public async addCheerleader(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getUrl('/api/team/addCheerleader'));
    }

    public async removeCheerleader(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getUrl('/api/team/removeCheerleader'));
    }

    public async fireCheerleader(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getUrl('/api/team/fireCheerleader'));
    }

    public async addApothecary(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getUrl('/api/team/addApothecary'));
    }

    public async removeApothecary(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getUrl('/api/team/removeApothecary'));
    }

    public async fireApothecary(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getUrl('/api/team/fireApothecary'));
    }

    public async setDedicatedFans(teamId: number, newDedicatedFans: number): Promise<ApiResponse> {
        const url = this.getUrl('/api/team/setDedicatedFans');
        const data = {teamId: teamId, newDf: newDedicatedFans};
        return await this.post(url, data);
    }

    public async buyPlayer(teamId: number, positionId: number, gender: PlayerGender, playerName: string): Promise<ApiResponse> {
        const url = this.getUrl('/api/team/buyPlayer');
        const data = {teamId: teamId, positionId: positionId, gender: gender, playerName: playerName};
        return await this.post(url, data);
    }
}