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
from scipy.signal import find_peaks
import librosa
import numpy as np
import io


app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "http://localhost:3000",
                                 "allow_headers": ["Authorization", "Content-Type"],
                                 "supports_credentials": True,
                                 "methods": ["OPTIONS", "GET", "POST"]}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rhythmi.db'
app.config['SECRET_KEY'] = 'hello'
db = SQLAlchemy(app)


#Defining Database Models for SQLite
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
    db.create_all() #Create tables

# Route to generate music based on user inputs
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

    description = f"{genre} music: {prompt}" #Prepare prompt for model
    
    try:
        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_id = decoded_token['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    
    #Send to ssh script to send to model depending on if melody conditioning is wanted
    script_command = f'python ssh_script.py --description "{genre} music: {prompt}" --user-id {user_id} --duration {duration}' 
    if file_path:
        script_command = f'python ssh_script.py --description "{genre} music: {prompt}" --user-id {user_id} --filePath "{file_path}" --duration {duration}'

    #Run ssh script
    subprocess.run(script_command, shell=True)

    #Retrieve generated song
    most_recent_song = Song.query.filter_by(user_id=user_id).order_by(desc(Song.creation_date)).first()

    if file:
        os.remove(file_path)

    if most_recent_song:
        return jsonify({'message': 'Music generated', 'song_id': most_recent_song.id, 'user_id': user_id}), 200
    else:
        return jsonify({'message': 'No song found for user'}), 404


# User registration endpoint
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


# User login endpoint
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
    
# Retrieve a specific song by user and song ID
@app.route('/get-song/<int:user_id>/<int:song_id>', methods =['GET'])
def get_song(user_id, song_id):
    song = Song.query.filter_by(user_id=user_id, id=song_id).first()
    if song:
        return Response(song.file_data, mimetype="audio/wav")
    return jsonify({'message': 'Song not found'}), 404

# Retrieve all songs for a logged-in user
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


@app.route('/get-prompt/<user_id>/<song_id>', methods =['GET'])
@cross_origin(origin='http://localhost:3000')
def get_prompt(user_id, song_id):
    song = Song.query.filter_by(user_id=user_id, id=song_id).first()

    if song:
        print(song.prompt)
        return jsonify({'prompt': song.prompt})
    else:
        return jsonify({'message': 'Song not found'}), 404 

# Delete a specific song
@app.route('/delete-song/<user_id>/<song_id>', methods=['DELETE'])
@cross_origin(origin='http://localhost:3000/librarypage')
def delete_song(user_id, song_id):
    try:
        song_to_delete = Song.query.filter_by(id=song_id, user_id=user_id).first()

        if song_to_delete:
            db.session.delete(song_to_delete)
            db.session.commit()
            return '', 200
        else:
            return 'Song not found', 404
    except Exception as e:
        print(f"Error deleting song: {e}")
        return 'Internal Server Error', 500
    
# Analyze specific features of a song
@app.route('/analyze-song/<int:userID>/<int:songID>', methods=['GET'])
def analyze_song(userID, songID):
    song = Song.query.filter_by(user_id=userID, id=songID).first()
    if not song:
        return jsonify({'message': 'Song not found'}), 404
    
    file_data = io.BytesIO(song.file_data)

    try:
        y, sr = librosa.load(file_data, sr=None)
        duration = librosa.get_duration(y=y, sr=sr)
        S = np.abs(librosa.stft(y))
        intensity = librosa.feature.rms(S=S).flatten()

        peak, trough = find_peak_and_trough(intensity, sr)

        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        tempo = round(tempo)
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)

        tonic_index = np.argmax(np.mean(chroma, axis=1))
        key_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
        tonic = key_names[tonic_index]

        return jsonify({'peak': peak, 'trough': trough, 'duration':duration, 'bpm': tempo, 'key': tonic})
    except Exception as e:
        print(f"Error analyzing song: {e}")
        return jsonify({'message': 'Error analyzing the song'}), 500

# Peaks and troughs for dynamics analysis
def find_peak_and_trough(intensity, sr):
    hop_length = 512  # Default hop length for librosa.stft, unless specified otherwise
    frame_time = hop_length / sr  # Time per frame in seconds
    
    peak_index = np.argmax(intensity)
    trough_index = np.argmin(intensity)
    
    peak_time = peak_index * frame_time
    trough_time = trough_index * frame_time
    
    peak = {'time': peak_time, 'value': intensity[peak_index]}
    trough = {'time': trough_time, 'value': intensity[trough_index]}
    
    return peak, trough

if __name__ == '__main__':
    app.run()