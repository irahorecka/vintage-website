# Vintage-Themed Personal Website

Welcome to the GitHub repository for [my website](https://irahorecka.com), a vintage-themed personal site showcasing my professional journey, projects, and interactive features. Built with modern technologies, this site combines functionality and nostalgia.

## Comics Portal

- Explore classic comic strips via date-based search or random browsing.
- Features include:
  - Fuzzy search with interactive suggestions.
  - Dynamic "Loading..." states for feedback.
  - Powered by a custom-built API.

## Technologies Used

- **Frontend**: React, Vite, Sass
- **Backend**: FastAPI
- **APIs**: Custom APIs for comics and other data retrieval.
- **Styling**: Retro-inspired design with dynamic interactivity.

## Environment Variables

To run this project locally, create `frontend/.env` with:

```bash
VITE_GITHUB_USERNAME=your_username_here
VITE_GITHUB_ORGS=org1,org2
VITE_GITHUB_REPOS=ownerA/repoA,ownerB/repoB
```

`VITE_GITHUB_REPOS` is used for pinned cards (first 6, in order) and for combined star/fork totals.
`VITE_GITHUB_ORGS` is optional and adds org repository totals.
No GitHub token is used.

## How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/irahorecka/vintage-website.git
   ```
2. Navigate to the project directory:
   ```bash
   cd vintage-website
   ```
3. Set up a Python virtual environment for the backend:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
6. Install frontend dependencies:
   ```bash
   npm install
   ```
7. Start the Vite development server:
   ```bash
   npm run dev
   ```
8. Access the project locally:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:8000/docs`

## License

This project is licensed under the [MIT License](LICENSE).

---

Feel free to explore the site and get in touch via the provided links!
