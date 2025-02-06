import zipfile
import os

# List of files and directories to include in the zip
files_to_zip = [
    'js',
    'html',
    'manifest.json',
    'assets'
]

# Name of the output zip file
zip_filename = 'dist.zip'

# Create a ZipFile object
with zipfile.ZipFile(zip_filename, 'w') as zipf:
    for file in files_to_zip:
        if os.path.isdir(file):
            # If the file is a directory, add all its contents
            for foldername, subfolders, filenames in os.walk(file):
                for filename in filenames:
                    file_path = os.path.join(foldername, filename)
                    zipf.write(file_path, os.path.relpath(file_path, os.path.join(file, '..')))
        else:
            # If the file is a regular file, add it to the zip
            zipf.write(file)

print(f'Created {zip_filename}')