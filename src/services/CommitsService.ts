import { Repo, Users } from "../types";
import { HttpService } from "./HttpService";

async function getCommits(repos: Repo[]) {
    if (!import.meta.env.VITE_GITHUB_TOKEN) {
        throw new Error("GitHub token is not set. Please add it to your .env file.");
    }

    const commitDataPromises = repos.map(({ owner, repo }) =>
        HttpService.get(`/repos/${owner}/${repo}/stats/commit_activity`, {
            headers: {
                Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
                "X-GitHub-Api-Version": "2022-11-28",
            },
        })
            .then((response) => ({
                owner,
                repo,
                data: response.data,
            }))
            .catch(() => ({
                owner,
                repo,
                data: null,
            }))
    );

    const allCommitData = await Promise.all(commitDataPromises);
    return allCommitData.filter((repoData) => repoData.data !== null);
}

async function getUserData(usernames: Users[]) {
    if (!import.meta.env.VITE_GITHUB_TOKEN) {
        throw new Error("GitHub token is not set. Please add it to your .env file.");
    }

    const userDataPromises = usernames.map(({ username }) =>
        HttpService.get(`/users/${username}`, {
            headers: {
                Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
                "X-GitHub-Api-Version": "2022-11-28",
            },
        })
            .then((response) => ({
                username,
                data: response.data,
            }))
            .catch(() => ({
                username,
                data: null,
            }))
    );

    const allUserData = await Promise.all(userDataPromises);
    return allUserData.filter((userData) => userData.data !== null);
}

export default {
    getCommits,
    getUserData,
};
