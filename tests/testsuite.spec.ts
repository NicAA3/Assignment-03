import { test, expect } from '@playwright/test';
import { APIHelper } from './apiHelpers';
import { faker } from '@faker-js/faker';
import { generateRandomRoomsPayload } from './testData'

test.describe("Front-end test", () => {
  test('TC01-Create room', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.locator('input[type="text"]').fill(`${process.env.TEST_USERNAME}`);
    await page.locator('input[type="password"]').fill(`${process.env.TEST_PASSWORD}`);
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("heading", { name: "Tester Hotel Overview" })).toBeVisible();
    await page.locator("#app > div > div > div:nth-child(1) > a").click();
    await expect(page.getByText('Rooms')).toBeVisible();
    await page.getByRole('link', { name: 'Create Room' }).click();
    await expect(page.getByText('New Room')).toBeVisible();
    //create new room
    const categoryOptions = ['Double', 'Single', 'Twin'];
    const randomCategory = faker.helpers.arrayElement(categoryOptions);
    await page.getByRole('combobox').selectOption({ label: randomCategory });
    const roomNumber = faker.number.int({ min: 1, max: 100 }).toString();
    await page.locator('div').filter({ hasText: /^Number$/ }).getByRole('spinbutton').fill(roomNumber);
    const randomFloor = faker.number.int({ min: 1, max: 10 }).toString();
    await page.locator('div').filter({ hasText: /^Floor$/ }).getByRole('spinbutton').fill(randomFloor);
    await page.locator('.checkbox').click();
    const randomPrice = faker.number.int({ min: 50, max: 500 }).toString();
    await page.locator('div').filter({ hasText: /^Price$/ }).getByRole('spinbutton').fill(randomPrice);
    const featureOptions = ['Balcony', 'Ensuite', 'Sea View', 'Penthouse'];
    const randomFeatures = faker.helpers.arrayElements(featureOptions, faker.number.int({ min: 1, max: featureOptions.length }));
    for (const feature of randomFeatures) {
      await page.getByRole('listbox').selectOption({ label: feature });
    }
    await page.getByText('Save').click()

    const lastRoomElement = page.locator("#app > div > div.rooms > div:nth-last-child(1)");

    await expect(lastRoomElement).toContainText(randomFloor);
    await expect(lastRoomElement).toContainText(roomNumber);
    await expect(lastRoomElement).toContainText((new RegExp(randomCategory, 'i')));
    await expect(lastRoomElement).toContainText('Available');
    await expect(lastRoomElement).toContainText(randomPrice);
    for (const feature of randomFeatures) {
      await expect(lastRoomElement).toContainText(new RegExp(feature, 'i'));
    }

  });
})

test.describe("Backend test", () => {
  let apiHelper: APIHelper;
  test.beforeAll(async ({ request }) => {
    // Initialize the APIHelper class
    apiHelper = new APIHelper('http://localhost:3000', `${process.env.TEST_USERNAME}`, `${process.env.TEST_PASSWORD}`);

    // Perform login to obtain the token
    const response = await request.post('http://localhost:3000/api/login', {
      data: {
        username: `${process.env.TEST_USERNAME}`,
        password: `${process.env.TEST_PASSWORD}`
      }
    });
    expect(response.ok()).toBeTruthy(); // Ensure the login was successful

    const loginData = await response.json();
    expect(loginData).toHaveProperty('username', process.env.TEST_USERNAME); // Assert the response contains the correct username
    expect(loginData).toHaveProperty('token'); // Assert the token exists

    // Store the token in the APIHelper instance for future use
    apiHelper.setToken(loginData.token);
  });

  test('Test case 02 - Create Room', async ({ request }) => {
    const payload = generateRandomRoomsPayload();
    const createPostResponse = await apiHelper.postNewRoom(request, payload);
    expect(createPostResponse.ok()).toBeTruthy();
    const responseData = await createPostResponse.json();
    expect(responseData).toHaveProperty('id');  // Ensure room ID exists
    expect(responseData).toMatchObject({
      category: payload.category,
      number: payload.number,
      floor: payload.floor,
      available: payload.available,
      price: payload.price,
      // features: payload.features,
    });
  });
});



