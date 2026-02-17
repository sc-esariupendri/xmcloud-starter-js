type Environment = 'production' | 'staging';

interface EnvironmentConfig {
  domain: string;
  clientId: string;
  audience: string;
  systemId: string;
  apiReferer: string;
}

const ENV_CONFIG: Record<Environment, EnvironmentConfig> = {
  staging: {
    domain: "https://auth-staging-1.sitecore-staging.cloud",
    clientId: "j8R7qCKxYJnIJYVlRpynUKxdhhkeUNNT",
    audience: "https://api-staging.sitecore-staging.cloud",
    systemId: "8db0ad22-445f-43fb-8d8e-f23c9396c974",
    apiReferer: "https://searchconfig-staging.sitecore-staging.cloud/",
  },
  production: {
    domain: "https://auth.sitecorecloud.io",
    clientId: "fNgQatuiFS87Luw7BhkfKIzNOqHFU6UN",
    audience: "https://api-webapp.sitecorecloud.io",
    systemId: "5907637C-CDDF-48E9-ACEF-BD06F1A6BAB8",
    apiReferer: "https://searchconfig.sitecorecloud.io/",
  }
};

export function detectEnvironment(): Environment {
  const referrer = document.referrer.toLowerCase();
  
  if (referrer.includes('sitecore-staging.cloud')) {
    return 'staging';
  }
  
  return 'production';
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = detectEnvironment();
  return ENV_CONFIG[env];
}

