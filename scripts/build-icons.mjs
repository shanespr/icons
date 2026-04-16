import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const root = resolve(process.cwd());
const iconsRoot = resolve(root, "Icons");
const srcDir = resolve(root, "src");
const distDir = resolve(root, "dist");
const PREFIX = "ss";

if (!existsSync(iconsRoot)) {
  console.error("Missing Icons directory. Expected ./Icons");
  process.exit(1);
}

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const toPosixPath = (value) => value.split("\\").join("/");

const walkSvgFiles = (dir) => {
  const output = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const fullPath = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      output.push(...walkSvgFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) {
      output.push(fullPath);
    }
  }

  return output;
};

const styleDirs = readdirSync(iconsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
  .map((entry) => ({
    name: entry.name,
    slug: slugify(entry.name),
    absPath: resolve(iconsRoot, entry.name)
  }))
  .sort((a, b) => a.slug.localeCompare(b.slug));

if (styleDirs.length === 0) {
  console.error("No style directories found inside ./Icons");
  process.exit(1);
}

const cssRules = [];
const manifest = [];
const classToPath = new Map();

for (const style of styleDirs) {
  const svgFiles = walkSvgFiles(style.absPath).sort((a, b) => a.localeCompare(b));

  for (const svgAbsPath of svgFiles) {
    const fileName = svgAbsPath.split("/").pop() || svgAbsPath.split("\\").pop() || "";
    const baseName = fileName.replace(/\.svg$/i, "");

    const styleSuffix = `-${style.slug}`;
    const baseWithoutStyle = baseName.endsWith(styleSuffix)
      ? baseName.slice(0, -styleSuffix.length)
      : baseName;

    const iconSlug = slugify(baseWithoutStyle);
    const className = `${PREFIX}-${style.slug}-${iconSlug}`;

    const relFromDist = toPosixPath(relative(distDir, svgAbsPath));
    const ruleValue = `--${PREFIX}:url("${relFromDist}")`;

    cssRules.push(`.${className}{${ruleValue}}`);
    classToPath.set(className, relFromDist);

    if (style.slug === "bold") {
      const defaultClassName = `${PREFIX}-${iconSlug}`;
      if (!classToPath.has(defaultClassName)) {
        cssRules.push(`.${defaultClassName}{${ruleValue}}`);
        classToPath.set(defaultClassName, relFromDist);
      }
    }

    manifest.push({
      className,
      style: style.slug,
      icon: iconSlug,
      file: toPosixPath(relative(root, svgAbsPath))
    });
  }
}

const banner = `/*\n * CSS Icons\n * Auto-generated from ./Icons\n * Run: npm run build\n */`;

const css = `${banner}
:root{
  --${PREFIX}-size:1em;
}

.${PREFIX}{
  display:inline-block;
  inline-size:var(--${PREFIX}-size);
  block-size:var(--${PREFIX}-size);
  vertical-align:-0.125em;
  background-color:currentColor;
  -webkit-mask:var(--${PREFIX}) center / contain no-repeat;
  mask:var(--${PREFIX}) center / contain no-repeat;
  flex-shrink:0;
}

${cssRules.join("\n")}

.${PREFIX}-xs{--${PREFIX}-size:0.75em}
.${PREFIX}-sm{--${PREFIX}-size:0.875em}
.${PREFIX}-lg{--${PREFIX}-size:1.25em}
.${PREFIX}-xl{--${PREFIX}-size:1.5em}

.${PREFIX}-spin{
  animation:${PREFIX}-spin 1s linear infinite;
}

@keyframes ${PREFIX}-spin{
  to{transform:rotate(360deg)}
}
`;

const minifyCss = (value) =>
  value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/ ?([{}:;,]) ?/g, "$1")
    .replace(/;}/g, "}")
    .trim();

mkdirSync(srcDir, { recursive: true });
mkdirSync(distDir, { recursive: true });

writeFileSync(resolve(srcDir, "icons.css"), css + "\n");
writeFileSync(resolve(distDir, "icons.css"), css + "\n");
writeFileSync(resolve(distDir, "icons.min.css"), minifyCss(css) + "\n");
writeFileSync(resolve(distDir, "icons.json"), JSON.stringify({ total: manifest.length, icons: manifest }, null, 2) + "\n");

const packageJsonPath = resolve(root, "package.json");
let packageJson = null;
if (existsSync(packageJsonPath)) {
  try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  } catch {
    packageJson = null;
  }
}

console.log(`Built ${manifest.length} style-specific icon classes from ${styleDirs.length} style folder(s).`);
if (packageJson?.name) {
  console.log(`Package: ${packageJson.name}`);
}
