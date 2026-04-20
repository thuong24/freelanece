// Central query key registry
export const QUERY_KEYS = {
  // Auth
  me: ["me"] as const,

  // Users
  user: (id: string) => ["users", id] as const,

  // Jobs
  jobs: (filters?: object) => ["jobs", filters] as const,
  job: (id: string) => ["jobs", id] as const,

  // Bids
  jobBids: (jobId: string) => ["bids", "job", jobId] as const,
  bid: (id: string) => ["bids", id] as const,

  // Contracts
  contracts: (filters?: object) => ["contracts", filters] as const,
  contract: (id: string) => ["contracts", id] as const,

  // Timelines
  timelines: (contractId: string) => ["timelines", contractId] as const,

  // Milestones
  milestones: (contractId: string) => ["milestones", contractId] as const,

  // Chat
  messages: (contractId: string) => ["messages", contractId] as const,

  // Wallet
  wallet: ["wallet"] as const,
  transactions: (filters?: object) => ["transactions", filters] as const,

  // Notifications
  notifications: (filters?: object) => ["notifications", filters] as const,

  // Disputes
  disputes: (filters?: object) => ["disputes", filters] as const,
  dispute: (id: string) => ["disputes", id] as const,

  // Admin
  adminStats: ["admin", "stats"] as const,
  adminUsers: (filters?: object) => ["admin", "users", filters] as const,

  // Discovery
  discoveryHome: ["discovery", "home"] as const,
} as const;
