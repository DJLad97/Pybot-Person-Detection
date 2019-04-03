import face_recognition
import requests
import imutils
import cv2
import collections

# Get a reference to webcam #0 (the default one)
video_capture = cv2.VideoCapture(0)

matt_image = face_recognition.load_image_file("matt.jpg")
matt_face_encoding = face_recognition.face_encodings(matt_image)[0]

shane_image = face_recognition.load_image_file("shane9.png")
shane_face_encoding = face_recognition.face_encodings(shane_image)[0]

dan_image = face_recognition.load_image_file("dan3.jpg")
dan_face_encoding = face_recognition.face_encodings(dan_image)[0]

ross_image = face_recognition.load_image_file("ross.jpg")
ross_face_encoding = face_recognition.face_encodings(ross_image)[0]



# Create arrays of known face encodings and their names
known_face_encodings = [
    ross_face_encoding,
    matt_face_encoding,
    dan_face_encoding,
    shane_face_encoding
]
known_face_names = [
    "Ross",
    "Matt",
    "Dan",
    "Shane"
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

    frame = imutils.resize(frame, width=300)
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

            # Send request to server saying the person detected is now present in the room
            r = requests.put("http://projects.danjscott.co.uk/intheroom/IsPresent?Name=" + name)
            if(r.status_code == 200):
                print(name + " is in the room")

        if(name == "Unknown"):
            detectedFaces.append("Unknown")

            # Send request to server saying the an unknown person is in the room
            r = requests.put("http://projects.danjscott.co.uk/intheroom/IsPresent?Name=Unknown")
            if(r.status_code == 200):
                unknownFaceDetected = True
                print("Unknown is in the room")
        


        # Draw a box around the face
        cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)

        # Draw a label with a name below the face
        cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
        font = cv2.FONT_HERSHEY_DUPLEX
        cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)
    

    # Check if there is any change in the detected faces
    # If a person previously detected is no longer detected send request to server saying they have left the room
    for face in previousDetectedFaces:
        if(face not in detectedFaces):
            r = requests.put("http://projects.danjscott.co.uk/intheroom/HasLeft?Name=" + face)
            if(r.status_code == 200):
                print(face + " has left the room")

    previousDetectedFaces = detectedFaces.copy()

    detectedFaces = []

    # Display the resulting image
    cv2.imshow('Video', frame)

    # Hit 'q' on the keyboard to quit!
    if cv2.waitKey(25) & 0xFF == ord('q'):
        # Empty room when exiting the app
        r = requests.put("http://projects.danjscott.co.uk/intheroom/HasLeft?Name=Dan")
        r = requests.put("http://projects.danjscott.co.uk/intheroom/HasLeft?Name=Shane")
        r = requests.put("http://projects.danjscott.co.uk/intheroom/HasLeft?Name=Matt")
        r = requests.put("http://projects.danjscott.co.uk/intheroom/HasLeft?Name=Ross")
        r = requests.put("http://projects.danjscott.co.uk/intheroom/HasLeft?Name=Unknown")
        break

# Release handle to the webcam
video_capture.release()
cv2.destroyAllWindows()
