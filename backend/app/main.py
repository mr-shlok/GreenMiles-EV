from fastapi import FastAPI
from app.api.v1.endpoints import prediction
from app.core.database import init_db, close_db
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="EV Battery AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://localhost:*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(prediction.router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()