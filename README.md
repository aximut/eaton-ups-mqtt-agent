# EATON UPS MQTT Agent

An open-source MQTT based agent software for EATON UPS.
Free your EATON UPS protected clients from proprietary software.
Shutdown clients gracefully on power outage before UPS power off.

Successfully tested on:

- [EATON Network-M2 Gigabit Network Management Card](https://www.eaton.com/us/en-us/catalog/backup-power-ups-surge-it-power-distribution/eaton-gigabit-network-card---na/network-m2.html)
    - [EATON Network-M2 UPS Network Management Card Datasheet](https://www.eaton.com/content/dam/eaton/products/backup-power-ups-surge-it-power-distribution/power-management-software-connectivity/eaton-gigabit-network-card/eaton-network-m2-user-guide.pdf)

## Download

Download the latest release [here](https://github.com/aximut/eaton-ups-mqtt-agent/releases/latest). No installation is required.

## Usage

Show help using:

```
eaton-ups-mqtt-agent -h
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
