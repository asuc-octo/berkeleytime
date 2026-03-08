/**
 * Cloudflare Zero Trust Access Groups integration for staff backup access.
 * Syncs Berkeleytime staff emails to a Cloudflare Access group that gates
 * access to private R2 backups (backups.berkeleytime.com/private/*).
 */

const CLOUDFLARE_ACCESS_GROUPS_BASE =
  "https://api.cloudflare.com/client/v4/accounts";

function getConfig(): {
  accountId: string;
  apiToken: string;
  groupId: string;
} | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_ACCESS_API_TOKEN;
  const groupId = process.env.CLOUDFLARE_STAFF_GROUP_ID;
  if (!accountId || !apiToken || !groupId) {
    return null;
  }
  return { accountId, apiToken, groupId };
}

/** Cloudflare API group result shape (subset we use). */
interface CloudflareAccessGroupRule {
  email?: string | string[] | { email?: string | string[] };
  [key: string]: unknown;
}

interface CloudflareAccessGroup {
  id: string;
  name: string;
  include: CloudflareAccessGroupRule[];
  exclude: CloudflareAccessGroupRule[];
  require: CloudflareAccessGroupRule[];
  is_default?: boolean;
}

interface CloudflareGroupResponse {
  success: boolean;
  result: CloudflareAccessGroup | null;
  errors?: Array<{ message: string }>;
}

/** Extract all email strings from a single include/exclude rule. */
function emailsFromRule(rule: CloudflareAccessGroupRule): string[] {
  const raw = rule.email;
  if (raw == null) return [];
  if (typeof raw === "string") return [raw];
  if (Array.isArray(raw)) return raw.filter((e): e is string => typeof e === "string");
  if (typeof raw === "object" && raw !== null && "email" in raw) {
    const inner = (raw as { email?: string | string[] }).email;
    if (typeof inner === "string") return [inner];
    if (Array.isArray(inner)) return inner.filter((e): e is string => typeof e === "string");
  }
  return [];
}

/** Extract all emails currently in the group's include rules. */
function parseEmailsFromInclude(include: CloudflareAccessGroupRule[]): string[] {
  const emails: string[] = [];
  for (const rule of include) {
    emails.push(...emailsFromRule(rule));
  }
  return emails;
}

/**
 * Return a copy of the rule with the given email removed. Preserves multi-email
 * rule shape so other emails in the same rule are not affected. Returns null
 * if the rule would have no emails left (caller should drop the rule).
 */
function ruleWithoutEmail(
  rule: CloudflareAccessGroupRule,
  emailToRemoveLower: string
): CloudflareAccessGroupRule | null {
  const raw = rule.email;
  if (raw == null) return rule;

  if (typeof raw === "string") {
    if (raw.toLowerCase() === emailToRemoveLower) return null;
    return rule;
  }

  if (Array.isArray(raw)) {
    const filtered = raw.filter(
      (e) => typeof e === "string" && e.toLowerCase() !== emailToRemoveLower
    );
    if (filtered.length === 0) return null;
    if (filtered.length === raw.length) return rule;
    return { ...rule, email: filtered };
  }

  if (typeof raw === "object" && raw !== null && "email" in raw) {
    const inner = (raw as { email?: string | string[] }).email;
    if (inner == null) return rule;
    if (typeof inner === "string") {
      if (inner.toLowerCase() === emailToRemoveLower) return null;
      return rule;
    }
    if (Array.isArray(inner)) {
      const filtered = inner.filter(
        (e) => typeof e === "string" && e.toLowerCase() !== emailToRemoveLower
      );
      if (filtered.length === 0) return null;
      if (filtered.length === inner.length) return rule;
      return { ...rule, email: { ...raw, email: filtered } };
    }
  }

  return rule;
}

/** Build a single include rule for one email (Cloudflare API shape). */
function ruleForEmail(email: string): CloudflareAccessGroupRule {
  return { email: { email } };
}

