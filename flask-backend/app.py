import subprocess
from flask import Flask, jsonify, request, send_file, Response
from flask_cors import CORS
import os
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import cross_origin
from sqlalchemy.exc import IntegrityError
import jwt
from sqlalchemy import desc,asc
from werkzeug.utils import secure_filename



app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000",
                                 "allow_headers": ["Authorization", "Content-Type"],
                                 "supports_credentials": True}})
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
@cross_origin(origin='http://localhost:3000')
def generate_music_endpoint():
    response = jsonify({'message': 'Received prompt and genre for music generation.'})
    response.headers.add('Access-Control-Allow-Origin', '*')

    prompt = request.form.get('prompt')
    genre = request.form.get('genre')
    token = request.form.get('token')
    duration = request.form.get('duration')

    file_path = None

    file = request.files.get('file')
    if file and file.filename != '':
        filename = secure_filename(file.filename)
        file_path = os.path.join('/tmp', filename)
        file.save(file_path)

    description = f"{genre} music: {prompt}"
    
    try:
        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_id = decoded_token['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401

    script_command = f'python ssh_script.py --description "{genre} music: {prompt}" --user-id {user_id} --duration {duration}'
    if file_path:
        script_command = f'python ssh_script.py --description "{genre} music: {prompt}" --user-id {user_id} --filePath "{file_path}" --duration {duration}'

    
    subprocess.run(script_command, shell=True)

    most_recent_song = Song.query.filter_by(user_id=user_id).order_by(desc(Song.creation_date)).first()

    if file:
        os.remove(file_path)

    if most_recent_song:
        return jsonify({'message': 'Music generated', 'song_id': most_recent_song.id, 'user_id': user_id}), 200
    else:
        return jsonify({'message': 'No song found for user'}), 404



@app.route('/register', methods=['POST'])
@cross_origin(origin='http://localhost:3000')
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
@cross_origin(origin='http://localhost:3000')
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
def get_song(user_id, song_id):
    song = Song.query.filter_by(user_id=user_id, id=song_id).first()
    if song:
        return Response(song.file_data, mimetype="audio/wav")
    return jsonify({'message': 'Song not found'}), 404

@app.route('/user-songs', methods=['GET'])
@cross_origin(origin='http://localhost:3000')
def get_user_songs():

    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'Authorization header is missing'}), 401

    token = auth_header.split(" ")[1]

    try:
        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_id = decoded_token['user_id']
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({'message': 'Invalid or expired token'}), 401
    
    user_songs = Song.query.filter_by(user_id=user_id).order_by(desc(Song.creation_date)).all()
    songs_data = [{
        'id': song.id,
        'prompt': song.prompt,
        'creation_date': song.creation_date.isoformat(),
        'user_id': user_id
    }for song in user_songs]

    return jsonify(songs_data)

if __name__ == '__main__':
    app.run()