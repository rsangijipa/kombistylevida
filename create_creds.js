const fs = require('fs');

const key = "-----BEGIN PRIVATE KEY-----\n" +
    "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCi8xEu5aoh6u4o\n" +
    "p9x3YsX7PIWyVPX+Mx3WMrZs9jYzw0bSqDMvJVprHEFA75wofyAXYYfrA+XhKAgD\n" +
    "tn4EA+gDrL8hcvpOV8raEKIkcuxM1YupP+GMn+dwABhOg+FzScUZ2XQdfUK3I/cC\n" +
    "ubxm8QwLc6hEbtklFU1xKOIT4xXpVLf7wmqjPUCq8MdluQ53eSqeRzKmb0hzmsh6\n" +
    "hahLymbhE5hBHdMZUZhOvKEaEGUay8c/aEpAEJLkmkRsTDs7BOsIYb6BSWqTlm17\n" +
    "yupRAimgstNb/IlDwh2u6Wo0FRhZXjQDw28eaBwhW3LvCgda8OWaQcNAaLF1N70B\n" +
    "Orc6vR1RAgMBAAECggEAAohCuXmj9io5mIE6+RInF7y0wAUCPCNaTg55x4cgJ+0w\n" +
    "/pvSzM4jVzQIPxHiLukX1sktxK0UiiuA4WGOrdxg2LLF7HIGGggoUhEisJc7x8S5\n" +
    "9S/AacV/4h2RmHcZSTJ+/m7Nd0UFBQXT7ujI7jQbhETgO0JaO/Frw6EMz13kGf0a\n" +
    "yg17fuAI15rsdj4mf4kxK7tzrGOxWxHdZ+gEcROJ3xzFu0J807xMzLx/Lctgsipg\n" +
    "gx68XbvsIAhxxhnRXHFYeiYUnXxze8I9/XAiJG6N7ctKzR1X424c3vWN5QCx2pmR\n" +
    "Ujj+oA7FYZKRTsQmCct5pCFDrwNa1IphKFvD+LcsSQKBgQC2nEB9l9Gk5BxGUXsRa0U0pZJrUqUcwNt9\n" +
    "Rii2/9Z8cXlv8NOcEaH9k4qDE+rApZLL1+l0fA2NxImiGgzMuYgWBOyxl+MCP+fQ\n" +
    "RTk8hyJ4h2fY+WEdxOeZDtZLmUIcIA+KeTu6fLwljkaYS3viyoav5rsuPYyj8Nl4\n" +
    "JbUv3pueyQKBgQCjcrMyyqhmtTTXZrNkCHTfBEAyw+aUsD/SKjOUS25qEIF/AL31\n" +
    "TxALbAb/YgjV+kDIen3/A82yLO0JC+TRxRFbDbmvpCCT0pGaZ+AmR9DBojDngyPh\n" +
    "ATULJ1d0JZF5kKVnnnnWZ7s82CF4BF0iytUa1ctr1yvuW5v7WDkilccMYQKBgH83\n" +
    "ofIdR29Bf7U5ZKyA9+iyhKwCGodKkF7Y9tpup6VwhHKI61MqMZlwJSomQQBPGVKr\n" +
    "q7d8CRE/38avsUUa6AS3D5K1xu+1R7Ef2L0jQ8+GPcG6En9jwxktbfui3JytdUY6\n" +
    "KXNFHOppESNeSwN3ppd6/eI7/PPlggui8XRU+EOJAoGBAKcX4+5xp/+FIqEJsS7L\n" +
    "ngtjYXelO1eiaHpRq0UeBAz33rs37iQ6H/3ExJrZU5zvH1EgXLMq63nPVNbJBISb\n" +
    "3RgaL3dL9fDNF5LV22j5FaKTROR0Yp0+OOoLdW3PLbxMFoFrmC8awRS9uWNwc5/S\n" +
    "yOWF95djK2j+h++4r3tAdpcr\n" +
    "-----END PRIVATE KEY-----\n";

const creds = {
    "type": "service_account",
    "project_id": "planar-outlook-480318-c3",
    "private_key_id": "baca3803eb7360482ed1d3345155625241fcedfa",
    "private_key": key,
    "client_email": "498245203714-compute@developer.gserviceaccount.com",
    "client_id": "116590697469063590450",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/498245203714-compute%40developer.gserviceaccount.com",
    "universe_domain": "googleapis.com"
};

fs.writeFileSync('planar-outlook-creds.json', JSON.stringify(creds, null, 2));
console.log("Created planar-outlook-creds.json");
