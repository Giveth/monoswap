import * as dotenv from 'dotenv';

dotenv.config();

interface EnvVarConfig {
  key: string;
  required?: boolean;
}
const envVarConfis: EnvVarConfig[] = [
  { key: 'INFURA_API_KEY', required: true },
  { key: 'XDAI_NODE_HTTP_URL', required: true },
  { key: 'POLYGON_MAINNET_NODE_HTTP_URL', required: false },
  { key: 'OPTIMISM_NODE_HTTP_URL', required: false },
];

interface EnvVar {
  value?: string;
  required: boolean;
}

interface EnvVars {
  //SOCKET_PORT: string
  [key: string]: EnvVar;
}

class Config {
  env: EnvVars;

  constructor(envFile: { [key: string]: string | undefined }) {
    this.validateAndFillEnv(envFile);
  }

  //Have this - replace it!
  validateAndFillEnv(envFile: { [key: string]: string | undefined }) {
    this.env = {};
    envVarConfis.forEach((envVar: EnvVarConfig) => {
      const { key, required } = envVar;
      if (envFile[key]) {
        this.env[key] = { value: envFile[key], required: required };
        // console.log(`envVar ---> : ${this[envVar]}`)
      } else {
        if (required)
          throw new Error(`Need to provide a ${envVar.key} in the .env`);
        this.env[key] = { value: undefined, required: false };
      }
    });
  }

  get(envVar: string): string | number | undefined {
    if (!this.env[envVar]) {
      throw new Error(`${envVar} is an invalid env variable`);
    }
    return this.env[envVar].value;
  }
}

const config = new Config(process.env);

export default config;
