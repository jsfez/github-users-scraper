import puppeteer from "puppeteer";
import slugify from "slugify";
import chalk from "chalk";
import { chunk, createProgressBar, fetchJson, writeFile } from "./utils.js";
import { getRepoIssueUrls, scrapIssueUsers } from "./issue-scraper.js";

const githubRepo = process.argv[2];
const browserPages = 15;
const delayMs = 1000;

const lookingForGithubRepo = async (githubRepo) => {
  console.log(
    chalk.cyan(`Looking for repository "${githubRepo}" in GitHub...`)
  );

  const repoJson = await fetchJson(
    `https://api.github.com/repos/${githubRepo}`
  );
  if (repoJson.message === "Not Found") {
    console.error(` -> ❌ Repository "${githubRepo}" not found.`);
    process.exit(1);
  }
  console.log(` -> Repository found.\n`);
};

const scrapGithubRepo = async () => {
  const filepath = `users/${slugify(githubRepo.replaceAll(/\//g, "_"))}.csv`;
  const logger = [];

  await lookingForGithubRepo(githubRepo);
  const urls = await getRepoIssueUrls(githubRepo);

  console.log(
    chalk.cyan(`Start scrapping users (parallel x${browserPages})...`)
  );
  const progressBar = createProgressBar(urls.length);

  const browser = await puppeteer.launch({ headless: true });
  const urlChunks = chunk(urls, browserPages);
  const chunkUsers = await Promise.all(
    urlChunks.map(async (urlChunk) => {
      try {
        const users = await scrapIssueUsers({
          browser,
          urls: urlChunk,
          delayMs,
          progressBar,
          logger,
        });
        return users;
      } catch (error) {
        logger.push(` -> Error scraping issue users: ${error}`);
        return [];
      }
    })
  );

  await browser.close();

  const results = [...new Set(chunkUsers.flat())].sort();
  console.log("\n");
  console.log(chalk.green("Done!"), `Found ${results.length} unique users`);

  await writeFile(filepath, results.join("\n"));
  console.log(`Results saved into "${filepath}"\n`);

  if (logger.length > 0) {
    console.log(`\n\nLogger:`);
    console.log(logger.join("\n"));
  }
};

if (!githubRepo) {
  console.error(
    chalk.red(
      "❌ Please provide a GitHub repository as an argument. (ex. 'openai/dall-e')"
    )
  );
  process.exit(1);
}

process.setMaxListeners(50);

scrapGithubRepo(githubRepo).catch((e) => console.log(e));
