import {Driver, getLogger, IAuthService, MetadataAuthService, Ydb} from "ydb-sdk";
import {Result} from "./models/result";
import {BAD_REQUEST, DATABASE, ENDPOINT, SUCCESS} from "./consts";

export const logger = getLogger()
export let driver: Driver

export async function initDb() {
    logger.debug("Driver initializing...")

    let authService: IAuthService = new MetadataAuthService()
    driver = new Driver({
        endpoint: ENDPOINT,
        database: DATABASE,
        authService
    })
    const timeout = 10000
    if (!(await driver.ready(timeout))) {
        logger.fatal('Driver has not become ready')
        process.exit(1)
    }
    logger.info('Driver ready')
}

export async function execute(query:string): Promise<Result> {
    let result: Result
    try {
        await initDb()
        logger.info(`Starting execute query: ${query}`)
        const data = await driver.tableClient.withSession(async (session) => {
            return await session.executeQuery(query)
        })
        result = {
            status: SUCCESS,
            data: parse(data)
        }
        await driver.destroy()
    } catch (e) {
        logger.error(e)
        result = {
            status: BAD_REQUEST,
            data: e
        }
    }
    return result
}

const parse = (data:  Ydb.Table.ExecuteQueryResult) => {
    let result: any[] = []
    if (!data.resultSets[0] || !data.resultSets[0].rows) {
        result = []
    } else {
        data.resultSets[0].rows.forEach((row) => {
            let rowData = {}
            row.items.forEach((item, idx) => {
                // 2 - определено опытным путем
                rowData[data.resultSets[0].columns[idx].name] = Object.values(item)[2]
            })
            result.push(rowData)
        })
    }
    return result
}
