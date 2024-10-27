export type GitData = {
    owner: string;
    repo: string;
    weeks: {
        week: number;
        total: number;
    }[];
}[];

export interface WeeklyData {
    days: number[];
    total: number;
    week: number;
}

export interface RepoCommitData {
    owner: string;
    repo: string;
    weeks: WeeklyData[];
}

export interface Repo {
    owner: string;
    repo: string;
}

export interface Users {
    username: string;
}

export interface UserData {
    username: string;
    name?: string;
    avatar_url?: string;
    html_url?: string;
}

export interface UnifiedWeeklyData {
    week: number;
    [commits: string]: number | undefined;
}

export type WeeklyCommitsComparisonProps = {
    repos: Repo[];
    isLoading: boolean;
    userData: UserData[];
    gitData: any;
};
