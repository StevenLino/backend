from django.shortcuts import render

# Create your views here.
# from django.http import HttpResponse

import requests
import json
# Importe el decorador login_required
from django.contrib.auth.decorators import login_required, permission_required

from collections import Counter
from datetime import datetime

# Restricción de acceso con @login_required
@login_required
@permission_required('main.index_viewer', raise_exception=True)
def index(request):
    # Arme el endpoint del REST API
    current_url = request.build_absolute_uri()
    url = current_url + '/api/v1/landing'

    # Petición al REST API
    response_http = requests.get(url)
    response_dict = json.loads(response_http.content)

    print("Endpoint ", url)
    print("Response ", response_dict)

    # Respuestas totales
    total_responses = len(response_dict.keys())

    # Valores de la respuesta
    responses = response_dict.values()

    # Obtener el primer elemento del JSON
    first_key = next(iter(response_dict))
    first_email = response_dict[first_key]["email"]

    # Dividir el correo electrónico en dos partes usando '@'
    first_response = first_email.split('@')[0]

    #Obteniendo la última respuesta
    last_key = next(reversed(response_dict))
    last_email = response_dict[last_key]["email"]
    last_response = last_email.split('@')[0]

    # Contador para almacenar la cantidad de respuestas por día
    date_counter = Counter()

    for entry in response_dict.values():
        saved_date = entry.get("saved", "")  # Obtener la fecha guardada
        if saved_date:
            date_part = saved_date.split(",")[0]  # Extraer solo la fecha
            date_counter[date_part] += 1

    # Encontrar el día con más respuestas
    most_common_date, max_responses = date_counter.most_common(1)[0] if date_counter else ("No data", 0)

    # Objeto con los datos a renderizar
    data = {
        'title': 'Landing - Dashboard',
        'total_responses': total_responses,
        'responses': responses,
        'first_response': first_response,
        'last_response': last_response,
        'most_common_date': most_common_date,
        'max_responses': max_responses,
    }

    # Renderización en la plantilla
    return render(request, 'main/index.html', data)