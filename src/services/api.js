import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3000", // backend URL
    timeout: 15000,
    headers: {
        "Content-Type": "application/json"
    }
});
