import {Result} from "../../models/result";
import {YC} from "../../yc";
import {execute, logger} from "../../db";
import {SUCCESS} from "../../consts";
import {MemberProduct} from "../../models/product";

export const getProductsByMember = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start getProductsByMember method")
    let result: Result
    const memberId: string = event.params.id
    let products: MemberProduct[] = []

    const queryGetMemberInfo = `SELECT eventId, userId
                                FROM members
                                WHERE id = '${memberId}'`
    result = await execute(queryGetMemberInfo)
    if (result.status === SUCCESS) {
        const eventId = result.data[0].eventId
        const userId = result.data[0].userId
        if (eventId && userId) {
            const queryEaten = `SELECT DISTINCT p.id as id,
                            p.eventId as eventId,
                            p.title as title,
                            p.price as price,
                            p.total as total,
                            u.id as userId,
                            u.username as username,
                            u.type as type,
                    FROM products p
                    LEFT JOIN users u ON p.buyerId = u.id 
                    WHERE p.eventId = '${eventId}'
                        AND p.id IN (select productId
                                        from eaters
                                        where userId = '${userId}')
                    order by title`
            result = await execute(queryEaten)
            if (result.status === SUCCESS) {
                const parsedProducts = parseProducts(result.data, true)
                products = [...products, ...parsedProducts]
            }

            const queryNonEaten = `SELECT DISTINCT p.id as id,
                            p.eventId as eventId,
                            p.title as title,
                            p.price as price,
                            p.total as total,
                            u.id as userId,
                            u.username as username,
                            u.type as type,
                    FROM products p
                    LEFT JOIN users u ON p.buyerId = u.id 
                    WHERE p.eventId = '${eventId}'
                        AND p.id NOT IN (select productId
                                        from eaters
                                        where userId = '${userId}')
                    order by title`
            result = await execute(queryNonEaten)
            if (result.status === SUCCESS) {
                const parsedProducts = parseProducts(result.data, false)
                products = [...products, ...parsedProducts]
            }
        }
    }
    result = {
        ...result,
        data: products
    }

    logger.info(`End getProductsByMember method. Result: ${JSON.stringify(result)}`)
    return result
}

const parseProducts = (products: any, eaten: boolean): MemberProduct[] => {
    let result: MemberProduct[] = []
    for (const item of products) {
        let product: MemberProduct = {
            id: item.id,
            eventId: item.eventId,
            title: item.title,
            price: item.price,
            total: item.total,
            buyer: {
                id: item.userId,
                username: item.username,
                type: item.type
            },
            eaten
        }
        result.push(product)
    }
    return result
}
