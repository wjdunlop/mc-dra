import json
import os
from fastapi import Body, FastAPI, Query, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
import secrets
import string

def generate_secure_string(length):
    if not isinstance(length, int) or length <= 0:
        raise ValueError("Length must be a positive integer.")

    # Generate a random string of alphanumeric characters using secrets module
    random_chars = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(length))

    return random_chars


app = FastAPI()

app.mount("/public", StaticFiles(directory="public"), name="public")
templates = Jinja2Templates(directory="views")

# Set the app secret key from the secret environment variables.
app.secret = os.environ.get("SECRET")
class FormData(BaseModel):
    txn_id: str = Field(default_factory=lambda: generate_secure_string(8))
    resource: str
    amount: int
    byWhomForWhom: str

INTAKES = []
NEEDS = []
WANTS = []

# Assuming your data model looks like this

@app.get('/')
def homepage(request: Request):
    """Displays the homepage."""
    
    return templates.TemplateResponse('index.html', {"request": request})

@app.get("/summary")
def get_summary():
    return {"intakes": INTAKES, "needs": NEEDS, 'wants': WANTS}


@app.post("/commit/intake")
def post_intake(intakes: list[FormData]):
    print(f"Processing {len(intakes)} intakes:")
    print(intakes)
    for intake in intakes:

        INTAKES.append(intake.model_dump())

    return intake


@app.post("/commit/need")
def post_need(needs: list[FormData]):
    print(f"Processing {len(needs)} Needs:")
    print(needs)
    for need in needs:

        NEEDS.append(need.model_dump())

    return need


@app.post("/commit/want")
def post_want(wants: list[FormData]):
    print(f"Processing {len(wants)} Wants:")
    print(wants)
    for want in wants:

        WANTS.append(want.model_dump())

    return want
