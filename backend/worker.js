const amqp = require('amqplib');
const nodemailer = require('nodemailer');

// --- 1. CONFIGURE EMAIL TRANSPORTER ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gimix141@gmail.com', 
        pass: 'dkva mcjn zuuv wctb'
    }
});

async function startWorker() {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
        const channel = await connection.createChannel();
        const queue = 'notifications';

        await channel.assertQueue(queue);

        console.log("🎧 Notification Worker is ON. Waiting for bookings...");

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                
                console.log(`\n📨 Processing email for: ${event.email}`);

                // --- 2. SEND REAL EMAIL ---
                const mailOptions = {
                    from: '"Golden Seat Cinema" <noreply@goldenseat.com>',
                    to: event.email,
                    subject: `🎟️ Booking Confirmed: ${event.movie} (Order #${event.orderId})`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                            <h2 style="color: #06b6d4;">Booking Confirmed!</h2>
                            <p>Hi <b>${event.user}</b>,</p>
                            <p>Your tickets for <strong>${event.movie}</strong> are ready.</p>
                            <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Order ID:</strong> #${event.orderId}</p>
                                <p style="margin: 5px 0;"><strong>Time:</strong> ${event.time}</p>
                                <p style="margin: 5px 0;"><strong>Seats:</strong> ${event.seats.join(', ')}</p>
                            </div>
                            <p style="font-size: 12px; color: #888;">Thank you for choosing Golden Seat.</p>
                        </div>
                    `
                };

                try {
                    await transporter.sendMail(mailOptions);
                    console.log(`✅ Email successfully sent to ${event.email}`);
                } catch (err) {
                    console.error("❌ Failed to send email:", err);
                }
                
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

startWorker();