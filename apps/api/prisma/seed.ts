import { MemberRole, PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SEED_PASSWORD = "password123";

const DEFAULT_RULES = [
  {
    position: 1,
    title: "Remember the human",
    description:
      "Treat others with respect. Healthy communities allow for disagreement.",
  },
  {
    position: 2,
    title: "Abide by community rules",
    description: "Posts should fit the topic and spirit of the community.",
  },
  {
    position: 3,
    title: "Respect privacy",
    description: "Do not share personal information without consent.",
  },
  {
    position: 4,
    title: "No spam or self-promotion",
    description: "Keep posts authentic and relevant to the discussion.",
  },
  {
    position: 5,
    title: "Search before you post",
    description: "Check if your question has already been answered.",
  },
];

type UserSeed = {
  username: string;
  email: string;
  displayName: string;
  bio: string;
};

const USERS: UserSeed[] = [
  {
    username: "demo",
    email: "demo@example.test",
    displayName: "Demo User",
    bio: "Default demo account for local development.",
  },
  {
    username: "typescript_fan",
    email: "typescript_fan@example.test",
    displayName: "TS Fan",
    bio: "Strict mode evangelist. I read the handbook for fun.",
  },
  {
    username: "react_dev_42",
    email: "react_dev_42@example.test",
    displayName: "Maya Chen",
    bio: "Frontend engineer · React · design systems · coffee.",
  },
  {
    username: "node_wizard",
    email: "node_wizard@example.test",
    displayName: "Alex Rivera",
    bio: "Backend at a fintech startup. NestJS, Postgres, queues.",
  },
  {
    username: "css_sorcerer",
    email: "css_sorcerer@example.test",
    displayName: "Jordan Lee",
    bio: "CSS is a programming language. Grid changed my life.",
  },
  {
    username: "docker_captain",
    email: "docker_captain@example.test",
    displayName: "Sam Okonkwo",
    bio: "Platform engineer. Kubernetes, Terraform, incident response.",
  },
  {
    username: "junior_dev_2024",
    email: "junior_dev_2024@example.test",
    displayName: "Emily Park",
    bio: "Bootcamp grad · first dev job · learning in public.",
  },
  {
    username: "senior_architect",
    email: "senior_architect@example.test",
    displayName: "David Kim",
    bio: "15 years in software. Architecture, mentoring, boring tech.",
  },
  {
    username: "nextjs_enjoyer",
    email: "nextjs_enjoyer@example.test",
    displayName: "Priya Sharma",
    bio: "Full-stack · Next.js App Router · server components curious.",
  },
  {
    username: "rust_curiosity",
    email: "rust_curiosity@example.test",
    displayName: "Chris Nolan",
    bio: "Mostly TypeScript by day. Exploring Rust on weekends.",
  },
  {
    username: "career_coach_jen",
    email: "career_coach_jen@example.test",
    displayName: "Jennifer Walsh",
    bio: "Former recruiter · help with resumes and interviews.",
  },
  {
    username: "open_source_hero",
    email: "open_source_hero@example.test",
    displayName: "Marcus Webb",
    bio: "Maintainer of small OSS libs. PRs welcome.",
  },
  {
    username: "data_driven_dev",
    email: "data_driven_dev@example.test",
    displayName: "Anita Desai",
    bio: "Analytics engineer turned product engineer.",
  },
  {
    username: "remote_worker",
    email: "remote_worker@example.test",
    displayName: "Tom Hughes",
    bio: "WFH since 2018 · async communication advocate.",
  },
  {
    username: "graphql_skeptic",
    email: "graphql_skeptic@example.test",
    displayName: "Lisa Tran",
    bio: "REST enjoyer. GraphQL when the client team insists.",
  },
  {
    username: "vim_forever",
    email: "vim_forever@example.test",
    displayName: "Erik Johansson",
    bio: "Neovim + tmux. No mouse required.",
  },
  {
    username: "ai_hype_realist",
    email: "ai_hype_realist@example.test",
    displayName: "Nina Patel",
    bio: "ML engineer who still writes unit tests.",
  },
  {
    username: "startup_cto",
    email: "startup_cto@example.test",
    displayName: "Ryan Foster",
    bio: "CTO at seed-stage startup. Hiring, shipping, surviving.",
  },
  {
    username: "leetcode_grinder",
    email: "leetcode_grinder@example.test",
    displayName: "Kevin Zhao",
    bio: "300+ LeetCode problems. Still nervous in interviews.",
  },
  {
    username: "design_systems",
    email: "design_systems@example.test",
    displayName: "Sofia Martinez",
    bio: "Design systems lead. Tokens, a11y, Figma ↔ code.",
  },
  {
    username: "postgres_lover",
    email: "postgres_lover@example.test",
    displayName: "Ben Clarke",
    bio: "Postgres indexes are my love language.",
  },
  {
    username: "side_project_king",
    email: "side_project_king@example.test",
    displayName: "James O'Brien",
    bio: "12 unfinished side projects. This one might ship.",
  },
  {
    username: "tech_lead_tired",
    email: "tech_lead_tired@example.test",
    displayName: "Rachel Green",
    bio: "Tech lead. Meetings → code → repeat.",
  },
  {
    username: "monorepo_survivor",
    email: "monorepo_survivor@example.test",
    displayName: "Omar Hassan",
    bio: "pnpm workspaces survivor. Turborepo curious.",
  },
  {
    username: "api_design_guru",
    email: "api_design_guru@example.test",
    displayName: "Victoria Adams",
    bio: "API design, OpenAPI, developer experience.",
  },
];

type CommunitySeed = {
  name: string;
  title: string;
  description: string;
  creatorUsername: string;
  extraMods?: string[];
  rules?: Array<{ position: number; title: string; description: string }>;
};

const COMMUNITIES: CommunitySeed[] = [
  {
    name: "typescript",
    title: "TypeScript",
    description:
      "Welcome to r/typescript — a community for the TypeScript programming language. Share projects, ask questions, discuss types, tooling, and ecosystem news.",
    creatorUsername: "typescript_fan",
    extraMods: ["senior_architect", "react_dev_42"],
    rules: [
      {
        position: 1,
        title: "TypeScript-focused content",
        description: "Posts should relate to TypeScript or its ecosystem.",
      },
      {
        position: 2,
        title: "Include context in questions",
        description: "Share tsconfig, versions, and what you already tried.",
      },
      ...DEFAULT_RULES.slice(2),
    ],
  },
  {
    name: "javascript",
    title: "JavaScript",
    description:
      "All things JavaScript — language features, frameworks, tooling, and the weird parts we all love.",
    creatorUsername: "react_dev_42",
    extraMods: ["node_wizard"],
  },
  {
    name: "webdev",
    title: "Web Development",
    description:
      "A community dedicated to all things web development: both front-end and back-end.",
    creatorUsername: "css_sorcerer",
    extraMods: ["design_systems", "nextjs_enjoyer"],
  },
  {
    name: "programming",
    title: "Programming",
    description:
      "Computer programming discussion. News, articles, and discussions about programming.",
    creatorUsername: "senior_architect",
    extraMods: ["open_source_hero", "vim_forever"],
  },
  {
    name: "reactjs",
    title: "React",
    description:
      "A community for discussing React and related tools in the React ecosystem.",
    creatorUsername: "react_dev_42",
    extraMods: ["nextjs_enjoyer", "design_systems"],
  },
  {
    name: "node",
    title: "Node.js",
    description:
      "Unofficial subreddit for Node.js — runtime, npm, frameworks, and production war stories.",
    creatorUsername: "node_wizard",
    extraMods: ["postgres_lover", "api_design_guru"],
  },
  {
    name: "learnprogramming",
    title: "Learn Programming",
    description:
      "A subreddit for all questions related to programming. All questions are welcome.",
    creatorUsername: "junior_dev_2024",
    extraMods: ["career_coach_jen", "leetcode_grinder"],
  },
  {
    name: "nextjs",
    title: "Next.js",
    description:
      "The React framework for production. Discuss App Router, RSC, deployment, and migrations.",
    creatorUsername: "nextjs_enjoyer",
    extraMods: ["react_dev_42", "monorepo_survivor"],
  },
  {
    name: "docker",
    title: "Docker",
    description:
      "Docker containers, images, Compose, and container orchestration in production.",
    creatorUsername: "docker_captain",
    extraMods: ["startup_cto"],
  },
  {
    name: "careerquestions",
    title: "Career Questions",
    description:
      "Questions about careers in computer science, IT, engineering, and related fields.",
    creatorUsername: "career_coach_jen",
    extraMods: ["remote_worker", "tech_lead_tired"],
  },
  {
    name: "experienceddevs",
    title: "Experienced Developers",
    description:
      "For experienced developers. Career growth, architecture, leadership, and industry discussion.",
    creatorUsername: "senior_architect",
    extraMods: ["startup_cto", "tech_lead_tired", "remote_worker"],
  },
  {
    name: "sideproject",
    title: "Side Projects",
    description:
      "Share what you're building on nights and weekends. Feedback, launches, and motivation.",
    creatorUsername: "side_project_king",
    extraMods: ["open_source_hero"],
  },
];

type PostSeed = {
  communityName: string;
  authorUsername: string;
  title: string;
  body: string;
  score: number;
  daysAgo: number;
  comments?: CommentSeed[];
};

type CommentSeed = {
  authorUsername: string;
  body: string;
  score: number;
  daysAgo: number;
  replies?: CommentSeed[];
};

const POSTS: PostSeed[] = [
  {
    communityName: "typescript",
    authorUsername: "monorepo_survivor",
    title: "Monorepo architecture shared types",
    body: `How is everyone managing shared TypeScript types in React + Node monorepos?

Currently using a shared package (@repo/types) published via workspace protocol, but I'm running into:
- Duplicate builds when types change
- Frontend importing server-only types by accident
- CI taking forever on typecheck

Wondering if there's a better approach than a dedicated types package. Turborepo? Project references? Something else?

What's working for you in 2025?`,
    score: 342,
    daysAgo: 2,
    comments: [
      {
        authorUsername: "senior_architect",
        body: "Project references + a strict `tsconfig.base.json` saved us. Separate `client` and `server` entry barrels so accidental imports fail at compile time.",
        score: 89,
        daysAgo: 2,
        replies: [
          {
            authorUsername: "monorepo_survivor",
            body: "Do you use path aliases across packages or only package names?",
            score: 12,
            daysAgo: 2,
          },
          {
            authorUsername: "senior_architect",
            body: "Package names only. Path aliases across package boundaries become a nightmare when you publish or run tests in isolation.",
            score: 45,
            daysAgo: 1,
          },
        ],
      },
      {
        authorUsername: "nextjs_enjoyer",
        body: "We use tRPC so the API contract IS the types. Shared Zod schemas in one package, infer types on both sides. Less duplication than raw interfaces.",
        score: 156,
        daysAgo: 2,
        replies: [
          {
            authorUsername: "graphql_skeptic",
            body: "tRPC is great but locks you into TS on both ends. Fine for internal monorepos, harder if you have mobile or external API consumers.",
            score: 34,
            daysAgo: 1,
          },
        ],
      },
      {
        authorUsername: "typescript_fan",
        body: "`exports` field in package.json with separate `./client` and `./server` subpaths. Combined with `typesVersions` it works surprisingly well.",
        score: 67,
        daysAgo: 1,
      },
      {
        authorUsername: "node_wizard",
        body: "Don't forget `composite: true` and incremental builds. Cut our CI typecheck from 8 min to 2 min.",
        score: 41,
        daysAgo: 1,
      },
    ],
  },
  {
    communityName: "typescript",
    authorUsername: "typescript_fan",
    title: "TypeScript 5.8 — what feature are you most excited about?",
    body: "Satisfies improvements, `--erasableSyntaxOnly`, better editor performance... which one actually changed your day-to-day?",
    score: 128,
    daysAgo: 5,
    comments: [
      {
        authorUsername: "react_dev_42",
        body: "The editor perf improvements are real on our 200k LOC repo. `tsserver` used to choke on big refactors.",
        score: 28,
        daysAgo: 5,
      },
      {
        authorUsername: "vim_forever",
        body: "Still waiting for pattern matching. The satisfies operator is nice though.",
        score: 19,
        daysAgo: 4,
      },
    ],
  },
  {
    communityName: "typescript",
    authorUsername: "senior_architect",
    title: "Stop using `any` — but also stop pretending `unknown` fixes everything",
    body: "Hot take: teams adopt `unknown` then cast immediately. Share patterns that actually help juniors type external data (APIs, JSON, form payloads).",
    score: 512,
    daysAgo: 8,
    comments: [
      {
        authorUsername: "junior_dev_2024",
        body: "Zod at the boundary changed how I think about this. Parse once, typed everywhere inside.",
        score: 203,
        daysAgo: 8,
      },
    ],
  },
  {
    communityName: "javascript",
    authorUsername: "react_dev_42",
    title: "What's the most confusing JavaScript feature for beginners you still explain often?",
    body: "For me it's `this` binding and closures in the same breath. What do you see in code reviews?",
    score: 267,
    daysAgo: 3,
    comments: [
      {
        authorUsername: "node_wizard",
        body: "Async timing — they add await everywhere including sync functions and wonder why order is wrong.",
        score: 77,
        daysAgo: 3,
      },
      {
        authorUsername: "career_coach_jen",
        body: "== vs === and why 0 == '0' is true. Every bootcamp cohort.",
        score: 44,
        daysAgo: 2,
      },
    ],
  },
  {
    communityName: "javascript",
    authorUsername: "open_source_hero",
    title: "Released a tiny library: deepFreeze for nested objects",
    body: "npm: `freeze-deep-lite` — 200 bytes, no deps. Useful for config objects. Feedback welcome before 1.0.",
    score: 94,
    daysAgo: 12,
  },
  {
    communityName: "webdev",
    authorUsername: "css_sorcerer",
    title: "CSS `:has()` is production-ready — here's 5 patterns I use weekly",
    body: "Parent selectors without JS: card hover states, form validation styling, nav active states, zebra tables, and conditional grid layouts. Examples in comments if people want.",
    score: 891,
    daysAgo: 4,
    comments: [
      {
        authorUsername: "design_systems",
        body: "`:has()` + `:not()` for focus-visible on custom checkboxes is chef's kiss.",
        score: 112,
        daysAgo: 4,
      },
    ],
  },
  {
    communityName: "webdev",
    authorUsername: "remote_worker",
    title: "How do you test responsive layouts without resizing the browser manually?",
    body: "Playwright visual snapshots? Dedicated viewport toolbar extension? Storybook?",
    score: 156,
    daysAgo: 7,
  },
  {
    communityName: "programming",
    authorUsername: "vim_forever",
    title: "What's a \"boring\" technology choice you stand by?",
    body: "I'll go first: SQLite for workloads under 100k users. Postgres is great but most apps don't need it on day one.",
    score: 1204,
    daysAgo: 1,
    comments: [
      {
        authorUsername: "postgres_lover",
        body: "Respectfully disagree on SQLite at scale but agree on boring CRUD with Rails/Django/Express.",
        score: 89,
        daysAgo: 1,
        replies: [
          {
            authorUsername: "vim_forever",
            body: "Fair — read replicas and connection pooling change the calculus past a point.",
            score: 23,
            daysAgo: 1,
          },
        ],
      },
      {
        authorUsername: "senior_architect",
        body: "Boring: REST over GraphQL for internal APIs. Boring: feature flags behind env vars before fancy SaaS.",
        score: 156,
        daysAgo: 1,
      },
    ],
  },
  {
    communityName: "reactjs",
    authorUsername: "nextjs_enjoyer",
    title: "React 19 use() hook — early adopters, what are you using it for?",
    body: "Reading promises in components feels wild. Suspense boundaries everywhere now.",
    score: 445,
    daysAgo: 6,
    comments: [
      {
        authorUsername: "react_dev_42",
        body: "Streaming user profile + permissions in one tree without effect waterfalls. Still wrapping my head around error boundaries.",
        score: 67,
        daysAgo: 6,
      },
    ],
  },
  {
    communityName: "reactjs",
    authorUsername: "design_systems",
    title: "Compound components vs render props in 2025?",
    body: "Our design system still uses render props for flexibility. Team wants compound components for simpler docs. Tradeoffs?",
    score: 178,
    daysAgo: 10,
  },
  {
    communityName: "node",
    authorUsername: "node_wizard",
    title: "NestJS vs Fastify raw — when do you pick Nest?",
    body: "I love Nest for large teams (modules, DI, guards). For small services I reach for Fastify. Where's your line?",
    score: 334,
    daysAgo: 5,
    comments: [
      {
        authorUsername: "startup_cto",
        body: "Nest when you have 3+ engineers touching the API. Solo → Fastify or Hono.",
        score: 91,
        daysAgo: 5,
      },
      {
        authorUsername: "api_design_guru",
        body: "Nest's OpenAPI plugin is underrated for client SDK generation.",
        score: 45,
        daysAgo: 4,
      },
    ],
  },
  {
    communityName: "node",
    authorUsername: "postgres_lover",
    title: "Prisma vs Drizzle — honest comparison from production",
    body: "Ran both on the same schema. Prisma: better DX, heavier runtime. Drizzle: closer to SQL, lighter. We picked Prisma for hiring pool familiarity.",
    score: 289,
    daysAgo: 9,
  },
  {
    communityName: "learnprogramming",
    authorUsername: "junior_dev_2024",
    title: "First PR merged at work — feels surreal",
    body: "Fixed a typo in docs then a real bug in auth middleware. Mentor said my tests were actually good. Still terrified of standup tomorrow.",
    score: 623,
    daysAgo: 2,
    comments: [
      {
        authorUsername: "career_coach_jen",
        body: "Celebrate this! Write down what you learned for your brag doc.",
        score: 88,
        daysAgo: 2,
      },
      {
        authorUsername: "tech_lead_tired",
        body: "Standup is just 'what I did yesterday' — you merged a PR. Easy win.",
        score: 42,
        daysAgo: 2,
      },
    ],
  },
  {
    communityName: "learnprogramming",
    authorUsername: "leetcode_grinder",
    title: "How many LeetCode problems before interviews feel okay?",
    body: "At 120 mediums. Still blank on graph problems under pressure. Is 200 the magic number or am I grinding wrong?",
    score: 412,
    daysAgo: 11,
    comments: [
      {
        authorUsername: "senior_architect",
        body: "Patterns > count. Master 15 patterns, then timed practice. 80 well-understood problems beat 300 shallow ones.",
        score: 234,
        daysAgo: 11,
      },
    ],
  },
  {
    communityName: "nextjs",
    authorUsername: "monorepo_survivor",
    title: "App Router caching defaults still confuse our team",
    body: "fetch cache, unstable_cache, revalidatePath, revalidateTag — we have a wiki page now. What resources helped you?",
    score: 367,
    daysAgo: 4,
    comments: [
      {
        authorUsername: "nextjs_enjoyer",
        body: "The Next.js docs 'Caching in Depth' section + building one feature with each strategy side by side.",
        score: 56,
        daysAgo: 4,
      },
    ],
  },
  {
    communityName: "nextjs",
    authorUsername: "react_dev_42",
    title: "Server Actions for forms — are you using them over API routes?",
    body: "Moved login and profile update to Server Actions. Less client JS. Still use API routes for mobile app BFF.",
    score: 198,
    daysAgo: 14,
  },
  {
    communityName: "docker",
    authorUsername: "docker_captain",
    title: "Multi-stage Dockerfile for Node — share your template",
    body: `Here's ours:
- deps stage: pnpm install --frozen-lockfile
- build stage: compile TS
- prod stage: distroless or alpine, non-root user

What do you optimize for: image size or build cache?`,
    score: 276,
    daysAgo: 6,
    comments: [
      {
        authorUsername: "startup_cto",
        body: "Build cache > size until you're paying for registry egress at scale.",
        score: 34,
        daysAgo: 6,
      },
    ],
  },
  {
    communityName: "docker",
    authorUsername: "node_wizard",
    title: "docker compose watch is a game changer for local dev",
    body: "Sync + restart on file changes without rebuilding images. Paired with volume mounts for node_modules.",
    score: 145,
    daysAgo: 15,
  },
  {
    communityName: "careerquestions",
    authorUsername: "remote_worker",
    title: "Remote job listing says 'occasional travel' — how occasional is occasional?",
    body: "Recruiter said 2-4 times per year. Offer letter says 'as needed'. Anyone been burned by this?",
    score: 534,
    daysAgo: 3,
    comments: [
      {
        authorUsername: "career_coach_jen",
        body: "Get it in writing: max trips per year, duration, paid travel, notice period.",
        score: 167,
        daysAgo: 3,
      },
    ],
  },
  {
    communityName: "careerquestions",
    authorUsername: "junior_dev_2024",
    title: "Bootcamp grad — 6 months job search, finally an offer. Should I negotiate?",
    body: "Offer is 72k USD remote. First dev role. Afraid they'll rescind if I ask for more.",
    score: 445,
    daysAgo: 8,
    comments: [
      {
        authorUsername: "career_coach_jen",
        body: "Always ask. Polite email: grateful + one concrete ask (salary or signing bonus). Rescinds are rare for reasonable requests.",
        score: 198,
        daysAgo: 8,
      },
      {
        authorUsername: "startup_cto",
        body: "From hiring side: we expect negotiation. 5-10% bump is normal for first roles.",
        score: 87,
        daysAgo: 7,
      },
    ],
  },
  {
    communityName: "experienceddevs",
    authorUsername: "tech_lead_tired",
    title: "How do you protect deep work time as a tech lead?",
    body: "Calendar is 60% meetings. Code reviews at night. Looking for tactics that actually work with management.",
    score: 678,
    daysAgo: 2,
    comments: [
      {
        authorUsername: "senior_architect",
        body: "No-meeting Wednesday mornings. Escalations go to async doc. Manager backed it.",
        score: 145,
        daysAgo: 2,
      },
      {
        authorUsername: "remote_worker",
        body: "Block 9-12 as 'focus' on calendar. Decline unless incident. Works if you actually decline.",
        score: 89,
        daysAgo: 1,
      },
    ],
  },
  {
    communityName: "experienceddevs",
    authorUsername: "startup_cto",
    title: "When to hire senior vs grow mid-level engineers?",
    body: "Seed stage, 8 engineers. Need someone to own infra but also want to develop existing team.",
    score: 234,
    daysAgo: 20,
  },
  {
    communityName: "sideproject",
    authorUsername: "side_project_king",
    title: "Launched my habit tracker — 47 signups on day one",
    body: "Posted on Show HN and two Discords. Next.js + Supabase. No revenue yet but real users! Link in comments if allowed.",
    score: 312,
    daysAgo: 1,
    comments: [
      {
        authorUsername: "open_source_hero",
        body: "Congrats! Day one retention metrics matter more than signup count. Did you set up analytics?",
        score: 45,
        daysAgo: 1,
      },
    ],
  },
  {
    communityName: "sideproject",
    authorUsername: "ai_hype_realist",
    title: "Built a CLI that summarizes git diffs — actually useful?",
    body: "Local model, no API keys. Fast on small repos. Slow on monorepos. Wondering if I should open source or abandon.",
    score: 167,
    daysAgo: 18,
  },
  {
    communityName: "typescript",
    authorUsername: "api_design_guru",
    title: "Zod vs Valibot for API validation",
    body: "Valibot tree-shaking is impressive. Zod ecosystem is massive. Picking for new NestJS project.",
    score: 89,
    daysAgo: 22,
  },
  {
    communityName: "webdev",
    authorUsername: "data_driven_dev",
    title: "Accessible data tables — what library do you trust?",
    body: "Need sorting, pagination, keyboard nav, screen reader labels. TanStack Table + custom a11y or something off-the-shelf?",
    score: 203,
    daysAgo: 13,
  },
  {
    communityName: "reactjs",
    authorUsername: "rust_curiosity",
    title: "Moved hot path to WASM — bundle size regret",
    body: "Image processing in Rust/WASM. 10x faster but +400kb gzip. Tradeoff worth it for our use case?",
    score: 134,
    daysAgo: 25,
  },
  {
    communityName: "programming",
    authorUsername: "data_driven_dev",
    title: "SQL window functions clicked for me after this example",
    body: "Running totals per user without self-joins. Sharing the query that finally made PARTITION BY make sense.",
    score: 567,
    daysAgo: 16,
  },
  {
    communityName: "node",
    authorUsername: "graphql_skeptic",
    title: "Rate limiting strategies for public REST APIs",
    body: "Token bucket at edge vs in-app middleware? Redis sliding window costs?",
    score: 178,
    daysAgo: 21,
  },
  {
    communityName: "learnprogramming",
    authorUsername: "career_coach_jen",
    title: "Free resources that are actually good in 2025",
    body: "Pinned thread: add your favorites for HTML/CSS/JS, CS fundamentals, and first portfolio projects.",
    score: 892,
    daysAgo: 30,
    comments: [
      {
        authorUsername: "junior_dev_2024",
        body: "The Odin Project + MDN + one project you care about beats any paid course.",
        score: 123,
        daysAgo: 29,
      },
    ],
  },
];

function daysAgoDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));
  return d;
}

