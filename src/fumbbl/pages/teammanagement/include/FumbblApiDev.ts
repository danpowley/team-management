import FumbblApi from "../include/FumbblApi";
import ApiResponse from "./ApiResponse";
import {PlayerGender} from "./Interfaces";

export default class FumbblApiDev extends FumbblApi {

    // some endpoints will only work if we go via a special proxy in development
    protected getProxyUrl(apiUrl: string): string {
        return 'http://localhost:3000' + apiUrl;
    }

    public async setSpecialRule(teamId: number, ruleName: string, ruleValue: string): Promise<ApiResponse> {
        const url = this.getProxyUrl('/api/team/setSpecialRule/' + teamId);
        const data = {rule: ruleName, val: ruleValue};
        // note we are not using a form post here as we cannot get that to work with our proxy express server
        return await this.post(url, data);
    }

    public async renameTeam(teamId: number, newName: string): Promise<ApiResponse> {
        const url = this.getProxyUrl('/api/team/rename');
        const data = {teamId: teamId, newName: newName};
        return await this.post(url, data);
    }

    public async addReroll(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getProxyUrl('/api/team/addReroll'));
    }

    public async removeReroll(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getProxyUrl('/api/team/removeReroll'));
    }

    public async discardReroll(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getProxyUrl('/api/team/discardReroll'));
    }

    public async addAssistantCoach(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getProxyUrl('/api/team/addAssistantCoach'));
    }

    public async removeAssistantCoach(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getProxyUrl('/api/team/removeAssistantCoach'));
    }

    public async fireAssistantCoach(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getProxyUrl('/api/team/fireAssistantCoach'));
    }

    public async addCheerleader(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getProxyUrl('/api/team/addCheerleader'));
    }

    public async removeCheerleader(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getProxyUrl('/api/team/removeCheerleader'));
    }

    public async fireCheerleader(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getProxyUrl('/api/team/fireCheerleader'));
    }

    public async addApothecary(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getProxyUrl('/api/team/addApothecary'));
    }

    public async removeApothecary(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getProxyUrl('/api/team/removeApothecary'));
    }

    public async fireApothecary(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getProxyUrl('/api/team/fireApothecary'));
    }

    public async setDedicatedFans(teamId: number, newDedicatedFans: number): Promise<ApiResponse> {
        const url = this.getProxyUrl('/api/team/setDedicatedFans');
        const data = {teamId: teamId, newDf: newDedicatedFans};
        return await this.post(url, data);
    }

    public async addPlayer(teamId: number, positionId: number, gender: PlayerGender, playerName: string): Promise<ApiResponse> {
        const url = this.getProxyUrl('/api/team/addPlayer');
        const data = {teamId: teamId, positionId: positionId, gender: gender.toLowerCase(), name: playerName};
        return await this.post(url, data);
    }
}