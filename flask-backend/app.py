import subprocess
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import os

app = Flask(__name__)
cors = CORS(app)

@app.route('/generate-music', methods=['POST'])
def generate_music_endpoint():
    response = jsonify({'message': 'Received prompt and genre for music generation.'})
    response.headers.add('Access-Control-Allow-Origin', '*')

    data = request.get_json()
    prompt = data['prompt']
    genre = data['genre']
    print(data)
    description = f"{genre} music: {prompt}"

    script_command = f'python ssh_script.py --description "{description}"'
    print(script_command)
    result = subprocess.run(script_command, shell = True)

    print(result)

    return response

@app.route('/get-audio/<filename>', methods=['GET'])
def get_audio_endpoint(filename):
    response = send_file(os.path.join('/Users/rohit/Documents/Work/cs310/Rhythmitester/flask-backend/', filename), as_attachment=True)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    app.run()