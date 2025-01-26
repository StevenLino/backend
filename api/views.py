from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from datetime import datetime
	
from firebase_admin import db

class LandingAPI(APIView):
	    
    name = 'Landing API'

    # Coloque el nombre de su colección en el Realtime Database
    collection_name = 'coleccion'

    def get(self, request):

        # Referencia a la colección
        ref = db.reference(f'{self.collection_name}')
		    
        # get: Obtiene todos los elementos de la colección
        data = ref.get()

        # Devuelve un arreglo JSON
        return Response(data, status=status.HTTP_200_OK)
    
    def post(self, request):
	        
        # Referencia a la colección
        ref = db.reference(f'{self.collection_name}')

        current_time  = datetime.now()
        custom_format = current_time.strftime("%d/%m/%Y, %I:%M:%S %p").lower().replace('am', 'a. m.').replace('pm', 'p. m.')
        request.data.update({"saved": custom_format })
	        
        # push: Guarda el objeto en la colección
        new_resource = ref.push(request.data)
	        
        # Devuelve el id del objeto guardado
        return Response({"id": new_resource.key}, status=status.HTTP_201_CREATED)
    
class LandingAPIDetail(APIView):

    name = 'Landing Detail API'

    collection_name = 'coleccion'

    def get(self, request, pk):
        # Referencia al documento con la clave 'pk'
        ref = db.reference(f'{self.collection_name}/{pk}')
        # Obtiene los datos del documento
        data = ref.get()

        if data is None:
            # Si el documento no existe, retorna un error 404
            return Response({"error": "Documento no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        # Si el documento existe, retorna los datos con el estado 200
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        # Referencia al documento con la clave 'pk'
        ref = db.reference(f'{self.collection_name}/{pk}')
        
        # Verifica si el documento existe
        if ref.get() is None:
            return Response({"error": "Documento no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # Valida que el cuerpo de la solicitud contenga datos
        if not request.data:
            return Response({"error": "El cuerpo de la solicitud está vacío"}, status=status.HTTP_400_BAD_REQUEST)

        # Actualiza el documento con los datos proporcionados
        try:
            ref.update(request.data)
            return Response({"message": "Documento actualizado exitosamente"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error al actualizar el documento: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            # Referencia al documento en la colección
            doc_ref = db.reference(f'{self.collection_name}/{pk}')
            # Intentar obtener el documento
            doc = doc_ref.get()
            
            if doc is None:
                return Response(
                    {"error": "Documento no encontrado"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Eliminar el documento
            doc_ref.delete()
            return Response(
                {"message": "Documento eliminado correctamente"},
                status=status.HTTP_204_NO_CONTENT
            )
        
        except Exception as e:
            return Response(
                {"error": f"Ocurrió un error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )