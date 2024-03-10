# EATON UPS MQTT Agent

An open-source MQTT based agent software for EATON UPS.
Free your EATON UPS protected clients from proprietary software.
Shutdown clients gracefully on power outage before UPS power off.
An open alternative to the [Eaton Intelligent Power Protector (IPP)](https://www.eaton.com/in/en-us/catalog/backup-power-ups-surge-it-power-distribution/eaton-intelligent-power-protector.html).

Successfully tested on:

- [EATON Network-M2 Gigabit Network Management Card](https://www.eaton.com/us/en-us/catalog/backup-power-ups-surge-it-power-distribution/eaton-gigabit-network-card---na/network-m2.html)
    - [EATON Network-M2 UPS Network Management Card Datasheet](https://www.eaton.com/content/dam/eaton/products/backup-power-ups-surge-it-power-distribution/power-management-software-connectivity/eaton-gigabit-network-card/eaton-network-m2-user-guide.pdf)

## Download

Download the latest release [here](https://github.com/aximut/eaton-ups-mqtt-agent/releases/latest). No installation is required.

Supported operating systems:
- Windows
- Linux
- MacOS

## Usage

Show help using:

```
eaton-ups-mqtt-agent -h
```

Supported options:

```
General options

  -h, --help            Show this help message and exit.
  -v, --version         Show product version and exit.
  -f, --file file ...   Load one or multiple config file(s).
                        Config files must be in JSON format and can contain all
                        command line arguments as parameters. If both, files
                        and command line arguments are given, the command line
                        arguments take precedence over the file parameters. If
                        multiple files are specified, the last files take
                        precedence over the first files. This allows to define
                        a base config and override individual parameters.
  -o, --show            Show the resulting config in JSON format and exit.

Network options

  These options define the details of the network connection with the UPS.

  -i, --ip string     IP address or DNS name of the UPS.
  -p, --port number   Port of the UPS MQTT broker. By default 8883.

TLS options

  These options define the details of the TLS authentication with the UPS.

  -c, --cert string       Client TLS certificate for MQTT.
  -k, --key string        Client TLS key for MQTT.
  -g, --generate          Generate a new client TLS certificate for MQTT.
  -e, --validity number   Validity of the certificate to be generated in years.
  -d, --id string         Client id presented to the UPS and common name of the
                          generated TLS certificate.

Protection options

  These options define the protection of the agent.

  -n, --outlet string             Outlet name on the UPS to which the agent
                                  server is connected. Omit to get a list of
                                  available outlet names.
  -t, --shutdownDuration number   Shutdown duration of the agent server. Omit
                                  to shutdown immediately on alarm.
```

### Systemd service

On Linux, the node can be installed as a systemd service, for example using the following configuration:
```
[Unit]
Description=EATON UPS MQTT Agent
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
ExecStart=/path/to/eaton-ups-mqtt-agent <...>
Restart=always

[Install]
WantedBy=multi-user.target
```

## Disclaimer

This project is not affiliated in any way with Eaton.
"Eaton", EATON (LOGO) and/or other Eaton names or products referenced herein are trade names of EATON CORPORATION.
