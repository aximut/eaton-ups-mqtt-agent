const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const object = require('lodash/fp/object');
const fs = require('fs');
const path = require('path');

const {version, name} = require('./package.json');
const {default: main, product} = require('./index');


const optionList = [
    { name: 'help', alias: 'h', description: 'Show this help message and exit.', type: Boolean },
    { name: 'version', alias: 'v', description: 'Show product version and exit.', type: Boolean },
    { name: 'file', alias: 'f', description: 'Load one or multiple config file(s).\nConfig files must be in JSON format and can contain all command line arguments as parameters. If both, files and command line arguments are given, the command line arguments take precedence over the file parameters. If multiple files are specified, the last files take precedence over the first files. This allows to define a base config and override individual parameters.', type: String, typeLabel: '{underline file} ...', multiple: true },
    { name: 'show', alias: 'o', description: 'Show the resulting config in JSON format and exit.', type: Boolean },
    { name: 'ip', alias: 'i', description: 'IP address or DNS name of the UPS.', group: 'network', type: String },
    { name: 'port', alias: 'p', description: 'Port of the UPS MQTT broker. By default 8883.', group: 'network', type: Number },
    { name: 'cert', alias: 'c', description: 'Client TLS certificate for MQTT.', group: 'tls', type: String },
    { name: 'key', alias: 'k', description: 'Client TLS key for MQTT.', group: 'tls', type: String },
    { name: 'generate', alias: 'g', description: 'Generate a new client TLS certificate for MQTT.', group: 'tls', type: Boolean },
    { name: 'validity', alias: 'e', description: 'Validity of the certificate to be generated in years.', group: 'tls', type: Number },
    { name: 'id', alias: 'd', description: 'Client id presented to the UPS and common name of the generated TLS certificate.', group: 'tls', type: String },
    { name: 'outlet', alias: 'n', description: 'Outlet name on the UPS to which the agent server is connected. Omit to get a list of available outlet names.', group: 'protection', type: String },
    { name: 'shutdownDuration', alias: 't', description: 'Shutdown duration of the agent server. Omit to shutdown immediately on alarm.', group: 'protection', type: Number },
]
const options = commandLineArgs(optionList);

const sections = [
    {
        header: `${product.name} v${version}`,
        content: `${product.description}\nOn Linux, Mac and Windows.`,
    },
    {
        content: `Usage: "${name} [options ...]"`
    },
    {
        header: 'General options',
        optionList,
        group: '_none',
    },
    {
        header: 'Network options',
        content: `These options define the details of the network connection with the UPS.`,
    },
    {
        optionList,
        group: 'network',
    },
    {
        header: 'TLS options',
        content: `These options define the details of the TLS authentication with the UPS.`,
    },
    {
        optionList,
        group: 'tls',
    },
    {
        header: 'Protection options',
        content: `These options define the protection of the agent.`,
    },
    {
        optionList,
        group: 'protection',
    },
    {
        header: 'More information',
        content: `Project home: {underline ${product.url}}`,
    }
];

if (options._none?.help || Object.entries(options._all).length === 0) {
    const usage = commandLineUsage(sections);
    console.log(usage);
    return;
}

if (options._none?.version) {
    console.log(`v${version}`);
    return;
}

let config = {};
if (options._none?.file) {
    for (const file of options._none.file) {
        const settings = JSON.parse(fs.readFileSync(file));
        config = object.merge(config, settings);
    }
}
config = object.merge(config, options);

const show = config._none?.show;
delete config._all;
delete config._none;

if (show) {
    console.log(config);
    return;
}

main(config);
