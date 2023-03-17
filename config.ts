import * as dotenv from 'dotenv';

dotenv.config();

interface EnvVar {
  key: string;
  required?: boolean;
}
const requiredEnvVars: EnvVar[] = [
  { key: 'INFURA_API_KEY', required: true },
  { key: 'XDAI_NODE_HTTP_URL', required: true },
  { key: 'POLYGON_MAINNET_NODE_HTTP_URL', required: false },
];

interface requiredEnv {
  //SOCKET_PORT: string
  [key: string]: string | undefined;
}

class Config {
  env: requiredEnv;

  constructor(envFile: requiredEnv) {
    this.env = envFile;
    this.validateEnv(envFile);
  }

  //Have this - replace it!
  validateEnv(envFile: requiredEnv) {
    requiredEnvVars.forEach((envVar: EnvVar) => {
      if (envFile[envVar.key]) {
        this.env[envVar.key] = envFile[envVar.key];
        // console.log(`envVar ---> : ${this[envVar]}`)
      } else {
        if (envVar.required)
          throw new Error(`Need to provide a ${envVar.key} in the .env`);
      }
    });
  }

  get(envVar: string): string | number | undefined {
    if (!this.env[envVar]) {
      throw new Error(`${envVar} is an invalid env variable`);
    }
    return this.env[envVar];
  }
}

const config = new Config(process.env);

export default config;