async function fetchGroup(
  accountId: string,
  groupId: string,
  apiToken: string
): Promise<CloudflareAccessGroup> {
  const url = `${CLOUDFLARE_ACCESS_GROUPS_BASE}/${accountId}/access/groups/${groupId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Cloudflare Access Groups API error: ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`
    );
  }

  const data = (await response.json()) as CloudflareGroupResponse;
  if (!data.success || !data.result) {
    const msg =
      data.errors?.[0]?.message ?? "Unknown error from Cloudflare Access Groups";
    throw new Error(`Cloudflare Access Groups: ${msg}`);
  }

  return data.result;
}

async function updateGroup(
  accountId: string,
  groupId: string,
  apiToken: string,
  body: {
    name: string;
    include: CloudflareAccessGroupRule[];
    exclude: CloudflareAccessGroupRule[];
    require: CloudflareAccessGroupRule[];
    is_default?: boolean;
  }
): Promise<void> {
  const url = `${CLOUDFLARE_ACCESS_GROUPS_BASE}/${accountId}/access/groups/${groupId}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Cloudflare Access Groups API error: ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`
    );
  }

  const data = (await response.json()) as CloudflareGroupResponse;
  if (!data.success) {
    const msg =
      data.errors?.[0]?.message ?? "Unknown error from Cloudflare Access Groups";
    throw new Error(`Cloudflare Access Groups: ${msg}`);
  }
}

/** Add one email to the staff Access group. */
export async function addEmailToStaffGroup(email: string): Promise<void> {
  const config = getConfig();
  if (!config) return;

  const normalizedEmail = email?.trim();
  if (!normalizedEmail) return;

  const group = await fetchGroup(
    config.accountId,
    config.groupId,
    config.apiToken
  );
  const existing = parseEmailsFromInclude(group.include);
  const normalizedExisting = existing.map((e) => e.toLowerCase());
  if (normalizedExisting.includes(normalizedEmail.toLowerCase())) return;

  const newInclude = [...group.include, ruleForEmail(normalizedEmail)];

  await updateGroup(config.accountId, config.groupId, config.apiToken, {
    name: group.name,
    include: newInclude,
    exclude: group.exclude ?? [],
    require: group.require ?? [],
    is_default: group.is_default,
  });
}

/** Remove one email from the staff Access group. */
export async function removeEmailFromStaffGroup(email: string): Promise<void> {
  const config = getConfig();
  if (!config) return;

  const normalizedEmail = email?.trim();
  if (!normalizedEmail) return;

  const group = await fetchGroup(
    config.accountId,
    config.groupId,
    config.apiToken
  );
  const existing = parseEmailsFromInclude(group.include);
  const toRemoveLower = normalizedEmail.toLowerCase();
  if (!existing.some((e) => e.toLowerCase() === toRemoveLower)) return;

  const newInclude: CloudflareAccessGroupRule[] = [];
  for (const rule of group.include) {
    const updated = ruleWithoutEmail(rule, toRemoveLower);
    if (updated !== null) newInclude.push(updated);
  }

  await updateGroup(config.accountId, config.groupId, config.apiToken, {
    name: group.name,
    include: newInclude,
    exclude: group.exclude ?? [],
    require: group.require ?? [],
    is_default: group.is_default,
  });
}

export interface AddMissingStaffEmailsResult {
  added: string[];
}

/** Add any emails from the list that are not already in the group. */
export async function addMissingStaffEmails(
  emails: string[]
): Promise<AddMissingStaffEmailsResult> {
  const config = getConfig();
  if (!config) return { added: [] };

  const toAdd = emails
    .map((e) => e?.trim())
    .filter((e): e is string => Boolean(e));
  if (toAdd.length === 0) return { added: [] };

  const group = await fetchGroup(
    config.accountId,
    config.groupId,
    config.apiToken
  );
  const existing = parseEmailsFromInclude(group.include);
  const existingSet = new Set(existing.map((e) => e.toLowerCase()));
  const added: string[] = [];
  const newInclude = [...group.include];

  for (const email of toAdd) {
    if (existingSet.has(email.toLowerCase())) continue;
    newInclude.push(ruleForEmail(email));
    added.push(email);
    existingSet.add(email.toLowerCase());
  }

  if (added.length === 0) return { added: [] };

  await updateGroup(config.accountId, config.groupId, config.apiToken, {
    name: group.name,
    include: newInclude,
    exclude: group.exclude ?? [],
    require: group.require ?? [],
    is_default: group.is_default,
  });

  return { added };
}
