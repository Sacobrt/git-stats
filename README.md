# GitHub Repo Commit Stats

![Logo](./src/assets/logo.png)

## Overview

GitHub Repo Commit Stats is a web application for visualizing and saving commit statistics across multiple GitHub repositories. This tool provides an easy-to-use interface to track weekly commit activity, save repository sets, and analyze contributions over time.

## Features

-   **Add Multiple Repositories:** Enter GitHub repository URLs and track up to 30 repositories simultaneously.
-   **Save Collections:** Save sets of repositories for quick access to frequently monitored projects.
-   **View Weekly Commits:** Get a breakdown of commits by week for each repository.
-   **Weekly Comparison:** Visualize weekly commit activity across all repositories to identify trends and patterns.

## Installation

    git clone https://github.com/Sacobrt/git-stats.git
    cd git-stats

    Install Dependencies Ensure you have Node.js installed.

    npm install
    npm run dev

## Usage

Add Repositories: Enter GitHub repository URLs (e.g., https://github.com/owner/repo) in the input field, each on a new line.

View Commit Data: Click "Add Repositories" to load commit data. The application displays weekly contributions.

Save Collections: Give a name to your collection and save it. Access saved collections anytime under "Your Collections."

Analyze Weekly Trends: The comparative section at the bottom provides insights into weekly commit trends across repositories.

## Contributing

Contributions are welcome! Please follow these steps:

-   Fork the Repository
-   Create a Branch `git checkout -b feature/YourFeatureName`

-   Commit Your Changes

-   Push to Your Fork
    `git push origin feature/YourFeatureName`

-   Submit a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/license/mit) file for details.
