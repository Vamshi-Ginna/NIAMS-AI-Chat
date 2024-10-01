import uuid
import logging
from fastapi import APIRouter, HTTPException, Request, Depends
from app.database import Database
from app.services.token_validation import validate_token

login_router = APIRouter()
logger = logging.getLogger("login_service")

# Define the group members
group_members = {
    "IRP": ["Xiantao Wang", "Vittorio Sartorelli", "Heidi Kong", "Ronnie Gladney", "Martyn Green", "Steve Brooks", "Nancy Spencer", "Hong-Wei Sun", "Luis Franco"],
    "OD": ["Valerie Green", "Liz Elliott", "Stephanie Burrows", "Colleen Dundas", "Elissa Golan"],
    "EP": ["Erik Edgerton", "Justine Buschman", "Isaah Vincent", "Jon Davis"],
    "SITB": ["Darrick Akiyama", "Christine Winchester", "Phil Waltz", "Rex Manoharan", "La’Tanya Burton", "Renee Strong", "Morrison Teague", "Rob Flowers"]
}


def match_group(given_name: str):
    # Iterate through groups and members
    for group, members in group_members.items():
        for member in members:
            member_parts = member.split(" ")
            # Check if each part of the member's name is contained in the given name
            if all(part in given_name for part in member_parts):
                logger.info("Matched user '%s' to group '%s'", given_name, group)
                return group
    
    # If no match, categorize as "Other"
    logger.info("No match found for user '%s', categorizing as 'Other'", given_name)
    return "Other"


@login_router.post("/login")
async def login(request: Request, payload: dict = Depends(validate_token)):
    try:
        oid = payload.get("oid")
        given_name = payload.get("name")

        if not oid or not given_name:
            raise HTTPException(status_code=400, detail="Invalid token: oid or name missing")

        logger.info("Login attempt with oid: %s", oid)

        db: Database = request.app.state.db

        # Check if user already exists in the database
        user_query = "SELECT user_id, name, group_name FROM Users WHERE user_id = %s"
        cursor = db.connection.cursor()
        cursor.execute(user_query, (oid,))
        user = cursor.fetchone()  

        if user:
            # User exists, check if group_name is already set
            logger.info("User found with user_id: %s", oid)
            group_name = user[2]
            if group_name:
                logger.info("User '%s' already has a group_name: '%s'", given_name, group_name)
            else:
                # Assign group_name if not already set
                group_name = match_group(given_name)
                update_query = "UPDATE Users SET group_name = %s WHERE user_id = %s"
                cursor.execute(update_query, (group_name, oid))
                db.connection.commit()
                logger.info("Assigned group '%s' to user '%s'", group_name, given_name)

            return {"message": "User logged in", "user": {"user_id": user[0], "name": given_name, "group_name": group_name}}
        else:
            # New user, insert into database and assign group_name
            group_name = match_group(given_name)
            insert_query = "INSERT INTO Users (user_id, name, group_name) VALUES (%s, %s, %s)"
            cursor.execute(insert_query, (oid, given_name, group_name))
            db.connection.commit()  # Commit the transaction
            logger.info("New user created with oid: %s and assigned group '%s'", oid, group_name)
            return {"message": "New user created", "user": {"user_id": oid, "name": given_name, "group_name": group_name}}

    except Exception as e:
        logger.error("Error during login: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()  # Close the cursor
