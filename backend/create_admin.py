from app.database import SessionLocal
from app import models
from app.auth import hash_password


ADMIN_EMAIL = "admin@sportsinjury.local"
ADMIN_PASSWORD = "Admin@12345"
ADMIN_USERNAME = "System Admin"


db = SessionLocal()


try:

    existing_admin = (
        db.query(models.User)
        .filter(models.User.role == "Admin")
        .first()
    )


    if existing_admin:

        print("Admin account already exists.")
        print("Email:", existing_admin.email)

    else:

        admin = models.User(

            username=ADMIN_USERNAME,

            email=ADMIN_EMAIL,

            hashed_password=hash_password(
                ADMIN_PASSWORD
            ),

            role="Admin"

        )


        db.add(admin)

        db.commit()

        db.refresh(admin)


        print(
            "Admin account created successfully."
        )

        print(
            "Email:",
            ADMIN_EMAIL
        )

        print(
            "Password:",
            ADMIN_PASSWORD
        )


finally:

    db.close()