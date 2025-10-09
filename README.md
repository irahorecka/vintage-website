# Vintage-Themed Personal Website

Welcome to the GitHub repository for [my website](https://irahorecka.com), a vintage-themed personal site showcasing my professional journey, projects, and interactive features. Built with modern technologies, this site combines functionality and nostalgia.

## Features

### 1. **Home**

- Introduction with a quote and personal details.
- Overview of my background as a molecular biologist, protein chemist, and bioinformatician pursuing a PhD in computational biology.
- Interactive protein explorer powered by the RCSB Protein Data Bank, allowing users to search and view 3D protein structures.

### 3. **Abstract Syntax Tree (AST)**

- Delve into the structural representation of code.
- Features include:
  - Tree traversal and manipulation techniques.
  - Tools for analyzing and transforming codebases.
  - Applications in linters, compilers, and transpilers.

### 4. **Projects**

- Showcases my coding projects with links to GitHub repositories.
- Highlights:
  - **pycraigslist**: Craigslist API wrapper.
  - **comics**: GoComics API wrapper.
  - **youtube2audio**: GUI for downloading annotated YouTube videos as MP3s/MP4s.
  - Other API wrappers and visual tools.

### 5. **Sidebar**

- Navigation links: Home, AST, and Projects.
- External profiles in a vintage dropdown menu (LinkedIn, GitHub, Google Scholar, etc.).

## Technologies Used

- **Frontend**: React, Vite, Sass
- **Backend**: FastAPI
- **Styling**: Retro-inspired design with dynamic interactivity.

## Environment Variables

To run this project locally, you must create a `.env` file in the root directory with the following variables:

```bash
VITE_GITHUB_USERNAME=your_username_here
VITE_GITHUB_TOKEN=your_token_here
```

Ensure you replace `your_token_here` with your actual GitHub token.

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
