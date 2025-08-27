<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to My Digital Universe</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        body {
            font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.7;
            color: #3a3a3a;
            background-color: #f5f7fa;
            margin: 0;
            padding: 0;
        }

        .email-wrapper {
            max-width: 600px;
            margin: 30px auto;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
        }

        .email-header {
            background-color: #f0f0f0;
            color: #333;
            padding: 30px;
            text-align: center;
        }

        .logo-placeholder {
            width: 70px;
            height: 70px;
            background-color: white;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #333;
            font-size: 24px;
            border: 1px solid #ddd;
        }

        .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }

        .email-header p {
            margin: 10px 0 0;
            font-size: 16px;
            font-weight: 300;
        }

        .email-body {
            background-color: white;
            padding: 35px;
        }

        .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #333;
            margin-bottom: 20px;
        }

        .message {
            color: #555;
            font-size: 16px;
        }

        .message p {
            margin-bottom: 20px;
        }

        .highlight {
            background-color: #f5f5f5;
            border-left: 4px solid #777;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 0 6px 6px 0;
            font-style: italic;
        }

        .cta-button {
            display: inline-block;
            background-color: #555;
            color: white;
            padding: 12px 28px;
            margin: 20px 0;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
        }

        .signature {
            margin-top: 35px;
            padding-top: 25px;
            border-top: 1px solid #eee;
            font-size: 15px;
        }

        .name {
            font-weight: 600;
            color: #333;
            font-size: 16px;
        }

        .role {
            color: #555;
            font-weight: 500;
            margin-top: 5px;
        }

        .email-footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #888;
        }
    </style>
</head>

<body>
    <div class="email-wrapper">

        <div class="email-body">
            <div class="greeting">Hello {{ $user->name }},</div>

            <div class="message">
                <p>I'm <strong>thrilled</strong> that you've decided to explore my platform! As a solo developer turning
                    ideas into digital experiences, your presence here means everything to me.</p>

                <div class="highlight">
                    "Behind every line of code and pixel you see is one passionate entrepreneur dedicated to creating
                    something meaningful for people just like you."
                </div>

                <p>Unlike big tech companies with hundreds of developers, when you use my platform, you're directly
                    supporting an independent creator's vision. Your feedback isn't just welcomed—it's essential to how
                    this product evolves.</p>

                <p>I'm constantly working to improve your experience and develop new features based on what users like
                    you need. Every suggestion you provide helps shape the future of this platform.</p>

                <p>Have an idea, question, or just want to say hello? I personally read every message and would love to
                    hear from you!</p>
            </div>

            <div class="signature">
                <div class="name">Prince Sanguan</div>
                <div class="role">Indie Developer & Digital Creator</div>
            </div>
        </div>

        <div class="email-footer">
            <p>This email was sent to {{ $user->email }}</p>
            <p>&copy; 2025 Prince Sanguan • Developer</p>
        </div>
    </div>
</body>

</html>
