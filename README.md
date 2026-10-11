<<<<<<< HEAD
# MAKEPDF — Powerful PDF Tools. Made Simple.

> Modern, futuristic **Orange and Black** PDF utility web application built with Python 3.11+, Flask, PostgreSQL, and Jinja2 templates.

---

## 🎨 Theme & Branding
- **Theme**: Futuristic Obsidian Black & Neon Orange (`#0a0a0e`, `#121218`, `#ff6b00`, `#ff851a`)
- **Tagline**: *"Powerful PDF Tools. Made Simple."*
- **Primary Tools Planned**:
  1. JPG to PDF
  2. Merge PDF
  3. Split PDF
  4. Compress PDF
  5. PDF to JPG
  6. Rotate PDF
  7. Watermark PDF
  8. Delete PDF pages
  9. Reorder PDF pages

---

## 📁 Project Structure (Phase 1)

```
MAKEPDF/
├── app/
│   ├── __init__.py          # Flask Application Factory
│   ├── config.py            # Environment & app configurations
│   ├── routes/
│   │   ├── __init__.py
│   │   └── main.py          # Home, tools index, and /api/health route
│   ├── templates/
│   │   ├── base.html        # Futuristic Orange/Black base template
│   │   ├── index.html       # Hero, 3D visual & tools grid
│   │   └── tools.html       # All tools directory
│   └── static/
│       ├── css/
│       │   └── style.css    # Premium Orange & Black CSS styles
│       └── js/
│           └── main.js      # Vanilla JavaScript navigation & health ping
├── tests/
│   └── test_basic.py        # Pytest test suite for Phase 1
├── uploads/                 # Temporary upload staging (created at startup)
├── outputs/                 # Output processed PDFs (created at startup)
├── .env.example             # Template for environment variables
├── requirements.txt         # Python dependencies
├── run.py                   # Development entry point
└── README.md                # Documentation & instructions
```

---

## 🚀 Phase 1: Local Setup & Running Commands

### 1. Create a Python Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
```

### 2. Install Required Dependencies
```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env
```

### 4. Run the Flask Development Server
```bash
python run.py
```
Server runs at `http://127.0.0.1:5000`.

### 5. Run the Tests
```bash
pytest tests/
```

---

## 🧪 Testing Phase 1 Features
- Open `http://127.0.0.1:5000/` in your browser to verify the Orange & Black hero page.
- Test `http://127.0.0.1:5000/tools` to see all utility cards.
- Visit `http://127.0.0.1:5000/api/health` to confirm the backend health JSON response.
=======
# MAKEPDF-
**MAKEPDF** is a fast, secure, and modern PDF utility suite that lets users merge, split, compress, convert, watermark, protect, and inspect PDF files. It also supports JPG and Word document conversions, with a focus on a smooth, user-friendly experience and client-side file processing wherever supported.
>>>>>>> f8dfd4ae82bb8b47b202cc36b33a0a87e430b50a
