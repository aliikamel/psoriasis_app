from channels.generic.websocket import AsyncWebsocketConsumer
import json


class SimulationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Attempting to connect")
        self.group_name = "simulation_group"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        print("Connected!")

    async def disconnect(self, close_code):
        print("Disconnecting")
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def send_progress(self, event):
        # Directly send the event's message as JSON
        print("Sending message:", event['message'])
        await self.send(text_data=json.dumps(event['message']))

