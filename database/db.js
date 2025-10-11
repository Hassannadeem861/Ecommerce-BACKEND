const db = {
  HOST: "localhost",         // Jis machine pe DB chal raha hai (local ka matlab apni machine)
  USER: "root",              // MySQL ka username
  PASSWORD: "",              // Password (agar khaali hai to blank)
  DB: "ecommerce_store",                // Database ka naam
  dialect: "mysql",          // Kon sa DB use ho raha hai (MySQL in this case)
  pool: {
    max: 5,                  // Maximum 5 connections DB se ek time pe
    min: 0,                  // Minimum 0 connection rakh sakta hai
    acquire: 30000,          // 30 sec tak wait karega connection ke liye
    idle: 10000,             // Agar koi connection 10 sec idle ho gaya to band ho jaye
  },
};

export default db;