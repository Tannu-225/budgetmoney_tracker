from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    # expose ISO date & formatted date/time for compatibility with the front-end
    date = serializers.SerializerMethodField()
    formattedDate = serializers.SerializerMethodField()
    formattedTime = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = ['id', 'description', 'amount', 'category', 'type', 'created_at', 'date', 'formattedDate', 'formattedTime']

    def get_date(self, obj):
        return obj.created_at.isoformat()

    def get_formattedDate(self, obj):
        return obj.created_at.strftime('%b %d, %Y')  # e.g. "Jan 15, 2025"

    def get_formattedTime(self, obj):
        return obj.created_at.strftime('%I:%M %p')   # e.g. "02:30 PM"
