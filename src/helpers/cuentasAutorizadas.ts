export interface Account {
  user: string;
  password: string;
}

const getAccountsFromEnv = (): Record<string, Account> => {
  return {
    "RR-Advisor": {
      user: import.meta.env.VITE_RR_ADVISOR_USER || "",
      password: import.meta.env.VITE_RR_ADVISOR_PASSWORD || "",
    },
    Horizon: {
      user: import.meta.env.VITE_HORIZON_USER || "",
      password: import.meta.env.VITE_HORIZON_PASSWORD || "",
    },
    Elias: {
      user: import.meta.env.VITE_ELIAS_USER || "",
      password: import.meta.env.VITE_ELIAS_PASSWORD || "",
    },
  };
};

export const validateCredentials = (
  username: string,
  password: string
): string | null => {
  // Eliminar espacios en blanco
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  const accounts = getAccountsFromEnv();

  for (const [accountName, account] of Object.entries(accounts)) {
    if (
      account.user === trimmedUsername &&
      account.password === trimmedPassword
    ) {
      return accountName;
    }
  }

  return null;
};