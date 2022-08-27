import {User} from "./user";
import {Eater} from "./eater";

export interface Product {
    id: string,
    eventId: string,
    title: string,
    price: number,
    total: number,
    buyer: User,
    eaters?: Eater[]
}
