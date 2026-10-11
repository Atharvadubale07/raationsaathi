@echo off
echo ========================================================
echo Launching RationSaathi Fullstack Application
echo ========================================================
start "RationSaathi Backend" cmd /c "run_backend.bat"
start "RationSaathi Frontend" cmd /c "run_frontend.bat"
echo Both servers started!
echo Frontend will be accessible at: http://localhost:5173
echo Backend API docs available at: http://127.0.0.1:8000/docs
