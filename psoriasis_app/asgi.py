"""
ASGI config for psoriasis_app project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from model.consumers import SimulationConsumer


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'psoriasis_app.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Django's ASGI application to handle traditional HTTP requests
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/simulate/", SimulationConsumer.as_asgi()),
        ])
    ),
})