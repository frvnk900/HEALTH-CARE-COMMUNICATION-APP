import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def generate_otp(length=6):
    """Generate a random numeric OTP of a given length."""
    digits = string.digits
    otp = ''.join(random.choice(digits) for _ in range(length))
    return otp

def send_email(receiver_email, otp_code, sender_email, sender_password):
    """Send the OTP code via email."""
    # Create email message
    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = receiver_email
    message['Subject'] = "Your Verification Code"

    body = f"Your OTP verification code is: {otp_code}\nThis code is valid for a single use."
    message.attach(MIMEText(body, 'plain'))

    try:
        # Connect to Gmail SMTP server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(message)
        server.quit()
        print(f"OTP sent successfully to {receiver_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

def verify_code():
    """Function to send the code and compare user input."""
    sender_email = "frvnkkwizigira@gmail.com"
    receiver_email = "ndizeyenoriega@gmail.com"
    sender_password = "gsgwmlkkdiipnqjx"  # Use app password for Gmail

    verification_code = generate_otp()
    send_email(receiver_email, verification_code, sender_email, sender_password)

    user_input_code = input("Enter the 6-digit code you received: ")

    if user_input_code == verification_code:
        print("Code successfully verified. Access granted!")
    else:
        print("Invalid code. Access denied.")

if __name__ == "__main__":
    verify_code()
