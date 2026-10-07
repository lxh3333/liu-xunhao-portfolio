// Build the app without esbuild when this Windows runtime denies child processes.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { rollup } from 'rollup';
import { compile } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';

const root = process.cwd();
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const assets = path.join(dist, 'assets');
fs.mkdirSync(assets, { recursive: true });

const extensions = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json', '.css', '.png'];
const reactPackages = new Map([
  ['react', path.join(root, 'node_modules/react/cjs/react.production.js')],
  ['react/jsx-runtime', path.join(root, 'node_modules/react/cjs/react-jsx-runtime.production.js')],
  ['react-dom/client', path.join(root, 'node_modules/react-dom/cjs/react-dom-client.production.js')],
  ['react-dom', path.join(root, 'node_modules/react-dom/cjs/react-dom.production.js')],
  ['scheduler', path.join(root, 'node_modules/scheduler/cjs/scheduler.production.js')],
]);
const resolveFile = (base) => {
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
  for (const ext of extensions) {
    if (fs.existsSync(base + ext)) return base + ext;
  }
  for (const ext of extensions) {
    const index = path.join(base, `index${ext}`);
    if (fs.existsSync(index)) return index;
  }
  return null;
};

const bundle = await rollup({
  input: path.join(src, 'main.tsx'),
  onwarn(warning, warn) {
    if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') warn(warning);
  },
  plugins: [{
    name: 'restricted-windows-resolver',
    resolveId(id, importer) {
      if (id.startsWith('\0')) return id;
      if (reactPackages.has(id)) return '\0cjs:' + reactPackages.get(id);
      const base = id.startsWith('.')
        ? path.resolve(path.dirname(importer.startsWith('\0cjs:') ? importer.slice(5) : importer), id)
        : path.resolve(root, 'node_modules', id);
      if (id.endsWith('.css')) return '\0css:' + base;
      return resolveFile(base);
    },
    load(id) {
      if (id.startsWith('\0css:')) return 'export default {}';
      if (id.startsWith('\0cjs:')) {
        const source = fs.readFileSync(id.slice(5), 'utf8');
        const exports = id.includes('react-dom-client') ? ['createRoot', 'hydrateRoot']
          : id.includes('jsx-runtime') ? ['jsx', 'jsxs', 'Fragment']
          : ['useEffect', 'useMemo', 'useRef', 'useState', 'StrictMode'];
        const dependencies = [...source.matchAll(/require\("([^"]+)"\)/g)]
          .map((match) => match[1]);
        const unique = [...new Set(dependencies)];
        const imports = unique.map((name, index) =>
          `import dependency${index} from ${JSON.stringify(name)};`).join('\n');
        const requireMap = `const require=(name)=>({${unique.map((name, index) =>
          `${JSON.stringify(name)}:dependency${index}`).join(',')}})[name];`;
        return `${imports}\n${requireMap}\nconst module={exports:{}};const exports=module.exports;\n${source}\n` +
          `export default module.exports;\n` +
          exports.map((name) => `export const ${name}=module.exports.${name};`).join('\n');
      }
      if (id.endsWith('.png')) {
        const name = path.basename(id);
        fs.copyFileSync(id, path.join(assets, name));
        return `export default ${JSON.stringify(`/assets/${name}`)};`;
      }
      if (!fs.existsSync(id)) return null;
      const code = fs.readFileSync(id, 'utf8');
      if (/\.(tsx|ts|jsx)$/.test(id)) {
        return ts.transpileModule(code, {
          fileName: id,
          compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.ESNext,
            jsx: ts.JsxEmit.ReactJSX,
          },
        }).outputText;
      }
      return code;
    },
  }],
});

const output = await bundle.generate({ format: 'es', sourcemap: false });
for (const item of output.output) {
  if (item.type === 'chunk') fs.writeFileSync(path.join(assets, 'index-preview.js'), item.code);
}
await bundle.close();

const scanner = new Scanner({
  sources: [{ base: src.replaceAll('\\', '/'), pattern: '**/*.{tsx,jsx,ts,js}', negated: false }],
});
const candidates = scanner.scan();
const css = fs.readFileSync(path.join(src, 'index.css'), 'utf8') + '\n' +
  fs.readFileSync(path.join(src, 'TechText.css'), 'utf8');
const compiler = await compile(css, { base: src, onDependency() {} });
fs.writeFileSync(path.join(assets, 'index-preview.css'), compiler.build(candidates));

for (const name of fs.readdirSync(path.join(root, 'public'))) {
  if (name === 'hero-signal.webm' || name === 'hero-signal-poster.jpg') continue;
  fs.copyFileSync(path.join(root, 'public', name), path.join(dist, name));
}

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace('<script type="module" src="/src/main.tsx"></script>',
  '<script type="module" src="/assets/index-preview.js"></script>');
html = html.replace('</head>', '  <link rel="stylesheet" href="/assets/index-preview.css" />\n  </head>');
fs.writeFileSync(path.join(dist, 'index.html'), html);
console.log(`Preview built: ${Math.round(fs.statSync(path.join(assets, 'index-preview.js')).size / 1024)} KiB JS, ${candidates.length} style candidates`);
