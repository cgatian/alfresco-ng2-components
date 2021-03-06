import { PluginTarget } from './plugins/plugin-model';
import { CheckEnv } from './plugins/check-env';
import program = require('commander');
import { ProcessServiceCheckPlugin } from './plugins/process-service-check-plugin';
import { ProcessAutomationCheckPlugin } from './plugins/process-automation-check-plugin';

let pluginEnv;

export default async function main(_args: string[]) {
    program
        .version('0.1.0')
        .option('--host [type]', 'Remote environment host')
        .option('--pluginName [type]', 'pluginName ')
        .option('--appName [type]', 'appName ')
        .option('-p, --password [type]', 'password ')
        .option('-u, --username [type]', 'username ')
        .option('--ui, --uiName [type]', 'uiName')
        .parse(process.argv);

    pluginEnv = new CheckEnv(program.host, program.username, program.password);
    await pluginEnv.checkEnv();

    if (program.pluginName === PluginTarget.processService) {
        await checkProcessServicesPlugin();
    }

    if (program.pluginName === PluginTarget.processAutomation) {
        await checkProcessAutomationPlugin();
    }
}

async function checkProcessServicesPlugin() {
    const processServiceCheckPlugin = new ProcessServiceCheckPlugin(
        {
            host: program.host,
            name: PluginTarget.processService,
            appName: null,
            uiName: null
        },
        pluginEnv.alfrescoJsApi
    );
    await processServiceCheckPlugin.checkProcessServicesPlugin();
}

async function checkProcessAutomationPlugin() {
    const processAutomationCheckPlugin = new ProcessAutomationCheckPlugin(
        {
            host: program.host,
            name: PluginTarget.processAutomation,
            appName: program.appName,
            uiName: program.uiName
        },
        pluginEnv.alfrescoJsApi
    );
    await processAutomationCheckPlugin.checkProcessAutomationPlugin();
}
