# ProtoPilot: Theoretical Project Information

## Core Concept
**ProtoPilot** is an AI-driven platform designed to automate the initial phases of the software development lifecycle, specifically requirement gathering and prototyping. Its primary goal is to convert raw meeting inputs (such as audio recordings or text notes) into structured technical documentation and live low-fidelity wireframes. This effectively bridges the gap between client discussions and technical implementation.

## Key Theoretical Workflows
1. **Input Processing**: Users can upload audio files, record live via an in-browser microphone, or paste meeting notes.
2. **Transcription**: Using OpenAI Whisper, the platform transcribes audio data into raw text.
3. **AI-Powered Requirement Extraction**: Google Gemini 2.5 Flash processes the transcripts/notes to deduce structured functional and non-functional requirements.
4. **Artifact Generation**: The platform theoretically outputs several technical artifacts:
   - **Software Requirements Specification (SRS)**: Generated in `.docx` format.
   - **Database Schema**: A relational table schema modeling the extracted requirements.
   - **REST API Specification**: Endpoints, methods, and authentication requirements for the backend.
   - **Wireframes**: Low-fidelity HTML wireframes that users can preview live.

## Technological Architecture (Theory)
- **Frontend**: A React 19 single-page application utilizing Tailwind CSS for a modern, glassmorphism-inspired UI, routing via React Router v7, and state/authentication context management.
- **Backend**: A FastAPI (Python) service that handles all REST routes, file uploads, authentication (JWT), and orchestration of AI logic (calling Whisper and Gemini).
- **Database**: MongoDB (via Motor) acting as an asynchronous document store for user and project metadata.

## How This Information is Accurate
The theoretical information presented above is highly accurate and directly grounded in the project's core documentation. Specifically, it was extracted straight from the `README.md` and foundational files within the `ProtoPilot` workspace located at `c:\Users\kirtan barot\Desktop\ProtoPilot`. These files define the exact stack (FastAPI, React, MongoDB), the AI models utilized (Whisper, Gemini), and the explicit feature set that the application aims to execute. Therefore, the theory aligns perfectly with the designed architecture and implemented roadmap of the codebase.
