import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import { join, extname, parse } from 'node:path'
import sharp from 'sharp'

const [,, inputGlob] = process.argv
const inputDir = inputGlob?.split('/**')[0] ?? 'assets/images'
const outputDir = join(inputDir, 'optimized')

async function* getImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* getImages(fullPath)
    } else if (/\.(jpe?g|png|gif|tiff?|webp)$/i.test(entry.name)) {
      yield fullPath
    }
  }
}

async function optimize() {
  await mkdir(outputDir, { recursive: true })
  for await (const filePath of getImages(inputDir)) {
    const { name } = parse(filePath)
    const ext = extname(filePath).toLowerCase()
    const outputExt = ext === '.png' ? '.png' : '.webp'
    const outputPath = join(outputDir, `${name}${outputExt}`)

    let pipeline = sharp(await readFile(filePath))
    if (ext === '.png') {
      pipeline = pipeline.png({ quality: 80 })
    } else {
      pipeline = pipeline.webp({ quality: 80 })
    }
    const data = await pipeline.toBuffer()
    await writeFile(outputPath, data)
    console.log(`Optimized: ${filePath} -> ${outputPath}`)
  }
}

optimize().catch(console.error)
