const sequelize = require('./config/database');
const Book = require('./models/bookModel');
const Member = require('./models/memberModel');
const MemberBooks = require('./models/memberBooksModel');

const seedData = async () => {
  try {
    // Sinkronisasi model dengan database
    await sequelize.sync({ force: true }); // Hati-hati menggunakan force: true

    // Data buku
    const books = [
      { code: "JK-45", title: "Harry Potter", author: "J.K Rowling", stock: 1 },
      { code: "SHR-1", title: "A Study in Scarlet", author: "Arthur Conan Doyle", stock: 1 },
      { code: "TW-11", title: "Twilight", author: "Stephenie Meyer", stock: 1 },
      { code: "HOB-83", title: "The Hobbit, or There and Back Again", author: "J.R.R. Tolkien", stock: 1 },
      { code: "NRN-7", title: "The Lion, the Witch and the Wardrobe", author: "C.S. Lewis", stock: 1 },
    ];

    // Data anggota
    const members = [
      { code: "M001", name: "Angga" },
      { code: "M002", name: "Ferry" },
      { code: "M003", name: "Putri" },
    ];

    // Masukkan data buku
    await Book.bulkCreate(books);
    console.log("Books seeded successfully!");

    // Masukkan data anggota
    await Member.bulkCreate(members);
    console.log("Members seeded successfully!");

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await sequelize.close(); // Tutup koneksi setelah selesai
  }
};

// Jalankan fungsi seed
seedData();
