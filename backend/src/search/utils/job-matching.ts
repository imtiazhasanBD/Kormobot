export interface ProfileSkillsAndRole {
  role?: string | null;
  skills?: string[];
}

const NON_TECH_PATTERNS = [
  /\b(nurse|nursing|doctor|physician|hospital|clinic|medical)\b/i,
  /\b(textile|garment|garments|woven|knit|knitting|merchandis|merchandiser|wash|washing|spinning)\b/i,
  /\b(cashier|receptionist|telecaller|tele-sales|sales officer|sales representative)\b/i,
  /\b(security guard|driver|cook|chef|peon|waiter|plumber|electrician)\b/i,
  /\b(paints|paint officer|tile officer|warehouse loader)\b/i,
];

interface SpecializedStack {
  name: string;
  pattern: RegExp;
  isUserSkilled: (skills: string[]) => boolean;
}

const SPECIALIZED_STACKS: SpecializedStack[] = [
  {
    name: 'flutter',
    pattern: /\b(flutter|dart)\b/i,
    isUserSkilled: (skills) => skills.some((s) => /\b(flutter|dart)\b/i.test(s)),
  },
  {
    name: 'android',
    pattern: /\bandroid\b/i,
    isUserSkilled: (skills) => skills.some((s) => /\b(android|kotlin)\b/i.test(s)),
  },
  {
    name: 'ios',
    pattern: /\b(ios|swift|swiftui)\b/i,
    isUserSkilled: (skills) => skills.some((s) => /\b(ios|swift|swiftui|objective-c)\b/i.test(s)),
  },
  {
    name: 'dotnet',
    pattern: /(?:^|[^\w])(\.net|c#|csharp|asp\.net|dotnet)(?:$|[^\w])/i,
    isUserSkilled: (skills) =>
      skills.some((s) => /(?:^|[^\w])(\.net|c#|csharp|asp\.net|dotnet)(?:$|[^\w])/i.test(s)),
  },
  {
    name: 'java',
    pattern: /\bjava\b(?!script)/i,
    isUserSkilled: (skills) => skills.some((s) => /\bjava\b(?!script)/i.test(s) || /\bspring\b/i.test(s)),
  },
  {
    name: 'php_cms',
    pattern: /\b(laravel|odoo|wordpress|magento|drupal)\b/i,
    isUserSkilled: (skills) =>
      skills.some((s) => /\b(laravel|odoo|wordpress|magento|drupal|php)\b/i.test(s)),
  },
  {
    name: 'pure_php',
    pattern: /\bphp\s+developer\b/i,
    isUserSkilled: (skills) => skills.some((s) => /\bphp\b/i.test(s)),
  },
];

export function extractCleanTokens(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[()[\]{},;:/\\+_-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

export function isJobCompatibleWithProfile(
  job: { title: string; description?: string | null; tags?: string[] | null },
  profile: ProfileSkillsAndRole | null,
): { compatible: boolean; reason?: string } {
  const title = job.title || '';

  // 1. Always filter non-technical roles (nurse, textile/woven, doctor, sales officer, etc.)
  for (const pattern of NON_TECH_PATTERNS) {
    if (pattern.test(title)) {
      return { compatible: false, reason: `Non-tech role pattern: ${pattern}` };
    }
  }

  const userSkills = profile?.skills || [];
  if (userSkills.length === 0) {
    // If profile has no skills listed yet, only filter non-tech roles
    return { compatible: true };
  }

  // Build searchable representation of user's core skills
  const normalizedUserSkills = new Set<string>();
  userSkills.forEach((s) => {
    const raw = s.toLowerCase().trim();
    normalizedUserSkills.add(raw);
    const cleaned = raw.replace(/\.js$/i, '').replace(/\s*\(.*\)$/i, '').trim();
    if (cleaned.length >= 2) normalizedUserSkills.add(cleaned);
  });

  const jobText = `${title} ${job.description || ''} ${(job.tags || []).join(' ')}`.toLowerCase();

  // 2. Check each specialized technology stack
  for (const stack of SPECIALIZED_STACKS) {
    if (stack.pattern.test(title)) {
      const userHasStack = stack.isUserSkilled(userSkills);
      if (!userHasStack) {
        // User does not possess this specialized stack.
        // Check if the job explicitly requires user's core web/full-stack skills in its title or tags
        // (e.g., "Full Stack Developer (React & .NET 9)" or "Node.js / Android Developer")
        let hasCoreOverlap = false;
        for (const skill of normalizedUserSkills) {
          if (skill.length < 3) continue;
          // check if user's skill is in the job title or primary tags
          const skillRegex = new RegExp(`(?:^|[\\s/(),-])${skill.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(?:$|[\\s/(),-])`, 'i');
          if (skillRegex.test(title) || (job.tags || []).some((t) => skillRegex.test(t))) {
            hasCoreOverlap = true;
            break;
          }
        }

        if (!hasCoreOverlap) {
          return {
            compatible: false,
            reason: `Job requires ${stack.name} which is absent from user skills and lacks core skill overlap`,
          };
        }
      }
    }
  }

  return { compatible: true };
}

export function computeJobMatchScore(
  job: { title: string; description?: string | null; tags?: string[] | null },
  profile: ProfileSkillsAndRole | null,
): number {
  if (!profile || !profile.skills || profile.skills.length === 0) {
    return 70;
  }

  const compatibility = isJobCompatibleWithProfile(job, profile);
  if (!compatibility.compatible) {
    return 15;
  }

  let score = 52;
  const userSkills = profile.skills;
  const title = job.title.toLowerCase();
  const jobText = `${job.title} ${job.description || ''} ${(job.tags || []).join(' ')}`.toLowerCase();

  // 1. Role / Title Match (+22 max)
  const roleKeywords = [
    'full stack',
    'fullstack',
    'frontend',
    'front-end',
    'backend',
    'back-end',
    'web developer',
    'software engineer',
    'software developer',
    'typescript developer',
    'react developer',
    'node developer',
    'javascript developer',
  ];

  if (profile.role) {
    const roleTokens = extractCleanTokens(profile.role);
    const matchedTokens = roleTokens.filter((token) => title.includes(token));
    if (matchedTokens.length > 0) {
      score += Math.min(22, matchedTokens.length * 9);
    }
  } else {
    // Inferred role bonus for standard web/software developer titles
    const isStandardRole = roleKeywords.some((rk) => title.includes(rk));
    if (isStandardRole) {
      score += 18;
    }
  }

  // 2. Skills Overlap (+26 max)
  let matchedSkillCount = 0;
  for (const skill of userSkills) {
    const clean = skill.toLowerCase().trim().replace(/\s*\(.*\)$/i, '');
    if (clean.length < 2) continue;
    const escaped = clean.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s/(),-])${escaped}(?:$|[\\s/(),-])`, 'i');
    if (regex.test(jobText)) {
      matchedSkillCount++;
    }
  }

  const skillBoost = Math.min(26, matchedSkillCount * 5);
  score += skillBoost;

  return Math.min(98, Math.max(45, score));
}