function avatarUrl(username: string): string {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

async function clearDatabase() {
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.communityRule.deleteMany();
  await prisma.communityMember.deleteMany();
  await prisma.community.deleteMany();
  await prisma.magicLinkToken.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers(passwordHash: string) {
  const map = new Map<string, string>();

  for (const u of USERS) {
    const user = await prisma.user.create({
      data: {
        username: u.username,
        email: u.email,
        displayName: u.displayName,
        bio: u.bio,
        avatarUrl: avatarUrl(u.username),
        passwordHash,
      },
    });
    map.set(u.username, user.id);
  }

  return map;
}

async function seedCommunities(userIds: Map<string, string>) {
  const map = new Map<string, string>();

  for (const c of COMMUNITIES) {
    const creatorId = userIds.get(c.creatorUsername)!;
    const rules = c.rules ?? DEFAULT_RULES;

    const community = await prisma.community.create({
      data: {
        name: c.name.toLowerCase(),
        title: c.title,
        description: c.description,
        creatorId,
        rules: {
          create: rules.map((r) => ({
            position: r.position,
            title: r.title,
            description: r.description,
          })),
        },
      },
    });

    map.set(c.name, community.id);

    const memberIds = new Set<string>([creatorId]);
    if (c.extraMods) {
      for (const modUsername of c.extraMods) {
        memberIds.add(userIds.get(modUsername)!);
      }
    }

    // Random extra members (40–70% of users join each community)
    const pool = USERS.filter((u) => !memberIds.has(userIds.get(u.username)!));
    const joinCount = Math.floor(pool.length * (0.4 + Math.random() * 0.3));
    for (let i = 0; i < joinCount; i++) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      memberIds.add(userIds.get(pick.username)!);
    }

    for (const userId of memberIds) {
      const isCreator = userId === creatorId;
      const isExtraMod =
        c.extraMods?.some((name) => userIds.get(name) === userId) ?? false;
      const role =
        isCreator || isExtraMod ? MemberRole.MODERATOR : MemberRole.MEMBER;

      await prisma.communityMember.create({
        data: {
          userId,
          communityId: community.id,
          role,
          joinedAt: daysAgoDate(30 + Math.floor(Math.random() * 180)),
        },
      });
    }
  }

  return map;
}

async function seedComments(
  postId: string,
  comments: CommentSeed[],
  userIds: Map<string, string>,
  parentId?: string,
) {
  for (const c of comments) {
    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: userIds.get(c.authorUsername)!,
        body: c.body,
        score: c.score,
        parentId,
        createdAt: daysAgoDate(c.daysAgo),
      },
    });

    if (c.replies?.length) {
      await seedComments(postId, c.replies, userIds, comment.id);
    }
  }
}

