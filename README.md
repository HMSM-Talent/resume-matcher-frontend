# Resume Matcher Frontend

A modern web application that helps job seekers match their resumes with job descriptions and assists companies in finding the best candidates. Built with React, Vite, and modern web technologies.

## Features

- **For Job Seekers:**
  - Upload and manage resumes
  - Search for matching job descriptions
  - View application history
  - Track application status
  - Get similarity scores for job matches

- **For Companies:**
  - Upload job descriptions
  - View candidate applications
  - Review and provide feedback
  - Track job posting history
  - Export application data

## Tech Stack

- React 18
- Vite
- React Router v6
- Axios for API calls
- Modern CSS with custom styling
- Environment-based configuration

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API server running (see backend repository for setup)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/resume-matcher-frontend.git
   cd resume-matcher-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
resume-matcher-frontend/
├── src/
│   ├── api/          # API integration
│   ├── components/   # Reusable components
│   ├── contexts/     # React contexts
│   ├── pages/        # Page components
│   └── styles/       # CSS styles
├── public/           # Static assets
└── ...
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:8000/api)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
