import face_recognition
import requests
import imutils
import cv2
import collections

# This is a super simple (but slow) example of running face recognition on live video from your webcam.
# There's a second example that's a little more complicated but runs faster.

# PLEASE NOTE: This example requires OpenCV (the `cv2` library) to be installed only to read from your webcam.
# OpenCV is *not* required to use the face_recognition library. It's only required if you want to run this
# specific demo. If you have trouble installing it, try any of the other demos that don't require it instead.

# Get a reference to webcam #0 (the default one)
video_capture = cv2.VideoCapture(0)

# Load a sample picture and learn how to recognize it.
# obama_image = face_recognition.load_image_file("obama.jpg")
# obama_face_encoding = face_recognition.face_encodings(obama_image)[0]

matt_image = face_recognition.load_image_file("matt.jpg")
matt_face_encoding = face_recognition.face_encodings(matt_image)[0]

dan_image = face_recognition.load_image_file("dan3.jpg")
dan_face_encoding = face_recognition.face_encodings(dan_image)[0]

# Load a second sample picture and learn how to recognize it.
# biden_image = face_recognition.load_image_file("biden.jpg")
# biden_face_encoding = face_recognition.face_encodings(biden_image)[0]

ross_image = face_recognition.load_image_file("ross.jpg")
ross_face_encoding = face_recognition.face_encodings(ross_image)[0]



# Create arrays of known face encodings and their names
known_face_encodings = [
    ross_face_encoding,
    matt_face_encoding
    # dan_face_encoding
]
known_face_names = [
    "Ross",
    "Matt",
    "Dan"
]

test_list = [
    "Ross",
    "Matt"
]

detectedFaces = []
previousDetectedFaces = []

while True:
    # Grab a single frame of video
    ret, frame = video_capture.read()

    frame = imutils.resize(frame, width=600)
    # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
    rgb_frame = frame[:, :, ::-1]
    # Find all the faces and face enqcodings in the frame of video
    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

    sendRequest = True
    requestSent = False
    # Loop through each face in this frame of video
    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        # See if the face is a match for the known face(s)
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding)

        name = "Unknown"

        # If a match was found in known_face_encodings, just use the first one.
        if True in matches:
            first_match_index = matches.index(True)
            name = known_face_names[first_match_index]
            detectedFaces.append(name)
            r = requests.put("http://pybot-api-pybot-api.1d35.starter-us-east-1.openshiftapps.com/intheroom/IsPresent?Name=" + name)
            if(r.status_code == 200):
                print(name + " is in the room")
            # r = requests.get('https://www.google.co.uk')
            # if(r.status_code == 200 and sendRequest):
            #     print("request sent to server")
            #     sendRequest = False

        if(name == "Unknown"):
            r = requests.put("http://pybot-api-pybot-api.1d35.starter-us-east-1.openshiftapps.com/intheroom/IsPresent?Name=Unknown")
            # print("unknown found")
            detectedFaces.append("Unknown")
            if(r.status_code == 200):
                print("Unknown is in the room")
        


        # Draw a box around the face
        cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)

        # Draw a label with a name below the face
        cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
        font = cv2.FONT_HERSHEY_DUPLEX
        cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)
    
    print(detectedFaces)

    for face in previousDetectedFaces:
        if(face not in detectedFaces):
            r = requests.put("http://pybot-api-pybot-api.1d35.starter-us-east-1.openshiftapps.com/intheroom/HasLeft?Name=" + face)
            if(r.status_code == 200):
                print(face + " has left the room")

    previousDetectedFaces = detectedFaces.copy()

    # print(previousDetectedFace)
    detectedFaces = []

    # Display the resulting image
    cv2.imshow('Video', frame)

    # Hit 'q' on the keyboard to quit!
    if cv2.waitKey(25) & 0xFF == ord('q'):
        break

# Release handle to the webcam
video_capture.release()
cv2.destroyAllWindows()

def sendRequestToServer():
    sendRequestToServer.func_code = (lambda:None).func_code
