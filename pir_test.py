from gpiozero import MotionSensor
from signal import pause

pir = MotionSensor(17)

print("PIR Sensor Testing Started")
print("Waiting for motion...")

def motion_detected():
    print("Motion Detected!")

def no_motion():
    print("No Motion Detected!")

pir.when_motion = motion_detected
pir.when_no_motion = no_motion

pause()
