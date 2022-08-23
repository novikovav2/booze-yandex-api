import {Driver, getLogger, IAuthService, MetadataAuthService} from "ydb-sdk";
import {Result} from "./models/result";

export const logger = getLogger()
export let driver: Driver

export async function initDb() {
    logger.debug("Driver initializing...")

    let authService: IAuthService = new MetadataAuthService()
    driver = new Driver({
        endpoint: process.env.ENDPOINT,
        database: process.env.DATABASE,
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
        logger.debug(`Starting execute query: ${query}`)
        const data = await driver.tableClient.withSession(async (session) => {
            return await session.executeQuery(query)
        })
        result = {
            status: 200,
            message: 'OK',
            data: data
        }
        await driver.destroy()
    } catch (e) {
        logger.error(e)
        result = {
            status: 400,
            message: 'Error occurred',
            data: e
        }
    }
    return result
}
