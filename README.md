# Algo-GPT

Created by: Jake Phelan, Jenny Jung

## Short Demo
https://github.com/user-attachments/assets/7cb87cf1-635d-4166-b5f1-979c3fd4f546

## Project Overview
Algo-GPT is a modern web application built with Next.js that provides an interactive platform for learning and practicing algorithms and data structures. The application leverages AI capabilities to help users understand complex algorithmic concepts and improve their problem-solving skills.

### Features
- Fine tuned Chatbot designed to help users understand algorithms 
- Responsive and modern user interface built with TypeScript, Tailwind CSS, and React
- Complex thread handling between frontend and backend to improve speed
- Syntax highlighting for code snippets
- Step-by-step algorithm visualization

## Development

### Project Structure
```
algo-gpt/
├── app/             # Next.js app directory
├── components/      # Reusable React components
├── lib/             # Utility functions and helpers
├── public/          # Static assets
├── styles/          # Global styles and Tailwind config
└── types/           # TypeScript type definitions
```

### Tools Used
**Next.js:** React framework for production-grade applications

**React & React DOM:** Core UI library and DOM manipulation

**TypeScript:** Type-safe JavaScript superset

**Tailwind CSS:** Utility-first CSS framework with forms plugin

**OpenAI:** AI integration for algorithm explanations

**Flask:** Handles integration between frontend and backend for slide generation and solution fetching

**Heroicons & Lucide:** Beautiful hand-crafted SVG icons

**Upstash Redis:** Rate limiting and caching

**Zod:** TypeScript-first schema validation

**Development Tools:**
- ESLint: Code quality and style checking
- PostCSS & Autoprefixer: CSS processing
- TurboPack: Next.js bundler for faster development

## Setup and Installation

1. **Clone the Repository**

```bash
git clone <repository-url>
cd algo-gpt
```

2. **Install Dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set Up Environment Variables**

Create a `.env.local` file in the root directory and add OPENAI_API_KEY along with ANTHROPIC_API_KEY.

4. **Start the backend server**
Navigate to the backend folder and run

```bash
python server.py
```

5. **Start the Development Server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. **Build for Production**

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## Usage
Once the application is running, open your web browser and navigate to http://localhost:3000. You'll be presented with the main interface where you can:

- Query a chatbot to go over leetcode questions and solutions
- View algorithm explanations and implementations
- Get AI-powered assistance
- Visualize algorithm execution

### Contributing
1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## Note
This project is under active development. Features and documentation may change frequently.
