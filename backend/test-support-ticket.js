const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chainsecure', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const SupportTicket = require('./models/SupportTicket');
const User = require('./models/User');

async function testTicketCreation() {
    try {
        // Find a test user
        const user = await User.findOne();
        if (!user) {
            console.error('❌ No users found. Please create a user first.');
            process.exit(1);
        }

        console.log('👤 Using user:', user.email, 'ID:', user._id);

        // Create a test ticket
        const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        const ticket = await SupportTicket.create({
            ticketId,
            userId: user._id,
            category: 'OTHER',
            subject: 'Test Support Ticket',
            message: 'This is a test ticket to verify the support system is working correctly.',
            status: 'OPEN',
            priority: 'MEDIUM',
            documents: []
        });

        console.log('✅ Ticket created successfully!');
        console.log('   Ticket ID:', ticket.ticketId);
        console.log('   Category:', ticket.category);
        console.log('   Status:', ticket.status);
        console.log('   Created At:', ticket.createdAt);

        // Verify we can find the ticket
        const foundTicket = await SupportTicket.findOne({ ticketId: ticket.ticketId })
            .populate('userId', 'name email');
        
        console.log('\n✅ Ticket retrieved successfully!');
        console.log('   User:', foundTicket.userId.name, '-', foundTicket.userId.email);
        console.log('   Subject:', foundTicket.subject);

        // Find tickets by userId
        const userTickets = await SupportTicket.find({ userId: user._id });
        console.log('\n📋 Total tickets for user:', userTickets.length);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testTicketCreation();
