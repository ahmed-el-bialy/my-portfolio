#!/usr/bin/env node
/**
 * Automated GitHub Portfolio Sync Script
 * Fetches live profile, pinned/top repositories, and contribution counts via
 * GitHub GraphQL API (or REST fallback when unauthenticated) and writes:
 *   - public/github-data.json
 *   - public/last-updated.json
 *   - data/portfolio.json (updates lastUpdated timestamp)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const USERNAME = process.env.GITHUB_USERNAME || 'ahmed-el-bialy';
const TOKEN = process.env.GITHUB_TOKEN || '';

const GRAPHQL_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      login
      name
      bio
      avatarUrl
      followers { totalCount }
      following { totalCount }
      repositories(first: 12, orderBy: { field: PUSHED_AT, direction: DESC }, isFork: false, privacy: PUBLIC) {
        totalCount
        nodes {
          databaseId
          name
          nameWithOwner
          description
          url
          homepageUrl
          stargazerCount
          forkCount
          primaryLanguage { name color }
          pushedAt
          updatedAt
          createdAt
          isFork
          diskUsage
          defaultBranchRef { name }
          repositoryTopics(first: 8) {
            nodes { topic { name } }
          }
        }
      }
      contributionsCollection {
        totalCommitContributions
        contributionCalendar {
          totalContributions
        }
      }
    }
  }
`;

async function fetchViaGraphQL() {
  if (!TOKEN) return null;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'ahmed-el-bialy-portfolio-sync',
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY,
      variables: { login: USERNAME },
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub GraphQL error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors || !json.data?.user) {
    throw new Error(`GitHub GraphQL payload error: ${JSON.stringify(json.errors || 'missing user')}`);
  }

  const user = json.data.user;
  const repoNodes = (user.repositories?.nodes || []).filter(
    (r) => r?.name && r.name.toLowerCase() !== USERNAME.toLowerCase()
  );

  return {
    generatedAt: new Date().toISOString(),
    source: 'github-graphql-api',
    user: {
      login: user.login || USERNAME,
      name: user.name || 'Ahmed El-Bialy',
      bio: user.bio || '',
      avatar_url: user.avatarUrl || '',
      followers: user.followers?.totalCount ?? 0,
      following: user.following?.totalCount ?? 0,
      public_repos: user.repositories?.totalCount ?? repoNodes.length,
    },
    contributions: {
      totalContributions: user.contributionsCollection?.contributionCalendar?.totalContributions ?? 0,
      totalCommitContributions: user.contributionsCollection?.totalCommitContributions ?? 0,
    },
    repositories: repoNodes.map((node, index) => ({
      id: node.databaseId || index + 1,
      name: node.name,
      full_name: node.nameWithOwner || `${USERNAME}/${node.name}`,
      description: node.description,
      html_url: node.url,
      homepage: node.homepageUrl || null,
      stargazers_count: node.stargazerCount ?? 0,
      forks_count: node.forkCount ?? 0,
      language: node.primaryLanguage?.name || null,
      topics: (node.repositoryTopics?.nodes || []).map((t) => t?.topic?.name).filter(Boolean),
      pushed_at: node.pushedAt,
      updated_at: node.updatedAt,
      created_at: node.createdAt,
      is_fork: Boolean(node.isFork),
      size: node.diskUsage ?? 0,
      default_branch: node.defaultBranchRef?.name || 'main',
    })),
  };
}

async function fetchViaRestFallback() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ahmed-el-bialy-portfolio-sync',
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(USERNAME)}`, { headers }),
    fetch(`https://api.github.com/users/${encodeURIComponent(USERNAME)}/repos?per_page=100&sort=pushed`, {
      headers,
    }),
  ]);

  if (!userRes.ok || !reposRes.ok) {
    throw new Error(`GitHub REST fallback failed: ${userRes.status}/${reposRes.status}`);
  }

  const user = await userRes.json();
  const rawRepos = await reposRes.json();
  const repositories = (Array.isArray(rawRepos) ? rawRepos : [])
    .filter((r) => !r.fork && r.name?.toLowerCase() !== USERNAME.toLowerCase())
    .map((r) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      html_url: r.html_url,
      homepage: r.homepage || null,
      stargazers_count: r.stargazers_count ?? 0,
      forks_count: r.forks_count ?? 0,
      language: r.language || null,
      topics: Array.isArray(r.topics) ? r.topics : [],
      pushed_at: r.pushed_at,
      updated_at: r.updated_at,
      created_at: r.created_at,
      is_fork: Boolean(r.fork),
      size: r.size ?? 0,
      default_branch: r.default_branch || 'main',
    }));

  return {
    generatedAt: new Date().toISOString(),
    source: 'github-rest-api',
    user: {
      login: user.login || USERNAME,
      name: user.name || 'Ahmed El-Bialy',
      bio: user.bio || '',
      avatar_url: user.avatar_url || '',
      followers: user.followers ?? 0,
      following: user.following ?? 0,
      public_repos: user.public_repos ?? repositories.length,
    },
    contributions: {
      totalContributions: null,
      totalCommitContributions: null,
    },
    repositories,
  };
}

async function main() {
  let snapshot = null;
  try {
    snapshot = await fetchViaGraphQL();
  } catch (err) {
    console.warn(`[sync-github] GraphQL sync unavailable (${err.message}), trying REST fallback...`);
  }

  if (!snapshot) {
    snapshot = await fetchViaRestFallback();
  }

  const nowIso = new Date().toISOString();
  const githubDataPath = path.join(ROOT_DIR, 'public', 'github-data.json');
  const lastUpdatedPath = path.join(ROOT_DIR, 'public', 'last-updated.json');
  const portfolioJsonPath = path.join(ROOT_DIR, 'data', 'portfolio.json');

  await fs.mkdir(path.dirname(githubDataPath), { recursive: true });
  await fs.writeFile(githubDataPath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');

  const lastUpdatedPayload = {
    lastUpdated: nowIso,
    source: snapshot.source,
    username: USERNAME,
    repoCount: snapshot.user.public_repos ?? snapshot.repositories.length,
    commitSha: process.env.GITHUB_SHA ? process.env.GITHUB_SHA.slice(0, 7) : 'local-sync',
  };
  await fs.writeFile(lastUpdatedPath, JSON.stringify(lastUpdatedPayload, null, 2) + '\n', 'utf8');

  try {
    const rawPortfolio = await fs.readFile(portfolioJsonPath, 'utf8');
    const portfolioJson = JSON.parse(rawPortfolio);
    portfolioJson.lastUpdated = nowIso;
    await fs.writeFile(portfolioJsonPath, JSON.stringify(portfolioJson, null, 2) + '\n', 'utf8');
  } catch (err) {
    console.warn(`[sync-github] Skipped updating data/portfolio.json: ${err.message}`);
  }

  console.log(
    `[sync-github] Synced ${snapshot.repositories.length} repos via ${snapshot.source} at ${nowIso}`
  );
}

main().catch((err) => {
  console.error('[sync-github] Fatal sync failure:', err);
  process.exit(1);
});
