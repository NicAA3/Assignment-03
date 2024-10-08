import { faker } from "@faker-js/faker";

export const generateRandomRoomsPayload = () => {
    return {
        "category": faker.helpers.arrayElement(['Double', 'Single', 'Twin']),
        "number": faker.number.int({ min: 1, max: 100 }),
        "floor": faker.number.int({ min: 1, max: 10 }),
        "available": true,
        "price": faker.number.int({ min: 50, max: 500 }),
        "features": faker.helpers.arrayElements(['Balcony', 'Ensuite', 'Sea View', 'Penthouse']),

    }
};