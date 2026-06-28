import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(scriptDirectory, "..");
const sourceImagesDirectory = path.join(rootDirectory, "imgs");
const outputDirectory = path.join(rootDirectory, "dist");
const outputImagesDirectory = path.join(outputDirectory, "imgs");
const imageExtensions = new Set([".jpg", ".jpeg", ".png"]);
const webpQuality = 82;
const maximumWidth = 2400;

function toWebPath(filePath) {
    return filePath.split(path.sep).join("/");
}

function formatSize(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function listFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(async (entry) => {
            const entryPath = path.join(directory, entry.name);
            return entry.isDirectory() ? listFiles(entryPath) : entryPath;
        }),
    );

    return files.flat();
}

async function buildImages() {
    const files = await listFiles(sourceImagesDirectory);
    const replacements = new Map();
    const outputNames = new Set();
    let sourceBytes = 0;
    let outputBytes = 0;
    let convertedImages = 0;

    for (const sourcePath of files) {
        const relativePath = path.relative(sourceImagesDirectory, sourcePath);
        const extension = path.extname(relativePath).toLowerCase();
        const sourceDetails = await stat(sourcePath);
        sourceBytes += sourceDetails.size;

        if (!imageExtensions.has(extension)) {
            const outputPath = path.join(outputImagesDirectory, relativePath);
            await mkdir(path.dirname(outputPath), { recursive: true });
            await cp(sourcePath, outputPath);
            outputBytes += sourceDetails.size;
            continue;
        }

        const outputRelativePath = relativePath.slice(0, -extension.length) + ".webp";
        const normalizedOutputName = outputRelativePath.toLowerCase();

        if (outputNames.has(normalizedOutputName)) {
            throw new Error(`Trùng tên ảnh sau khi đổi sang WebP: ${outputRelativePath}`);
        }

        outputNames.add(normalizedOutputName);
        const outputPath = path.join(outputImagesDirectory, outputRelativePath);
        await mkdir(path.dirname(outputPath), { recursive: true });

        const image = sharp(sourcePath).rotate();
        const metadata = await image.metadata();
        const pipeline =
            metadata.width && metadata.width > maximumWidth
                ? image.resize({ width: maximumWidth, withoutEnlargement: true })
                : image;

        await pipeline
            .webp({
                quality: webpQuality,
                alphaQuality: 90,
                effort: 6,
                smartSubsample: true,
            })
            .toFile(outputPath);

        const outputDetails = await stat(outputPath);
        outputBytes += outputDetails.size;
        convertedImages += 1;

        replacements.set(
            `imgs/${toWebPath(relativePath)}`,
            `imgs/${toWebPath(outputRelativePath)}`,
        );
    }

    return { replacements, sourceBytes, outputBytes, convertedImages };
}

function optimizeImageMarkup(html) {
    let firstContentImageFound = false;

    return html.replace(/<img\b[^>]*>/gi, (imageTag) => {
        if (/\bsrc\s*=\s*["']\s*["']/i.test(imageTag)) {
            return imageTag;
        }

        const isFirstContentImage = !firstContentImageFound;
        firstContentImageFound = true;
        let optimizedTag = imageTag;

        if (!/\bdecoding\s*=/i.test(optimizedTag)) {
            optimizedTag = optimizedTag.replace(/<img\b/i, '<img decoding="async"');
        }

        if (!/\bloading\s*=/i.test(optimizedTag)) {
            optimizedTag = optimizedTag.replace(
                /<img\b/i,
                isFirstContentImage ? '<img loading="eager"' : '<img loading="lazy"',
            );
        }

        if (isFirstContentImage && !/\bfetchpriority\s*=/i.test(optimizedTag)) {
            optimizedTag = optimizedTag.replace(/<img\b/i, '<img fetchpriority="high"');
        }

        return optimizedTag;
    });
}

async function build() {
    await rm(outputDirectory, { recursive: true, force: true });
    await mkdir(outputImagesDirectory, { recursive: true });

    const { replacements, sourceBytes, outputBytes, convertedImages } = await buildImages();
    let html = await readFile(path.join(rootDirectory, "index.html"), "utf8");

    for (const [sourcePath, outputPath] of replacements) {
        html = html.replaceAll(sourcePath, outputPath);
    }

    html = optimizeImageMarkup(html);
    await writeFile(path.join(outputDirectory, "index.html"), html, "utf8");

    const savedBytes = sourceBytes - outputBytes;
    const savedPercent = sourceBytes ? (savedBytes / sourceBytes) * 100 : 0;

    console.log(`Build hoàn tất: ${path.relative(rootDirectory, outputDirectory)}`);
    console.log(`Đã tối ưu ${convertedImages} ảnh sang WebP (quality ${webpQuality}).`);
    console.log(
        `Dung lượng ảnh: ${formatSize(sourceBytes)} → ${formatSize(outputBytes)} ` +
            `(giảm ${formatSize(savedBytes)}, ${savedPercent.toFixed(1)}%).`,
    );
}

build().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
