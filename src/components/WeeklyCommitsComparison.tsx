import React, { useState } from "react";
import { startOfWeek, endOfWeek, getISOWeek } from "date-fns";
import { getUnifiedWeeklyData } from "../hooks/getUnifiedWeeklyData";
import { WeeklyCommitsComparisonProps } from "../types";

const WeeklyCommitsComparison: React.FC<WeeklyCommitsComparisonProps> = ({ repos, isLoading, userData, gitData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWeekData, setSelectedWeekData] = useState<any>(null);
    const [displayedWeeks, setDisplayedWeeks] = useState(6);

    if (!repos.length || isLoading) return null;

    const weeklyData = getUnifiedWeeklyData({ gitData });

    const openModal = (weekData: any) => {
        setSelectedWeekData(weekData);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedWeekData(null);
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const loadMoreWeeks = () => {
        setDisplayedWeeks(displayedWeeks + 6);
    };

    return (
        <div className="mt-12">
            <div className="col-span-full text-2xl font-semibold mb-4 text-center">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight">Weekly Commits Comparison</h2>
                <p className="text-sm space-x-1 text-indigo-500 font-bold">Last 1 year</p>
            </div>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4">
                {weeklyData.slice(0, displayedWeeks).map((weekData, index) => {
                    const startDate = startOfWeek(new Date(weekData.week * 1000), { weekStartsOn: 1 });
                    const endDate = endOfWeek(new Date(weekData.week * 1000), { weekStartsOn: 1 });
                    const weekNumber = getISOWeek(startDate);

                    const sortedRepos = repos.slice().sort((a, b) => {
                        const repoA = `${a.owner}/${a.repo}`;
                        const repoB = `${b.owner}/${b.repo}`;
                        const commitsA = weekData[repoA] || 0;
                        const commitsB = weekData[repoB] || 0;
                        return commitsB - commitsA;
                    });

                    const displayRepos = sortedRepos.slice(0, 3);
                    const hasMoreRepos = sortedRepos.length > 3;

                    return (
                        <div
                            key={index}
                            className="relative p-6 bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg transition-all hover:shadow-2xl hover:bg-opacity-90 duration-500 ease-in-out bg-gradient-to-br from-gray-100 via-white to-gray-50"
                        >
                            <div className="relative z-10 text-center">
                                <p className="text-lg font-semibold text-gray-700 mb-1">
                                    Week #{weekNumber} of {startDate.getFullYear()}
                                </p>
                                <p className="text-xs text-gray-500 mb-4">
                                    {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                                </p>
                                <div className="space-y-4">
                                    {displayRepos.map((repo, repoIndex) => {
                                        const user = userData.find((user) => user.username === repo.owner);
                                        const commits = `${repo.owner}/${repo.repo}`;

                                        return (
                                            <div
                                                key={repoIndex}
                                                className="flex items-center space-x-4 bg-white bg-opacity-50 rounded-lg p-2 shadow-sm transform hover:scale-105 transition-all duration-500 ease-in-out"
                                            >
                                                <img src={user?.avatar_url} alt={`${user?.username}'s avatar`} className="w-10 h-10 rounded-full shadow-sm" />
                                                <div className="text-left">
                                                    <a
                                                        href={user?.html_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-semibold text-gray-800 hover:text-blue-600 transition duration-200"
                                                    >
                                                        {user?.name || user?.username}
                                                    </a>
                                                    <p className="text-xs text-gray-500">{repo.repo}</p>
                                                    <p className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                                                        <span>Commits:</span>
                                                        <span className="text-indigo-500 font-bold">{weekData[commits] !== undefined ? weekData[commits] : 0}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {hasMoreRepos && (
                                        <button onClick={() => openModal(weekData)} className="text-indigo-600 font-semibold text-sm mt-2 hover:underline">
                                            View More
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show More Button */}
            {displayedWeeks < weeklyData.length && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={loadMoreWeeks}
                        className="px-6 py-2 text-white font-semibold bg-indigo-500 rounded-lg hover:bg-indigo-600 transition duration-300"
                    >
                        Show More Weeks
                    </button>
                </div>
            )}

            {/* Scrollable Modal Implementation */}
            {isModalOpen && selectedWeekData && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-gray-900 bg-opacity-80 z-50" onClick={handleOverlayClick}>
                    <div className="bg-gray-100 rounded-lg p-6 max-w-lg w-full relative overflow-hidden">
                        <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                            X
                        </button>
                        <h3 className="text-2xl font-bold text-center mb-2">All Commits for Week #{getISOWeek(new Date(selectedWeekData.week * 1000))}</h3>
                        <p className="text-xs text-gray-500 mb-4 text-center">
                            {startOfWeek(new Date(selectedWeekData.week * 1000), { weekStartsOn: 1 }).toLocaleDateString()} -{" "}
                            {endOfWeek(new Date(selectedWeekData.week * 1000), { weekStartsOn: 1 }).toLocaleDateString()}
                        </p>

                        {/* Scrollable content with max height */}
                        <div className="max-h-[600px] overflow-y-auto space-y-4 p-2">
                            {repos
                                .slice()
                                .sort((a, b) => {
                                    const repoA = `${a.owner}/${a.repo}`;
                                    const repoB = `${b.owner}/${b.repo}`;
                                    const commitsA = selectedWeekData[repoA] || 0;
                                    const commitsB = selectedWeekData[repoB] || 0;
                                    return commitsB - commitsA;
                                })
                                .map((repo, repoIndex) => {
                                    const user = userData.find((user) => user.username === repo.owner);
                                    const commits = `${repo.owner}/${repo.repo}`;

                                    return (
                                        <div key={repoIndex} className="flex items-center space-x-4 bg-gray-100 rounded-lg p-2 shadow-sm">
                                            <img src={user?.avatar_url} alt={`${user?.username}'s avatar`} className="w-10 h-10 rounded-full shadow-sm" />
                                            <div className="text-left">
                                                <a
                                                    href={user?.html_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-semibold text-gray-800 hover:text-blue-600 transition duration-200"
                                                >
                                                    {user?.name || user?.username}
                                                </a>
                                                <p className="text-xs text-gray-500">{repo.repo}</p>
                                                <p className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                                                    <span>Commits:</span>
                                                    <span className="text-indigo-500 font-bold">
                                                        {selectedWeekData[commits] !== undefined ? selectedWeekData[commits] : 0}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyCommitsComparison;
