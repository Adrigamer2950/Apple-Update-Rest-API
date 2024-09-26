import axios from 'axios';
import * as semver from 'semver';

export async function getAssets(): Promise<Assets> {
    const res = await axios.get("https://gdmf.apple.com/v2/pmv");

    const assets = res.data.PublicAssetSets as Assets
    assets.iOS = assets.iOS.filter(o => o.SupportedDevices.find(str => str.includes("iPhone")) !== undefined);

    return assets;
}

export interface Assets {
    iOS: AssetProduct[],
    macOS: AssetProduct[],
    visionOS: AssetProduct[]
}

export interface AssetProduct {
    ProductVersion: string;
    Build: string;
    PostingDate: string;
    ExpirationDate: string;
    SupportedDevices: string[]
}

export enum OS {
    ios = "iOS",
    macos = "macOS",
    visionos = "visionOS"
}

export function parseInvalidSemVer(ver: string) {
    return ver.split(".").length < 3 ? (ver + ".0") : ver;
}

export function getLatestVersion(assets: Assets, os: OS) {
    let maxVersion: AssetProduct = {
        ProductVersion: "0.0.0",
        Build: "0000000",
        ExpirationDate: "22/22/1234",
        PostingDate: "22/22/1234",
        SupportedDevices: [
            "iPhone1,6"
        ]
    };

    for (const ver of assets[os]) {
        maxVersion = semver.compare(parseInvalidSemVer(ver.ProductVersion), parseInvalidSemVer(maxVersion.ProductVersion), false) > 0 ? ver : maxVersion;
    }

    return maxVersion;
}