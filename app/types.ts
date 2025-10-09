export type ClerkAPIError = {
  code?: string;
  message?: string;
  longMessage?: string;
  meta?: Record<string, unknown>;
};

export type ClerkErrorLike = {
  clerkError?: boolean;
  status?: number;
  errors?: ClerkAPIError[];
};
