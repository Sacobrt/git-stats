import { GitData, UnifiedWeeklyData } from "../types";

export const getUnifiedWeeklyData = ({ gitData }: { gitData: GitData }): UnifiedWeeklyData[] => {
    if (!gitData) return [];

    const weeklyDataMap = new Map<number, { [repoName: string]: number }>();

    gitData.forEach(({ owner, repo, weeks }) => {
        const repoName = `${owner}/${repo}`;
        weeks.forEach((weekData) => {
            if (!weeklyDataMap.has(weekData.week)) {
                weeklyDataMap.set(weekData.week, {});
            }
            const weekCommits = weeklyDataMap.get(weekData.week)!;
            weekCommits[repoName] = weekData.total;
        });
    });

    const unifiedData: UnifiedWeeklyData[] = Array.from(weeklyDataMap.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([week, reposData]) => ({
            week,
            ...reposData,
        }));

    return unifiedData;
};
