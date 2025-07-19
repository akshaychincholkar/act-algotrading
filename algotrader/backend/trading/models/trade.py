from django.db import models

class Trade(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='trades', null=True, blank=True)
    stock = models.CharField(max_length=50, blank=True, null=True)
    cmp = models.FloatField(blank=True, null=True)
    slp = models.FloatField(blank=True, null=True)
    sl = models.FloatField(blank=True, null=True)
    tgtp = models.FloatField(blank=True, null=True)
    tgt = models.FloatField(blank=True, null=True)
    stb_sl = models.FloatField(blank=True, null=True)
    stb_ipt = models.FloatField(blank=True, null=True)
    stb = models.FloatField(blank=True, null=True)
    sb = models.FloatField(null=True, blank=True)
    rsi = models.CharField(max_length=5, choices=[("Yes", "Yes"), ("No", "No")], blank=True, null=True)
    candle = models.CharField(max_length=20, blank=True, null=True)
    volume = models.CharField(max_length=5, choices=[("Yes", "Yes"), ("No", "No")], blank=True, null=True)
    invested = models.FloatField(blank=True, null=True)
    pl = models.CharField(max_length=6, choices=[("Profit", "Profit"), ("Loss", "Loss")], blank=True, null=True)
    percent_pl = models.FloatField(blank=True, null=True)
    booked = models.FloatField(blank=True, null=True)
    rr = models.FloatField(blank=True, null=True)
    entry_date = models.DateField(null=True, blank=True)
    exit_date = models.DateField(null=True, blank=True)
    tenure = models.IntegerField(null=True, blank=True)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Trade {self.id} - {self.stock} by {self.user.email_id} on {self.entry_date}"
