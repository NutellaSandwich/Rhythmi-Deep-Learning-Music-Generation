import paramiko
import time
import argparse
import sqlite3
import os
import sys

#Code for sending and recieving to the language model on University account batch computing

# Set up command-line argument parsing
parser = argparse.ArgumentParser()
parser.add_argument('--description', type=str, required=True)
parser.add_argument('--user-id', type=int, required=True)
parser.add_argument('--duration', type=int, required=True)
parser.add_argument('--filePath', type=str)
args = parser.parse_args()

# Extract arguments
file_path = args.filePath
description = args.description
des = description.replace(" ", "_") # Prepare the description for filename usage
user_id = args.user_id
duration = args.duration 

duration = str(duration)

# SSH and other connection parameters
hostname = 'kudu.dcs.warwick.ac.uk'  # Target hostname where the operations will be performed
username = 'u2102807'  # SSH Username
private_key_path = '/Users/rohit/.ssh/id_rsa'  # Path to the RSA private key
jump_hostname = 'remote-07.dcs.warwick.ac.uk'  # Intermediate jump server hostname

# Directories and paths on the remote server
directory_to_change = '/dcs/21/u2102807/Documents/cs310/audiocraft'
batch_script_path = 'rhythmitest.sbatch'  # Path to the batch script on the remote server
generated_filename = f'{des}.wav'  # The filename of the generated audio
command_to_run = 'sbatch --output=/dev/null rhythmitest.sbatch'  # SLURM command to run the batch job

db_path = 'instance/rhythmi.db' # Local path to the database

# Set up SSH clients and authentication
jump_ssh = paramiko.SSHClient()
jump_ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
private_key = paramiko.RSAKey(filename=private_key_path)

try:

    # Establish SSH connection through jump server
    jump_ssh.connect(jump_hostname, username=username, pkey=private_key)
    transport = jump_ssh.get_transport()
    dest_addr = (hostname, 22)
    local_addr = ('127.0.0.1', 22)  
    channel = transport.open_channel("direct-tcpip", dest_addr, local_addr)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, pkey=private_key, sock=channel)

    # Begin SFTP session to upload and manipulate files
    sftp = ssh.open_sftp()

    # Upload the local file to the remote server if specified
    if file_path and os.path.isfile(file_path):
        try:
            remote_file_path = f'/dcs/21/u2102807/Documents/cs310/{os.path.basename(file_path)}'
            sftp.put(file_path, remote_file_path)
        except Exception as e:
            sys.exit(1)

    # Read and modify the batch script remotely
    with sftp.file(f'{directory_to_change}/{batch_script_path}', 'r') as remote_file:
        batch_script_content = remote_file.read()

    description_bytes = f'{description}'.encode('utf-8')
    duration_bytes = duration.encode('utf-8')
    if file_path:
        remote_file_path_bytes = remote_file_path.encode('utf-8')
    batch_script_content = batch_script_content.replace(b'REPLACE', description_bytes)
    batch_script_content = batch_script_content.replace(b'REPLAC', duration_bytes)

    if file_path:
        batch_script_content = batch_script_content.replace(b'REPLA', remote_file_path_bytes)

    with sftp.file(f'{directory_to_change}/{batch_script_path}','w') as remote_file:
        remote_file.write(batch_script_content)

    # Execute the modified batch script on the remote server
    cd_command = f'cd {directory_to_change}; {command_to_run}'
    stdin, stdout, stderr = ssh.exec_command(cd_command)

    if stdout.channel.recv_exit_status() == 0:
        # Check for generated audio file and insert into database
        remote_wav_path = f'{directory_to_change}/{generated_filename}'

        while True:
            try:

                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()

                file_data = sftp.file(remote_wav_path, 'rb').read()

                insert_query = """
                INSERT INTO song (user_id, prompt, file_data, creation_date)
                VALUES (?,?,?,CURRENT_TIMESTAMP)
                """
                cursor.execute(insert_query, [user_id, des, sqlite3.Binary(file_data)])

                conn.commit()
                conn.close()
                break
            except IOError:
                print('File not yet available. Waiting...')
                time.sleep(5) 

        # Clean up by resetting script content and removing remote files
        batch_script_content = batch_script_content.replace(description_bytes, b'REPLACE')
        batch_script_content = batch_script_content.replace(duration_bytes, b'REPLAC')
        if file_path:
            batch_script_content = batch_script_content.replace(remote_file_path_bytes, b'REPLA')

        with sftp.file(f'{directory_to_change}/{batch_script_path}', 'w') as remote_file:
            remote_file.write(batch_script_content)
        
        ssh.exec_command(f'rm {remote_wav_path}')
        if file_path:
            sftp.remove(remote_file_path)
        sftp.close()
        
    else:
        print('Command execution failed. Check the command or script for errors.')

except paramiko.AuthenticationException:
    print("Authentication failed. Please check your credentials.")
except paramiko.SSHException as e:
    print(f"SSH connection failed: {e}")
finally:
    ssh.close()
    jump_ssh.close()