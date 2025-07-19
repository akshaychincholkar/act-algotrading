from django.db import models


from .user import User

class UserRoi(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    total_capital = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    risk = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_risk = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    diversification = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    ipt = models.DecimalField("Investment Per Trade", max_digits=15, decimal_places=2, blank=True, null=True)
    rpt = models.DecimalField("Risk Per Trade", max_digits=15, decimal_places=2, blank=True, null=True)
    invested = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    monthly_pl = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    tax_pl = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    donation_pl = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    monthly_gain = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    monthly_percent_gain = models.DecimalField(max_digits=7, decimal_places=2, blank=True, null=True)
    total_gain = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    total_percert_gain = models.DecimalField(max_digits=7, decimal_places=2, blank=True, null=True)

    class Meta:
        verbose_name = "User ROI"
        verbose_name_plural = "User ROIs"

    def __str__(self):
        return f"ROI for {self.user}"

    class Meta:
        verbose_name = "User ROI"
        verbose_name_plural = "User ROIs"

    def __str__(self):
        return f"ROI for {self.user}"
