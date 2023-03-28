# monoswap

A single SDK that wraps the uniswap SDK V2 (Mainnet, 1Hive HoneySwap and Pancakeswap), the uniswap SDK V3 (Polygon, Optimism) and Celo Exchange (Celo mainnet and alfajores).

## Options
Set the following environment variables to configure the SDK.

| Key                           | Required | Description                                                                        |
|-------------------------------|----------|------------------------------------------------------------------------------------|
| INFURA_API_KEY                | true     | Infura API key, enable polygon mainnet if POLYGON_MAINNET_NODE_HTTP_URL is not set |
| XDAI_NODE_HTTP_URL            | true     | Gnosi Chain node url                                                               |
| POLYGON_MAINNET_NODE_HTTP_URL | false    | Polygon mainnet node url                                                           |
| OPTIMISM_NODE_HTTP_URL        | false    | Optimism node url                                                                  |
| CELO_MAINNET_NODE_HTTP_URL    | false    | Celo mainnet node url. Default: https://forno.celo.org                             |
| CELO_ALFAJORES_NODE_HTTP_URL  | false    | Celo Alfajores node url. Default: https://alfajores-forno.celo-testnet.org         |

