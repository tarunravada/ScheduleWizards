from google.cloud import vision
from PIL import Image
import io
import requests
import numpy as np
from sklearn.cluster import AgglomerativeClustering
import gc
import time

def get_words(resp):
    valid_words = []
    document = resp.full_text_annotation

    for page in document.pages:
        img_w = page.width
        img_h = page.height
        for block in page.blocks: 
            for para in block.paragraphs: 
                for word in para.words:
                    word = validate_word(word, img_w, img_h)
                    if word != None: valid_words.append(word)
    return valid_words

def validate_word(word, img_w, img_h):
    breaks = vision.TextAnnotation.DetectedBreak.BreakType
    line_break = [breaks.EOL_SURE_SPACE, breaks.LINE_BREAK, breaks.SURE_SPACE]
    word_break = [breaks.SPACE]
    hyphen_break = [breaks.HYPHEN]

    x1 = max(0,word.bounding_box.vertices[0].x)
    y1 = max(0,word.bounding_box.vertices[0].y)
    x2 = min(word.bounding_box.vertices[2].x, img_w)
    y2 = min(word.bounding_box.vertices[2].y, img_h)

    sbb = (x1, y1)
    ebb = (x2, y2)

    text = ''
    for symbol in word.symbols:
        text+=symbol.text
    if text == '': return None

    if word.symbols[-1].property.detected_break.type in line_break:
        break_type = 'line'
    elif word.symbols[-1].property.detected_break.type in word_break:
        break_type = 'word'
    elif word.symbols[-1].property.detected_break.type in hyphen_break:
        break_type = 'hyphen'
    else: break_type = 'none'

    return  {'text': text, 'sbb': sbb, 'ebb': ebb, 'break_type': break_type}

def assign_cluster(centroids, points):
    clusters = []
    for p in points:
        clusters.append(np.absolute(np.array(centroids)-p).argmin())
    return clusters
        
def cluster_columns(words):
    week_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    centroids = {}
    points = []

    for word in words:
        x_coord = (word['sbb'][0] + word['ebb'][0])//2
        if word['text'] in week_days: centroids[word['text']] = x_coord
        points.append(x_coord)
    
    cluster_names = list(centroids.keys())
    centroids_values = list(centroids.values())

    assignment = assign_cluster(centroids_values, points)

    clusters = []
    for i in range(len(cluster_names)):
        idx = np.where(np.array(assignment) == i)[0]
        if len(idx)>1:
            cuur_cluster = []
            for j in idx: cuur_cluster.append(words[j])
            clusters.append(cuur_cluster)
    
    return cluster_names, clusters

def sort_clusters(clusters):
    sorted_clusters = []
    for cluster in clusters:
        sorted_cluster = []
        merge_thresh = []
        points = []
        for word in cluster:
            merge_thresh.append(word['ebb'][1]-word['sbb'][1])
            points.append((word['sbb'][1],0))

        merge_thresh = np.mean(merge_thresh)//3

        clustering = AgglomerativeClustering( n_clusters=None, affinity="manhattan", 
                                        linkage="average", distance_threshold=merge_thresh)

        assignment = clustering.fit_predict(points)

        for l in np.unique(assignment):
            idx = np.where(assignment==l)[0]
            if len(idx)>0:
                elements = []
                for i in idx:
                    elements.append(cluster[i])
                elements.sort(key=lambda x: x['sbb'][0])
                sorted_cluster.append(elements)
        
        sorted_cluster.sort(key=lambda  x: x[0]['sbb'][1])
        sorted_clusters.append(parse_day(sorted_cluster))
    
    return sorted_clusters

def parse_day(day):
    text_l = []
    space_less_chars = ['-', ':']
    for row in day:
        for word in row:
            w = word['text']
            if w[0] in space_less_chars:
                text_l.pop()
            if word['break_type']=='hyphen':
                w+='-' 
            text_l.append(w)
            if w[-1] not in space_less_chars:
                text_l.append(" ")    
    text=""
    for t in text_l: text+=t
    return text

def split_events(week):
    event_split_week = []
    for day in week:
        words = day.split()
        day_name = words[0]
        all_events = words[1:]
        if len(all_events) % 9 != 0:
            print("Failed to extract some events")
            continue
        else:
            n = 9
            events = [all_events[i * n:(i + 1) * n] for i in range((len(all_events) + n - 1) // n )]
        event_split_week.append({'day': day_name, 'events': events})
    return event_split_week

def parse_time(time_str):
    t = time_str.split('-')
    start = format_time(t[0])
    end = format_time(t[1])
    return start, end

def format_time(time):
    meridiem = time[-2:].lower()
    time = time[:-2]

    if meridiem == 'am' and time[:2] == '12':
        return '00'+time[2:]
    elif meridiem == 'am':
        return time
    elif meridiem == 'pm' and time[:2] == '12':
        return time
    else:
        time = time.split(':')
        h = str(int(time[0])+12)
        return h+":"+time[1]
    
def format_events(week):
    events = []
    for d in week:
        for event in d['events']:
            day = d['day']
            course = event[0]+" "+event[1]
            loc = event[-2]+" "+event[-1]
            s_time, e_time = parse_time(""+event[4]+event[5]+event[6])
            events.append({'day': day, 'class': course, 'start_time': s_time, 'end_time': e_time, 'location': loc})
    return events

#''' ------------------------------------------------PREPROCESSING METHODS------------------------------------------------ '''
##############################################################################################################################
def get_image_bytes(content):
    if 'url' in content:
        img_bytes = requests.get(content['url']).content
    elif 'file' in content:
        img_bytes = content['file'].read()
    return img_bytes

def validate_img(img_bytes):
    width, height = Image.open(io.BytesIO(img_bytes)).size
    return (width, height)

def event_detection_helper(resp):
    words = get_words(resp)
    cluster_names, clusters = cluster_columns(words)
    sorted_clusters = sort_clusters(clusters)
    week = split_events(sorted_clusters)
    events = format_events(week)
    return events

#  ''' ------------------------------------------------MAIN METHODS------------------------------------------------ '''
##############################################################################################################################
def run_event_detection(content):
    output = None
    gc_time = None
    process_time = None

    try: img_bytes = get_image_bytes(content)
    except: return(415, "Could not open file. Please check if the uploaded file is valid", gc_time, process_time)

    try: dims = validate_img(img_bytes)
    except: return(415, "Could not validate image. Please ensure the image is of valid format ('jpg', 'png', or 'jpeg')", gc_time, process_time)

    try: client = vision.ImageAnnotatorClient()
    except: return(550, "Could not initialize OCR detection service. Please inform the developers", gc_time, process_time)

    gc_st = time.time()
    image = vision.Image(content=img_bytes)
    gc_resp = client.text_detection(image=image)
    gc_time = time.time() - gc_st
    
    if gc_resp.error.message:
        return (550,'{}\nFor more info check: https://cloud.google.com/apis/design/errors'.format(gc_resp.error.message), gc_time, process_time)
    
    try:
        process_st = time.time()
        parsed_resp = event_detection_helper(gc_resp)
        process_time = time.time() - process_st
    except: return(550, "Something Failed :/", gc_time, process_time)

    if len(parsed_resp) > 0:
        gc.collect()
        return (200, parsed_resp, gc_time, process_time)
    return (415, "Failed to detect events in the provided image", gc_time, process_time)