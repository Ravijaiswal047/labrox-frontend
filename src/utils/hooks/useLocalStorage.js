// import CryptoJS from "crypto-js";

// const SECRET_KEY = "your-secret-key";

// export const useLocalStorage = (key, type, valueToStore) => {
//   if (type === "set") {
//     const encryptedData = CryptoJS.AES.encrypt(
//       JSON.stringify(valueToStore),
//       SECRET_KEY
//     ).toString();
//     localStorage.setItem(key, encryptedData);
//   } else if (type === "get") {
//     const encryptedData = localStorage.getItem(key);
//     if (encryptedData) {
//       const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
//       const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
//       return JSON.parse(decryptedData);
//     }
//     return null;
//   }
// };

import CryptoJS from "crypto-js";

const SECRET_KEY = "your-secret-key"; // keep it same everywhere

export const useLocalStorage = (key, type, valueToStore) => {
  try {
    if (type === "set") {
      if (valueToStore === undefined) return;
      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(valueToStore),
        SECRET_KEY,
      ).toString();
      localStorage.setItem(key, encryptedData);
    } else if (type === "get") {
      const encryptedData = localStorage.getItem(key);
      if (!encryptedData) return null;

      try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

        // If decryption fails → decryptedData will be empty string
        if (!decryptedData) {
          console.warn(`Decryption failed for key: ${key}`);
          return null;
        }

        return JSON.parse(decryptedData);
      } catch (err) {
        console.error("Error decrypting localStorage item:", err);
        return null;
      }
    }
  } catch (err) {
    console.error("useLocalStorage error:", err);
    return null;
  }
};
