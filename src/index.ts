import {getAssets, getLatestVersion, OS, parseInvalidSemVer} from "./gdmf/gdmf.ts";

import Express from 'express';
import * as semver from "semver";

import * as dotnet from 'dotenv';
dotnet.config();

const port = process.env['PORT'] ?? 8080;

async function getLatest(req: Express.Request, res: Express.Response, os: OS) {
    const { onlyVersion } = req.query;

    const latest = getLatestVersion(await getAssets(), os);

    if (onlyVersion == undefined)
        return res.status(200).json(latest);

    res.status(200).send(latest.ProductVersion)
}

const app = new Express()

.get("/*", (req, res) => {
    res.redirect("https://github.com/Adrigamer2950/Apple-Update-Rest-API", 301);
})
.get("/latest/ios", async (req, res) => {
    await getLatest(req, res, OS.ios);
})
.get("/latest/macos", async (req, res) => {
    await getLatest(req, res, OS.macos);
})
.get("/latest/visionos", async (req, res) => {
    await getLatest(req, res, OS.visionos);
})
.get("/compare", async (req, res) => {
    let { v1, v2, fetchLatest, fetchOS } = req.query;

    if (v1 == undefined || (v2 == undefined && fetchLatest == undefined))
        return res.status(400).json({
            error: "'v1' or 'v2' is undefined"
        });

    if (fetchLatest && fetchOS == undefined)
        return res.status(400).json({
            error: "You can't fetch the latest version without specifying the OS"
        });

    let os;

    if (fetchLatest) {
        os = OS[fetchOS.toLowerCase()];

        if (os == undefined)
            return res.status(400).json({
                error: "OS is invalid"
            });
    }

    v2 = fetchLatest !== undefined ? getLatestVersion(await getAssets(), os).ProductVersion : v2;

    const highest = semver.compare(parseInvalidSemVer(v1), parseInvalidSemVer(v2), false) > 0 ? v1 : v2;

    res.status(200).json({
        highest
    });
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});