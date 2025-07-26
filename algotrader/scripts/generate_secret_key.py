#!/usr/bin/env python3
"""
Django Secret Key Generator
Generates a secure SECRET_KEY for Django applications
"""

import secrets
import string

def generate_secret_key(length=50):
    """Generate a secure Django SECRET_KEY"""
    # Use all printable ASCII characters except space
    chars = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
    return ''.join(secrets.choice(chars) for _ in range(length))

def generate_multiple_keys(count=3):
    """Generate multiple secret keys for different environments"""
    print("🔐 Django Secret Key Generator")
    print("=" * 50)
    
    for i in range(count):
        key = generate_secret_key()
        print(f"\nSecret Key {i+1}:")
        print(f"SECRET_KEY={key}")
    
    print("\n" + "=" * 50)
    print("⚠️  IMPORTANT SECURITY NOTES:")
    print("1. Use different keys for development, staging, and production")
    print("2. Never commit secret keys to version control")
    print("3. Store production keys in environment variables")
    print("4. Keys should be exactly 50 characters long")
    print("5. Change keys if they are ever compromised")

if __name__ == "__main__":
    generate_multiple_keys()
