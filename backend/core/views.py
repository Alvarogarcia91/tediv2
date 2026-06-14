from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET'])
def health_check(request):
    """
    Simple health check endpoint returning service status.
    """
    return Response(
        {
            "status": "ok",
            "service": "tedi-backend"
        },
        status=status.HTTP_200_OK
    )
