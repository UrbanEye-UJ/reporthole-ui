import { defineConfig } from "orval";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiBaseUrl = process.env.REPORTHOLE_API_BASE_URL;

if (!apiBaseUrl) {
    throw new Error("REPORTHOLE_API_BASE_URL is not set in .env file");
}

export default defineConfig({
    reporthole: {
        input: {
            target: `${apiBaseUrl}/v3/api-docs`,
        },
        output: {
            mode: "tags-split",
            target: "app/api/generated",
            client: "react-query",
            httpClient: "axios",
            clean: true,
        },
    },
});