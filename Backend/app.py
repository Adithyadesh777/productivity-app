from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///productivity.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

with app.app_context():
    import models

    db.create_all()

@app.route("/")
def home():
    return "Productivity App Backend Running"

if __name__ == "__main__":
    app.run(debug=True)
