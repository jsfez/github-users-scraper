import fs from "fs";
import path from "path";
import ProgressBar from "progress";
import fetch from "node-fetch";

export const formatNumber = (number) => number.toLocaleString();

export const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    );
  }
  return await response.json();
};

export const createProgressBar = (total) => {
  const progressBar = new ProgressBar(`[:bar] :current/:total :percent`, {
    total,
    width: 40,
    complete: "=",
    incomplete: " ",
  });
  return progressBar;
};

const isExists = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
};

export const writeFile = async (filePath, data) => {
  try {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, data);
  } catch (err) {
    throw new Error(err);
  }
};

export const chunk = (array, chunkCount) => {
  const chunkSize = Math.ceil(array.length / chunkCount);
  const chunks = [];
  let index = 0;
  while (index < array.length) {
    chunks.push(array.slice(index, index + chunkSize));
    index += chunkSize;
  }
  return chunks;
};
