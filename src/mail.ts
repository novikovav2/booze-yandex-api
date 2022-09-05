import {Options} from "nodemailer/lib/smtp-transport";
import {createTransport} from "nodemailer";
import {logger} from "./db";
import {MAIL_FROM, MAIL_HOST, MAIL_PASS, MAIL_PORT, MAIL_USER} from "./consts";

export const mail = async (to: string, subject: string, text: string, html: string) => {
    logger.info("Start mail method")
    const options: Options = {
        host: MAIL_HOST,
        port: MAIL_PORT,
        secure: true,
        auth: {
            user: MAIL_USER,
            pass: MAIL_PASS
        }
    }

    const transport = createTransport(options)

    const message = await transport.sendMail({
        from: MAIL_FROM,
        to, subject, text, html
    })

    logger.info(`End mail method. Result: ${JSON.stringify(message)}`)
}
