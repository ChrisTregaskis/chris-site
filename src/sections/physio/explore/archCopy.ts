import { type ArchPlace } from "./archDraft";

/*
 * The how-it-runs layer's copy (draft, pending Chris's language pass). The
 * design principles only: never versions, stage names, network rules or
 * ranges, regions, role, secret or variable names, how credentials reach the
 * code, function counts or known gaps. The four lines are the same in every
 * drawing, so the drawings can be compared on their own.
 */
export type PrincipleId = "out" | "keys" | "role" | "admin";

export interface Principle {
  id: PrincipleId;
  title: string;
  text: string;
}

const PRINCIPLES: Record<PrincipleId, Principle> = {
  out: {
    id: "out",
    title: "No way out",
    text: "The functions run in a private network with no NAT, so nothing in it can reach the internet. Sign-in and video storage are reached through private endpoints.",
  },
  keys: {
    id: "keys",
    title: "Only the keys it needs",
    text: "Each function holds just the secrets its job needs. The video functions carry the key that signs video links; the health check carries none.",
  },
  role: {
    id: "role",
    title: "An app that owns nothing",
    text: "The app connects to Postgres as a role that owns no tables. An owner can skip row-level security; this role can't, so the policy binds every query it makes.",
  },
  admin: {
    id: "admin",
    title: "Admins look, never touch",
    text: "Admins get a read-only login, through a private host that opens only under IAM. They can read the data, and can't change any of it.",
  },
};

export interface ArchCopy {
  eyebrow: string;
  title: string;
  intro: string;
  principles: readonly Principle[];
}

/**
 * Before the steps, the layer ends on the role that owns nothing, which the
 * steps then put to work. After the leak test, it opens with it: the reason
 * the empty result holds.
 */
export const ARCH_COPY: Record<ArchPlace, ArchCopy> = {
  before: {
    eyebrow: "How it runs",
    title: "Shut in on purpose",
    intro:
      "Row-level security is the last wall a request meets, not the only one. Before a single query runs, the platform is closed in.",
    principles: [
      PRINCIPLES.out,
      PRINCIPLES.keys,
      PRINCIPLES.admin,
      PRINCIPLES.role,
    ],
  },
  after: {
    eyebrow: "Why it holds",
    title: "Not the only wall",
    intro:
      "The policy only binds a role that can't step round it, and it's the last of several walls. Around it, the platform is closed in on purpose.",
    principles: [
      PRINCIPLES.role,
      PRINCIPLES.out,
      PRINCIPLES.keys,
      PRINCIPLES.admin,
    ],
  },
};
