import {YC} from "../../yc";
import {Result, RESULT_DEFAULT} from "../../models/result";
import {logger} from "../../db";
import {getProducts} from "../products/getProducts";
import {Product} from "../../models/product";
import {Member} from "../../models/member";
import {getMembers} from "../members/getMembers";
import {Donor, EventResult, Payment, Recipient} from "../../models/event-result";

export const getResult = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start getResult method.")
    let result: Result = RESULT_DEFAULT
    const id = event.params.id
    const products: Product[] = (await getProducts(event)).data
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
    result = {
        ...result,
        data: eventResult
    }
    logger.info(`End getResult method. Result: ${JSON.stringify(result)}`)
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
