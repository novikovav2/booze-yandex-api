import {User} from "./user";
import {Eater} from "./eater";
import {Member} from "./member";

export interface Product {
    id: string,
    eventId: string,
    title: string,
    price: number,
    total: number,
    buyer: User,
    eaters?: Eater[]
}

export interface NewProduct {
    eventId: string,
    title: string,
    price: number,
    total: number,
    buyerId: string,
    eaters: Member[]
}
