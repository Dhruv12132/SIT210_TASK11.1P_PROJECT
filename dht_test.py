import time
import board
import adafruit_dht

dht = adafruit_dht.DHT22(board.D4)

while True:
    try:
        temperature = dht.temperature
        humidity = dht.humidity

        print("----------------------")
        print("Temperature:", temperature, "°C")
        print("Humidity:", humidity, "%")

    except RuntimeError as error:
        print("Reading error:", error)

    time.sleep(2)
