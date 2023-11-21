import paramiko
import time
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--description', type=str, required=True)
args = parser.parse_args()



description = args.description
des = description[:15].replace(" ", "_")

hostname = 'kudu.dcs.warwick.ac.uk'
username = 'u2102807'
private_key_path = '/Users/rohit/.ssh/id_rsa'

directory_to_change = '/dcs/21/u2102807/Documents/cs310/audiocraft'
batch_script_path = 'rhythmitest.sbatch'
generated_filename = f'{des}.wav'
command_to_run = 'sbatch --output=/dev/null rhythmitest.sbatch'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:

    private_key = paramiko.RSAKey(filename = private_key_path)
    ssh.connect(hostname, username=username, pkey=private_key)


    sftp = ssh.open_sftp()
    with sftp.file(f'{directory_to_change}/{batch_script_path}', 'r') as remote_file:
        batch_script_content = remote_file.read()

    description_bytes = f'{description}'.encode('utf-8')
    batch_script_content = batch_script_content.replace(b'REPLACE', description_bytes)

    with sftp.file(f'{directory_to_change}/{batch_script_path}','w') as remote_file:
        remote_file.write(batch_script_content)

    cd_command = f'cd {directory_to_change}; {command_to_run}'
    stdin, stdout, stderr = ssh.exec_command(cd_command)

    if stdout.channel.recv_exit_status() == 0:
        # Download the generated WAV file
        remote_wav_path = f'{directory_to_change}/{generated_filename}'

        while True:
            try:
                sftp.get(remote_wav_path, generated_filename)
                break
            except IOError:
                print('File not yet available. Waiting...')
                time.sleep(5)  # Adjust the delay as needed (e.g., every 5 seconds)


        batch_script_content = batch_script_content.replace(description_bytes, b'REPLACE')

        with sftp.file(f'{directory_to_change}/{batch_script_path}', 'w') as remote_file:
            remote_file.write(batch_script_content)
        
        ssh.exec_command(f'rm {remote_wav_path}')
        sftp.close()
        
    else:
        print('Command execution failed. Check the command or script for errors.')

except paramiko.AuthenticationException:
    print("Authentication failed. Please check your credentials.")
except paramiko.SSHException as e:
    print(f"SSH connection failed: {e}")
finally:
    ssh.close()