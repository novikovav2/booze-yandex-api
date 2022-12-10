import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {Product} from "../../models/product";
import {Member} from "../../models/member";
import {getMembers} from "../members/getMembers";
import {Donor, EventResult, Payment, Recipient} from "../../models/event-result";
import {NOT_FOUND, SUCCESS} from "../../consts";
import {Eater} from "../../models/eater";
import {v4 as uuid} from "uuid"
import {TypedValues} from "ydb-sdk";
import {clearResult} from "../shared/clearResult";

export const getResult = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start getResult method.")
    let result: Result
    const id = event.params.id

    result = await getResultFromDB(id)
    if (result.status !== SUCCESS) {
        // Результата нет в БД или он пустой
        logger.info("No result in DB. Starting long process...")
        const products: Product[] = (await getProductsData(event)).data
        const members: Member[] = (await getMembers(event)).data

        let recipients: Recipient[] = []
        let donors: Donor[] = []

        members.forEach((member) => {
            // Вычисляем на сколько участник съел
            const ate = calculateAte(member, products)
            // Вычисляем сколько участник заплатил за продукты
            const paid = calculatePaid(member, products)
            if (paid >= ate) {
                recipients.push({
                    user: member.user,
                    currentPaid: paid - ate,
                    totalPaid: paid
                })
            } else {
                const donor: Donor = {
                    user: member.user,
                    payments: [],
                    currentAte: ate - paid,
                    totalAte: ate
                }
                donors.push(donor)
            }
        })
        donors.forEach((donor) => {
            recipients.forEach((recipient) => {
                let payment: Payment
                if (donor.currentAte === 0) {
                    payment = {
                        recipient: recipient.user,
                        value: 0
                    }
                } else {
                    if (donor.currentAte >= recipient.currentPaid) {
                        payment = {
                            recipient: recipient.user,
                            value: recipient.currentPaid
                        }
                        donor.currentAte = donor.currentAte - recipient.currentPaid
                        recipient.currentPaid = 0
                    } else {
                        payment = {
                            recipient: recipient.user,
                            value: donor.currentAte
                        }
                        recipient.currentPaid = recipient.currentPaid - donor.currentAte
                        donor.currentAte = 0
                    }
                }
                donor.payments.push(payment)
            })
            delete donor.currentAte // удаляем вспомогательную переменную
        })
        // удаляем вспомогательную переменную
        recipients.forEach((recipient) => { delete recipient.currentPaid})


        let eventResult: EventResult = {
            eventId: id,
            recipients: recipients,
            donors: donors
        }
        result = await saveResultToDB(id, eventResult)
        result = {
            ...result,
            data: eventResult
        }
    }

    logger.info(`End getResult method. Result: ${JSON.stringify(result)}`)
    return result
}

const getProductsData = async (event: YC.CloudFunctionsHttpEvent) => {
    logger.info("Start getProductsData method")

    let result: Result
    const id = event.params.id
    const query = ` DECLARE $eventId AS Utf8;
                    SELECT p.id as id,
                            p.eventId as eventId,
                            p.title as title,
                            p.price as price,
                            p.total as total,
                            u.id as userId,
                            u.username as username,
                            u.type as type
                    FROM products p
                    CROSS JOIN users u
                    WHERE p.buyerId = u.id
                        AND p.eventId = $eventId;`
    const paramsProducts = {
        '$eventId': TypedValues.utf8(id)
    }
    result = await execute(query, paramsProducts)
    logger.info(`Result after select from products: ${JSON.stringify(result)}`)
    if (result.status === SUCCESS) {
        let products: Product[] = []
        for (const item of result.data) {
            let product: Product = {
                id: item.id,
                eventId: item.eventId,
                title: item.title,
                price: item.price,
                total: item.total,
                buyer: {
                    id: item.userId,
                    username: item.username,
                    type: item.type
                }
            }

            const queryEater = `DECLARE $productId AS Utf8;
                            SELECT e.id as id,
                                       e.productId as productId,
                                       e.number as number,
                                       e.userId as userId,
                                       u.username as username,
                                       u.type as type
                            FROM eaters e
                            CROSS JOIN users u
                            WHERE e.userId = u.id
                                AND productId = $productId;`
            const paramsEaters = {
                '$productId': TypedValues.utf8(item.id)
            }
            const eaterResult = await execute(queryEater, paramsEaters)
            const eaters: Eater[] = []
            eaterResult.data.forEach((e) => {
                const eater: Eater = {
                    user: {
                        id: e.userId,
                        username: e.username,
                        type: e.type
                    },
                    count: e.number
                }
                eaters.push(eater)
            })
            product.eaters = eaters
            products.push(product)
        }
        result = {
            ...result,
            data: products
        }
    }

    logger.info(`End getProducts method. Result: ${JSON.stringify(result)}`)
    return result
}

const calculateAte = (member: Member, products: Product[]) => {
    let result: number = 0
    products.forEach((product) => {
        const memberAteProduct = product.eaters.find((eater) => {
            return eater.user.id === member.user.id
        })
        if (memberAteProduct) {
            result = result + product.price/product.eaters.length
        }
    })
    return result
}

const calculatePaid = (member: Member, products: Product[]) => {
    let result: number = 0
    products.forEach((product) => {
        if (product.buyer.id === member.user.id) {
            result = result + product.price
        }
    })
    return result
}

const saveResultToDB = async (eventId: string, eventResult: EventResult) => {
    const resultUuid = uuid()
    await clearResult(eventId)

    const query = ` DECLARE $id AS Utf8;
                    DECLARE $eventId AS Utf8;
                    DECLARE $result AS Utf8;
                    INSERT into results (id, eventId, result)
                    VALUES ($id, $eventId, $result);`
    const params = {
        '$id': TypedValues.utf8(resultUuid),
        '$eventId': TypedValues.utf8(eventId),
        '$result': TypedValues.utf8(JSON.stringify(eventResult))
    }
    return await execute(query, params)
}

const getResultFromDB = async (eventId: string) => {
    let result: Result
    const query = ` DECLARE $eventId AS Utf8;
                    SELECT result
                    FROM results
                    WHERE eventId = $eventId;`
    const params = {
        '$eventId': TypedValues.utf8(eventId)
    }
    result = await execute(query, params)
    if (result.status === SUCCESS && result.data.length > 0) {
        logger.info("Result from DB received successfully")
        result = {
            ...result,
            data: result.data[0].result
        }
    } else {
        result.status = NOT_FOUND
    }

    return result
}
