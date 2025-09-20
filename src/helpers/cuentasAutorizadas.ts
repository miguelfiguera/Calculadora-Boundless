export interface Account {
  user: string;
  password: string;
}

export const cuentasAutorizadas: Record<string, Account> = {
  "RR-Advisor": {
    user: "r.jimenez@rradvisor.net",
    password: "VayaPalCarajo2025..",
  },
  Horizon: {
    user: "customerservice@horizonsun.net",
    password: "siosi2025..",
  },
  Elias: {
    user: "pramirez@maximoenergy.net.sr",
    password: "Maximo2025$@",
  },
};

export const validateCredentials = (
  username: string,
  password: string
): string | null => {
  // Eliminar espacios en blanco
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  for (const [accountName, account] of Object.entries(cuentasAutorizadas)) {
    if (
      account.user === trimmedUsername &&
      account.password === trimmedPassword
    ) {
      return accountName;
    }
  }

  return null;
};
