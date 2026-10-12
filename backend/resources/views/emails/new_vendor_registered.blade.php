<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; }
        .header { background-color: #7B1F2A; color: white; padding: 10px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
        .btn { display: inline-block; background-color: #C08E3F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Vendor Registration</h2>
        </div>
        <div class="content">
            <p>Hello Admin,</p>
            <p>A new vendor has registered on Golden Promise and is awaiting setup or review.</p>
            <ul>
                <li><strong>Business Name:</strong> {{ $vendor->name }}</li>
                <li><strong>Vendor Email:</strong> {{ $vendor->user->email }}</li>
                <li><strong>WhatsApp Phone:</strong> {{ $vendor->whatsapp_phone }}</li>
                <li><strong>Subscription Tier:</strong> {{ ucfirst($requestedTier) }}{{ $requestedTier !== 'free' ? ' (Pending Stripe Payment)' : '' }}</li>
            </ul>
            <p>Please log in to the admin portal to review their details.</p>
            <a href="{{ env('ADMIN_URL', 'http://localhost:5174') }}" class="btn">Go to Admin Portal</a>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Golden Promise. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
