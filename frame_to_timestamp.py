import os
import glob
import argparse
import re
import shutil

# Convert time string to seconds
def time_to_seconds(time_str):
    h, m, s = map(float, time_str.replace('_', ':').split(':'))
    return h * 3600 + m * 60 + s

# Convert frames to seconds
def frame_to_seconds(frame, frame_rate=24):
    return frame / frame_rate

# Format seconds to HH:MM:SS,sss
def format_seconds(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h:02}_{m:02}_{s:06.3f}".replace(',', '.')

# Process timestamps and frames in file content
def process_timestamps_and_frames(file_content):
    lines = file_content.strip().split('\n')
    results = []
    
    for line in lines:
        if re.match(r'^\d{2}:\d{2}:\d{2}\.\d{3}', line):
            timestamps = line.split(',')
            start_time = format_seconds(time_to_seconds(timestamps[0].strip().replace('_', ':')))
            end_time = format_seconds(time_to_seconds(timestamps[1].strip().replace('_', ':')))
            results.append((start_time, end_time))
        elif re.match(r'^\d+', line):
            frames = line.split(',')
            frame_start = format_seconds(frame_to_seconds(int(frames[0].strip())))
            frame_end = format_seconds(frame_to_seconds(int(frames[1].strip())))
            results.append((frame_start, frame_end))
    
    return results

# Process single file
def process_file(file_path, output_dir):
    with open(file_path, 'r') as file:
        content = file.read()
    converted_times = process_timestamps_and_frames(content)
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    output_file = os.path.join(output_dir, os.path.basename(file_path))
    with open(output_file, 'w') as out_file:
        for start, end in converted_times:
            out_file.write(f"{start}, {end}\n")

# Process input directory or single file
def process_input(input_path, option):
    if os.path.isfile(input_path):
        if option == 'shots' or option == 'both':
            output_dir = os.path.dirname(input_path) + '_converted'
            process_file(input_path, output_dir)
        elif option == 'keyframes':
            process_keyframes_file(input_path, os.path.dirname(input_path) + '_converted')
    elif os.path.isdir(input_path):
        if option == 'shots' or option == 'both':
            output_dir = input_path + '_converted'
            files = glob.glob(os.path.join(input_path, '*.txt'))
            for file in files:
                process_file(file, output_dir)
        if option == 'keyframes' or option == 'both':
            output_dir = os.path.join(os.path.dirname(input_path), 'keyframes_converted')
            process_keyframes_folder(input_path, output_dir)
    else:
        print(f"Error: {input_path} is not a valid file or directory.")

# Process keyframes for filenames
def process_keyframes_file(file_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    file_name = os.path.basename(file_path)
    match_frame = re.match(r'(.+)_start_(\d+)\.jpg', file_name)
    match_time = re.match(r'(.+)_start_(\d{2}:\d{2}:\d{2}\.\d{3})\.jpg', file_name)
    
    if match_frame:
        video_name, frame = match_frame.groups()
        seconds = format_seconds(frame_to_seconds(int(frame)))
        new_file_name = f"{video_name}_start_{seconds}.jpg"
    elif match_time:
        new_file_name = file_name.replace(':', '_')
    else:
        new_file_name = file_name
    
    shutil.copy(file_path, os.path.join(output_dir, new_file_name))

# Process keyframes for folder
def process_keyframes_folder(input_path, output_path):
    for root, dirs, files in os.walk(input_path):
        for file in files:
            relative_path = os.path.relpath(root, input_path)
            target_dir = os.path.join(output_path, relative_path)
            if not os.path.exists(target_dir):
                os.makedirs(target_dir)
            process_keyframes_file(os.path.join(root, file), target_dir)

# Replace slashes in filenames in keyframes_converted folder
def replace_slashes_in_filenames(folder_path):
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            new_file = file.replace('/', '_')
            if new_file != file:
                os.rename(os.path.join(root, file), os.path.join(root, new_file))

# Rename files to format 00100_Scene-1
def rename_files_to_scene_format(folder_path):
    for root, dirs, files in os.walk(folder_path):
        valid_files = [file for file in files if '_start_' in file]
        files_sorted = sorted(valid_files, key=lambda x: time_to_seconds(x.split('_start_')[1].replace('_', ':').replace('.jpg', '')))
        for idx, file in enumerate(files_sorted):
            base_name = file[:5]
            new_file = f"{base_name}_Scene-{idx+1}.jpg"
            os.rename(os.path.join(root, file), os.path.join(root, new_file))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert frames to seconds in timestamps or filenames.")
    parser.add_argument('input_path', nargs='?', default=None, help="Path to the input file or directory containing .txt files or keyframe images.")
    parser.add_argument('-s', '--shots', action='store_true', help="Process shot boundaries.")
    parser.add_argument('-k', '--keyframes', action='store_true', help="Process keyframes.")
    parser.add_argument('-f', '--folder', default=None, help="Folder containing 'keyframes' and 'shot_boundaries' directories.")
    parser.add_argument('-r', '--rename', action='store_true', help="Rename files to scene format. (execute after initial conversion)")

    args = parser.parse_args()
    option = 'both'
    if args.shots:
        option = 'shots'
    elif args.keyframes:
        option = 'keyframes'
    
    if args.folder:
        if not os.path.isdir(args.folder):
            print(f"Error: {args.folder} is not a valid directory.")
        else:
            process_input(os.path.join(args.folder, 'shot_boundaries'), 'shots')
            process_input(os.path.join(args.folder, 'keyframes'), 'keyframes')
            replace_slashes_in_filenames(os.path.join(args.folder, 'keyframes_converted'))
            if args.rename:
                rename_files_to_scene_format(os.path.join(args.folder, 'keyframes_converted'))
    elif args.input_path:
        process_input(args.input_path, option)
        if option == 'keyframes' or option == 'both':
            replace_slashes_in_filenames(os.path.join(os.path.dirname(args.input_path), 'keyframes_converted'))
            if args.rename:
                rename_files_to_scene_format(os.path.join(os.path.dirname(args.input_path), 'keyframes_converted'))
    else:
        process_input('shot_boundaries', 'shots')
        process_input('keyframes', 'keyframes')
        replace_slashes_in_filenames('keyframes_converted')
        if args.rename:
            rename_files_to_scene_format('keyframes_converted')
