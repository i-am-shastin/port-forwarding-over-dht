# Installation

```bash
git clone https://github.com/i-am-shastin/port-forwarding-over-dht.git
cd port-forwarding-over-dht
npm install
```

# Usage

The application can run in either **Server** or **Client** mode. A shared secret phrase is required for them to connect. Gateways (port forwarding rules) are configured on the server and used by the client.

### Getting Help

To see all available command-line options:
```bash
npm run help
```

### Running Modes

#### 1. Interactive Mode:

If you run the application without any arguments, it will guide you through the configuration process interactively.

```bash
npm start
```

#### 2. Command-Line Mode:

You can provide configuration via command-line arguments.

```bash
npm start -- --server --easy --gateways=tcp:3000 --output=config.json MY_SECRET_PHRASE
```

*   **Secret:**
    *   Provide a secret phrase directly via argument.
    *   Use a randomly generated secret: `-r` or `--random` flag (the secret will be printed to stdout).
*   **Mode:**
    *   Server mode: `-s` or `--server` flag.
    *   Client mode: (default, no flag needed).
*   **Gateways (Port Forwarding Rules):**
    *   Specify gateways directly: `-g <[ip-]protocol:port,...>` or `--gateways ...`
        *   Examples: `-g tcp:8080,udp:53` or `-g 192.168.1.10-tcp:3000`
    *   Use a configuration file: `-c <filename>` or `--config <filename>` (see Configuration File section).
*   **Easy Mode:**
    *   Simplifies gateway configuration exchange: `-e` or `--easy`. When the server runs in easy mode, the client doesn't need gateway configuration; it will receive it automatically upon connection.
*   **Output Configuration:**
    *   Save the final configuration (including generated secret if `-r` is used) to a file: `-o <filename>` or `--output <filename>`. This is useful for easily configuring the client later.
*   **Debug Mode:**
    *   Enable verbose logging: `-d` or `--debug`.

### Configuration File

You can use a JSON file to specify configuration options (`-c <filename>`).

Example `config.json`:

```json
{
  "secret": "my-optional-secret-phrase",
  "gateways": [
    { "protocol": "tcp", "port": 8080 },
    { "protocol": "udp", "port": 5300, "host": "192.168.1.5" }
  ],
  "server": false,
  "easy": false
}
```

*   `secret`: The shared secret phrase (optional if provided via CLI argument or `-r`).
*   `gateways`: An array of gateway objects.
    *   `protocol`: `"tcp"` or `"udp"`.
    *   `port`: The port number.
    *   `host`: (Optional) The specific IP address to bind to (server) or forward to (client). Defaults to `127.0.0.1`.
*   `server`: `true` for server mode, `false` or omitted for client mode.
*   `easy`: `true` to enable easy mode (server only), `false` or omitted otherwise.

CLI options generally override configuration file settings, except for gateways, which are merged (CLI gateways are added to file gateways). The secret from the CLI takes precedence.
