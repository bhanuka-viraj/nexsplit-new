import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';
import { Transaction } from '../models/transaction.model';
import { env } from '../config/env';

const seedDatabase = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Using database:', mongoose.connection.name);
    console.log('Connected to MongoDB');

    // 1. Ensure the Main User Exists
    const mainUserData = {
      googleId: "114823646272051459315",
      email: "bhanukaviraj22@gmail.com",
      name: "Bhanuka Viraj",
      avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocKawJ-n-mn2ABYMjyX4Uq5cW_cFA21u5oWFbLOoKhAhfSN-fa1l=s96-c",
      monthlyLimit: 2000,
      currency: "USD"
    };

    let mainUser = await User.findOne({ email: mainUserData.email });
    if (mainUser) {
      console.log('Main user already exists, updating...');
      Object.assign(mainUser, mainUserData);
      await mainUser.save();
    } else {
      console.log('Creating main user...');
      mainUser = await User.create(mainUserData);
    }

    // 2. Create Dummy Friends
    const friendsData = [
      { name: 'Alice Smith', email: 'alice@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=alice' },
      { name: 'Bob Johnson', email: 'bob@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
      { name: 'Charlie Brown', email: 'charlie@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=charlie' }
    ];

    const friends = [];
    for (const friendData of friendsData) {
      let friend = await User.findOne({ email: friendData.email });
      if (!friend) {
        friend = await User.create({ ...friendData, password: 'password123' }); // Dummy password
      }
      friends.push(friend);
    }
    console.log(`Ensured ${friends.length} mock friends exist.`);

    // 3. Create Groups
    // Bali Trip with Everyone
    const tripGroup = await Group.findOneAndUpdate(
      { name: 'Bali Trip 🌴', creatorId: mainUser._id },
      {
        name: 'Bali Trip 🌴',
        creatorId: mainUser._id,
        members: [mainUser._id, ...friends.map(f => f._id)],
        currency: 'USD',
        imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000'
      },
      { upsert: true, new: true }
    );
    console.log('Ensured "Bali Trip" group exists.');

    // Apartment Group with just Alice
    const apartmentGroup = await Group.findOneAndUpdate(
      { name: 'Apartment 🏠', creatorId: mainUser._id },
      {
        name: 'Apartment 🏠',
        creatorId: mainUser._id,
        members: [mainUser._id, friends[0]._id],
        currency: 'USD'
      },
      { upsert: true, new: true }
    );
    console.log('Ensured "Apartment" group exists.');


    // 4. Create Transactions (Clear old ones for clean state if needed, or just append)
    // To avoid duplicates on re-seed, we might want to delete transactions for these groups first? 
    // Let's just create them if the count is low.
    const txCount = await Transaction.countDocuments({ groupId: tripGroup._id });
    
    if (txCount === 0) {
        console.log('Seeding transactions for Bali Trip...');
        
        // Expense 1: Villa Rental (Paid by You, Split Equally)
        await Transaction.create({
            description: 'Villa Rental',
            amount: 1000,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
            type: 'EXPENSE',
            groupId: tripGroup._id,
            paidByUserId: mainUser._id,
            splitType: 'EQUAL',
            splitDetails: [
                { userId: mainUser._id, amount: 250 },
                { userId: friends[0]._id, amount: 250 },
                { userId: friends[1]._id, amount: 250 },
                { userId: friends[2]._id, amount: 250 }
            ],
            category: 'Housing'
        });

        // Expense 2: Dinner (Paid by Alice, Split Equally)
        await Transaction.create({
            description: 'Seafood Dinner',
            amount: 200,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
            type: 'EXPENSE',
            groupId: tripGroup._id,
            paidByUserId: friends[0]._id,
            splitType: 'EQUAL',
            splitDetails: [
                { userId: mainUser._id, amount: 50 },
                { userId: friends[0]._id, amount: 50 },
                { userId: friends[1]._id, amount: 50 },
                { userId: friends[2]._id, amount: 50 }
            ],
            category: 'Food'
        });
    }

    const aptTxCount = await Transaction.countDocuments({ groupId: apartmentGroup._id });
    if (aptTxCount === 0) {
        console.log('Seeding transactions for Apartment...');
         // Expense 3: Internet Bill (Paid by Main User, Split Equally)
         await Transaction.create({
            description: 'Internet Bill',
            amount: 60,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            type: 'EXPENSE',
            groupId: apartmentGroup._id,
            paidByUserId: mainUser._id,
            splitType: 'EQUAL',
            splitDetails: [
                { userId: mainUser._id, amount: 30 },
                { userId: friends[0]._id, amount: 30 }
            ],
            category: 'Utilities'
        });
    }

    console.log('Database seeded successfully! 🌱');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
