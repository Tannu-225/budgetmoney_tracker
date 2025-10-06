from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet
from django.urls import path, include
from . import views

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('api/', include(router.urls)),
    path('', views.index, name='index'),  # serves the main HTML page
    path('transactions/', views.transactions_view, name='transactions'),
    path('charts/', views.charts_view, name='charts'),
    path('logout/', views.logout_view, name='logout'),
]    