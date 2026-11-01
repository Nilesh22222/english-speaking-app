# 🗣️ English Speaking Practice App

A simple browser-based app to practise spoken English. It shows a sentence, lets you
listen to it, record yourself repeating it, and scores your pronunciation word by word.

## Features
- 3 levels: Beginner, Intermediate, Advanced
- Listen to the sentence (US / UK / India accent)
- Speak and get instant word-by-word feedback (green = correct, red = missed)
- Hinglish hint for the meaning of every sentence
- Tracks attempts, best score and streak (saved in your browser)
- No backend, no API key, no build step

## Run locally
Open `index.html` in Google Chrome or Microsoft Edge. (If the mic does not work from a
file, run `python -m http.server 8000` and open http://localhost:8000.)

## Deploy free on GitHub Pages
1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under *Build and deployment*, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Your app will be live at `https://<your-username>.github.io/<repo-name>/`.

## Add your own sentences
Edit the `SENTENCES` object at the top of `app.js`.

## Browser support
Speech recognition works best in Chrome and Edge. Firefox does not support it yet.

## License
MIT
