# 🧠 Thomas GIA Aptitude Assessment Trainer

> **Open-source, zero-dependency, bilingual (EN / RU) interactive preparation platform for the Thomas International General Intelligence Assessment (GIA).**

[![Live Web Application](https://img.shields.io/badge/🚀_Live_Demo-GitHub_Pages-2ea44f?style=for-the-badge)](https://prostopasta.github.io/thomas-gia-trainer/)

**🌐 Online Web App:** [https://prostopasta.github.io/thomas-gia-trainer/](https://prostopasta.github.io/thomas-gia-trainer/)

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-yellow.svg)
![Bilingual](https://img.shields.io/badge/Languages-EN%20%7C%20RU-green.svg)
![Theme](https://img.shields.io/badge/Theme-Light%20%2F%20Dark-purple.svg)

---

## 📌 Overview

The **Thomas International General Intelligence Assessment (GIA)** is a standardized psychometric aptitude test measuring cognitive processing speed, mental agility, verbal reasoning, and spatial awareness. It is widely used in hiring assessments by tech companies and enterprises.

This repository provides an authentic browser-based simulation of the 5 GIA subtests along with **mathematical and cognitive shortcuts**, **instant error breakdown**, **audio feedback**, and **local high-score tracking**.

---

## ⚡ The 5 Subtests

| # | Subtest | Description | Official Timing | Shortcuts / Mode |
|---|---------|-------------|-----------------|------------------|
| **01** | **Reasoning** | Deductive logic & short-term verbal memory comparisons | ~2–3 mins | **Boolean XOR Sign Logic Mode** |
| **02** | **Perceptual Speed** | Error checking & rapid case-insensitive letter scanning | ~2–3 mins | **Saccadic Sweep & Subvocalization Mute** |
| **03** | **Number Speed & Accuracy** | Extreme distance identification & numerical estimation | ~2–3 mins | **Midpoint Balance Algorithm (`(Min+Max)/2`)** |
| **04** | **Word Meaning** | Vocabulary relationship matching (synonyms / antonyms) | ~2–3 mins | **Polar Opposites Filter** |
| **05** | **Spatial Visualisation** | 2D mental rotation vs mirrored glyph orientation | ~2–3 mins | **Spine & Loop Chirality Invariant Mode** |

---

## 🚀 Key Features

* **Zero External Dependencies / Zero Build Step**: 100% pure Vanilla HTML5, CSS3, and modern JavaScript. Runs directly in any web browser or via GitHub Pages.
* **Full Bilingual Support (English & Russian)**: Seamlessly toggle between English (`EN`) and Russian (`RU`) on any screen.
* **Algorithmic Training Modes**: Learn optimal cognitive shortcuts that replace multi-step mental arithmetic with single topological or parity comparisons.
* **Detailed Post-Sprint Mistake Review**: Deep analysis at the end of every timed session with filters (`Errors Only`, `All Items`, `Correct`) and step-by-step logic explanations.
* **Custom Web Audio FX**: Built-in pleasant auditory feedback using the browser Web Audio API (zero audio file assets required; toggleable on/off).
* **Adaptive Theme Support**: Dark and Light themes with seamless CSS custom properties.
* **Faithful Mouse & Click-Driven UI**: 100% mouse-operated assessment interface strictly matching official Thomas GIA desktop environment.

---

## 🏃 Running Locally

### Option A: Direct Browser Launch
Simply double-click `index.html` or open it directly in your browser:
```bash
google-chrome index.html
```

### Option B: Local Python HTTP Server
```bash
python3 -m http.server 8080
# Open http://localhost:8080 in your browser
```

---

## 📂 Project Structure

```txt
thomas-gia-trainer/
│
├── index.html                  # Main Hub & High Scores Leaderboard
├── algorithms.html             # Optimal Algorithms & Mathematical Proofs Guide
│
├── reasoning.html              # Task 1: Reasoning UI
├── reasoning.js                # Task 1: Logic Engine & XOR mode
│
├── perceptual-speed.html       # Task 2: Perceptual Speed UI
├── perceptual-speed.js         # Task 2: Letter Scanning Engine
│
├── number-speed.html           # Task 3: Number Speed UI
├── number-speed.js             # Task 3: Midpoint Dynamic Axis Engine
│
├── word-meaning.html           # Task 4: Word Meaning UI
├── word-meaning.js             # Task 4: Semantic Vocabulary Engine
│
├── spatial-visualisation.html  # Task 5: Spatial Visualisation UI
├── spatial-visualisation.js    # Task 5: Chirality Engine
│
├── trainer-core.js             # Shared Timer, Theme, i18n & Results Review Modal
├── style.css                   # Responsive Styles & Themes
├── LICENSE                     # MIT License
└── README.md                   # Project Documentation
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
