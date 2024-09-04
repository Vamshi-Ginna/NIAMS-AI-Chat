import uuid
import logging
from fastapi import APIRouter, HTTPException, Request, Depends
from app.database import Database
from app.services.token_validation import validate_token

# Create a router for login functionality
login_router = APIRouter()
logger = logging.getLogger("login_service")

@login_router.post("/login")
async def login(request: Request, payload: dict = Depends(validate_token)):
    try:
        # Extract oid and name from the token payload
        oid = payload.get("oid")
        given_name = payload.get("name")

        if not oid or not given_name:
            raise HTTPException(status_code=400, detail="Invalid token: oid or name missing")

        logger.info("Login attempt with oid: %s", oid)

        # Get the database connection from the FastAPI app state
        db: Database = request.app.state.db

        # Check if user already exists in the database
        user_query = "SELECT user_id, name FROM Users WHERE user_id = %s"
        cursor = db.connection.cursor()
        cursor.execute(user_query, (oid,))
        user = cursor.fetchone()  # Fetch the result of the query

        if user:
            # User exists, return user info
            logger.info("User found with user_id: %s", oid)
            return {"message": "User logged in", "user": {"user_id": user[0], "name": given_name}}
        else:
            insert_query = "INSERT INTO Users (user_id, name) VALUES (%s, %s)"
            cursor.execute(insert_query, (oid, given_name))
            db.connection.commit()  # Commit the transaction
            logger.info("New user created with oid: %s", oid)
            return {"message": "New user created", "user": {"user_id": oid, "name": given_name}}

    except Exception as e:
        logger.error("Error during login: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()  # Close the cursor
