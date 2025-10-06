from django.contrib import admin
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'description', 'type', 'amount', 'category', 'created_at')
    search_fields = ('description', 'category')
    list_filter = ('type', 'category')