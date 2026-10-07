# Liu Xunhao Portfolio

React + Vite portfolio with GSAP motion and WebGL backgrounds.

Website: https://lxh3333.github.io/liu-xunhao-portfolio/

## Local Development

```sh
npm ci
npm run dev
```

Local URL: http://127.0.0.1:5174/

## Update And Publish

```sh
npm run build
git add src public scripts package.json package-lock.json vite.config.js README.md .gitignore
git commit -m "Update portfolio"
git push origin main
npm run deploy
```

`main` contains source code. `npm run deploy` builds the site with the GitHub
Pages base path and pushes the generated files to `gh-pages`. GitHub Pages
publishes that branch. No additional GitHub Actions workflow permission is needed.

Source updates alone do not publish the site; run `npm run deploy` after pushing.