async function seedPosts(
  communityIds: Map<string, string>,
  userIds: Map<string, string>,
) {
  for (const p of POSTS) {
    const post = await prisma.post.create({
      data: {
        title: p.title,
        body: p.body,
        score: p.score,
        communityId: communityIds.get(p.communityName)!,
        authorId: userIds.get(p.authorUsername)!,
        createdAt: daysAgoDate(p.daysAgo),
        updatedAt: daysAgoDate(p.daysAgo),
      },
    });

    if (p.comments?.length) {
      await seedComments(post.id, p.comments, userIds);
    }
  }

  // Extra filler posts for volume
  const fillerTitles = [
    "Weekly discussion thread",
    "What are you working on?",
    "Tooling Tuesday",
    "Rant: production bug on Friday",
    "TIL something small but useful",
    "Ask anything — no judgment",
    "Show off your setup",
    "Unpopular opinion thread",
    "Help me choose between two options",
    "Documentation appreciation post",
  ];

  const communityNames = COMMUNITIES.map((c) => c.name);
  const userPool = USERS.map((u) => u.username);

  for (let i = 0; i < 35; i++) {
    const communityName =
      communityNames[Math.floor(Math.random() * communityNames.length)];
    const authorUsername =
      userPool[Math.floor(Math.random() * userPool.length)];
    const title =
      fillerTitles[Math.floor(Math.random() * fillerTitles.length)] +
      ` #${i + 1}`;
    const days = 1 + Math.floor(Math.random() * 60);

    const post = await prisma.post.create({
      data: {
        title,
        body: `Discussion thread for r/${communityName}. Share links, questions, and wins from this week.`,
        score: Math.floor(Math.random() * 400) + 5,
        communityId: communityIds.get(communityName)!,
        authorId: userIds.get(authorUsername)!,
        createdAt: daysAgoDate(days),
        updatedAt: daysAgoDate(days),
      },
    });

    const commentCount = Math.floor(Math.random() * 4);
    for (let j = 0; j < commentCount; j++) {
      const commentAuthor =
        userPool[Math.floor(Math.random() * userPool.length)];
      await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: userIds.get(commentAuthor)!,
          body: "Thanks for posting — this is exactly what I needed today.",
          score: Math.floor(Math.random() * 50) + 1,
          createdAt: daysAgoDate(days),
        },
      });
    }
  }
}

async function main() {
  console.log("Clearing existing data…");
  await clearDatabase();

  console.log("Hashing password…");
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  console.log(`Creating ${USERS.length} users…`);
  const userIds = await seedUsers(passwordHash);

  console.log(`Creating ${COMMUNITIES.length} communities…`);
  const communityIds = await seedCommunities(userIds);

  console.log("Creating posts and comments…");
  await seedPosts(communityIds, userIds);

  const counts = {
    users: await prisma.user.count(),
    communities: await prisma.community.count(),
    posts: await prisma.post.count(),
    comments: await prisma.comment.count(),
    members: await prisma.communityMember.count(),
  };

  console.log("\nSeed complete!");
  console.log(counts);
  console.log("\nLogin with any seeded user:");
  console.log(`  email: demo@example.test (or any *@example.test)`);
  console.log(`  password: ${SEED_PASSWORD}`);
  console.log("\nFeatured post: r/typescript → Monorepo architecture shared types");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
