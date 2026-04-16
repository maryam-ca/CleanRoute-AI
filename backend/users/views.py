from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_testers(request):
    """Get all tester users"""
    testers = User.objects.filter(username__startswith='tester')
    data = [{'id': t.id, 'username': t.username, 'email': t.email} for t in testers]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users(request):
    """Get all users (admin only)"""
    users = User.objects.all()
    data = [{'id': u.id, 'username': u.username, 'email': u.email, 'is_staff': u.is_staff} for u in users]
    return Response(data)
