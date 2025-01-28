import mongoose from "mongoose";
import User from "../models/User";
import bcrypt from "bcryptjs";

const responders = [
  {
    name: "Pastor John",
    email: "john@church.com",
    password: "password123",
    role: "responder",
    expertise: "Biblical Studies",
  },
  {
    name: "Sister Mary",
    email: "mary@church.com",
    password: "password123",
    role: "responder",
    expertise: "Youth Counseling",
  },
  {
    name: "Elder David",
    email: "david@church.com",
    password: "password123",
    role: "responder",
    expertise: "Family Counseling",
  },
  {
    name: "Deacon Sarah",
    email: "sarah@church.com",
    password: "password123",
    role: "responder",
    expertise: "Prayer Ministry",
  },
];

const seedResponders = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://tigabutg:GeDWA601PkRszifG@cluster0.yl2mp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );

    for (const responder of responders) {
      const hashedPassword = await bcrypt.hash(responder.password, 10);
      await User.create({
        ...responder,
        password: hashedPassword,
      });
    }

    console.log("Responders seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding responders:", error);
    process.exit(1);
  }
};

seedResponders();
