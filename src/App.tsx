import { useEffect, useState } from "react";
import logo from "./assets/logo.png";
import CommitsService from "./services/CommitsService";
import { FaArrowCircleRight, FaCheckCircle, FaFolderOpen, FaPlus, FaSave, FaTrashAlt } from "react-icons/fa";
import { Repo, RepoCommitData, UserData } from "./types";
import WeeklyCommitsComparison from "./components/WeeklyCommitsComparison";
import About from "./components/About";

function App() {
    const [gitData, setGitData] = useState<RepoCommitData[] | null>(null);
    const [repos, setRepos] = useState<Repo[]>([]);
    const [userData, setUserData] = useState<UserData[]>([]);
    const [inputUrls, setInputUrls] = useState("");
    const [saveName, setSaveName] = useState("");
    const [savedData, setSavedData] = useState<{ name: string; repos: Repo[]; data: RepoCommitData[] }[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ visible: false, type: "", message: "" });

    const [showAllRepos, setShowAllRepos] = useState(false);

    // Number of repos to show initially before expanding
    const initialRepoDisplayLimit = 6;

    // Toggle function for expanding/collapsing
    const toggleShowAllRepos = () => setShowAllRepos(!showAllRepos);

    useEffect(() => {
        const storedData = localStorage.getItem("data");
        if (storedData) {
            setSavedData(JSON.parse(storedData));
        }
    }, []);

    const parseGitHubUrls = (urls: string): Repo[] => {
        const regex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/;
        const urlArray = urls
            .split(/\r?\n/)
            .map((url) => url.trim())
            .filter(Boolean);
        const parsedRepos: Repo[] = [];

        for (const url of urlArray) {
            const match = url.match(regex);
            if (match) {
                parsedRepos.push({ owner: match[1], repo: match[2] });
            } else {
                setError(`Invalid GitHub URL: ${url}`);
                return [];
            }
        }

        return parsedRepos;
    };

    const handleAddRepos = () => {
        const parsedRepos = parseGitHubUrls(inputUrls);

        if (parsedRepos.length === 0) {
            setError("Please enter valid GitHub URLs.");
            return;
        }

        const newRepos = parsedRepos.filter(({ owner, repo }) => !repos.some((r) => r.owner === owner && r.repo === repo));

        if (newRepos.length === 0) {
            setError("All provided repositories are already added.");
            return;
        }

        if (repos.length + newRepos.length > 30) {
            setError("You can only add up to 30 repositories.");
            return;
        }

        setError("");
        setRepos([...repos, ...newRepos]);
        setInputUrls("");
    };

    const fetchMultiRepoCommitData = async () => {
        if (repos.length === 0) return;

        setIsLoading(true);
        const repoData: RepoCommitData[] = [];
        const usersToFetch: { username: string }[] = repos.map(({ owner }) => ({ username: owner }));

        for (const { owner, repo } of repos) {
            try {
                const response = await CommitsService.getCommits([{ owner, repo }]);
                const repoResponse = response[0];
                if (Array.isArray(repoResponse.data)) {
                    repoData.push({
                        owner: repoResponse.owner,
                        repo: repoResponse.repo,
                        weeks: repoResponse.data,
                    });
                }
            } catch (error) {
                console.error(`Error fetching data for ${owner}/${repo}`);
            }
        }

        setGitData(repoData);

        try {
            const usersResponse = await CommitsService.getUserData(usersToFetch);
            setUserData(
                usersResponse.map(({ username, data }) => ({
                    username,
                    name: data.name,
                    avatar_url: data.avatar_url,
                    html_url: data.html_url,
                }))
            );
        } catch (error) {
            console.error("Error fetching user data:", error);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        if (repos.length > 0) {
            fetchMultiRepoCommitData();
        }
    }, [repos]);

    const calculateRepoTotals = () => {
        if (!gitData) return {};

        const totals = gitData.reduce((acc, { owner, repo, weeks }) => {
            const repoName = `${owner}/${repo}`;
            acc[repoName] = weeks.reduce((sum, week) => sum + week.total, 0);
            return acc;
        }, {} as { [repoName: string]: number });

        return totals;
    };

    const calculateOverallTotal = (repoTotals: { [repoName: string]: number }) => {
        return Object.values(repoTotals).reduce((sum, total) => sum + total, 0);
    };

    const loadData = (name: string) => {
        const dataToLoad = savedData.find((data) => data.name === name);
        if (dataToLoad) {
            setRepos(dataToLoad.repos);
            setGitData(dataToLoad.data);
        }
    };

    const saveData = () => {
        if (!saveName) {
            setError("Please enter a name for the data set.");
            return;
        }

        const newSavedData = [...savedData, { name: saveName, repos, data: gitData! }];
        setSavedData(newSavedData);
        localStorage.setItem("data", JSON.stringify(newSavedData));
        setSaveName("");

        setNotification({ visible: true, type: "success", message: `Data saved as "${saveName}"` });
        setTimeout(() => setNotification({ visible: false, type: "", message: "" }), 3000);
    };

    const deleteData = (name: string) => {
        const updatedData = savedData.filter((data) => data.name !== name);
        setSavedData(updatedData);
        localStorage.setItem("data", JSON.stringify(updatedData));

        setNotification({ visible: true, type: "error", message: `Collection "${name}" has been deleted` });
        setTimeout(() => setNotification({ visible: false, type: "", message: "" }), 3000);
    };

    const repoTotals = calculateRepoTotals();
    const overallTotal = calculateOverallTotal(repoTotals);

    const sortedGitData = gitData
        ? [...gitData].sort((a, b) => {
              const totalA = repoTotals[`${a.owner}/${a.repo}`] || 0;
              const totalB = repoTotals[`${b.owner}/${b.repo}`] || 0;
              return totalB - totalA;
          })
        : [];

    return (
        <div className="container mx-auto p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <img src={logo} alt="Logo" className="h-16 mx-auto" />
                    <h1 className="text-5xl font-extrabold text-gray-800">GitHub Repo Commit Stats</h1>
                </div>

                <About />

                {/* Notification */}
                {notification.visible && (
                    <div
                        className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in ${
                            notification.type === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                        {notification.type === "success" ? <FaCheckCircle className="text-white text-2xl" /> : <FaTrashAlt className="text-white text-2xl" />}
                        <p className="font-semibold text-white">{notification.message}</p>
                    </div>
                )}

                <div className="p-10 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl shadow-lg border border-gray-200/50 space-y-6 transition-all duration-300 ease-in-out">
                    {/* Header */}
                    <div className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
                        <FaPlus className="text-blue-500 text-3xl animate-pulse" />
                        <span>Add GitHub Repositories</span>
                    </div>

                    {/* Textarea for URLs */}
                    <textarea
                        placeholder="Enter GitHub URLs, each on a new line (e.g., https://github.com/owner/repo)"
                        value={inputUrls}
                        onChange={(e) => setInputUrls(e.target.value)}
                        className="border-2 border-gray-600 p-4 w-full rounded-xl h-32 resize-y bg-gray-100 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition duration-300 placeholder-gray-500 text-gray-800"
                    />

                    {/* Add Repositories Button */}
                    <button
                        onClick={handleAddRepos}
                        className="w-full py-3 text-gray-200 font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-in-out flex items-center justify-center space-x-2"
                    >
                        <FaPlus className="text-lg" />
                        <span>Add Repositories</span>
                    </button>

                    {/* Error Message */}
                    {error && <p className="text-red-500 font-medium mt-2 text-center bg-red-50 rounded-lg py-2 shadow-inner">{error}</p>}

                    {/* Collection Section */}
                    {(repos.length > 0 || savedData.length > 0) && (
                        <div className="mt-8 p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-2xl shadow-md border border-gray-200 space-y-8">
                            {/* Save Data Collection Section */}
                            {repos.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
                                        <FaSave className="text-green-500 text-2xl" />
                                        <span>Save Data Collection</span>
                                    </h3>
                                    <input
                                        type="text"
                                        placeholder="Collection name (e.g., Project Alpha)"
                                        value={saveName}
                                        onChange={(e) => setSaveName(e.target.value)}
                                        className="border-2 border-gray-600 p-3 w-full rounded-lg hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300/50 transition duration-300 bg-white placeholder-gray-500 text-gray-800"
                                    />
                                    <button
                                        onClick={saveData}
                                        className="w-full py-3 text-gray-200 font-semibold bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-in-out flex items-center justify-center space-x-2"
                                    >
                                        <FaSave className="text-lg" />
                                        <span>Save Collection</span>
                                    </button>
                                </div>
                            )}

                            {/* Your Collections Section */}
                            {savedData.length > 0 && (
                                <div>
                                    <div className="text-2xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                                        <FaFolderOpen className="text-blue-500 text-2xl" />
                                        <span>Your Collections</span>
                                    </div>
                                    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {savedData.map((data, index) => (
                                            <li
                                                key={index}
                                                className="flex flex-col justify-between p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 ease-in-out border border-gray-200"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <FaFolderOpen className="text-gray-400 text-xl" />
                                                    <span className="text-lg font-semibold text-gray-700">{data.name}</span>
                                                </div>
                                                <div className="flex space-x-2 mt-4">
                                                    <button
                                                        onClick={() => loadData(data.name)}
                                                        className="flex-1 py-2 text-gray-200 bg-indigo-500 rounded-lg font-medium shadow-md hover:bg-indigo-600 transition duration-500 ease-in-out hover:scale-105 flex items-center justify-center space-x-2"
                                                    >
                                                        <span>Load Data</span>
                                                        <FaArrowCircleRight className="text-lg" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteData(data.name)}
                                                        className="px-3 py-2 text-red-500 bg-red-100 rounded-lg font-medium shadow hover:bg-red-200 transition duration-300 ease-in-out flex items-center justify-center"
                                                    >
                                                        <FaTrashAlt className="text-lg" />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div className="flex justify-center items-center mt-10">
                        <div className="inline-flex flex-col items-center space-y-4 py-6 px-10 bg-white/30 backdrop-blur-lg rounded-3xl shadow-md border border-gray-200/40">
                            {/* Spinning Loader */}
                            <div className="w-8 h-8 border-4 border-t-transparent border-blue-400 rounded-full animate-spin"></div>

                            {/* Loading Text */}
                            <div className="text-gray-700 font-semibold text-lg tracking-wider animate-pulse text-center">Loading content, please wait...</div>
                        </div>
                    </div>
                )}

                {!isLoading && (
                    <>
                        {repos.length > 0 && !isLoading && (
                            <div className="mt-8 p-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-3xl shadow-md border border-gray-200/40 space-y-8">
                                {/* Header */}
                                <div className="text-center space-y-2">
                                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">User and Repository Information</h2>
                                    <p className="text-sm text-indigo-500 font-semibold">Overall Commits: {overallTotal}</p>
                                </div>

                                {/* User & Repo Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(showAllRepos ? sortedGitData : sortedGitData.slice(0, initialRepoDisplayLimit)).map((repoItem, index) => {
                                        const commits = `${repoItem.owner}/${repoItem.repo}`;
                                        const user = userData.find((user) => user.username === repoItem.owner);

                                        return (
                                            <div
                                                key={index}
                                                className="p-6 bg-gray-50 rounded-2xl shadow-md border border-gray-200/30 hover:shadow-2xl transition-all duration-500 ease-in-out space-y-5"
                                            >
                                                {/* User Info */}
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        src={user?.avatar_url}
                                                        alt={`${user?.username}'s avatar`}
                                                        className="w-16 h-16 rounded-full shadow-lg border-2 border-gray-200/60"
                                                    />
                                                    <div>
                                                        <a
                                                            href={user?.html_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-lg font-semibold text-gray-800 hover:text-indigo-500 transition duration-300"
                                                        >
                                                            {user?.name || user?.username}
                                                        </a>
                                                        <p className="text-gray-500 text-sm">@{user?.username}</p>
                                                    </div>
                                                </div>

                                                {/* Repository Info */}
                                                <div className="p-4 bg-gray-100/70 rounded-xl shadow-inner border border-gray-200/20 space-y-1">
                                                    <div className="text-gray-700 font-semibold text-sm">
                                                        Repository Name
                                                        <p className="text-xs text-gray-500">{repoItem.repo}</p>
                                                    </div>
                                                    <div className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                                                        <span>Total Commits:</span>
                                                        <span className="text-indigo-500 font-bold">{repoTotals[commits] || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Toggle Button */}
                                {sortedGitData.length > initialRepoDisplayLimit && (
                                    <div className="flex justify-center mt-6">
                                        <button
                                            onClick={toggleShowAllRepos}
                                            className="px-6 py-2 text-white font-semibold bg-indigo-500 rounded-lg hover:bg-indigo-600 transition duration-300"
                                        >
                                            {showAllRepos ? "Show Less" : "Show More"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <WeeklyCommitsComparison repos={repos} isLoading={isLoading} userData={userData} gitData={gitData} />
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
