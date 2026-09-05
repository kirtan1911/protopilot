# How to Run ProtoPilot

To run the ProtoPilot project locally on your machine, you need to run the **Backend** and the **Frontend** simultaneously in two separate terminal windows.

## Terminal 1: Starting the Backend

1. Open a terminal and navigate to the project root directory (`ProtoPilot`).
2. Go to the `app/backend` directory:
   ```powershell
   cd app\backend
   ```
3. Activate the virtual environment:
   ```powershell
   .\.venv\Scripts\activate
   ```
4. Start the FastAPI server:
   ```powershell
   uvicorn server:app --reload --port 8000
   ```
   *The backend will now be running on [http://localhost:8000](http://localhost:8000).*

---

## Terminal 2: Starting the Frontend

1. Open a **new** terminal window and navigate to the project root directory (`ProtoPilot`).
2. Go to the `app/frontend` directory:
   ```powershell
   cd app\frontend
   ```
3. Start the React development server:
   ```powershell
   yarn start
   ```
   *The frontend will open automatically in your browser at [http://localhost:3000](http://localhost:3000).*

---

> **Note on Dependencies:** If this is your first time setting up the project, make sure you run `pip install -r requirements.txt` in the backend (while the virtual environment is activated) and `yarn install` in the frontend before starting the servers.
