from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Transaction
from .serializers import TransactionSerializer
from rest_framework.decorators import action
from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import generics
from django.utils import timezone
from datetime import timedelta

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    lookup_field = 'id'   # because id is a CharField primary key

    def get_queryset(self):
        qs = super().get_queryset()
        ttype = self.request.query_params.get('type')
        category = self.request.query_params.get('category')
        if ttype in ['credit', 'debit']:
            qs = qs.filter(type=ttype)
        if category and category != 'all':
            qs = qs.filter(category=category)
        # optional: order by created_at desc
        return qs.order_by('-created_at')
    
def index(request):
    return render(request, 'expenses/index.html')
    

def transactions_view(request):
    return render(request, 'expenses/transactions.html')

def charts_view(request):
    return render(request, 'expenses/charts.html')

def logout_view(request):
    # Example: clear session & redirect to login
    from django.shortcuts import redirect
    from django.contrib.auth import logout
    logout(request)
    return redirect('login')  # Make sure 'login' exists in urls.py