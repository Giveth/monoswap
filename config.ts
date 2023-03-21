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
  //SOCKET_PORT: string
  [key: string]: { value: string | undefined; required: boolean };
}

class Config {
  env: EnvVar;

  constructor(envFile: { [key: string]: string | undefined }) {
    this.validateAndFillEnv(envFile);
  }

  //Have this - replace it!
  validateAndFillEnv(envFile: { [key: string]: string | undefined }) {
    const env = {};
    envVarConfis.forEach((envVar: EnvVarConfig) => {
      const { key, required } = envVar;
      if (envFile[key]) {
        env[key] = { value: envFile[key], required: required };
        // console.log(`envVar ---> : ${this[envVar]}`)
      } else {
        if (required)
          throw new Error(`Need to provide a ${envVar.key} in the .env`);
        env[key] = { key: undefined, required: false };
      }
    });
    this.env = env;
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
