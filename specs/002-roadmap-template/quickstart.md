# Quickstart: Course Roadmap Template

This guide explains how to spin up the Course Roadmap Rendering template, powered by React (Vite) and Tailwind CSS, to display your custom roadmap JSON.

## 1. Setup

Clone the repository and install dependencies:
```bash
npm install
```

## 2. Define Your Data

Locate the `src/data/course-roadmap.json` file. Update it to match the v2 schema defined in `contracts/course-schema.json`.

Example:
```json
{
  "roadmap": {
    "id": "intro-web",
    "title": "Intro to Web Dev",
    "phases": [
      {
        "id": "phase-1",
        "name": "Foundations",
        "topics": [
          { "id": "html", "name": "HTML5" },
          { "id": "css", "name": "CSS3" }
        ]
      }
    ],
    "topic_graph": [
      { "from": "html", "to": "css", "type": "required" }
    ]
  }
}
```

## 3. Run Locally

Start the Vite development server:
```bash
npm run dev
```

Your interactive roadmap will be available at `http://localhost:5173`. 
The nodes and connections will automatically render based on the `x` and `y` coordinates defined in your JSON, styled with utility classes from Tailwind CSS.
