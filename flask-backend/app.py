import subprocess
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import os
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import cross_origin
from sqlalchemy.exc import IntegrityError
import jwt
from sqlalchemy import desc


app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rhythmi.db'
app.config['SECRET_KEY'] = 'hello'
db = SQLAlchemy(app)
#from models import User, Song


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    songs = db.relationship('Song', backref='author', lazy=True)
    def __repr__(self):
        return f"User: {self.username}"

class Song(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    prompt = db.Column(db.String(200), nullable=False)
    creation_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    file_data = db.Column(db.LargeBinary)
    def __repr__(self):
        return f"Prompt: {self.prompt}"
    
with app.app_context():
    db.create_all()    


@app.route('/generate-music', methods=['POST'])
def generate_music_endpoint():
    response = jsonify({'message': 'Received prompt and genre for music generation.'})
    response.headers.add('Access-Control-Allow-Origin', '*')

    data = request.get_json()
    prompt = data['prompt']
    genre = data['genre']
    token = data['token']
    print(data)
    description = f"{genre} music: {prompt}"

    try:
        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_id = decoded_token['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401

    script_command = f'python ssh_script.py --description "{description}" --user-id {user_id}'
    subprocess.run(script_command, shell = True)

    most_recent_song = Song.query.filter_by(user_id=user_id).order_by(desc(Song.creation_data)).first()
    if most_recent_song:
        return jsonify({'message': 'Music generated', 'song_id': most_recent_song.id}), 200
    else:
        return jsonify({'message': 'No song found for user'}), 404




@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'message': 'User already exists'}), 409
    
    hashed_password = generate_password_hash(password)
    print("EMAIL: ", email)
    print("PASSWORD: ", password)

    new_user = User(email=email, password_hash=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}),201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'message': 'Login successful', 'token': token}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401
    

@app.route('/get-song/<int:user_id>/<int:song_id>', methods =['GET'])
def get_song(song_id):
    song = Song.query.filter_by(user_id=user_id, id=song_id).first()
    if song:
        return Reponse(song.file_data, mimetype="audio/wav")
    return jsonify({'message': 'Song not found'}), 404

if __name__ == '__main__':
    app.run()