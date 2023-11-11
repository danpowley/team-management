export interface DemoTeamSettings {
    existingTeamId: number | null,
    newTeam: {
        division: string,
        rulesetId: number,
        rosterId: number,
    } | null,
};

export interface RawApiSpecialRules {
    fromRoster: any,
    fromTeam: any
};

export type UserRole = 'OWNER' | 'LEAGUE_STAFF' | 'SITE_STAFF';

export type TeamStatusValue = 'NEW' | 'ACTIVE' | 'PENDING_APPROVAL' | 'BLOCKED' | 'RETIRED' | 'WAITING_FOR_OPPONENT' | 'SKILL_ROLLS_PENDING' | 'POST_MATCH_SEQUENCE' | 'REDRAFTING';

export type TeamAction = 'CREATE' | 'EDIT' | 'RETIRE_TEAM' | 'VIEW_HISTORY' | 'HIRE_ROOKIE';

export type ActionGrantAccessTo = {
    action: TeamAction,
    grantAccessToList: GrantAccessTo[],
};

export type GrantAccessTo = {
    userRoles: UserRole[],
    teamStatusValues: TeamStatusValue[],
};

export type PlayerRowFoldOutMode = 'BUY' | 'MORE' | 'CLOSED';

export type PlayerGender = 'FEMALE' | 'MALE' | 'NEUTRAL' | 'NONBINARY';

export type PlayerSkillStatus = 'NONE' | 'CAN_SKILL' | 'MUST_SKILL';

export interface Coach {
    id: number,
    name: string,
};

export interface Position {
    id: number,
    name: string,
    cost: number,
    skills: string[],
    stats: PositionStats,
    quantityAllowed: number,
    isBigGuy: boolean,
    defaultGender: string,
    isPeaked: boolean,
};

export interface PositionDataForBuyingPlayer {
    positionId: number,
    quantityHired: number,
    canAfford: boolean,
    position: Position,
}

export interface PositionStats {
    Movement: number,
    Strength: number,
    Agility: number,
    Passing: number | null,
    Armour: number,
}

export interface PlayerRecord {
    games: number,
    completions: number,
    touchdowns: number,
    interceptions: number,
    casualties: number,
    mvps: number,
    spp: {
        total: number,
        extra: number,
        spent: number,
    },
}

export interface JourneymanQuantityChoice {
    positionId: number,
    quantity: number,
}

export interface JourneymanQuantityInput extends JourneymanQuantityChoice {
    positionName: string,
}

export interface SetupTeamManagementSettings {
    roster: {
        name: string,
        logoId: {
            large: number,
        }
    },
    treasury: {
        start: number,
    },
    players: {
        start: number,
        max: number,
        maxBigGuys: number,
        lowCostLinemen: boolean,
        nameGenerator: string,
        positions: Position[],
    },
    dedicatedFans: {
        start: number,
        minStart: number,
        maxStart: number,
        cost: number,
    },
    rerolls: {
        max: number,
        cost: number,
    },
    sidelineStaff: {
        assistantCoaches: {
            max: number,
            cost: number,
        },
        cheerleaders: {
            max: number,
            cost: number,
        },
        apothecary: {
            allowed: boolean,
            cost: number,
        },
    },
    seasons: {
        seasonLength: number,
    },
};

export interface AddRemovePermissions {
    rerolls: {
        add: boolean,
        remove: boolean,
    },
    assistantCoaches: {
        add: boolean,
        remove: boolean,
    },
    cheerleaders: {
        add: boolean,
        remove: boolean,
    },
    apothecary: {
        add: boolean,
        remove: boolean,
    },
};