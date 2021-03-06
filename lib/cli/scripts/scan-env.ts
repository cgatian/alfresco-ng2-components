const { AlfrescoApiCompatibility, PeopleApi, NodesApi, GroupsApi, SitesApi, SearchApi } = require('@alfresco/js-api');
const program = require('commander');

interface PeopleTally { enabled: number, disabled: number }
interface RowToPrint { label: string, value: number }

const MAX_ATTEMPTS = 10;
const TIMEOUT = 60000;
const MAX_PEOPLE_PER_PAGE = 100;
const USERS_HOME_RELATIVE_PATH = 'User Homes';

let jsApiConnection;
let loginAttempts: number = 0;

export default async function main(_args: string[]) {
    
    program
        .version('0.1.0')
        .option('--host <type>', 'Remote environment host')
        .option('-p, --password <type>', 'password ')
        .option('-u, --username <type>', 'username ')
        .parse(process.argv);

    await attemptLogin();

    const rowsToPrint: Array<RowToPrint> = [];
    const peopleCount = await getPeopleCount();
    rowsToPrint.push({ label: 'Active Users', value: peopleCount.enabled });
    rowsToPrint.push({ label: 'Deactivated Users', value: peopleCount.disabled });
    rowsToPrint.push({ label: "User's Home Folders", value: await getHomeFoldersCount() });
    rowsToPrint.push({ label: 'Groups', value: await getGroupsCount() });
    rowsToPrint.push({ label: 'Sites', value: await getSitesCount() });
    rowsToPrint.push({ label: 'Files', value: await getFilesCount() });

    console.log(generateTable(rowsToPrint));

}

function generateTable(rowsToPrint: Array<RowToPrint>) {
    const columnWidths = rowsToPrint.reduce((maxWidths, row: RowToPrint) => {
        return {
            labelColumn: Math.max(maxWidths.labelColumn, row.label.length),
            valueColumn: Math.max(maxWidths.valueColumn, row.value.toString().length)
        };
    }, { labelColumn: 12, valueColumn: 1 });
    
    const horizontalLine = ''.padEnd(columnWidths.labelColumn + columnWidths.valueColumn + 5, '═');
    const headerText = 'ENVIRONM'.padStart(Math.floor((columnWidths.labelColumn + columnWidths.valueColumn + 3) / 2), ' ')
        + 'ENT SCAN'.padEnd(Math.ceil((columnWidths.labelColumn + columnWidths.valueColumn + 3) / 2), ' ');

    const reset = '\x1b[0m', grey = '\x1b[90m', cyan = '\x1b[36m', yellow = '\x1b[93m', bright = '\x1b[1m';

    let tableString = `${grey}╒${horizontalLine}╕${reset}
${grey}│ ${bright}${cyan}${headerText} ${grey}│${reset}
${grey}╞${horizontalLine}╡${reset}`;
    rowsToPrint.forEach(row => {
        tableString += `\n${grey}│${reset} ${row.label.padEnd(columnWidths.labelColumn, ' ')}   ${yellow}${row.value.toString().padEnd(columnWidths.valueColumn, ' ')} ${grey}│${reset}`;
    });
    tableString += `\n${grey}╘${horizontalLine}╛${reset}`;

    return tableString;
}

async function attemptLogin() {
    try {
        jsApiConnection = new AlfrescoApiCompatibility({
            provider: 'ECM',
            hostEcm: program.host
        });
        await jsApiConnection.login(program.username, program.password);
    } catch (err) {
        console.log('Login error environment down or inaccessible');
        loginAttempts++;
        if (MAX_ATTEMPTS === loginAttempts) {
            console.log('Give up');
            process.exit(1);
        } else {
            console.log(`Retry in 1 minute attempt N ${loginAttempts}`);
            await wait(TIMEOUT);
            await attemptLogin();
        }
    }
}

async function getPeopleCount(skipCount: number = 0): Promise<PeopleTally> {
    try {
        const peopleApi = new PeopleApi(jsApiConnection);
        const apiResult = await peopleApi.listPeople({
            fields: ['enabled'],
            maxItems: MAX_PEOPLE_PER_PAGE,
            skipCount: skipCount
        });
        const result: PeopleTally = apiResult.list.entries.reduce((peopleTally: PeopleTally, currentPerson) => {
            if (currentPerson.entry.enabled) { peopleTally.enabled++; } else { peopleTally.disabled++; }
            return peopleTally;
        }, { enabled: 0, disabled: 0 });
        if (apiResult.list.pagination.hasMoreItems) {
            const more = await getPeopleCount(apiResult.list.pagination.skipCount + MAX_PEOPLE_PER_PAGE);
            result.enabled += more.enabled;
            result.disabled += more.disabled;
        }
        return result;
    } catch (error) {
        console.log(error);
    }
}

async function getHomeFoldersCount(): Promise<number> {
    try {
        const nodesApi = new NodesApi(jsApiConnection);
        const homesFolderApiResult = await nodesApi.listNodeChildren('-root-', {
            maxItems: 1,
            relativePath: USERS_HOME_RELATIVE_PATH
        });
        return homesFolderApiResult.list.pagination.totalItems;
    } catch (error) {
        console.log(error);
    }
}

async function getGroupsCount(): Promise<number> {
    try {
        const groupsApi = new GroupsApi(jsApiConnection);
        const groupsApiResult = await groupsApi.listGroups({ maxItems: 1 });
        return groupsApiResult.list.pagination.totalItems;
    } catch (error) {
        console.log(error);
    }
}

async function getSitesCount(): Promise<number> {
    try {
        const sitesApi = new SitesApi(jsApiConnection);
        const sitesApiResult = await sitesApi.listSites({ maxItems: 1 });
        return sitesApiResult.list.pagination.totalItems;
    } catch (error) {
        console.log(error);
    }
}

async function getFilesCount(): Promise<number> {
    try {
        const searchApi = new SearchApi(jsApiConnection);
        const searchApiResult = await searchApi.search({
            query: {
                query: "select * from cmis:document",
                language: 'cmis'
            },
            paging: {
                maxItems: 1
            }
        });
        return searchApiResult.list.pagination.totalItems;
    } catch (error) {
        console.log(error);
    }
}

async function wait(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
