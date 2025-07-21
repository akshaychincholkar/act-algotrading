from algotrader.backend.trading.models.user import User
from algotrader.backend.trading.models.screener import Screener
class ScreenerUtils:
    @staticmethod
    def print_user_name_by_id(user_id):
        try:
            user = User.objects.get(user_id=user_id)
            print(f"User name for user_id {user_id}: {user.user_name}")
            return user
        except User.DoesNotExist:
            print(f"User with user_id {user_id} does not exist.")
            return None

    @staticmethod
    def create_dummy_screener_for_user(user):
        if not user:
            print("No user provided. Cannot create screener.")
            return None
        screener = Screener.objects.create(
            screener_name="dummy_screener",
            scan_clause="dummy_scan_clause",
            created_by=user
        )
        print(f"Created Screener: {screener.screener_name} for user {user.user_name}")
        return screener

# Example usage:
if __name__ == "__main__":
    user = ScreenerUtils.print_user_name_by_id("XV7820")
    ScreenerUtils.create_dummy_screener_for_user(user)
