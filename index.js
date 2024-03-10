const product = {
    name: 'EATON UPS MQTT Agent',
    description: 'An MQTT based agent for your EATON UPS.\nShutdown clients gracefully on power outage before UPS power off.',
    //descriptionFancy: 'The {italic all-in-one} {bold open-source solution} to free your EATON UPS protected clients from proprietary software.',
    url: 'https://github.com/aximut/eaton-ups-mqtt-agent',
}

async function main(config) {
    let outletId = undefined
    /*const powerGroup = "SOME_UID"
    const topicSuppliers = "mbdetnrs/1.0/protectionService/suppliers"
    const topicSupplierStatus = `mbdetnrs/1.0/protectionService/suppliers/${powerGroup}/status`*/
    const topicPowerServiceIdentification = "mbdetnrs/1.0/powerService/suppliers/+/identification"
    const topicPowerServiceSchedule = (id) => `mbdetnrs/1.0/powerService/suppliers/${id}/schedule`

    if (process.pkg) {
        console.debug = () => {}
    }

    const fs = require("fs");
    const forge = require('node-forge');

    if (config.tls.generate) {
        const keyPair = forge.pki.rsa.generateKeyPair({ bits: 4096 });

        const cert = forge.pki.createCertificate();
        cert.publicKey = keyPair.publicKey;
        cert.validity.notBefore = new Date();
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + (config.tls.validity || 15));

        const attrs = [
            { name: 'commonName', value: config.tls.id },
        ];
        cert.setSubject(attrs);
        cert.setIssuer(attrs);
        cert.sign(keyPair.privateKey);

        fs.writeFileSync(config.tls.cert, forge.pki.certificateToPem(cert))
        fs.writeFileSync(config.tls.key, forge.pki.privateKeyToPem(keyPair.privateKey))
        process.exit(0)
    }

    const isSuper = require("is-super");
    if (!isSuper()) {
        console.error("This program requires admin/sudo privileges.");
        if (process.pkg) {
            process.exit(1);
        }
    }
    const mqtt = require("mqtt");
    const cert = fs.readFileSync(config.tls.cert);
    const key = fs.readFileSync(config.tls.key);
    const clientId = config.tls.id || forge.pki.certificateFromPem(cert).subject.getField('CN').value;
    console.log(`Authenticating to UPS as "${clientId}".`)
    const client = mqtt.connect(`mqtt://${config.network.ip}:${config.network.port || 8883}`, {clientId, rejectUnauthorized: false, connectTimeout: 5000, reconnectPeriod: 1000, cert, key});
    const Shutdown = require("system-shutdown").Shutdown;
    const shutdown = new Shutdown();

    client.subscribe([topicPowerServiceIdentification /*topicSuppliers, topicSupplierStatus*/], () => {
        console.log('Subscribed to outlet identification topic.')
    })

    client.on('error', (error) => {
        console.error('Connection failed.', error)
    })

    client.on('reconnect', () => {
        console.error('Reconnecting...')
    })

    client.on('connect', () => {
        console.log('Connected to UPS.')
    })

    client.on('message', (topic, data) => {
        console.debug('Received Message:', topic, data.toString());
        const msg = JSON.parse(data);

        /*if (topic === topicSuppliers) {
            console.log('The following power groups exist:')
            for (member of msg.members) {
                console.log(member['@id'].replace(`${topicSuppliers}/`, ''));
            }
        }
        if (topic === topicSupplierStatus) {
            console.log(msg.state);
        }*/
        if (topic.includes("mbdetnrs/1.0/powerService/suppliers/")) {
            if (topic.includes("/identification")) {
                console.log(`Outlet name "${msg.physicalName}" was detected.`);
                if (msg.physicalName === config.protection.outlet && outletId === undefined) {
                    outletId = topic.replace("mbdetnrs/1.0/powerService/suppliers/", "").replace("/identification", "")
                    console.log(`Outlet name "${config.protection.outlet}" corresponds to outlet id "${outletId}", starting agent protection...`)
                    client.subscribe([topicPowerServiceSchedule(outletId)], () => {
                        console.log(`Subscribed to schedule topic for outlet id "${outletId}".`)
                    })
                }
            }
            if (topic.includes("/schedule")) {
                console.log(`Delay before power off: ${msg.delayBeforePowerDown}.`);
                if (msg.delayBeforePowerDown >= 0 && (!config.protection.shutdownDuration || config.protection.shutdownDuration < 0 || msg.delayBeforePowerDown <= config.protection.shutdownDuration)) {
                    if (process.pkg) {
                        console.warn("Shutting down NOW!");
                        shutdown.initShutdown();
                    } else {
                        console.warn("Shutdown trigger NOW!");
                    }
                }
            }
        }
    })
}

exports.default = main;
exports.product = product;
