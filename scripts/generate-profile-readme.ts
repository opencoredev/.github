import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Project = {
  description: string;
  name: string;
  repo: string;
  stage?: string;
};

const owner = "opencoredev";

const projects: Project[] = [
  {
    name: "Email SDK",
    repo: "email-sdk",
    stage: "Public",
    description:
      "A lightweight TypeScript email SDK for Resend, Postmark, SendGrid, Mailgun, Brevo, SMTP, and more.",
  },
  {
    name: "Amend.sh",
    repo: "amend.sh",
    stage: "Beta",
    description:
      "Product update automation for feedback, shipped work, changelogs, roadmaps, and customer notifications.",
  },
  {
    name: "Agent Center",
    repo: "agent-center",
    stage: "Unreleased",
    description: "A control plane for starting, steering, and reviewing background coding agents.",
  },
  {
    name: "Beppo",
    repo: "beppo",
    stage: "WIP",
    description: "A desktop workspace for delegating general tasks to AI agents.",
  },
  {
    name: "cc-sync",
    repo: "cc-sync",
    stage: "Active",
    description:
      "A CLI and sync service for keeping agent skills and MCP configuration in sync across machines.",
  },
  {
    name: "Convt",
    repo: "convt",
    stage: "Public",
    description: "A local-first file converter.",
  },
  {
    name: "OpenChat / OSSChat",
    repo: "openchat",
    stage: "Open source",
    description: "An open-source AI chat platform with BYOK and self-hosting support.",
  },
  {
    name: "Better Files",
    repo: "better-files",
    stage: "Native",
    description: "Swift-based file tooling experiments for macOS.",
  },
  {
    name: "OpenBlocks",
    repo: "openblocks",
    stage: "Experiment",
    description: "An open web project for building with reusable blocks.",
  },
  {
    name: "TheoCounter",
    repo: "theocounter",
    stage: "Web",
    description: "A simple site that tracks how long Theo has not posted.",
  },
  {
    name: "ClaudeDay",
    repo: "claudeday",
    stage: "Web",
    description: "A small site for national Claude day.",
  },
];

const labs: Project[] = [
  {
    name: "RQ",
    repo: "rq",
    description: "A small TypeScript request utility.",
  },
  {
    name: "leo-stack",
    repo: "leo-stack",
    description: "An opinionated fork of Better T Stack.",
  },
  {
    name: "create",
    repo: "create",
    description: "A customized Better T Stack scaffold.",
  },
  {
    name: "beff",
    repo: "beff",
    description: "A Convex Chef-style project that can use local Claude Code or Codex subscriptions.",
  },
  {
    name: "quad",
    repo: "quad",
    description: "An open-source Claude Cowork alternative experiment.",
  },
  {
    name: "claudex",
    repo: "claudex",
    description: "A Codex CLI fork for Claude models and opinionated workflows.",
  },
  {
    name: "warp-leo",
    repo: "warp-leo",
    description: "OpenWarp customized around preferred workflows.",
  },
];

type RankedProject = Project & {
  stars: number;
};

function badge(repo: string) {
  return `![stars](https://img.shields.io/github/stars/${owner}/${repo}?style=flat&label=%E2%98%85)`;
}

async function fetchStars(repo: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "opencoredev-profile-readme-generator",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!response.ok) {
    throw new Error(`Could not fetch ${owner}/${repo}: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { stargazers_count?: number };
  return data.stargazers_count ?? 0;
}

async function rank(projectList: Project[]): Promise<RankedProject[]> {
  const ranked = await Promise.all(
    projectList.map(async (project) => ({
      ...project,
      stars: await fetchStars(project.repo),
    })),
  );

  return ranked.sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));
}

function renderProjectsTable(projectList: RankedProject[]) {
  return [
    "| Project | Stage | What it is | Stars |",
    "| --- | --- | --- | ---: |",
    ...projectList.map(
      (project) =>
        `| [${project.name}](https://github.com/${owner}/${project.repo}) | ${project.stage} | ${project.description} | ${badge(project.repo)} |`,
    ),
  ].join("\n");
}

function renderLabsTable(projectList: RankedProject[]) {
  return [
    "| Project | What it is | Stars |",
    "| --- | --- | ---: |",
    ...projectList.map(
      (project) =>
        `| [${project.name}](https://github.com/${owner}/${project.repo}) | ${project.description} | ${badge(project.repo)} |`,
    ),
  ].join("\n");
}

async function main() {
  const rankedProjects = await rank(projects);
  const rankedLabs = await rank(labs);

  const readme = `<p align="center">
  <img src="https://raw.githubusercontent.com/opencoredev/.github/main/logo.svg" width="96" alt="OpenCore" />
</p>

<h1 align="center">OpenCore</h1>

<p align="center">
  Open-source and open-core software for agents, developer workflows, local tools, and useful internet products.
</p>

## Our Philosophy

Open source should be something people can actually run, inspect, fork, and improve. OpenCore builds in public because useful software gets better when the implementation is visible, practical, and owned by the people using it.

## Projects

${renderProjectsTable(rankedProjects)}

## Labs And Forks

${renderLabsTable(rankedLabs)}

---

Core maintainer: [Leo](https://github.com/leoisadev1).
`;

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const profileDir = path.join(root, "profile");

  await mkdir(profileDir, { recursive: true });
  await writeFile(path.join(profileDir, "README.md"), readme);
}

await main();
