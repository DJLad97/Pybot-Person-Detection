# Face Recognition System

### How It Works
  If a known face is found (i.e a face that the system was trained to recognise) or an unknown face, the system will send a request to our web server which will update the database and add the person that was detected the "room". Along with updating the room, when a face is detected, another request will be sent to a localhost server (which is started when the python program runs) and that localhost server will trigger the Google Home to speak and say who has entered/left the room

### Requirements
 * Python 3+
 * OpenCV 3 
 * [Face Recognition Library](https://github.com/ageitgey/face_recognition)
 * Node 9
 * [imutils](https://github.com/jrosebr1/imutils)
 
### Usage
 * `npm install`
 * `python index.py`
 
 In order for the system to recognise your face, you will have a provide a self-portrait photo.
 With that image you need to create a variable for the image, the face encodings and add the face encoding variable to the known_faces array.
 
 ```python
  person_image = face_recognition.load_image_file("person.jpg")
  person_face_encoding = face_recognition.face_encodings(person_image)[0]
  known_face_encodings = [
      person_face_encoding
  ]
```

### Alexa/Google Code

Both the files `ALEXACODEDUMP.js` & `GOOGLECODEDUMP.js` contain serverless functions that run on our Google Home and Alexa devices. When these apps are triggered by initiation command, they will send a request to our API and get the data that was asked for (e.g on Alexa, saying "ask who's in the room" will get Alexa to list out the people currently registered as in the room)
