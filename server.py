import json
import os
import sqlite3
from fastapi import Body, FastAPI, Query, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# app = FastAPI(__name__, static_folder='public', template_folder='views')

app = FastAPI()

app.mount("/public", StaticFiles(directory="public"), name="public")
templates = Jinja2Templates(directory="views")

# Set the app secret key from the secret environment variables.
app.secret = os.environ.get('SECRET')

# Dream database. Store dreams in memory for now. 
INTAKES = []
NEEDS = []
WANTS = []

@app.get('/')
def homepage(request: Request):
    """Displays the homepage."""
    
    return templates.TemplateResponse('index.html', {"request": request})

@app.post('/intake')
def post_intakes(intake: str = Query(..., title="Intake", description="Intake")):

    print("Intaking:")
    print(intake)

    INTAKES.append(intake)
    return json.dumps(INTAKES)
  
@app.get('/intake')
def get_intakes():
    return json.dumps(INTAKES)

if __name__ == '__main__':
    app.run()