# GitHub Users Scraper

A script to scrape GitHub issues and extract the usernames of all contributors who commented on them.

## Features

- Scrapes GitHub issues for a given repository
- Extracts all unique usernames who have commented on the issues
- Saves the usernames to a CSV file

## Requirements

- Node.js (v14 or later)

## Installation

1. Clone the repository: `git clone https://github.com/username/repo.git`
2. Navigate to the project directory: `cd repo`
3. Install dependencies: `npm install`

## Usage

1. Navigate to the project directory
2. Run the script with the following command: `npm start [repository]`
   - Replace `[repository]` with the name of the GitHub repository you want to scrape (e.g. `openai/dall-e`)
   - For example: `npm start openai/dall-e`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
