
const productsAsObjects = require('./productsAsObjects');
const dotenv = require('dotenv');
dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN;
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token, {
    polling: true
});
const NOT_FOUND_PRODUCTS = "🤷‍♀️ לא נמצאו תוצאות 🤷‍♂️";

bot.on("polling_error", console.log);

bot.on('message', (msg) => {
    var start = "/start";
    if (msg.text.toString().toLowerCase().indexOf(start) !== 0) {
        const organizedShoppingTextMessage = organizeShoppingList(msg.text);
        bot.sendMessage(msg.chat.id, organizedShoppingTextMessage, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });
    }
});

function organizeShoppingList(unorganizedShoppingList) {
    const productsList = textMessageToProductList(unorganizedShoppingList);
    const organizedProductsDictionary = productsListToOrganizedProductsDictionary(productsList);
    return OrganizedProductsDictionaryToTextMessage(organizedProductsDictionary);
}

function textMessageToProductList(unorganizedShoppingList) {
    if (unorganizedShoppingList) {
        return unorganizedShoppingList.split('\n');
    }
}

function productsListToOrganizedProductsDictionary(productsList) {
    const organizedProductsDictionary = {};
    const unsortedProducts = [];
    for (let i = 0; i < productsList.length; i++) {
        let productName = getProductName(productsList[i]);
        let productObject;
        if (Object.hasOwnProperty.call(productsAsObjects, productName)) {
            productObject = productsAsObjects[productName];
        } else {
            unsortedProducts.push(productsList[i]);
        }
        if (productObject) {
            if (productObject && !Object.hasOwnProperty.call(organizedProductsDictionary, productObject.category)) {
                organizedProductsDictionary[productObject.category] = [];
            }
            organizedProductsDictionary[productObject.category].push(
                `<a href="${productObject.link}">${productsList[i]}</a>`);
        }
    }

    if (unsortedProducts.length > 0) {
        organizedProductsDictionary[NOT_FOUND_PRODUCTS] = unsortedProducts;
    }
    return organizedProductsDictionary;
}

function getProductName(product) {
    let productParts = product.trim().split(/\s+/);
    let numOfProduct = '';
    if (productParts.length > 1) {
        numOfProduct = parseInt(productParts[0], 10);
        if (numOfProduct) {
            productParts.shift();
        } else {
            numOfProduct = '';
        }
    }
    let productName = productParts.join(' ').replace(/['"*_#]/g, '');
    return productName.replace(/[-]/g, ' ');
}

function OrganizedProductsDictionaryToTextMessage(organizedProductsDictionary) {
    let textMessage = "";
    for (const category in organizedProductsDictionary) {
        if (Object.hasOwnProperty.call(organizedProductsDictionary, category)) {
            const productsList = organizedProductsDictionary[category];
            textMessage += `\n<b>${category}:</b>\n`;
            for (let i = 0; i < productsList.length; i++) {
                const product = productsList[i];
                textMessage += `${product}\n`;
            }
        }
    }
    textMessage += '\nקנייה נעימה!  🛒\n';
    return textMessage;
}

