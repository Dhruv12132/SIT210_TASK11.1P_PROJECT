from gpiozero import OutputDevice
from time import sleep

# Relay connected to GPIO 27
relay = OutputDevice(27, active_high=True, initial_value=False)

try:
    print("Turning fan ON...")
    relay.on()

    while True:
        sleep(1)

except KeyboardInterrupt:
    print("Stopping...")

finally:
    relay.off()
    relay.close()
