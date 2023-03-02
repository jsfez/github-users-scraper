import chalk from "chalk";
import { fetchJson, formatNumber } from "./utils.js";

const perPage = 100;

const getIssues = async (githubRepo, page) => {
  const url = `https://api.github.com/repos/${githubRepo}/issues?state=all&page=${page}&per_page=${perPage}`;
  const response = await fetchJson(url);
  return response;
};

export const getRepoIssueUrls = async (githubRepo) => {
  console.log(chalk.cyan(`Looking for issues...`));
  const firstPageIssues = await getIssues(githubRepo, 1);
  const lastPage = Math.ceil(firstPageIssues[0].number / perPage);
  const issues = [
    ...firstPageIssues,
    ...(await Promise.all(
      Array.from({ length: lastPage - 1 }, (_, i) =>
        getIssues(githubRepo, i + 2)
      )
    ).then((results) => results.flat())),
  ];

  const filteredIssues = issues.filter(
    (issue) => !issue.title.toLowerCase().includes("bump")
  );

  console.log(
    ` -> ${formatNumber(
      filteredIssues.length
    )} relevant issues found (total: ${formatNumber(issues.length)} issues).\n`
  );

  return filteredIssues.map(
    (issue) => `https://github.com/${githubRepo}/issues/${issue.number}`
  );
};

export const scrapIssueUsers = async ({
  browser,
  urls,
  delayMs,
  progressBar,
  logger,
}) => {
  const page = await browser.newPage();
  const issuesUsers = await Promise.all(
    urls.map(async (url) => {
      try {
        await page.goto(url, { waitUntil: "networkidle0" });
        await page.waitForTimeout(delayMs);
        await page.waitForSelector("a.author");

        const users = await page.$$eval("a.author", (author) =>
          author.map((option) =>
            (option.textContent || "").replaceAll(/\s|\n/g, "")
          )
        );

        if (users.length === 0) {
          logger.push(`- No user found in ${url}`);
        }

        return users;
      } catch (error) {
        if (!error.message.match("- Waiting for selector `a.author` failed")) {
          logger.push(error.message);
        } else {
          console.error(`Error fetching ${url}: ${error}`);
        }
        return [];
      } finally {
        progressBar.tick(1);
      }
    })
  );

  await page.close();
  return [...new Set(issuesUsers.flat())];
};
